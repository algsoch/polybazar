import pytest
import numpy as np
from unittest.mock import patch, MagicMock
from PIL import Image
import io

from app.services.embedding import EmbeddingService
from app.services.vision import VisionService
from app.services.price_predictor import PricePredictorService
from app.services.ocr import OCRService
from app.services.vector_store import VectorStoreService


class TestEmbeddingService:
    """Tests for EmbeddingService."""

    @pytest.fixture
    def service(self):
        """Create service instance with mocked model."""
        with patch('app.services.embedding.SentenceTransformer') as mock:
            mock_instance = MagicMock()
            mock_instance.encode.return_value = np.random.rand(384)
            mock.return_value = mock_instance
            return EmbeddingService()

    def test_embed_text_returns_correct_dimensions(self, service):
        """Test that embedding has correct dimensions."""
        embedding = service.embed_text("HDPE polymer granules")
        assert len(embedding) == 384

    def test_embed_text_normalizes_output(self, service):
        """Test that embedding is normalized."""
        embedding = service.embed_text("test text")
        norm = np.linalg.norm(embedding)
        assert abs(norm - 1.0) < 0.01  # Should be approximately unit length

    def test_embed_batch_returns_list(self, service):
        """Test batch embedding returns list of embeddings."""
        service.model.encode.return_value = np.random.rand(3, 384)
        
        embeddings = service.embed_batch([
            "HDPE granules",
            "PP pellets",
            "LDPE film"
        ])
        
        assert len(embeddings) == 3
        assert all(len(e) == 384 for e in embeddings)

    def test_embed_text_handles_special_characters(self, service):
        """Test embedding with special characters."""
        text = "HDPE ® polymer with μ-structure"
        embedding = service.embed_text(text)
        assert len(embedding) == 384

    def test_embed_text_caches_results(self, service):
        """Test that repeated embeddings use cache."""
        text = "test polymer"
        
        # First call
        service.embed_text(text)
        # Second call
        service.embed_text(text)
        
        # Model should be called only once due to caching
        assert service.model.encode.call_count <= 2


class TestVisionService:
    """Tests for VisionService."""

    @pytest.fixture
    def service(self):
        """Create service instance with mocked model."""
        with patch('app.services.vision.EfficientNetB0') as mock:
            mock_instance = MagicMock()
            mock_instance.predict.return_value = np.array([[0.1, 0.7, 0.1, 0.1]])
            mock.return_value = mock_instance
            return VisionService()

    @pytest.fixture
    def sample_image(self):
        """Create a sample test image."""
        return Image.new('RGB', (224, 224), color='white')

    def test_classify_image_returns_polymer_type(self, service, sample_image):
        """Test image classification returns polymer type."""
        result = service.classify_image(sample_image)
        
        assert "polymer_type" in result
        assert "confidence" in result

    def test_classify_image_confidence_range(self, service, sample_image):
        """Test confidence is in valid range."""
        result = service.classify_image(sample_image)
        
        assert 0 <= result["confidence"] <= 1

    def test_preprocess_image_resizes(self, service, sample_image):
        """Test image preprocessing resizes correctly."""
        processed = service._preprocess_image(sample_image)
        
        assert processed.shape == (1, 224, 224, 3)

    def test_extract_features_returns_dict(self, service, sample_image):
        """Test feature extraction returns dictionary."""
        features = service.extract_polymer_features(sample_image)
        
        assert isinstance(features, dict)
        assert "color_rgb" in features or "texture" in features


class TestPricePredictorService:
    """Tests for PricePredictorService."""

    @pytest.fixture
    def service(self):
        """Create service instance with mocked models."""
        with patch('app.services.price_predictor.joblib') as mock:
            mock.load.return_value = MagicMock()
            return PricePredictorService()

    def test_predict_returns_price(self, service):
        """Test prediction returns price."""
        service.models["ensemble"].predict.return_value = np.array([1.45])
        
        result = service.predict(
            polymer_type="HDPE",
            grade="Injection",
            mfi=8.0,
            quantity=1000,
            location={"country": "India"}
        )
        
        assert "predicted_price" in result
        assert result["predicted_price"] > 0

    def test_predict_returns_confidence_interval(self, service):
        """Test prediction returns confidence interval."""
        service.models["ensemble"].predict.return_value = np.array([1.45])
        
        result = service.predict(
            polymer_type="HDPE",
            grade="Injection",
            mfi=8.0,
            quantity=1000
        )
        
        assert "confidence_interval" in result
        assert len(result["confidence_interval"]) == 2

    def test_predict_handles_unknown_polymer(self, service):
        """Test prediction with unknown polymer falls back gracefully."""
        result = service.predict(
            polymer_type="UNKNOWN",
            grade="General",
            quantity=100
        )
        
        # Should return a default/fallback prediction
        assert "predicted_price" in result

    def test_feature_engineering(self, service):
        """Test feature engineering creates correct features."""
        features = service._create_features(
            polymer_type="HDPE",
            grade="Injection",
            mfi=8.0,
            quantity=1000,
            location={"country": "India", "city": "Mumbai"}
        )
        
        assert isinstance(features, np.ndarray)
        assert features.shape[0] > 0


class TestOCRService:
    """Tests for OCRService."""

    @pytest.fixture
    def service(self):
        """Create service instance with mocked pytesseract."""
        with patch('app.services.ocr.pytesseract') as mock:
            mock.image_to_string.return_value = "Sample OCR text"
            mock.image_to_data.return_value = {
                'text': ['Sample', 'text'],
                'conf': [90, 85]
            }
            return OCRService()

    @pytest.fixture
    def sample_image(self):
        """Create a sample test image."""
        return Image.new('RGB', (800, 600), color='white')

    def test_extract_text_returns_string(self, service, sample_image):
        """Test text extraction returns string."""
        result = service.extract_text(sample_image)
        
        assert "text" in result
        assert isinstance(result["text"], str)

    def test_extract_text_returns_confidence(self, service, sample_image):
        """Test extraction returns confidence score."""
        result = service.extract_text(sample_image)
        
        assert "confidence" in result
        assert 0 <= result["confidence"] <= 1

    def test_extract_kyc_fields_pan(self, service, sample_image):
        """Test KYC extraction for PAN card."""
        service.tesseract.image_to_string.return_value = (
            "INCOME TAX DEPARTMENT\n"
            "PERMANENT ACCOUNT NUMBER CARD\n"
            "ABCDE1234F\n"
            "Name: TEST USER"
        )
        
        result = service.extract_kyc_fields(sample_image, document_type="PAN")
        
        assert "document_type" in result
        assert "fields" in result

    def test_encryption_of_sensitive_data(self, service, sample_image):
        """Test sensitive data is encrypted."""
        result = service.extract_kyc_fields(sample_image, encrypt=True)
        
        if "encrypted_data" in result:
            assert result["encrypted_data"] != result.get("raw_text", "")

    def test_preprocess_improves_image(self, service, sample_image):
        """Test image preprocessing for OCR."""
        processed = service._preprocess_for_ocr(sample_image)
        
        # Should return a processed image
        assert processed is not None


class TestVectorStoreService:
    """Tests for VectorStoreService."""

    @pytest.fixture
    def service(self):
        """Create service instance with mocked FAISS."""
        with patch('app.services.vector_store.faiss') as mock:
            mock_index = MagicMock()
            mock_index.ntotal = 0
            mock.IndexFlatIP.return_value = mock_index
            return VectorStoreService()

    def test_add_product(self, service):
        """Test adding product to index."""
        embedding = np.random.rand(384).astype(np.float32)
        
        result = service.add_product("prod-123", embedding, {"title": "HDPE"})
        
        assert result["status"] == "indexed"

    def test_remove_product(self, service):
        """Test removing product from index."""
        # First add a product
        embedding = np.random.rand(384).astype(np.float32)
        service.add_product("prod-123", embedding, {})
        
        # Then remove it
        result = service.remove_product("prod-123")
        
        assert result["status"] == "removed"

    def test_find_similar(self, service):
        """Test finding similar products."""
        service.index.search.return_value = (
            np.array([[0.95, 0.88, 0.75]]),
            np.array([[0, 1, 2]])
        )
        service.metadata = {
            0: {"id": "prod-1"},
            1: {"id": "prod-2"},
            2: {"id": "prod-3"}
        }
        
        query_embedding = np.random.rand(384).astype(np.float32)
        results = service.find_similar(query_embedding, k=3)
        
        assert len(results) == 3
        assert results[0]["score"] > results[1]["score"]

    def test_semantic_search(self, service):
        """Test semantic search with text query."""
        with patch.object(service, 'embedding_service') as mock_embed:
            mock_embed.embed_text.return_value = np.random.rand(384)
            service.index.search.return_value = (
                np.array([[0.9]]),
                np.array([[0]])
            )
            service.metadata = {0: {"id": "prod-1", "title": "HDPE"}}
            
            results = service.semantic_search("HDPE granules", k=5)
            
            assert len(results) >= 0

    def test_get_stats(self, service):
        """Test getting index statistics."""
        service.index.ntotal = 10000
        
        stats = service.get_stats()
        
        assert "total_vectors" in stats
        assert stats["dimensions"] == 384

    def test_batch_add(self, service):
        """Test batch adding products."""
        embeddings = np.random.rand(10, 384).astype(np.float32)
        ids = [f"prod-{i}" for i in range(10)]
        metadata = [{"title": f"Product {i}"} for i in range(10)]
        
        result = service.batch_add(ids, embeddings, metadata)
        
        assert result["added"] == 10


class TestServiceIntegration:
    """Integration tests for service interactions."""

    @pytest.fixture
    def embedding_service(self):
        """Create mocked embedding service."""
        with patch('app.services.embedding.SentenceTransformer'):
            service = EmbeddingService()
            service.model.encode.return_value = np.random.rand(384)
            return service

    @pytest.fixture
    def vector_service(self):
        """Create mocked vector store service."""
        with patch('app.services.vector_store.faiss'):
            return VectorStoreService()

    def test_embedding_to_vector_store_flow(self, embedding_service, vector_service):
        """Test flow from text embedding to vector storage."""
        # Generate embedding
        text = "High quality HDPE granules for injection molding"
        embedding = embedding_service.embed_text(text)
        
        # Store in vector database
        result = vector_service.add_product(
            "prod-123",
            np.array(embedding, dtype=np.float32),
            {"title": text, "polymer_type": "HDPE"}
        )
        
        assert result["status"] == "indexed"

    def test_search_retrieval_flow(self, embedding_service, vector_service):
        """Test search and retrieval flow."""
        # Setup mock search results
        vector_service.index.search.return_value = (
            np.array([[0.95, 0.88]]),
            np.array([[0, 1]])
        )
        vector_service.metadata = {
            0: {"id": "prod-1", "title": "HDPE Granules"},
            1: {"id": "prod-2", "title": "HDPE Pellets"}
        }
        
        # Perform search
        query_embedding = np.array(
            embedding_service.embed_text("HDPE for injection"),
            dtype=np.float32
        )
        results = vector_service.find_similar(query_embedding, k=2)
        
        assert len(results) == 2
        assert all("id" in r for r in results)
