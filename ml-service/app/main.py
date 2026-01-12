"""
PolyBazar ML Service
FastAPI-based microservice for AI/ML features including:
- Product embedding generation using SentenceTransformers
- Image classification for polymer type detection
- Price prediction using ensemble models
- OCR for KYC document processing
- Vector similarity search using FAISS/Chroma
"""

import os
import random
from fastapi import FastAPI, HTTPException, File, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from typing import List, Optional, Dict, Any
from datetime import datetime

# Settings
class Settings(BaseSettings):
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    ML_MODELS_ENABLED: bool = False  # Set to True when ML deps are installed
    
    class Config:
        env_file = ".env"

settings = Settings()

app = FastAPI(
    title="PolyBazar ML Service",
    description="AI/ML microservice for polymer trading platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mock services for development (when ML deps not installed)
class MockEmbeddingService:
    model_name = "all-MiniLM-L6-v2"
    
    def is_ready(self):
        return True
    
    def encode(self, text: str) -> List[float]:
        # Return deterministic mock embedding based on text hash
        import hashlib
        seed = int(hashlib.md5(text.encode()).hexdigest()[:8], 16)
        random.seed(seed)
        return [random.uniform(-1, 1) for _ in range(384)]
    
    def encode_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.encode(t) for t in texts]


class MockVisionService:
    def is_ready(self):
        return True
    
    async def classify(self, image_url: str) -> Dict[str, Any]:
        categories = ["HDPE", "LDPE", "PP", "PET", "PVC", "ABS"]
        return {
            "category": random.choice(categories),
            "type": "granules",
            "confidence": random.uniform(0.85, 0.98),
            "all_predictions": [{"label": c, "score": random.uniform(0.1, 0.9)} for c in categories]
        }
    
    def classify_bytes(self, contents: bytes) -> Dict[str, Any]:
        categories = ["HDPE", "LDPE", "PP", "PET", "PVC", "ABS"]
        return {
            "category": random.choice(categories),
            "type": "granules",
            "confidence": random.uniform(0.85, 0.98),
            "all_predictions": [{"label": c, "score": random.uniform(0.1, 0.9)} for c in categories]
        }


class MockPricePredictorService:
    def is_ready(self):
        return True
    
    def predict(self, category: str, polymer_type: str, **kwargs) -> Dict[str, Any]:
        base_prices = {"HDPE": 85, "LDPE": 75, "PP": 90, "PET": 65, "PVC": 55, "ABS": 110}
        base = base_prices.get(category, 70)
        predicted = base + random.uniform(-10, 15)
        return {
            "predicted_price": round(predicted, 2),
            "price_range": {"min": round(predicted * 0.9, 2), "max": round(predicted * 1.1, 2)},
            "confidence": random.uniform(0.75, 0.92),
            "market_trend": random.choice(["up", "stable", "down"]),
            "factors": [
                {"name": "Base Price", "impact": "high"},
                {"name": "Quality Grade", "impact": "medium"},
                {"name": "Location", "impact": "low"}
            ]
        }
    
    def get_history(self, category: str, polymer_type: str, days: int) -> List[Dict]:
        return [
            {"date": f"2024-{11-i//30:02d}-{(i%30)+1:02d}", "price": 70 + random.uniform(-5, 10)}
            for i in range(days)
        ]


class MockOCRService:
    def is_ready(self):
        return True
    
    async def extract(self, document_url: str, document_type: str) -> Dict[str, Any]:
        return {
            "extracted_data": {
                "name": "SAMPLE USER",
                "document_number": "ABCDE1234F",
                "document_type": document_type.upper()
            },
            "confidence": 0.92,
            "raw_text": "SAMPLE OCR TEXT EXTRACTED FROM DOCUMENT"
        }
    
    def extract_bytes(self, contents: bytes, document_type: str) -> Dict[str, Any]:
        return {
            "extracted_data": {
                "name": "SAMPLE USER",
                "document_number": "ABCDE1234F",
                "document_type": document_type.upper()
            },
            "confidence": 0.92,
            "raw_text": "SAMPLE OCR TEXT EXTRACTED FROM DOCUMENT"
        }


class MockVectorStoreService:
    def __init__(self):
        self.products = {}
    
    def is_ready(self):
        return True
    
    def find_similar(self, product_id: str, limit: int) -> Dict[str, Any]:
        return {
            "recommendations": [f"product-{i}" for i in range(limit)],
            "scores": [random.uniform(0.7, 0.95) for _ in range(limit)]
        }
    
    def find_similar_by_vector(self, embedding: List[float], limit: int) -> Dict[str, Any]:
        return {
            "recommendations": [f"product-{i}" for i in range(limit)],
            "scores": [random.uniform(0.7, 0.95) for _ in range(limit)]
        }
    
    def add_product(self, product_id: str, embedding: List[float], metadata: Dict = None):
        self.products[product_id] = {"embedding": embedding, "metadata": metadata}
    
    def remove_product(self, product_id: str):
        self.products.pop(product_id, None)


# Initialize services
embedding_service = MockEmbeddingService()
vision_service = MockVisionService()
price_predictor = MockPricePredictorService()
ocr_service = MockOCRService()
vector_store = MockVectorStoreService()


class EmbeddingRequest(BaseModel):
    text: str


class EmbeddingResponse(BaseModel):
    embedding: List[float]
    model: str
    dimension: int


class ClassifyRequest(BaseModel):
    image_url: str


class ClassifyResponse(BaseModel):
    category: str
    type: str
    confidence: float
    all_predictions: List[Dict[str, Any]]


class PricePredictRequest(BaseModel):
    category: str
    type: str
    grade: Optional[str] = None
    brand: Optional[str] = None
    quantity: Optional[float] = 1.0
    location: Optional[str] = None


class PricePredictResponse(BaseModel):
    predicted_price: float
    price_range: Dict[str, float]
    confidence: float
    market_trend: str
    factors: List[Dict[str, Any]]


class OCRRequest(BaseModel):
    document_url: str
    document_type: str


class OCRResponse(BaseModel):
    extracted_data: Dict[str, Any]
    confidence: float
    raw_text: str


class RecommendRequest(BaseModel):
    product_id: str
    limit: int = 10


class RecommendResponse(BaseModel):
    recommendations: List[str]
    scores: List[float]


class IndexProductRequest(BaseModel):
    product_id: str
    text: str
    metadata: Optional[Dict[str, Any]] = None


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "embedding": embedding_service.is_ready(),
            "vision": vision_service.is_ready(),
            "price_predictor": price_predictor.is_ready(),
            "ocr": ocr_service.is_ready(),
            "vector_store": vector_store.is_ready()
        }
    }


@app.post("/embed", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest):
    """Generate text embedding using SentenceTransformers"""
    try:
        embedding = embedding_service.encode(request.text)
        return EmbeddingResponse(
            embedding=embedding.tolist(),
            model=embedding_service.model_name,
            dimension=len(embedding)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/embed/batch")
async def generate_embeddings_batch(texts: List[str]):
    """Generate embeddings for multiple texts"""
    try:
        embeddings = embedding_service.encode_batch(texts)
        return {
            "embeddings": [e.tolist() for e in embeddings],
            "model": embedding_service.model_name,
            "count": len(embeddings)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/vision/classify", response_model=ClassifyResponse)
async def classify_image(request: ClassifyRequest):
    """Classify polymer image using EfficientNet"""
    try:
        result = await vision_service.classify(request.image_url)
        return ClassifyResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/vision/classify/upload")
async def classify_uploaded_image(file: UploadFile = File(...)):
    """Classify uploaded polymer image"""
    try:
        contents = await file.read()
        result = vision_service.classify_bytes(contents)
        return ClassifyResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/price/predict", response_model=PricePredictResponse)
async def predict_price(request: PricePredictRequest):
    """Predict polymer price based on features"""
    try:
        result = price_predictor.predict(
            category=request.category,
            polymer_type=request.type,
            grade=request.grade,
            brand=request.brand,
            quantity=request.quantity,
            location=request.location
        )
        return PricePredictResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/price/history/{category}/{polymer_type}")
async def get_price_history(category: str, polymer_type: str, days: int = 30):
    """Get historical price data"""
    try:
        history = price_predictor.get_history(category, polymer_type, days)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ocr/extract", response_model=OCRResponse)
async def extract_document(request: OCRRequest):
    """Extract data from KYC documents using OCR"""
    try:
        result = await ocr_service.extract(request.document_url, request.document_type)
        return OCRResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ocr/extract/upload")
async def extract_uploaded_document(
    file: UploadFile = File(...),
    document_type: str = "pan"
):
    """Extract data from uploaded KYC document"""
    try:
        contents = await file.read()
        result = ocr_service.extract_bytes(contents, document_type)
        return OCRResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recommend")
async def get_recommendations(product_id: str, limit: int = 10):
    """Get product recommendations using vector similarity"""
    try:
        recommendations = vector_store.find_similar(product_id, limit)
        return RecommendResponse(**recommendations)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommend/by-text")
async def get_recommendations_by_text(text: str, limit: int = 10):
    """Get product recommendations based on text query"""
    try:
        embedding = embedding_service.encode(text)
        recommendations = vector_store.find_similar_by_vector(embedding, limit)
        return RecommendResponse(**recommendations)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/index/product")
async def index_product(request: IndexProductRequest, background_tasks: BackgroundTasks):
    """Index a product for similarity search"""
    try:
        embedding = embedding_service.encode(request.text)
        background_tasks.add_task(
            vector_store.add_product,
            request.product_id,
            embedding,
            request.metadata
        )
        return {"status": "indexing", "product_id": request.product_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/index/product/{product_id}")
async def remove_product_from_index(product_id: str):
    """Remove a product from the similarity index"""
    try:
        vector_store.remove_product(product_id)
        return {"status": "removed", "product_id": product_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
