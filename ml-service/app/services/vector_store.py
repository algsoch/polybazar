"""
Vector Store Service for similarity search
Supports FAISS and ChromaDB
"""

import numpy as np
from typing import Dict, Any, List, Optional
import os
import logging
import json

from app.config import settings

logger = logging.getLogger(__name__)

# Try to import FAISS
try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    logger.warning("FAISS not available")

# Try to import ChromaDB
try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False
    logger.warning("ChromaDB not available")


class VectorStoreService:
    def __init__(self):
        self._ready = False
        self._index = None
        self._id_mapping = {}  # product_id -> index position
        self._reverse_mapping = {}  # index position -> product_id
        self._metadata_store = {}
        self._dimension = 384  # SentenceTransformers all-MiniLM-L6-v2 dimension
        
        self._init_store()
    
    def _init_store(self):
        """Initialize vector store based on configuration"""
        store_type = settings.VECTOR_STORE_TYPE.lower()
        
        if store_type == "faiss" and FAISS_AVAILABLE:
            self._init_faiss()
        elif store_type == "chroma" and CHROMA_AVAILABLE:
            self._init_chroma()
        else:
            # Fallback to in-memory numpy-based store
            self._init_numpy_store()
    
    def _init_faiss(self):
        """Initialize FAISS index"""
        try:
            index_path = settings.FAISS_INDEX_PATH
            
            if os.path.exists(f"{index_path}.index"):
                # Load existing index
                self._index = faiss.read_index(f"{index_path}.index")
                with open(f"{index_path}.mapping", 'r') as f:
                    mapping_data = json.load(f)
                    self._id_mapping = mapping_data.get('id_mapping', {})
                    self._reverse_mapping = {v: k for k, v in self._id_mapping.items()}
                logger.info(f"Loaded FAISS index with {self._index.ntotal} vectors")
            else:
                # Create new index
                self._index = faiss.IndexFlatIP(self._dimension)  # Inner product for cosine similarity
                os.makedirs(os.path.dirname(index_path), exist_ok=True)
                logger.info("Created new FAISS index")
            
            self._store_type = "faiss"
            self._ready = True
            
        except Exception as e:
            logger.error(f"Failed to initialize FAISS: {e}")
            self._init_numpy_store()
    
    def _init_chroma(self):
        """Initialize ChromaDB"""
        try:
            self._chroma_client = chromadb.Client(ChromaSettings(
                chroma_db_impl="duckdb+parquet",
                persist_directory=settings.CHROMA_PERSIST_DIR
            ))
            
            self._collection = self._chroma_client.get_or_create_collection(
                name="products",
                metadata={"hnsw:space": "cosine"}
            )
            
            self._store_type = "chroma"
            self._ready = True
            logger.info("Initialized ChromaDB")
            
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            self._init_numpy_store()
    
    def _init_numpy_store(self):
        """Initialize simple numpy-based store"""
        self._vectors = np.array([]).reshape(0, self._dimension)
        self._store_type = "numpy"
        self._ready = True
        logger.info("Using in-memory numpy vector store")
    
    def is_ready(self) -> bool:
        return self._ready
    
    def add_product(self, product_id: str, embedding: np.ndarray, metadata: Optional[Dict] = None):
        """Add product to vector store"""
        if not self._ready:
            raise RuntimeError("Vector store not initialized")
        
        # Normalize embedding for cosine similarity
        embedding = embedding / np.linalg.norm(embedding)
        
        if self._store_type == "faiss":
            self._add_faiss(product_id, embedding, metadata)
        elif self._store_type == "chroma":
            self._add_chroma(product_id, embedding, metadata)
        else:
            self._add_numpy(product_id, embedding, metadata)
    
    def _add_faiss(self, product_id: str, embedding: np.ndarray, metadata: Optional[Dict]):
        """Add to FAISS index"""
        idx = self._index.ntotal
        self._index.add(embedding.reshape(1, -1).astype('float32'))
        self._id_mapping[product_id] = idx
        self._reverse_mapping[idx] = product_id
        if metadata:
            self._metadata_store[product_id] = metadata
        self._save_faiss()
    
    def _add_chroma(self, product_id: str, embedding: np.ndarray, metadata: Optional[Dict]):
        """Add to ChromaDB"""
        self._collection.add(
            ids=[product_id],
            embeddings=[embedding.tolist()],
            metadatas=[metadata] if metadata else None
        )
    
    def _add_numpy(self, product_id: str, embedding: np.ndarray, metadata: Optional[Dict]):
        """Add to numpy store"""
        idx = len(self._id_mapping)
        self._vectors = np.vstack([self._vectors, embedding.reshape(1, -1)])
        self._id_mapping[product_id] = idx
        self._reverse_mapping[idx] = product_id
        if metadata:
            self._metadata_store[product_id] = metadata
    
    def find_similar(self, product_id: str, limit: int = 10) -> Dict[str, Any]:
        """Find similar products by product ID"""
        if not self._ready:
            raise RuntimeError("Vector store not initialized")
        
        if self._store_type == "chroma":
            return self._find_similar_chroma(product_id, limit)
        
        # Get product's embedding
        if product_id not in self._id_mapping:
            return {"recommendations": [], "scores": []}
        
        idx = self._id_mapping[product_id]
        
        if self._store_type == "faiss":
            embedding = self._index.reconstruct(idx)
        else:
            embedding = self._vectors[idx]
        
        return self.find_similar_by_vector(embedding, limit, exclude_id=product_id)
    
    def find_similar_by_vector(self, embedding: np.ndarray, limit: int = 10, 
                               exclude_id: Optional[str] = None) -> Dict[str, Any]:
        """Find similar products by embedding vector"""
        if not self._ready:
            raise RuntimeError("Vector store not initialized")
        
        # Normalize
        embedding = embedding / np.linalg.norm(embedding)
        
        if self._store_type == "faiss":
            return self._search_faiss(embedding, limit, exclude_id)
        elif self._store_type == "chroma":
            return self._search_chroma(embedding, limit)
        else:
            return self._search_numpy(embedding, limit, exclude_id)
    
    def _search_faiss(self, embedding: np.ndarray, limit: int, 
                      exclude_id: Optional[str]) -> Dict[str, Any]:
        """Search FAISS index"""
        k = limit + 1 if exclude_id else limit
        distances, indices = self._index.search(
            embedding.reshape(1, -1).astype('float32'), 
            min(k, self._index.ntotal)
        )
        
        recommendations = []
        scores = []
        
        for dist, idx in zip(distances[0], indices[0]):
            if idx < 0:
                continue
            product_id = self._reverse_mapping.get(idx)
            if product_id and product_id != exclude_id:
                recommendations.append(product_id)
                scores.append(float(dist))
                if len(recommendations) >= limit:
                    break
        
        return {"recommendations": recommendations, "scores": scores}
    
    def _search_chroma(self, embedding: np.ndarray, limit: int) -> Dict[str, Any]:
        """Search ChromaDB"""
        results = self._collection.query(
            query_embeddings=[embedding.tolist()],
            n_results=limit
        )
        
        return {
            "recommendations": results['ids'][0] if results['ids'] else [],
            "scores": [1 - d for d in results['distances'][0]] if results['distances'] else []
        }
    
    def _find_similar_chroma(self, product_id: str, limit: int) -> Dict[str, Any]:
        """Find similar in ChromaDB by product ID"""
        # Get product embedding
        result = self._collection.get(ids=[product_id], include=['embeddings'])
        if not result['embeddings']:
            return {"recommendations": [], "scores": []}
        
        embedding = np.array(result['embeddings'][0])
        
        # Search
        results = self._collection.query(
            query_embeddings=[embedding.tolist()],
            n_results=limit + 1
        )
        
        # Exclude the query product
        recommendations = []
        scores = []
        for pid, dist in zip(results['ids'][0], results['distances'][0]):
            if pid != product_id:
                recommendations.append(pid)
                scores.append(1 - dist)
        
        return {"recommendations": recommendations[:limit], "scores": scores[:limit]}
    
    def _search_numpy(self, embedding: np.ndarray, limit: int, 
                      exclude_id: Optional[str]) -> Dict[str, Any]:
        """Search numpy store"""
        if len(self._vectors) == 0:
            return {"recommendations": [], "scores": []}
        
        # Compute cosine similarities
        similarities = np.dot(self._vectors, embedding)
        
        # Get top k
        indices = np.argsort(similarities)[::-1]
        
        recommendations = []
        scores = []
        
        for idx in indices:
            product_id = self._reverse_mapping.get(idx)
            if product_id and product_id != exclude_id:
                recommendations.append(product_id)
                scores.append(float(similarities[idx]))
                if len(recommendations) >= limit:
                    break
        
        return {"recommendations": recommendations, "scores": scores}
    
    def remove_product(self, product_id: str):
        """Remove product from index"""
        if self._store_type == "chroma":
            try:
                self._collection.delete(ids=[product_id])
            except Exception as e:
                logger.error(f"Failed to remove from ChromaDB: {e}")
        else:
            # For FAISS and numpy, we can't easily remove
            # Mark as deleted in mapping
            if product_id in self._id_mapping:
                del self._id_mapping[product_id]
                logger.info(f"Marked product {product_id} as deleted")
    
    def _save_faiss(self):
        """Save FAISS index to disk"""
        if self._store_type != "faiss":
            return
        
        try:
            index_path = settings.FAISS_INDEX_PATH
            faiss.write_index(self._index, f"{index_path}.index")
            with open(f"{index_path}.mapping", 'w') as f:
                json.dump({'id_mapping': self._id_mapping}, f)
        except Exception as e:
            logger.error(f"Failed to save FAISS index: {e}")
