from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/callingitnow"
    
    # JWT
    jwt_secret: str = "your-super-secret-jwt-key-here"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30
    
    # Google OAuth
    google_oauth_client_id: str = ""
    google_oauth_client_secret: str = ""
    
    # API Configuration
    allowed_origins: str = "http://localhost:3000"
    rate_limit_per_minute: int = 60
    content_filter_level: str = "PG13"
    
    # Development
    debug: bool = True
    log_level: str = "info"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]


settings = Settings()
