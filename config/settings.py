"""
Configuration settings for the AI Task Extraction System
"""
import os
from typing import Dict, Any

class Settings:
    """Configuration settings class"""
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_DEBUG: bool = False
    
    # OpenRouter Configuration
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_MODEL: str = "openai/gpt-3.5-turbo"
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 3600  # 1 hour in seconds
    
    # Batch Processing
    BATCH_SIZE: int = 10
    BATCH_TIMEOUT: int = 30  # seconds
    
    # File Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    EMAILS_FILE: str = os.path.join(DATA_DIR, "emails.json")
    TASKS_FILE: str = os.path.join(DATA_DIR, "tasks.json")
    LOGS_FILE: str = os.path.join(DATA_DIR, "logs.json")
    
    # Cache Configuration
    CACHE_MAX_SIZE: int = 1000
    CACHE_TTL: int = 3600  # 1 hour
    
    # Queue Configuration
    QUEUE_MAX_SIZE: int = 1000
    QUEUE_TIMEOUT: int = 60  # seconds
    
    # Monitoring
    HEALTH_CHECK_INTERVAL: int = 30  # seconds
    LOG_LEVEL: str = "INFO"
    
    @classmethod
    def get_settings(cls) -> Dict[str, Any]:
        """Get all settings as dictionary"""
        return {
            key: getattr(cls, key) 
            for key in dir(cls) 
            if not key.startswith('_') and not callable(getattr(cls, key))
        }
    
    @classmethod
    def validate_settings(cls) -> bool:
        """Validate critical settings"""
        if not cls.OPENROUTER_API_KEY:
            print("Warning: OPENROUTER_API_KEY not set")
            return False
        
        # Create data directory if it doesn't exist
        os.makedirs(cls.DATA_DIR, exist_ok=True)
        
        return True

# Global settings instance
settings = Settings()

# Validate settings on import
if not settings.validate_settings():
    print("Warning: Some settings validation failed")
