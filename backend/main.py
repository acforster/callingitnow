from fastapi import FastAPI, Depends, HTTPException, status, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from sqlalchemy import text # Make sure 'text' is imported from sqlalchemy at the top
from typing import Optional, List
import hashlib
import json
from better_profanity import profanity
from datetime import datetime, timedelta
from profanity_list import custom_bad_words
from config import settings
from database import get_db, engine, Base
from models import User, Prediction, Vote, Backing, Group, GroupMember, LoginType, Visibility, GroupRole, GroupVisibility, Comment, CommentVote
from schemas import (
    UserCreate, UserResponse, UserProfile, Token, LoginRequest, GoogleAuthRequest,
    PredictionCreate, PredictionResponse, PredictionListResponse, VoteRequest, VoteResponse,
    BackingResponse, PredictionReceipt, ErrorResponse, GroupCreate, GroupResponse, GroupListResponse,
    MessageResponse, CommentCreate, CommentResponse
)

from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_current_user_optional
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CallingItNow API",
    description="API for the CallingItNow prediction platform",
    version="1.0.0"
)

# Enhance the profanity filter with custom words
profanity.add_censor_words(custom_bad_words)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_request_path(request, call_next):
    print(f"Request received for path: {request.url.path}")
    response = await call_next(request)
    return response

@app.get("/healthcheck")
def healthcheck():
    return {"status": "ok"}

def generate_prediction_hash(user_id: int, title: str, content: str, timestamp: datetime) -> str:
    """Generate a unique hash for a prediction."""
    data = f"{user_id}:{title}:{content}:{timestamp.isoformat()}"
    return hashlib.sha256(data.encode()).hexdigest()


def calculate_vote_score(prediction_id: int, db: Session) -> int:
    """Calculate the total vote score for a prediction."""
    result = db.query(func.sum(Vote.value)).filter(Vote.prediction_id == prediction_id).scalar()
    return result or 0


def get_user_vote(prediction_id: int, user_id: Optional[int], db: Session) -> Optional[int]:
    """Get the current user's vote for a prediction."""
    if not user_id:
        return None
    vote = db.query(Vote).filter(Vote.prediction_id == prediction_id, Vote.user_id == user_id).first()
    return vote.value if vote else None


def get_user_backing(prediction_id: int, user_id: Optional[int], db: Session) -> bool:
    """Check if the current user has backed a prediction."""
    if not user_id:
        return False
    backing = db.query(Backing).filter(Backing.prediction_id == prediction_id, Backing.backer_user_id == user_id).first()
    return backing is not None

@app.get("/predictions/my", response_model=PredictionListResponse)
def list_my_predictions(
    page: int = 1,
    per_page: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all predictions for the current user."""
    query = db.query(Prediction).filter(Prediction.user_id == current_user.user_id)
    query = query.order_by(Prediction.timestamp.desc())
    
    total = query.count()
    predictions_db = query.offset((page - 1) * per_page).limit(per_page).all()

    # This part requires that your main.py imports PredictionResponse
    # and PredictionListResponse from schemas.py
    predictions_resp = [
        PredictionResponse(
            **prediction.__dict__,
            user=prediction.user,
            vote_score=calculate_vote_score(prediction.prediction_id, db),
            user_vote=get_user_vote(prediction.prediction_id, current_user.user_id, db),
            user_backed=get_user_backing(prediction.prediction_id, current_user.user_id, db),
            backing_count=db.query(Backing).filter(Backing.prediction_id == prediction.prediction_id).count()
        ) for prediction in predictions_db
    ]

    return PredictionListResponse(
        predictions=predictions_resp,
        total=total,
        page=page,
        per_page=per_page
    )

# Auth endpoints
@app.post("/auth/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if handle already exists
    if db.query(User).filter(User.handle == user_data.handle).first():
        raise HTTPException(status_code=400, detail="Handle already taken")
    
    # Hash password if provided
    password_hash = None
    if user_data.password:
        password_hash = get_password_hash(user_data.password)
    
    # Create user
    user = User(
        email=user_data.email,
        handle=user_data.handle,
        password_hash=password_hash,
        login_type=user_data.login_type
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.user_id)})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/auth/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not user.password_hash or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": str(user.user_id)})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/auth/me", response_model=UserProfile)
def get_current_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user profile."""
    prediction_count = db.query(Prediction).filter(Prediction.user_id == current_user.user_id).count()
    backing_count = db.query(Backing).filter(Backing.backer_user_id == current_user.user_id).count()
    
    return UserProfile(
        user_id=current_user.user_id,
        email=current_user.email,
        handle=current_user.handle,
        login_type=current_user.login_type,
        wisdom_level=current_user.wisdom_level,
        created_at=current_user.created_at,
        prediction_count=prediction_count,
        backing_count=backing_count
    )


# Prediction endpoints
@app.post("/predictions", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def create_prediction(prediction_data: PredictionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new prediction."""
    if prediction_data.group_id:
        member = db.query(GroupMember).filter(
            GroupMember.group_id == prediction_data.group_id,
            GroupMember.user_id == current_user.user_id
        ).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this group."
            )


    # Check for profanity but don't censor here
    has_profanity = profanity.contains_profanity(prediction_data.title) or profanity.contains_profanity(prediction_data.content)

    # Censor content for display later if needed
    censored_title = profanity.censor(prediction_data.title)
    censored_content = profanity.censor(prediction_data.content)

    now = datetime.utcnow()
    prediction_hash = generate_prediction_hash(
        user_id=current_user.user_id, 
        title=prediction_data.title, 
        content=prediction_data.content, 
        timestamp=now
    )

    prediction = Prediction(
        user_id=current_user.user_id,
        group_id=prediction_data.group_id,
        title=censored_title, # Store censored version
        content=censored_content, # Store censored version
        category=prediction_data.category,
        visibility=prediction_data.visibility,
        allow_backing=prediction_data.allow_backing,
        timestamp=now,
        hash=prediction_hash,
        contains_profanity=has_profanity
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return PredictionResponse(
        **prediction.__dict__,
        user=prediction.user,
        vote_score=0,
        backing_count=0,
        comment_count=0,
        user_vote=None,
        user_backed=False,
        backing_count=0
    )


@app.get("/predictions", response_model=PredictionListResponse)
def get_predictions(
    category: Optional[str] = None,
    sort: str = Query("recent", regex="^(recent|popular|controversial)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    safe_search: bool = False, # Add this line
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get public predictions with filtering and pagination."""
    query = db.query(Prediction).filter(Prediction.visibility == Visibility.PUBLIC)
    
    if category:
        query = query.filter(Prediction.category == category)
        
    # Add this block
    if safe_search:
        query = query.filter(Prediction.contains_profanity == False)
    
    # Apply sorting
    if sort == "recent":
        query = query.order_by(desc(Prediction.timestamp))
    elif sort == "popular":
        # Join with votes and order by score
        query = query.outerjoin(Vote).group_by(Prediction.prediction_id).order_by(desc(func.sum(Vote.value)))
    elif sort == "controversial":
        # Order by vote count (regardless of score)
        query = query.outerjoin(Vote).group_by(Prediction.prediction_id).order_by(desc(func.count(Vote.vote_id)))
    
    total = query.count()
    predictions = query.offset((page - 1) * per_page).limit(per_page).all()
    
    # Build response with additional data
    prediction_responses = []
    for prediction in predictions:
        vote_score = calculate_vote_score(prediction.prediction_id, db)
        backing_count = db.query(Backing).filter(Backing.prediction_id == prediction.prediction_id).count()
        user_vote = get_user_vote(prediction.prediction_id, current_user.user_id if current_user else None, db)
        user_backed = get_user_backing(prediction.prediction_id, current_user.user_id if current_user else None, db)
        comment_count = db.query(Comment).filter(Comment.prediction_id == prediction.prediction_id).count()
        
        prediction_responses.append(PredictionResponse(
            prediction_id=prediction.prediction_id,
            user_id=prediction.user_id,
            title=prediction.title,
            content=prediction.content,
            category=prediction.category,
            visibility=prediction.visibility,
            allow_backing=prediction.allow_backing,
            timestamp=prediction.timestamp,
            hash=prediction.hash,
            user=prediction.user,
            vote_score=vote_score,
            backing_count=backing_count,
            user_vote=user_vote,
            user_backed=user_backed,
            comment_count=comment_count,
        ))
        
    return PredictionListResponse(
        predictions=prediction_responses,
        total=total,
        page=page,
        per_page=per_page
    )


@app.get("/predictions/{prediction_id}", response_model=PredictionResponse)
def get_prediction(
    prediction_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
    ):

    """Get a specific prediction by ID."""
    prediction = db.query(Prediction).filter(Prediction.prediction_id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    # Check visibility
    if prediction.visibility == Visibility.PRIVATE and (not current_user or current_user.user_id != prediction.user_id):
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    vote_score = calculate_vote_score(prediction.prediction_id, db)
    backing_count = db.query(Backing).filter(Backing.prediction_id == prediction.prediction_id).count()
    comment_count=db.query(Comment).filter(Comment.prediction_id == prediction.prediction_id).count()
    user_vote = get_user_vote(prediction.prediction_id, current_user.user_id if current_user else None, db)
    user_backed = get_user_backing(prediction.prediction_id, current_user.user_id if current_user else None, db)
    
    return PredictionResponse(
        prediction_id=prediction.prediction_id,
        user_id=prediction.user_id,
        title=prediction.title,
        content=prediction.content,
        category=prediction.category,
        visibility=prediction.visibility,
        allow_backing=prediction.allow_backing,
        timestamp=prediction.timestamp,
        hash=prediction.hash,
        user=UserResponse(
            user_id=prediction.user.user_id,
            email=prediction.user.email,
            handle=prediction.user.handle,
            login_type=prediction.user.login_type,
            wisdom_level=prediction.user.wisdom_level,
            created_at=prediction.user.created_at
        ),
        vote_score=vote_score,
        backing_count=backing_count,
        user_vote=user_vote,
        user_backed=user_backed
    )


@app.post("/predictions/{prediction_id}/vote", response_model=VoteResponse)
def vote_prediction(
    prediction_id: int,
    vote_data: VoteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vote on a prediction."""
    prediction = db.query(Prediction).filter(Prediction.prediction_id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    # Check if user already voted
    existing_vote = db.query(Vote).filter(
        Vote.prediction_id == prediction_id,
        Vote.user_id == current_user.user_id
    ).first()
    
    if existing_vote:
        # Update existing vote
        existing_vote.value = vote_data.value
        db.commit()
        db.refresh(existing_vote)
        return VoteResponse(
            vote_id=existing_vote.vote_id,
            prediction_id=existing_vote.prediction_id,
            user_id=existing_vote.user_id,
            value=existing_vote.value,
            timestamp=existing_vote.timestamp
        )
    else:
        # Create new vote
        vote = Vote(
            prediction_id=prediction_id,
            user_id=current_user.user_id,
            value=vote_data.value
        )
        db.add(vote)
        db.commit()
        db.refresh(vote)
        return VoteResponse(
            vote_id=vote.vote_id,
            prediction_id=vote.prediction_id,
            user_id=vote.user_id,
            value=vote.value,
            timestamp=vote.timestamp
        )


@app.post("/predictions/{prediction_id}/back", response_model=BackingResponse)
def back_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Back a prediction."""
    prediction = db.query(Prediction).filter(Prediction.prediction_id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    if not prediction.allow_backing:
        raise HTTPException(status_code=400, detail="Backing not allowed for this prediction")
    
    # Check if user already backed
    existing_backing = db.query(Backing).filter(
        Backing.prediction_id == prediction_id,
        Backing.backer_user_id == current_user.user_id
    ).first()
    
    if existing_backing:
        raise HTTPException(status_code=400, detail="Already backed this prediction")
    
    # Create backing
    backing = Backing(
        prediction_id=prediction_id,
        backer_user_id=current_user.user_id
    )
    db.add(backing)
    
    # Update wisdom level of prediction author
    prediction.user.wisdom_level += 1
    
    db.commit()
    db.refresh(backing)
    
    return BackingResponse(
        backing_id=backing.backing_id,
        prediction_id=backing.prediction_id,
        backer_user_id=backing.backer_user_id,
        timestamp=backing.timestamp,
        backer=UserResponse(
            user_id=current_user.user_id,
            email=current_user.email,
            handle=current_user.handle,
            login_type=current_user.login_type,
            wisdom_level=current_user.wisdom_level,
            created_at=current_user.created_at
        )
    )

@app.delete("/predictions/{prediction_id}/back", status_code=status.HTTP_204_NO_CONTENT)
def unback_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unback a prediction."""
    # Find the backing
    backing = db.query(Backing).filter(
        Backing.prediction_id == prediction_id,
        Backing.backer_user_id == current_user.user_id
    ).first()

    if not backing:
        raise HTTPException(status_code=404, detail="Not backed")

    # Decrement wisdom level of prediction author, ensuring it doesn't go below 0
    if backing.prediction.user.wisdom_level > 0:
        backing.prediction.user.wisdom_level -= 1

    db.delete(backing)
    db.commit()
    return


@app.delete("/predictions/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a prediction. Only the author can delete their own prediction."""
    prediction = db.query(Prediction).filter(Prediction.prediction_id == prediction_id).first()

    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")

    if prediction.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this prediction")

    # Manually delete associated votes and backings due to lack of cascade
    db.query(Vote).filter(Vote.prediction_id == prediction_id).delete()
    db.query(Backing).filter(Backing.prediction_id == prediction_id).delete()

    db.delete(prediction)
    db.commit()
    return

@app.get("/predictions/{prediction_id}/receipt", response_model=PredictionReceipt)
def get_prediction_receipt(
    prediction_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get a prediction receipt."""
    prediction = db.query(Prediction).filter(Prediction.prediction_id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    # Check visibility
    if prediction.visibility == Visibility.PRIVATE and (not current_user or current_user.user_id != prediction.user_id):
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    return PredictionReceipt(
        prediction_id=prediction.prediction_id,
        title=prediction.title,
        content=prediction.content,
        user_handle=prediction.user.handle,
        timestamp=prediction.timestamp,
        hash=prediction.hash,
        verification_url=f"https://callingitnow.com/predictions/{prediction_id}"
    )


@app.post("/groups", response_model=GroupResponse, tags=["groups"], status_code=status.HTTP_201_CREATED)
def create_group(group: GroupCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Create a new group.
    """
    db_group = db.query(Group).filter(Group.name == group.name).first()
    if db_group:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A group with this name already exists."
        )

    # Simple, clean ORM object creation
    new_group = Group(
        name=group.name,
        description=group.description,
        visibility=group.visibility.value, # Pass the lowercase string value
        created_by=current_user.user_id
    )
    db.add(new_group)
    db.flush()

    new_member = GroupMember(
        group_id=new_group.group_id,
        user_id=current_user.user_id,
        role=GroupRole.OWNER.value # Also use .value for the role
    )
    db.add(new_member)
    
    db.commit()
    db.refresh(new_group)

    return GroupResponse(
        group_id=new_group.group_id,
        name=new_group.name,
        description=new_group.description,
        visibility=new_group.visibility,
        creator=new_group.creator,
        created_at=new_group.created_at,
        member_count=1
    )


@app.get("/groups", response_model=GroupListResponse, tags=["groups"])
def get_groups(sort: Optional[str] = Query(None, regex="^(popular|top)$"), db: Session = Depends(get_db)):
    """
    Get a list of all public groups, with sorting options.
    - `popular`: Groups with the most new predictions in the last 24 hours.
    - `top`: Groups with the most predictions of all time.
    """
    query = db.query(Group).filter(Group.visibility == GroupVisibility.PUBLIC.value)

    if sort == "top":
        query = query.outerjoin(Prediction, Group.group_id == Prediction.group_id)\
                     .group_by(Group.group_id)\
                     .order_by(desc(func.count(Prediction.prediction_id)))
    elif sort == "popular":
        one_day_ago = datetime.utcnow() - timedelta(days=1)
        query = query.outerjoin(Prediction, Group.group_id == Prediction.group_id)\
                     .filter(Prediction.timestamp >= one_day_ago)\
                     .group_by(Group.group_id)\
                     .order_by(desc(func.count(Prediction.prediction_id)))
    else:
        # Default sort by most recent
        query = query.order_by(desc(Group.created_at))

    groups_db = query.all()
    
    group_responses = []
    for group in groups_db:
        member_count = db.query(GroupMember).filter(GroupMember.group_id == group.group_id).count()
        group_responses.append(
            GroupResponse(
                group_id=group.group_id,
                name=group.name,
                description=group.description,
                visibility=group.visibility,
                creator=group.creator,
                created_at=group.created_at,
                member_count=member_count
            )
        )
        
    return GroupListResponse(groups=group_responses)

@app.get("/groups/me", response_model=GroupListResponse, tags=["groups"])
def get_my_groups(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Get a list of all groups the current user is a member of,
    sorted by the number of new predictions in the last 7 days.
    """
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    # Subquery to count recent predictions for each group
    recent_predictions_subquery = db.query(
        Prediction.group_id,
        func.count(Prediction.prediction_id).label('recent_prediction_count')
    ).filter(
        Prediction.timestamp >= seven_days_ago
    ).group_by(Prediction.group_id).subquery()

    # Main query to get user's groups and join with the subquery
    groups_db = db.query(
        Group,
        recent_predictions_subquery.c.recent_prediction_count
    ).join(
        GroupMember, Group.group_id == GroupMember.group_id
    ).outerjoin(
        recent_predictions_subquery, Group.group_id == recent_predictions_subquery.c.group_id
    ).filter(
        GroupMember.user_id == current_user.user_id
    ).order_by(
        desc(func.coalesce(recent_predictions_subquery.c.recent_prediction_count, 0)),
        Group.name
    ).all()

    group_responses = []
    for group, recent_prediction_count in groups_db:
        member_count = db.query(GroupMember).filter(GroupMember.group_id == group.group_id).count()
        group_responses.append(
            GroupResponse(
                group_id=group.group_id,
                name=group.name,
                description=group.description,
                visibility=group.visibility,
                creator=group.creator,
                created_at=group.created_at,
                member_count=member_count,
                is_member=True # User is always a member in this query
            )
        )
        
    return GroupListResponse(groups=group_responses)

@app.get("/groups/{group_id}", response_model=GroupResponse, tags=["groups"])
def get_group(group_id: int, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    """
    Get details for a single group by its ID.
    Includes 'is_member' flag if a user is authenticated.
    """
    group = db.query(Group).filter(Group.group_id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found."
        )

    member_count = db.query(GroupMember).filter(GroupMember.group_id == group.group_id).count()
    
    is_member = None
    if current_user:
        is_member = db.query(GroupMember).filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.user_id
        ).first() is not None

    # Manually create a dictionary with all required fields
    group_data = {
        "group_id": group.group_id,
        "name": group.name,
        "description": group.description,
        "visibility": group.visibility,
        "creator": group.creator,
        "created_at": group.created_at,
        "member_count": member_count,
        "is_member": is_member
    }
    # Validate the complete dictionary
    return GroupResponse.model_validate(group_data)

@app.get("/groups/{group_id}/predictions", response_model=PredictionListResponse, tags=["groups"])
def get_group_predictions(
    group_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get predictions for a specific group."""
    # First, check if the group exists
    group = db.query(Group).filter(Group.group_id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Basic visibility check (can be expanded later)
    if group.visibility != 'public' and (not current_user or not db.query(GroupMember).filter(GroupMember.group_id == group_id, GroupMember.user_id == current_user.user_id).first()):
         raise HTTPException(status_code=403, detail="You do not have permission to view this group's predictions.")

    query = db.query(Prediction).filter(Prediction.group_id == group_id).order_by(desc(Prediction.timestamp))

    total = query.count()
    predictions_db = query.offset((page - 1) * per_page).limit(per_page).all()

    prediction_responses = []
    for prediction in predictions_db:
        prediction_responses.append(PredictionResponse(
            prediction_id=prediction.prediction_id,
            user_id=prediction.user_id,
            group_id=prediction.group_id,
            title=prediction.title,
            content=prediction.content,
            category=prediction.category,
            visibility=prediction.visibility,
            allow_backing=prediction.allow_backing,
            timestamp=prediction.timestamp,
            hash=prediction.hash,
            user=prediction.user,
            vote_score=calculate_vote_score(prediction.prediction_id, db),
            backing_count=db.query(Backing).filter(Backing.prediction_id == prediction.prediction_id).count(),
            user_vote=get_user_vote(prediction.prediction_id, current_user.user_id if current_user else None, db),
            user_backed=get_user_backing(prediction.prediction_id, current_user.user_id if current_user else None, db)
        ))

    return PredictionListResponse(
        predictions=prediction_responses,
        total=total,
        page=page,
        per_page=per_page
    )

@app.post("/groups/{group_id}/join", response_model=MessageResponse, tags=["groups"])
def join_group(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Allows the current user to join a public group.
    """
    # Find the group
    group = db.query(Group).filter(Group.group_id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found."
        )

    # For now, only allow joining public groups
    if group.visibility != 'public':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This group is private and cannot be joined directly."
        )

    # Check if user is already a member
    existing_member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.user_id
    ).first()

    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already a member of this group."
        )

    # Create the new membership
    new_member = GroupMember(
        group_id=group_id,
        user_id=current_user.user_id,
        role=GroupRole.MEMBER.value
    )
    db.add(new_member)
    db.commit()

    return MessageResponse(message="Successfully joined group.")

@app.post("/groups/{group_id}/leave", response_model=MessageResponse, tags=["groups"])
def leave_group(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Allows the current user to leave a group they are a member of.
    """
    # Find the membership record
    member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.user_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not a member of this group."
        )
    
    # Prevent owner from leaving the group for now
    if member.role == 'owner':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Group owners cannot leave the group. You must transfer ownership or delete the group."
        )

    db.delete(member)
    db.commit()

    return MessageResponse(message="You have successfully left the group.")

@app.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["groups"])
def delete_group(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Delete a group. Only the creator of the group can delete it.
    """
    group = db.query(Group).filter(Group.group_id == group_id).first()

    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    if group.created_by != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the group creator can delete the group")

    # The database is set up with cascading deletes, so deleting the group
    # will automatically delete related memberships, predictions, etc.
    db.delete(group)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)

# ===================
# Comments
# ===================

def get_comment_response(comment: Comment, db: Session, current_user: Optional[User]) -> CommentResponse:
    """Helper function to construct a CommentResponse from a Comment object."""
    vote_score = sum(v.value for v in comment.votes)
    user_vote = next((v.value for v in comment.votes if current_user and v.user_id == current_user.user_id), None)
    
    return CommentResponse(
        comment_id=comment.comment_id,
        prediction_id=comment.prediction_id,
        user=comment.user,
        parent_comment_id=comment.parent_comment_id,
        content=comment.content,
        timestamp=comment.timestamp,
        votes=[v for v in comment.votes],
        vote_score=vote_score,
        user_vote=user_vote,
        replies=[get_comment_response(reply, db, current_user) for reply in comment.replies]
    )

@app.post("/predictions/{prediction_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED, tags=["comments"])
def create_comment(
    prediction_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new comment on a prediction."""
    prediction = db.query(Prediction).filter(Prediction.prediction_id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")

    if comment_data.parent_comment_id:
        parent_comment = db.query(Comment).filter(Comment.comment_id == comment_data.parent_comment_id).first()
        if not parent_comment or parent_comment.prediction_id != prediction_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid parent comment")

    new_comment = Comment(
        content=comment_data.content,
        prediction_id=prediction_id,
        user_id=current_user.user_id,
        parent_comment_id=comment_data.parent_comment_id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return get_comment_response(new_comment, db, current_user)

@app.get("/predictions/{prediction_id}/comments", response_model=List[CommentResponse], tags=["comments"])
def get_comments_for_prediction(
    prediction_id: int,
    sort: str = Query("top", regex="^(top|new|controversial)$"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get all comments for a prediction, sorted and nested."""
    # Fetch all comments for the prediction to build the hierarchy
    all_comments = db.query(Comment).filter(Comment.prediction_id == prediction_id).all()
    
    # Create a dictionary for easy access
    comment_map = {c.comment_id: c for c in all_comments}
    
    # Build the nested structure
    root_comments = []
    for comment in all_comments:
        if comment.parent_comment_id:
            parent = comment_map.get(comment.parent_comment_id)
            if parent:
                if not hasattr(parent, 'temp_replies'):
                    parent.temp_replies = []
                parent.temp_replies.append(comment)
        else:
            root_comments.append(comment)

    # Attach the replies properly
    for comment in all_comments:
        if hasattr(comment, 'temp_replies'):
            comment.replies = comment.temp_replies

    # Sort the top-level comments
    if sort == "new":
        root_comments.sort(key=lambda c: c.timestamp, reverse=True)
    elif sort == "top":
        root_comments.sort(key=lambda c: sum(v.value for v in c.votes), reverse=True)
    # 'controversial' could be implemented later if needed

    return [get_comment_response(comment, db, current_user) for comment in root_comments]

@app.post("/comments/{comment_id}/vote", response_model=MessageResponse, tags=["comments"])
def vote_on_comment(
    comment_id: int,
    vote_request: VoteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cast a vote on a comment."""
    comment = db.query(Comment).filter(Comment.comment_id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

    existing_vote = db.query(CommentVote).filter(
        CommentVote.comment_id == comment_id,
        CommentVote.user_id == current_user.user_id
    ).first()

    if existing_vote:
        if vote_request.value == 0: # User wants to remove their vote
            db.delete(existing_vote)
            message = "Vote removed"
        elif existing_vote.value == vote_request.value: # Vote is the same, do nothing or treat as removal
            db.delete(existing_vote)
            message = "Vote removed"
        else: # Change vote
            existing_vote.value = vote_request.value
            message = "Vote updated"
    elif vote_request.value != 0: # New vote
        new_vote = CommentVote(
            comment_id=comment_id,
            user_id=current_user.user_id,
            value=vote_request.value
        )
        db.add(new_vote)
        message = "Vote cast"
    else: # Trying to cast a '0' vote from a neutral state
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid vote value")

    db.commit()
    return MessageResponse(message=message)

@app.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["comments"])
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a comment. Only the author can delete their comment."""
    comment = db.query(Comment).filter(Comment.comment_id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

    if comment.user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own comments")

    db.delete(comment)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)