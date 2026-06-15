import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Missing variables will throw a ValidationError if not provided or set here
    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    frontend_origin: str = "http://localhost:5173"
    gemini_api_key: Optional[str] = None


    class Config:
        env_file = ".env"
        # We allow extra environment variables passing through implicitly, 
        # but required fields above must be populated.
        extra = "allow"

try:
    settings = Settings()
except Exception as e:
    print(f"⚠️ Configuration Error: {e}")
    # In production, this would ideally crash the app immediately (raise e)
    # but we will just print to console for safety to not break everything if env differs
    raise e
