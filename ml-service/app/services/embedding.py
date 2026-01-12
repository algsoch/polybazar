"""
Text Embedding Service using SentenceTransformers
Generates dense vector representations for semantic similarity
"""

import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Union
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL
        self._model = None
        self._ready = False
        self._load_model()
    
    def _load_model(self):
        try:
            logger.info(f"Loading embedding model: {self.model_name}")
            self._model = SentenceTransformer(self.model_name)
            self._ready = True
            logger.info("Embedding model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            self._ready = False
    
    def is_ready(self) -> bool:
        return self._ready
    
    def encode(self, text: str) -> np.ndarray:
        """Generate embedding for a single text"""
        if not self._ready:
            raise RuntimeError("Embedding model not loaded")
        
        # Preprocess text
        text = self._preprocess(text)
        
        # Generate embedding
        embedding = self._model.encode(text, convert_to_numpy=True)
        
        return embedding
    
    def encode_batch(self, texts: List[str]) -> List[np.ndarray]:
        """Generate embeddings for multiple texts"""
        if not self._ready:
            raise RuntimeError("Embedding model not loaded")
        
        # Preprocess texts
        texts = [self._preprocess(t) for t in texts]
        
        # Generate embeddings
        embeddings = self._model.encode(texts, convert_to_numpy=True, batch_size=32)
        
        return embeddings
    
    def similarity(self, text1: str, text2: str) -> float:
        """Calculate cosine similarity between two texts"""
        emb1 = self.encode(text1)
        emb2 = self.encode(text2)
        
        # Cosine similarity
        similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
        
        return float(similarity)
    
    def _preprocess(self, text: str) -> str:
        """Preprocess text for embedding"""
        # Basic cleaning
        text = text.strip()
        text = " ".join(text.split())  # Normalize whitespace
        
        # Polymer-specific preprocessing
        # Expand common abbreviations
        abbreviations = {
            "PP": "Polypropylene",
            "PE": "Polyethylene",
            "HDPE": "High Density Polyethylene",
            "LDPE": "Low Density Polyethylene",
            "LLDPE": "Linear Low Density Polyethylene",
            "PVC": "Polyvinyl Chloride",
            "PET": "Polyethylene Terephthalate",
            "PS": "Polystyrene",
            "ABS": "Acrylonitrile Butadiene Styrene",
            "PC": "Polycarbonate",
            "PA": "Polyamide Nylon",
            "PU": "Polyurethane",
            "PMMA": "Polymethyl Methacrylate Acrylic",
            "MFI": "Melt Flow Index",
        }
        
        for abbr, full in abbreviations.items():
            text = text.replace(f" {abbr} ", f" {abbr} ({full}) ")
        
        return text
