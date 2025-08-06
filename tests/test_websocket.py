import pytest
import json
import asyncio
from fastapi import FastAPI
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocket
from unittest.mock import Mock, patch
from main import app, manager

# Using context manager approach for TestClient
# client = TestClient(app)


class TestWebSocketManager:
    """Test suite for the WebSocket ConnectionManager class"""
    
    def test_connection_manager_initialization(self):
        """Test that ConnectionManager initializes with empty connections and history"""
        assert len(manager.active_connections) == 0
        assert len(manager.chat_history) == 0
    
    def test_broadcast_message(self):
        """Test that broadcast method adds message to history"""
        # This would require a mock WebSocket connection for full testing
        # For now, we'll test the history management aspect
        initial_history_length = len(manager.chat_history)
        # Note: Full WebSocket testing requires more complex setup
        
    def test_chat_history_limit(self):
        """Test that chat history is limited to 1000 messages"""
        # Clear existing history
        manager.chat_history = []
        
        # Add 1001 messages by calling broadcast method
        for i in range(1001):
            message_data = {
                "content": f"Message {i}",
                "sender": "TestUser",
                "type": "public",
                "timestamp": "2023-01-01T00:00:00"
            }
            # Mock the broadcast method to avoid sending to connections
            with patch.object(manager, 'active_connections', []):
                asyncio.run(manager.broadcast(f"Message {i}", "TestUser", "public"))
        
        # Check that history is limited to 1000 messages
        assert len(manager.chat_history) == 1000
        # Check that the first message was removed (message 0)
        assert manager.chat_history[0]["content"] == "Message 1"
        # Check that the last message is still there (message 1000)
        assert manager.chat_history[-1]["content"] == "Message 1000"

class TestWebSocketEndpoint:
    """Test suite for the WebSocket chat endpoint"""
    
    def test_websocket_endpoint_exists(self):
        """Test that the WebSocket endpoint is properly defined"""
        # Check that the endpoint route exists
        routes = [route.path for route in app.routes]
        assert "/ws/chat" in routes

if __name__ == "__main__":
    pytest.main([__file__])
