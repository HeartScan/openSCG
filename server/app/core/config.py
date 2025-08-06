from pydantic_settings import BaseSettings
from typing import List, Union

class Settings(BaseSettings):
    """
    Application settings, loaded from environment variables.
    """
    DATABASE_URL: str = "postgresql://user:password@localhost/openscg"
    CORS_ORIGINS: Union[str, List[str]] = "*"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
