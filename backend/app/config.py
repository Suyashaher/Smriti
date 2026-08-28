from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_uri: str = "mongodb+srv://suyashaher99_db_user:wypyJh9E3caCMtj8@cluster0.kbzdrbx.mongodb.net/eldercare_ai?appName=Cluster0"
    mongodb_database: str = "eldercare_ai"
    cors_origins: str = "http://localhost:5173"
    api_host: str = "127.0.0.1"
    api_port: int = 8000
    app_version: str = "0.1.0"
    jwt_secret_key: str = "super-secret-key-for-mvp"
    jwt_algorithm: str = "HS256"
    
    model_config = {"env_file": "../.env", "env_file_encoding": "utf-8"}

settings = Settings()
