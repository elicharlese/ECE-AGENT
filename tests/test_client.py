import pytest
from fastapi.testclient import TestClient
from main import app

def test_fastapi_version():
    """Test to check FastAPI and TestClient compatibility"""
    # This is a simple test to verify TestClient usage
    with TestClient(app) as client:
        response = client.get("/openapi.json")
        assert response.status_code == 200

if __name__ == "__main__":
    pytest.main([__file__])
