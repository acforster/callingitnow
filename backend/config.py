from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Database
    # This will now prioritize the DATABASE_URL environment variable
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/callingitnow")
    
    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30
    
    # Google OAuth (now optional)
    google_oauth_client_id: Optional[str] = None
    google_oauth_client_secret: Optional[str] = None
    
    # API Configuration
    allowed_origins: str = "http://localhost:3000"
    rate_limit_per_minute: int = 60
    content_filter_level: str = "PG13"
    
    # Development
    debug: bool = False
    log_level: str = "info"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = 'ignore'
    
    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

settings = Settings()