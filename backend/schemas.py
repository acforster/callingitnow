from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models import LoginType, Visibility, GroupVisibility, GroupRole


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    handle: str = Field(..., min_length=3, max_length=50)


class UserCreate(UserBase):
    password: Optional[str] = None
    login_type: LoginType


class UserResponse(UserBase):
    user_id: int
    login_type: LoginType
    wisdom_level: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserProfile(UserResponse):
    prediction_count: int = 0
    backing_count: int = 0


# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    token: str


# Prediction schemas
class PredictionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    content: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=50)
    visibility: Visibility
    allow_backing: bool = True


class PredictionCreate(PredictionBase):
    pass


class PredictionResponse(PredictionBase):
    prediction_id: int
    user_id: int
    timestamp: datetime
    hash: str
    user: UserResponse
    vote_score: int = 0
    backing_count: int = 0
    user_vote: Optional[int] = None  # Current user's vote
    user_backed: bool = False  # Whether current user backed this
    
    class Config:
        from_attributes = True


class PredictionListResponse(BaseModel):
    predictions: List[PredictionResponse]
    total: int
    page: int
    per_page: int


# Vote schemas
class VoteRequest(BaseModel):
    value: int = Field(..., ge=-1, le=1)


class VoteResponse(BaseModel):
    vote_id: int
    prediction_id: int
    user_id: int
    value: int
    timestamp: datetime
    
    class Config:
        from_attributes = True


# Backing schemas
class BackingResponse(BaseModel):
    backing_id: int
    prediction_id: int
    backer_user_id: int
    timestamp: datetime
    backer: UserResponse
    
    class Config:
        from_attributes = True


# Group schemas
class GroupBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    description: str = Field(..., min_length=1)
    visibility: GroupVisibility


class GroupCreate(GroupBase):
    pass


class GroupResponse(GroupBase):
    group_id: int
    created_by: int
    created_at: datetime
    creator: UserResponse
    member_count: int = 0
    prediction_count: int = 0
    
    class Config:
        from_attributes = True


class GroupMemberResponse(BaseModel):
    group_member_id: int
    group_id: int
    user_id: int
    role: GroupRole
    joined_at: datetime
    user: UserResponse
    
    class Config:
        from_attributes = True


# Group prediction schemas
class GroupPredictionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    content: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=50)
    allow_backing: bool = True


class GroupPredictionCreate(GroupPredictionBase):
    pass


class GroupPredictionResponse(GroupPredictionBase):
    prediction_id: int
    group_id: int
    user_id: int
    timestamp: datetime
    hash: str
    user: UserResponse
    vote_score: int = 0
    backing_count: int = 0
    user_vote: Optional[int] = None
    user_backed: bool = False
    
    class Config:
        from_attributes = True


# Receipt schema
class PredictionReceipt(BaseModel):
    prediction_id: int
    title: str
    content: str
    user_handle: str
    timestamp: datetime
    hash: str
    verification_url: str


# Leaderboard schemas
class LeaderboardCall(BaseModel):
    prediction_id: int
    title: str
    user_handle: str
    score: int
    backing_count: int


class LeaderboardCreator(BaseModel):
    user_id: int
    handle: str
    wisdom_level: int
    prediction_count: int


class CategoryStats(BaseModel):
    category: str
    prediction_count: int
    total_score: int


# Error schemas
class ErrorResponse(BaseModel):
    detail: str
