from fastapi import FastAPI, HTTPException, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from typing import Optional, List
import hashlib
import json
from datetime import datetime

from config import settings
from database import get_db, engine, Base
from models import User, Prediction, Vote, Backing, LoginType, Visibilityfrom schemas import (
    UserCreate, UserResponse, UserProfile, Token, LoginRequest, GoogleAuthRequest,
    PredictionCreate, PredictionResponse, PredictionListResponse, VoteRequest, VoteResponse,
    BackingResponse, GroupCreate, GroupResponse, GroupMemberResponse,
    GroupPredictionCreate, GroupPredictionResponse, PredictionReceipt,
    LeaderboardCall, LeaderboardCreator, CategoryStats, ErrorResponse
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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
@app.post("/predictions", response_model=PredictionResponse)
def create_prediction(
    prediction_data: PredictionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new prediction."""
    timestamp = datetime.utcnow()
    hash_value = generate_prediction_hash(
        current_user.user_id, 
        prediction_data.title, 
        prediction_data.content, 
        timestamp
    )
    
    prediction = Prediction(
        user_id=current_user.user_id,
        title=prediction_data.title,
        content=prediction_data.content,
        category=prediction_data.category,
        visibility=prediction_data.visibility,
        allow_backing=prediction_data.allow_backing,
        timestamp=timestamp,
        hash=hash_value
    )
    
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    
    # Return with additional data
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
            user_id=current_user.user_id,
            email=current_user.email,
            handle=current_user.handle,
            login_type=current_user.login_type,
            wisdom_level=current_user.wisdom_level,
            created_at=current_user.created_at
        ),
        vote_score=0,
        backing_count=0,
        user_vote=None,
        user_backed=False
    )


@app.get("/predictions", response_model=PredictionListResponse)
def get_predictions(
    category: Optional[str] = None,
    sort: str = Query("recent", regex="^(recent|popular|controversial)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get public predictions with filtering and pagination."""
    query = db.query(Prediction).filter(Prediction.visibility == Visibility.PUBLIC)
    
    if category:
        query = query.filter(Prediction.category == category)
    
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
