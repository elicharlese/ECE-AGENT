import pytest
import json
from fastapi import FastAPI
from fastapi.testclient import TestClient
from main import app
# Using context manager approach for TestClient
# client = TestClient(app)

# client = TestClient(app)

class TestAgentQueryEndpoint:
    """Test suite for the AGENT query endpoint"""
    
    def test_agent_query_endpoint_exists(self):
        """Test that the AGENT query endpoint is properly defined"""
        # Check that the endpoint route exists
        routes = [route.path for route in app.routes]
        assert "/agent/query" in routes
    
    def test_agent_query_requires_auth(self):
        """Test that the AGENT query endpoint requires authentication"""
        with TestClient(app) as client:
            response = client.post("/agent/query", json={
                "query": "test query",
                "domain": "general",
                "use_internet": True
            })
            # Should return 401 Unauthorized without proper authentication
            assert response.status_code == 401

class TestDomainAgents:
    """Test suite for domain agent functionality"""
    
    def test_domain_agents_list(self):
        """Test that expected domain-related endpoints exist"""
        # Check that the domain-specific endpoints exist
        routes = [route.path for route in app.routes]
        domain_endpoints = [
            "/training/retrain/{domain}",
            "/training/performance/{domain}",
            "/training/rollback/{domain}"
        ]
        for endpoint in domain_endpoints:
            assert endpoint in routes

if __name__ == "__main__":
    pytest.main([__file__])
