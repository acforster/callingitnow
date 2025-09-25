#!/usr/bin/env python3
"""
Simple database fix for CallingItNow signup issue
This recreates the database tables with correct enum values
"""

import os
import sys

# Change to the backend directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)

# Remove any alembic from path to avoid conflicts
if 'alembic' in sys.modules:
    del sys.modules['alembic']

def main():
    print("Fixing CallingItNow database for signup...")
    
    try:
        # Import after changing directory
        from sqlalchemy import create_engine, MetaData
        from config import settings
        
        print(f"Connecting to database: {settings.database_url}")
        engine = create_engine(settings.database_url)
        
        # Test connection
        with engine.connect() as conn:
            print("Database connection successful!")
        
        # Import models and recreate tables
        from database import Base
        from models import User, Prediction, Vote, Backing, Group, GroupMember, GroupPrediction, GroupVote, GroupBacking
        
        print("Dropping existing tables...")
        Base.metadata.drop_all(bind=engine)
        
        print("Creating tables with correct schema...")
        Base.metadata.create_all(bind=engine)
        
        print("✅ Database fix complete!")
        print("✅ LoginType enum now accepts: 'password', 'google'")
        print("✅ All table schemas updated")
        print("\nYou can now test signup functionality!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"Error type: {type(e).__name__}")
        
        # Provide troubleshooting info
        print("\nTroubleshooting:")
        print("1. Make sure your database is running")
        print("2. Check your DATABASE_URL in config/environment")
        print("3. Ensure you have database permissions")
        
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
