from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models import LoginType, Visibility


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


# Receipt schema
class PredictionReceipt(BaseModel):
    prediction_id: int
    title: str
    content: str
    user_handle: str
    timestamp: datetime
    hash: str
    verification_url: str


# Error schemas
class ErrorResponse(BaseModel):
    detail: str
