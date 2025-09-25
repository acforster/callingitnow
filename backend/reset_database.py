#!/usr/bin/env python3
"""
Database reset script for CallingItNow
This will drop all tables and recreate them from the current models.
WARNING: This will delete all existing data!
"""

import sys
import os

# Add the current directory to Python path to ensure proper imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from database import engine, Base
    # Import all model classes
    from models import (
        User, Prediction, Vote, Backing, Group, GroupMember, 
        GroupPrediction, GroupVote, GroupBacking,
        LoginType, Visibility, GroupVisibility, GroupRole
    )
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure you're running this script from the backend directory")
    sys.exit(1)

def reset_database():
    """Drop all tables and recreate them from models."""
    print("WARNING: This will delete all existing data in the database!")
    
    # Ask for confirmation
    response = input("Are you sure you want to continue? (yes/no): ")
    if response.lower() != 'yes':
        print("Database reset cancelled.")
        return
    
    try:
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        
        print("Creating all tables from models...")
        Base.metadata.create_all(bind=engine)
        
        print("Database reset complete!")
        print("All tables have been recreated from the current models.")
        print("LoginType enum now uses lowercase values: 'password', 'google'")
        
    except Exception as e:
        print(f"Error resetting database: {e}")
        print(f"Error type: {type(e).__name__}")
        sys.exit(1)

if __name__ == "__main__":
    reset_database()
