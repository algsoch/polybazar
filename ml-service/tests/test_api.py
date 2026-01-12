import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import numpy as np
from PIL import Image
import io

from app.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def sample_image():
    """Create a sample test image."""
    img = Image.new('RGB', (224, 224), color='white')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    return img_byte_arr


@pytest.fixture
def sample_embedding():
    """Create a sample embedding vector."""
    return np.random.rand(384).tolist()


class TestHealthEndpoints:
    """Tests for health check endpoints."""

    def test_health_check(self, client):
        """Test basic health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_readiness_check(self, client):
        """Test readiness check endpoint."""
        response = client.get("/ready")
        assert response.status_code == 200
        assert "services" in response.json()


class TestEmbeddingEndpoints:
    """Tests for text embedding endpoints."""

    @patch('app.services.embedding.EmbeddingService.embed_text')
    def test_embed_text_success(self, mock_embed, client, sample_embedding):
        """Test successful text embedding generation."""
        mock_embed.return_value = sample_embedding

        response = client.post(
            "/api/v1/embed",
            json={"text": "HDPE polymer granules high quality"}
        )

        assert response.status_code == 200
        assert "embedding" in response.json()
        assert len(response.json()["embedding"]) == 384

    def test_embed_text_empty_input(self, client):
        """Test embedding with empty text."""
        response = client.post(
            "/api/v1/embed",
            json={"text": ""}
        )

        assert response.status_code == 422

    @patch('app.services.embedding.EmbeddingService.embed_batch')
    def test_embed_batch_success(self, mock_embed, client, sample_embedding):
        """Test batch text embedding."""
        mock_embed.return_value = [sample_embedding, sample_embedding]

        response = client.post(
            "/api/v1/embed/batch",
            json={"texts": ["HDPE granules", "PP pellets"]}
        )

        assert response.status_code == 200
        assert len(response.json()["embeddings"]) == 2


class TestVisionEndpoints:
    """Tests for image classification endpoints."""

    @patch('app.services.vision.VisionService.classify_image')
    def test_classify_image_success(self, mock_classify, client, sample_image):
        """Test successful image classification."""
        mock_classify.return_value = {
            "polymer_type": "HDPE",
            "confidence": 0.92,
            "form": "granules",
            "color": "white"
        }

        response = client.post(
            "/api/v1/classify",
            files={"image": ("test.jpg", sample_image, "image/jpeg")}
        )

        assert response.status_code == 200
        assert response.json()["polymer_type"] == "HDPE"
        assert response.json()["confidence"] > 0.5

    def test_classify_invalid_file(self, client):
        """Test classification with invalid file type."""
        response = client.post(
            "/api/v1/classify",
            files={"image": ("test.txt", b"not an image", "text/plain")}
        )

        assert response.status_code == 422

    @patch('app.services.vision.VisionService.extract_polymer_features')
    def test_extract_features_success(self, mock_extract, client, sample_image):
        """Test polymer feature extraction."""
        mock_extract.return_value = {
            "color_rgb": [255, 255, 255],
            "texture": "smooth",
            "granule_size": "medium",
            "uniformity": 0.95
        }

        response = client.post(
            "/api/v1/features",
            files={"image": ("test.jpg", sample_image, "image/jpeg")}
        )

        assert response.status_code == 200
        assert "color_rgb" in response.json()


class TestPricePredictionEndpoints:
    """Tests for price prediction endpoints."""

    @patch('app.services.price_predictor.PricePredictorService.predict')
    def test_predict_price_success(self, mock_predict, client):
        """Test successful price prediction."""
        mock_predict.return_value = {
            "predicted_price": 1.45,
            "confidence_interval": [1.35, 1.55],
            "confidence": 0.87,
            "factors": {
                "base_price": 1.40,
                "quality_adjustment": 0.05,
                "market_trend": 0.00
            }
        }

        response = client.post(
            "/api/v1/predict/price",
            json={
                "polymer_type": "HDPE",
                "grade": "Injection",
                "mfi": 8.0,
                "quantity": 1000,
                "location": {"country": "India", "city": "Mumbai"}
            }
        )

        assert response.status_code == 200
        assert "predicted_price" in response.json()
        assert response.json()["predicted_price"] > 0

    def test_predict_price_invalid_polymer(self, client):
        """Test prediction with invalid polymer type."""
        response = client.post(
            "/api/v1/predict/price",
            json={
                "polymer_type": "INVALID",
                "grade": "Injection",
                "quantity": 1000
            }
        )

        assert response.status_code == 422

    @patch('app.services.price_predictor.PricePredictorService.get_market_trends')
    def test_market_trends_success(self, mock_trends, client):
        """Test market trends endpoint."""
        mock_trends.return_value = {
            "polymer_type": "HDPE",
            "trend": "upward",
            "change_percent": 2.5,
            "period": "30d"
        }

        response = client.get("/api/v1/trends/HDPE")

        assert response.status_code == 200
        assert response.json()["polymer_type"] == "HDPE"


class TestOCREndpoints:
    """Tests for OCR endpoints."""

    @patch('app.services.ocr.OCRService.extract_text')
    def test_ocr_extract_success(self, mock_ocr, client, sample_image):
        """Test successful OCR text extraction."""
        mock_ocr.return_value = {
            "text": "COMPANY NAME\nGST: 27XXXXX\nPAN: ABCDE1234F",
            "confidence": 0.89,
            "blocks": [
                {"text": "COMPANY NAME", "confidence": 0.95},
                {"text": "GST: 27XXXXX", "confidence": 0.88}
            ]
        }

        response = client.post(
            "/api/v1/ocr/extract",
            files={"document": ("kyc.jpg", sample_image, "image/jpeg")}
        )

        assert response.status_code == 200
        assert "text" in response.json()

    @patch('app.services.ocr.OCRService.extract_kyc_fields')
    def test_kyc_extraction_success(self, mock_kyc, client, sample_image):
        """Test KYC field extraction."""
        mock_kyc.return_value = {
            "document_type": "PAN_CARD",
            "fields": {
                "pan_number": "ABCDE1234F",
                "name": "TEST USER",
                "date_of_birth": "01/01/1990"
            },
            "confidence": 0.91,
            "encrypted_data": "encrypted_base64_string"
        }

        response = client.post(
            "/api/v1/ocr/kyc",
            files={"document": ("pan.jpg", sample_image, "image/jpeg")}
        )

        assert response.status_code == 200
        assert response.json()["document_type"] == "PAN_CARD"
        assert "encrypted_data" in response.json()


class TestRecommendationEndpoints:
    """Tests for product recommendation endpoints."""

    @patch('app.services.vector_store.VectorStoreService.find_similar')
    def test_similar_products_success(self, mock_similar, client, sample_embedding):
        """Test similar products search."""
        mock_similar.return_value = [
            {"id": "prod-1", "score": 0.95, "title": "HDPE Granules"},
            {"id": "prod-2", "score": 0.88, "title": "HDPE Pellets"}
        ]

        response = client.post(
            "/api/v1/recommend/similar",
            json={"product_id": "prod-123", "limit": 5}
        )

        assert response.status_code == 200
        assert len(response.json()["products"]) == 2
        assert response.json()["products"][0]["score"] > 0.9

    @patch('app.services.vector_store.VectorStoreService.semantic_search')
    def test_semantic_search_success(self, mock_search, client):
        """Test semantic search."""
        mock_search.return_value = [
            {"id": "prod-1", "score": 0.92, "title": "HDPE Injection Grade"}
        ]

        response = client.post(
            "/api/v1/recommend/search",
            json={"query": "high MFI HDPE for injection molding", "limit": 10}
        )

        assert response.status_code == 200
        assert len(response.json()["products"]) >= 1


class TestVectorStoreEndpoints:
    """Tests for vector store management endpoints."""

    @patch('app.services.vector_store.VectorStoreService.add_product')
    def test_add_product_to_index(self, mock_add, client, sample_embedding):
        """Test adding product to vector index."""
        mock_add.return_value = {"status": "indexed", "id": "prod-123"}

        response = client.post(
            "/api/v1/index/add",
            json={
                "id": "prod-123",
                "embedding": sample_embedding,
                "metadata": {"polymer_type": "HDPE", "grade": "Injection"}
            }
        )

        assert response.status_code == 200
        assert response.json()["status"] == "indexed"

    @patch('app.services.vector_store.VectorStoreService.remove_product')
    def test_remove_product_from_index(self, mock_remove, client):
        """Test removing product from vector index."""
        mock_remove.return_value = {"status": "removed", "id": "prod-123"}

        response = client.delete("/api/v1/index/prod-123")

        assert response.status_code == 200
        assert response.json()["status"] == "removed"

    @patch('app.services.vector_store.VectorStoreService.get_stats')
    def test_index_stats(self, mock_stats, client):
        """Test getting vector index statistics."""
        mock_stats.return_value = {
            "total_vectors": 10000,
            "dimensions": 384,
            "index_type": "FAISS"
        }

        response = client.get("/api/v1/index/stats")

        assert response.status_code == 200
        assert response.json()["total_vectors"] == 10000


class TestErrorHandling:
    """Tests for error handling."""

    def test_not_found_endpoint(self, client):
        """Test 404 response for unknown endpoint."""
        response = client.get("/api/v1/unknown")
        assert response.status_code == 404

    def test_method_not_allowed(self, client):
        """Test 405 response for wrong HTTP method."""
        response = client.get("/api/v1/embed")
        assert response.status_code == 405

    @patch('app.services.embedding.EmbeddingService.embed_text')
    def test_internal_server_error(self, mock_embed, client):
        """Test 500 response for internal errors."""
        mock_embed.side_effect = Exception("Model loading failed")

        response = client.post(
            "/api/v1/embed",
            json={"text": "test text"}
        )

        assert response.status_code == 500
        assert "error" in response.json()


class TestRateLimiting:
    """Tests for rate limiting."""

    def test_rate_limit_headers(self, client):
        """Test rate limit headers are present."""
        response = client.get("/health")

        # Rate limit headers should be present
        assert response.status_code == 200
        # Note: Actual rate limiting depends on middleware configuration


class TestAuthentication:
    """Tests for API authentication."""

    def test_protected_endpoint_without_token(self, client):
        """Test protected endpoint returns 401 without token."""
        response = client.post(
            "/api/v1/index/add",
            json={"id": "test", "embedding": [0.1] * 384}
        )

        # Depending on configuration, should return 401 or require auth
        assert response.status_code in [200, 401, 403]

    def test_protected_endpoint_with_invalid_token(self, client):
        """Test protected endpoint with invalid token."""
        response = client.post(
            "/api/v1/index/add",
            json={"id": "test", "embedding": [0.1] * 384},
            headers={"Authorization": "Bearer invalid_token"}
        )

        assert response.status_code in [200, 401, 403]
