from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Metron Hybrid Bot"
    BINANCE_API_KEY: str = ""
    BINANCE_SECRET_KEY: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
