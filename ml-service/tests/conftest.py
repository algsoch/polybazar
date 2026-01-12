"""
PolyBazar ML Service Test Configuration
"""
import pytest
import numpy as np
from unittest.mock import MagicMock, patch
from PIL import Image
import io


@pytest.fixture(scope="session")
def mock_models():
    """Mock ML models for testing."""
    with patch.dict('sys.modules', {
        'sentence_transformers': MagicMock(),
        'tensorflow': MagicMock(),
        'torch': MagicMock(),
        'faiss': MagicMock(),
        'chromadb': MagicMock(),
        'pytesseract': MagicMock(),
    }):
        yield


@pytest.fixture
def sample_embedding():
    """Generate a sample embedding vector."""
    return np.random.rand(384).astype(np.float32)


@pytest.fixture
def sample_embeddings():
    """Generate sample batch embeddings."""
    return np.random.rand(10, 384).astype(np.float32)


@pytest.fixture
def sample_image_bytes():
    """Create sample image as bytes."""
    img = Image.new('RGB', (224, 224), color='blue')
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)
    return buffer.getvalue()


@pytest.fixture
def sample_image_pil():
    """Create sample PIL Image."""
    return Image.new('RGB', (224, 224), color='white')


@pytest.fixture
def sample_document_image():
    """Create sample document image for OCR testing."""
    img = Image.new('RGB', (800, 600), color='white')
    return img


@pytest.fixture
def sample_product_data():
    """Sample product data for testing."""
    return {
        "id": "prod-test-123",
        "title": "High Quality HDPE Granules",
        "polymer_type": "HDPE",
        "grade": "Injection",
        "mfi": 8.0,
        "quantity": 1000,
        "unit": "kg",
        "price": 1.50,
        "currency": "USD",
        "location": {
            "city": "Mumbai",
            "country": "India",
            "lat": 19.0760,
            "lng": 72.8777
        }
    }


@pytest.fixture
def sample_price_prediction_input():
    """Sample input for price prediction."""
    return {
        "polymer_type": "HDPE",
        "grade": "Injection",
        "mfi": 8.0,
        "quantity": 1000,
        "location": {"country": "India", "city": "Mumbai"}
    }


@pytest.fixture
def sample_kyc_data():
    """Sample KYC document data."""
    return {
        "document_type": "PAN_CARD",
        "fields": {
            "pan_number": "ABCDE1234F",
            "name": "TEST USER",
            "father_name": "FATHER NAME",
            "date_of_birth": "01/01/1990"
        }
    }


@pytest.fixture
def mock_faiss_index():
    """Create mock FAISS index."""
    mock_index = MagicMock()
    mock_index.ntotal = 100
    mock_index.d = 384
    mock_index.search.return_value = (
        np.array([[0.95, 0.88, 0.75]]),
        np.array([[0, 1, 2]])
    )
    return mock_index


@pytest.fixture
def mock_sentence_transformer():
    """Create mock SentenceTransformer."""
    mock = MagicMock()
    mock.encode.return_value = np.random.rand(384)
    return mock


@pytest.fixture
def mock_vision_model():
    """Create mock vision model."""
    mock = MagicMock()
    mock.predict.return_value = np.array([[0.1, 0.7, 0.1, 0.1]])
    return mock


class AsyncMock(MagicMock):
    """Mock class for async functions."""
    
    async def __call__(self, *args, **kwargs):
        return super(AsyncMock, self).__call__(*args, **kwargs)


@pytest.fixture
def async_mock():
    """Create async mock."""
    return AsyncMock()


def pytest_configure(config):
    """Configure pytest markers."""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )
