"""
Enhanced Connection Manager for Chat Rooms
Handles room-based WebSocket connections, presence tracking, and real-time messaging.
Extends the existing WebSocket infrastructure for multi-room support.
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set
from fastapi import WebSocket, WebSocketDisconnect
from dataclasses import dataclass, asdict

from agent.chat_rooms import chat_room_manager, Message, UserPresence
from agent.auth import auth_manager

logger = logging.getLogger(__name__)

@dataclass
class WebSocketConnection:
    websocket: WebSocket
    user_id: str
    username: str
    current_room_id: Optional[int]
    connected_at: datetime
    last_activity: datetime

@dataclass
class TypingIndicator:
    user_id: str
    username: str
    room_id: int
    started_at: datetime

class RoomConnectionManager:
    """
    Enhanced connection manager that handles:
    - Room-based WebSocket connections
    - User presence tracking across rooms
    - Typing indicators
    - Real-time message broadcasting
    - User session management
    """
    
    def __init__(self):
        # WebSocket connections by connection ID
        self.connections: Dict[str, WebSocketConnection] = {}
        
        # Room-based connection mapping: room_id -> set of connection_ids
        self.room_connections: Dict[int, Set[str]] = {}
        
        # User-based connection mapping: user_id -> connection_id
        self.user_connections: Dict[str, str] = {}
        
        # Typing indicators: room_id -> list of TypingIndicator
        self.typing_indicators: Dict[int, List[TypingIndicator]] = {}
        
        # Cleanup task
        self.cleanup_task = None
        # Don't start cleanup task immediately - wait for first connection
    
    def start_cleanup_task(self):
        """Start background task for cleaning up stale connections and typing indicators"""
        if self.cleanup_task is None:
            try:
                self.cleanup_task = asyncio.create_task(self._cleanup_loop())
            except RuntimeError:
                # No event loop running, will start when needed
                pass
    
    async def _cleanup_loop(self):
        """Background cleanup loop"""
        while True:
            try:
                await asyncio.sleep(30)  # Run every 30 seconds
                await self._cleanup_stale_typing_indicators()
                await self._update_user_presence()
            except Exception as e:
                logger.error(f"Error in cleanup loop: {e}")
    
    async def _cleanup_stale_typing_indicators(self):
        """Remove typing indicators older than 10 seconds"""
        cutoff_time = datetime.now() - timedelta(seconds=10)
        
        for room_id in list(self.typing_indicators.keys()):
            self.typing_indicators[room_id] = [
                indicator for indicator in self.typing_indicators[room_id]
                if indicator.started_at > cutoff_time
            ]
            
            if not self.typing_indicators[room_id]:
                del self.typing_indicators[room_id]
    
    async def _update_user_presence(self):
        """Update user presence in database based on active connections"""
        for connection_id, conn in self.connections.items():
            # Update last activity if connection is still active
            try:
                chat_room_manager.update_user_presence(
                    user_id=conn.user_id,
                    username=conn.username,
                    current_room_id=conn.current_room_id,
                    status="online"
                )
            except Exception as e:
                logger.error(f"Failed to update presence for {conn.user_id}: {e}")
    
    async def connect_user(self, websocket: WebSocket, user_token: str) -> Optional[str]:
        """
        Connect a user to the WebSocket system.
        Returns connection_id if successful, None if authentication fails.
        """
        try:
            # Validate user session
            user_session = auth_manager.validate_session(user_token)
            if not user_session:
                await websocket.close(code=4001, reason="Invalid authentication")
                return None
            
            # Accept the WebSocket connection
            await websocket.accept()
            
            # Generate unique connection ID
            connection_id = f"{user_session['username']}_{datetime.now().timestamp()}"
            
            # Create connection object
            connection = WebSocketConnection(
                websocket=websocket,
                user_id=user_session['username'],
                username=user_session['username'],
                current_room_id=None,
                connected_at=datetime.now(),
                last_activity=datetime.now()
            )
            
            # Store connection
            self.connections[connection_id] = connection
            
            # Start cleanup task if this is the first connection
            if len(self.connections) == 1:
                self.start_cleanup_task()
            
            # If user was already connected, disconnect old connection
            if connection.user_id in self.user_connections:
                old_connection_id = self.user_connections[connection.user_id]
                await self._disconnect_by_id(old_connection_id, "New connection established")
            
            self.user_connections[connection.user_id] = connection_id
            
            # Update user presence
            chat_room_manager.update_user_presence(
                user_id=connection.user_id,
                username=connection.username,
                status="online"
            )
            
            logger.info(f"User {connection.username} connected with ID {connection_id}")
            
            # Send connection confirmation
            await self._send_to_connection(connection_id, {
                "type": "connection_established",
                "user_id": connection.user_id,
                "username": connection.username,
                "timestamp": datetime.now().isoformat()
            })
            
            return connection_id
            
        except Exception as e:
            logger.error(f"Failed to connect user: {e}")
            await websocket.close(code=4000, reason="Connection failed")
            return None
    
    async def disconnect_user(self, connection_id: str, reason: str = "User disconnected"):
        """Disconnect a user and clean up their session"""
        await self._disconnect_by_id(connection_id, reason)
    
    async def _disconnect_by_id(self, connection_id: str, reason: str):
        """Internal method to disconnect by connection ID"""
        if connection_id not in self.connections:
            return
        
        connection = self.connections[connection_id]
        
        try:
            # Leave current room if any
            if connection.current_room_id:
                await self.leave_room(connection_id, connection.current_room_id)
            
            # Update user presence to offline
            chat_room_manager.update_user_presence(
                user_id=connection.user_id,
                username=connection.username,
                status="offline"
            )
            
            # Close WebSocket
            await connection.websocket.close(code=1000, reason=reason)
            
        except Exception as e:
            logger.error(f"Error during disconnect cleanup: {e}")
        
        finally:
            # Clean up connection references
            if connection.user_id in self.user_connections:
                if self.user_connections[connection.user_id] == connection_id:
                    del self.user_connections[connection.user_id]
            
            del self.connections[connection_id]
            logger.info(f"User {connection.username} disconnected: {reason}")
    
    async def join_room(self, connection_id: str, room_id: int) -> bool:
        """Join user to a specific room"""
        if connection_id not in self.connections:
            return False
        
        connection = self.connections[connection_id]
        
        try:
            # Leave current room if any
            if connection.current_room_id:
                await self.leave_room(connection_id, connection.current_room_id)
            
            # Join new room in database
            success = chat_room_manager.join_room(room_id, connection.user_id, connection.username)
            if not success:
                return False
            
            # Update connection
            connection.current_room_id = room_id
            connection.last_activity = datetime.now()
            
            # Add to room connections
            if room_id not in self.room_connections:
                self.room_connections[room_id] = set()
            self.room_connections[room_id].add(connection_id)
            
            # Update user presence
            chat_room_manager.update_user_presence(
                user_id=connection.user_id,
                username=connection.username,
                current_room_id=room_id,
                status="online"
            )
            
            # Broadcast user joined message to room
            await self.broadcast_to_room(room_id, {
                "type": "user_joined",
                "room_id": room_id,
                "user_id": connection.user_id,
                "username": connection.username,
                "timestamp": datetime.now().isoformat()
            }, exclude_user=connection.user_id)
            
            # Send room info to user
            await self._send_to_connection(connection_id, {
                "type": "room_joined",
                "room_id": room_id,
                "timestamp": datetime.now().isoformat()
            })
            
            logger.info(f"User {connection.username} joined room {room_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to join room {room_id} for user {connection.username}: {e}")
            return False
    
    async def leave_room(self, connection_id: str, room_id: int) -> bool:
        """Remove user from a specific room"""
        if connection_id not in self.connections:
            return False
        
        connection = self.connections[connection_id]
        
        try:
            # Remove from room connections
            if room_id in self.room_connections:
                self.room_connections[room_id].discard(connection_id)
                if not self.room_connections[room_id]:
                    del self.room_connections[room_id]
            
            # Update connection
            if connection.current_room_id == room_id:
                connection.current_room_id = None
            
            # Update database
            chat_room_manager.leave_room(room_id, connection.user_id)
            
            # Update user presence
            chat_room_manager.update_user_presence(
                user_id=connection.user_id,
                username=connection.username,
                current_room_id=None,
                status="online"
            )
            
            # Remove from typing indicators
            if room_id in self.typing_indicators:
                self.typing_indicators[room_id] = [
                    indicator for indicator in self.typing_indicators[room_id]
                    if indicator.user_id != connection.user_id
                ]
            
            # Broadcast user left message to room
            await self.broadcast_to_room(room_id, {
                "type": "user_left",
                "room_id": room_id,
                "user_id": connection.user_id,
                "username": connection.username,
                "timestamp": datetime.now().isoformat()
            }, exclude_user=connection.user_id)
            
            logger.info(f"User {connection.username} left room {room_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to leave room {room_id} for user {connection.username}: {e}")
            return False
    
    async def send_message_to_room(self, connection_id: str, room_id: int, content: str, reply_to_id: Optional[int] = None) -> bool:
        """Send a message to a room"""
        if connection_id not in self.connections:
            return False
        
        connection = self.connections[connection_id]
        
        # Verify user is in the room
        if connection.current_room_id != room_id:
            return False
        
        try:
            # Save message to database
            message = chat_room_manager.send_message(
                room_id=room_id,
                user_id=connection.user_id,
                username=connection.username,
                content=content,
                reply_to_id=reply_to_id
            )
            
            if not message:
                return False
            
            # Update connection activity
            connection.last_activity = datetime.now()
            
            # Stop typing indicator for this user
            await self.stop_typing(connection_id, room_id)
            
            # Broadcast message to room
            await self.broadcast_to_room(room_id, {
                "type": "message",
                "room_id": room_id,
                "message": {
                    "id": message.id,
                    "user_id": message.user_id,
                    "username": message.username,
                    "content": message.content,
                    "message_type": message.message_type,
                    "timestamp": message.timestamp.isoformat(),
                    "reply_to_id": message.reply_to_id
                }
            })
            
            logger.info(f"Message sent to room {room_id} by {connection.username}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send message to room {room_id}: {e}")
            return False
    
    async def start_typing(self, connection_id: str, room_id: int) -> bool:
        """Start typing indicator for user in room"""
        if connection_id not in self.connections:
            return False
        
        connection = self.connections[connection_id]
        
        if connection.current_room_id != room_id:
            return False
        
        try:
            # Remove existing typing indicator for this user in this room
            if room_id in self.typing_indicators:
                self.typing_indicators[room_id] = [
                    indicator for indicator in self.typing_indicators[room_id]
                    if indicator.user_id != connection.user_id
                ]
            else:
                self.typing_indicators[room_id] = []
            
            # Add new typing indicator
            self.typing_indicators[room_id].append(TypingIndicator(
                user_id=connection.user_id,
                username=connection.username,
                room_id=room_id,
                started_at=datetime.now()
            ))
            
            # Broadcast typing update
            await self._broadcast_typing_update(room_id)
            return True
            
        except Exception as e:
            logger.error(f"Failed to start typing for user {connection.username} in room {room_id}: {e}")
            return False
    
    async def stop_typing(self, connection_id: str, room_id: int) -> bool:
        """Stop typing indicator for user in room"""
        if connection_id not in self.connections:
            return False
        
        connection = self.connections[connection_id]
        
        try:
            # Remove typing indicator
            if room_id in self.typing_indicators:
                self.typing_indicators[room_id] = [
                    indicator for indicator in self.typing_indicators[room_id]
                    if indicator.user_id != connection.user_id
                ]
                
                if not self.typing_indicators[room_id]:
                    del self.typing_indicators[room_id]
            
            # Broadcast typing update
            await self._broadcast_typing_update(room_id)
            return True
            
        except Exception as e:
            logger.error(f"Failed to stop typing for user {connection.username} in room {room_id}: {e}")
            return False
    
    async def _broadcast_typing_update(self, room_id: int):
        """Broadcast current typing users to room"""
        typing_users = []
        if room_id in self.typing_indicators:
            typing_users = [
                {"user_id": indicator.user_id, "username": indicator.username}
                for indicator in self.typing_indicators[room_id]
            ]
        
        await self.broadcast_to_room(room_id, {
            "type": "typing_update",
            "room_id": room_id,
            "typing_users": typing_users,
            "timestamp": datetime.now().isoformat()
        })
    
    async def broadcast_to_room(self, room_id: int, message: dict, exclude_user: Optional[str] = None):
        """Broadcast message to all users in a room"""
        if room_id not in self.room_connections:
            return
        
        message_text = json.dumps(message)
        failed_connections = []
        
        for connection_id in self.room_connections[room_id].copy():
            if connection_id in self.connections:
                connection = self.connections[connection_id]
                
                # Skip excluded user
                if exclude_user and connection.user_id == exclude_user:
                    continue
                
                try:
                    await connection.websocket.send_text(message_text)
                except Exception as e:
                    logger.error(f"Failed to send message to {connection.username}: {e}")
                    failed_connections.append(connection_id)
        
        # Clean up failed connections
        for connection_id in failed_connections:
            await self._disconnect_by_id(connection_id, "Send failed")
    
    async def _send_to_connection(self, connection_id: str, message: dict):
        """Send message to specific connection"""
        if connection_id not in self.connections:
            return False
        
        try:
            connection = self.connections[connection_id]
            await connection.websocket.send_text(json.dumps(message))
            return True
        except Exception as e:
            logger.error(f"Failed to send message to connection {connection_id}: {e}")
            await self._disconnect_by_id(connection_id, "Send failed")
            return False
    
    async def handle_websocket_message(self, connection_id: str, message_data: dict):
        """Handle incoming WebSocket messages"""
        if connection_id not in self.connections:
            return
        
        connection = self.connections[connection_id]
        message_type = message_data.get("type")
        
        try:
            if message_type == "join_room":
                room_id = message_data.get("room_id")
                if room_id:
                    await self.join_room(connection_id, room_id)
            
            elif message_type == "leave_room":
                room_id = message_data.get("room_id")
                if room_id:
                    await self.leave_room(connection_id, room_id)
            
            elif message_type == "send_message":
                room_id = message_data.get("room_id")
                content = message_data.get("content")
                reply_to_id = message_data.get("reply_to_id")
                if room_id and content:
                    await self.send_message_to_room(connection_id, room_id, content, reply_to_id)
            
            elif message_type == "start_typing":
                room_id = message_data.get("room_id")
                if room_id:
                    await self.start_typing(connection_id, room_id)
            
            elif message_type == "stop_typing":
                room_id = message_data.get("room_id")
                if room_id:
                    await self.stop_typing(connection_id, room_id)
            
            elif message_type == "ping":
                # Respond to ping with pong
                await self._send_to_connection(connection_id, {
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                })
            
            # Update last activity
            connection.last_activity = datetime.now()
            
        except Exception as e:
            logger.error(f"Error handling WebSocket message from {connection.username}: {e}")
    
    def get_room_users(self, room_id: int) -> List[str]:
        """Get list of users currently in a room"""
        if room_id not in self.room_connections:
            return []
        
        users = []
        for connection_id in self.room_connections[room_id]:
            if connection_id in self.connections:
                users.append(self.connections[connection_id].username)
        
        return users
    
    def get_online_users(self) -> List[str]:
        """Get list of all online users"""
        return list(set(conn.username for conn in self.connections.values()))
    
    def is_user_online(self, user_id: str) -> bool:
        """Check if a user is currently online"""
        return user_id in self.user_connections

# Global room connection manager instance
room_connection_manager = RoomConnectionManager()
