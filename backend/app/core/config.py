from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./ai_note_app.db"
    
    # OpenAI
    openai_api_key: str = ""
    
    # Web Search
    search_api_key: str = ""
    search_engine_id: str = ""
    
    # Application
    secret_key: str = "your-secret-key-change-this-in-production"
    debug: bool = True
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    @property
    def cors_origins_list(self) -> List[str]:
        """CORS origins를 리스트로 변환"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
