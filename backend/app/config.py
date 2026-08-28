from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "eldercare_ai"
    cors_origins: str = "http://localhost:5173"
    api_host: str = "127.0.0.1"
    api_port: int = 8000
    app_version: str = "0.1.0"
    jwt_secret_key: str = "super-secret-key-for-mvp"
    jwt_algorithm: str = "HS256"
    
    model_config = {"env_file": "../.env", "env_file_encoding": "utf-8"}

settings = Settings()
