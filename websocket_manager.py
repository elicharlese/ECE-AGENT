"""
WebSocket Connection Manager
Handles WebSocket connections, disconnections, message broadcasting, and chat history.
"""

import asyncio
import json
from fastapi import WebSocket
from typing import List, Dict
import logging

class ConnectionManager:
    def __init__(self):
        # Store active connections
        self.active_connections: List[WebSocket] = []
        # Store chat history per domain
        self.chat_history: Dict[str, List[Dict]] = {}
        # Logger
        self.logger = logging.getLogger(__name__)
    
    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        self.logger.info(f"New WebSocket connection established. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            self.logger.info(f"WebSocket connection closed. Total connections: {len(self.active_connections)}")
    
    async def broadcast(self, message: str, sender: str, msg_type: str, domain: str = "general"):
        """Broadcast a message to all connected clients"""
        # Create message object
        message_obj = {
            "type": msg_type,
            "content": message,
            "sender": sender,
            "domain": domain,
            "timestamp": asyncio.get_event_loop().time()
        }
        
        # Add to chat history
        if domain not in self.chat_history:
            self.chat_history[domain] = []
        self.chat_history[domain].append(message_obj)
        
        # Keep only last 100 messages per domain
        if len(self.chat_history[domain]) > 100:
            self.chat_history[domain] = self.chat_history[domain][-100:]
        
        # Send to all active connections
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message_obj))
            except Exception as e:
                self.logger.error(f"Error sending message to client: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
    
    def get_chat_history(self, domain: str = "general"):
        """Get chat history for a specific domain"""
        return self.chat_history.get(domain, [])
