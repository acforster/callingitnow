from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class LoginType(enum.Enum):
    PASSWORD = "password"
    GOOGLE = "google"


class Visibility(enum.Enum):
    PUBLIC = "public"
    PRIVATE = "private"


class GroupVisibility(enum.Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    SECRET = "secret"


class GroupRole(enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)  # Nullable for Google OAuth users
    handle = Column(String, unique=True, index=True, nullable=False)
    login_type = Column(Enum(LoginType), nullable=False)
    wisdom_level = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    predictions = relationship("Prediction", back_populates="user")
    votes = relationship("Vote", back_populates="user")
    backings = relationship("Backing", back_populates="backer")
    created_groups = relationship("Group", back_populates="creator")
    memberships = relationship("GroupMember", back_populates="user")



class Prediction(Base):
    __tablename__ = "predictions"
    
    prediction_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    title = Column(String(120), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    visibility = Column(Enum(Visibility), nullable=False)
    allow_backing = Column(Boolean, default=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    hash = Column(String(255), nullable=False, unique=True)
    contains_profanity = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="predictions")
    votes = relationship("Vote", back_populates="prediction")
    backings = relationship("Backing", back_populates="prediction")


class Vote(Base):
    __tablename__ = "votes"
    
    vote_id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.prediction_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    value = Column(Integer, nullable=False)  # -1 or 1
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    prediction = relationship("Prediction", back_populates="votes")
    user = relationship("User", back_populates="votes")
    
    # Unique constraint
    __table_args__ = (UniqueConstraint('prediction_id', 'user_id', name='unique_vote_per_user'),)


class Backing(Base):
    __tablename__ = "backings"
    
    backing_id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.prediction_id"), nullable=False)
    backer_user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    prediction = relationship("Prediction", back_populates="backings")
    backer = relationship("User", back_populates="backings")
    
    # Unique constraint
    __table_args__ = (UniqueConstraint('prediction_id', 'backer_user_id', name='unique_backing_per_user'),)

class Group(Base):
    __tablename__ = "groups"

    group_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, unique=True)
    description = Column(Text, nullable=False)
    visibility = Column(Enum(GroupVisibility, create_type=False), nullable=False)
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    creator = relationship("User", back_populates="created_groups")
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")


class GroupMember(Base):
    __tablename__ = "group_members"

    group_member_id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.group_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    role = Column(Enum(GroupRole), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="memberships")

    # Unique constraint
    __table_args__ = (UniqueConstraint('group_id', 'user_id', name='unique_group_membership'),)