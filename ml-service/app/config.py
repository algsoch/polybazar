from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "PolyBazar ML Service"
    DEBUG: bool = False
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    
    # MongoDB
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB: str = "polybazar"
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # ML Models
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    VISION_MODEL: str = "efficientnet-b0"
    
    # Vector Store
    VECTOR_STORE_TYPE: str = "faiss"  # or "chroma"
    FAISS_INDEX_PATH: str = "./data/faiss_index"
    CHROMA_PERSIST_DIR: str = "./data/chroma"
    
    # OCR
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", "tesseract")
    
    # Encryption (AES-256 for KYC data)
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "your-32-byte-encryption-key-here!")
    
    class Config:
        env_file = ".env"


settings = Settings()
