"""
Chat Room Management System
Handles room creation, membership, messaging, and persistence for the AGENT chat system.
Integrates with existing authentication and WebSocket infrastructure.
"""

import sqlite3
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class Room:
    id: int
    name: str
    description: str
    room_type: str  # public, private, admin
    created_by: str
    created_at: datetime
    max_members: int = 100
    is_active: bool = True

@dataclass
class Message:
    id: int
    room_id: int
    user_id: str
    username: str
    content: str
    message_type: str  # text, system, file, reaction
    timestamp: datetime
    reply_to_id: Optional[int] = None
    edited_at: Optional[datetime] = None
    is_deleted: bool = False

@dataclass
class RoomMember:
    room_id: int
    user_id: str
    username: str
    role: str  # owner, admin, moderator, member
    joined_at: datetime
    last_seen: datetime
    is_active: bool = True

@dataclass
class UserPresence:
    user_id: str
    username: str
    current_room_id: Optional[int]
    status: str  # online, away, busy, offline
    last_activity: datetime
    typing_in_room: Optional[int] = None
    typing_started_at: Optional[datetime] = None

class ChatRoomManager:
    """
    Core chat room management system that handles:
    - Room creation, deletion, and management
    - User membership and permissions
    - Message storage and retrieval
    - User presence tracking
    - Integration with existing authentication
    """
    
    def __init__(self, db_path: str = "data/chat_rooms.db"):
        self.db_path = db_path
        self.ensure_data_directory()
        self.init_database()
        self.setup_default_rooms()
    
    def ensure_data_directory(self):
        """Ensure the data directory exists"""
        data_dir = os.path.dirname(self.db_path)
        if data_dir and not os.path.exists(data_dir):
            os.makedirs(data_dir, exist_ok=True)
    
    def init_database(self):
        """Initialize the chat room database with required tables"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Rooms table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS rooms (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name VARCHAR(100) NOT NULL UNIQUE,
                        description TEXT,
                        room_type VARCHAR(20) DEFAULT 'public',
                        created_by VARCHAR(50) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        max_members INTEGER DEFAULT 100,
                        is_active BOOLEAN DEFAULT TRUE
                    )
                ''')
                
                # Messages table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS messages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        room_id INTEGER NOT NULL,
                        user_id VARCHAR(50) NOT NULL,
                        username VARCHAR(50) NOT NULL,
                        content TEXT NOT NULL,
                        message_type VARCHAR(20) DEFAULT 'text',
                        reply_to_id INTEGER,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        edited_at TIMESTAMP,
                        is_deleted BOOLEAN DEFAULT FALSE,
                        FOREIGN KEY (room_id) REFERENCES rooms(id),
                        FOREIGN KEY (reply_to_id) REFERENCES messages(id)
                    )
                ''')
                
                # Room membership table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS room_members (
                        room_id INTEGER NOT NULL,
                        user_id VARCHAR(50) NOT NULL,
                        username VARCHAR(50) NOT NULL,
                        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        role VARCHAR(20) DEFAULT 'member',
                        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        is_active BOOLEAN DEFAULT TRUE,
                        PRIMARY KEY (room_id, user_id),
                        FOREIGN KEY (room_id) REFERENCES rooms(id)
                    )
                ''')
                
                # User presence table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS user_presence (
                        user_id VARCHAR(50) PRIMARY KEY,
                        username VARCHAR(50) NOT NULL,
                        current_room_id INTEGER,
                        status VARCHAR(20) DEFAULT 'offline',
                        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        typing_in_room INTEGER,
                        typing_started_at TIMESTAMP,
                        FOREIGN KEY (current_room_id) REFERENCES rooms(id),
                        FOREIGN KEY (typing_in_room) REFERENCES rooms(id)
                    )
                ''')
                
                # Message read status table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS message_read_status (
                        user_id VARCHAR(50) NOT NULL,
                        room_id INTEGER NOT NULL,
                        last_read_message_id INTEGER NOT NULL,
                        last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (user_id, room_id),
                        FOREIGN KEY (room_id) REFERENCES rooms(id),
                        FOREIGN KEY (last_read_message_id) REFERENCES messages(id)
                    )
                ''')
                
                # Create indexes for performance
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_messages_room_timestamp ON messages(room_id, timestamp)')
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id)')
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_room_members_user ON room_members(user_id)')
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_presence_room ON user_presence(current_room_id)')
                
                conn.commit()
                logger.info("Chat room database initialized successfully")
                
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    def setup_default_rooms(self):
        """Create default rooms if they don't exist"""
        default_rooms = [
            {"name": "General", "description": "General discussion for all topics", "room_type": "public"},
            {"name": "Developer", "description": "Development and programming discussions", "room_type": "public"},
            {"name": "Trading", "description": "Financial markets and trading discussions", "room_type": "public"},
            {"name": "Security", "description": "Cybersecurity topics and discussions", "room_type": "public"},
            {"name": "Admin", "description": "Administrator discussions (admin only)", "room_type": "admin"}
        ]
        
        for room_data in default_rooms:
            if not self.get_room_by_name(room_data["name"]):
                self.create_room(
                    name=room_data["name"],
                    description=room_data["description"],
                    creator="system",
                    room_type=room_data["room_type"]
                )
    
    def create_room(self, name: str, description: str, creator: str, room_type: str = "public") -> Optional[int]:
        """Create a new chat room"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Check if room name already exists
                cursor.execute('SELECT id FROM rooms WHERE name = ?', (name,))
                if cursor.fetchone():
                    logger.warning(f"Room with name '{name}' already exists")
                    return None
                
                # Insert new room
                cursor.execute('''
                    INSERT INTO rooms (name, description, room_type, created_by, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (name, description, room_type, creator, datetime.now(), datetime.now()))
                
                room_id = cursor.lastrowid
                
                # Add creator as owner
                cursor.execute('''
                    INSERT INTO room_members (room_id, user_id, username, role, joined_at, last_seen)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (room_id, creator, creator, 'owner', datetime.now(), datetime.now()))
                
                conn.commit()
                logger.info(f"Created room '{name}' with ID {room_id}")
                return room_id
                
        except Exception as e:
            logger.error(f"Failed to create room '{name}': {e}")
            return None
    
    def get_room_by_name(self, name: str) -> Optional[Room]:
        """Get room by name"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id, name, description, room_type, created_by, created_at, max_members, is_active
                    FROM rooms WHERE name = ? AND is_active = TRUE
                ''', (name,))
                
                row = cursor.fetchone()
                if row:
                    return Room(
                        id=row[0],
                        name=row[1],
                        description=row[2],
                        room_type=row[3],
                        created_by=row[4],
                        created_at=datetime.fromisoformat(row[5]) if row[5] else datetime.now(),
                        max_members=row[6],
                        is_active=bool(row[7])
                    )
                return None
                
        except Exception as e:
            logger.error(f"Failed to get room by name '{name}': {e}")
            return None
    
    def get_user_accessible_rooms(self, user_id: str, user_role: str = "member") -> List[Room]:
        """Get all rooms accessible to a user based on their role"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Build query based on user role
                if user_role == "admin":
                    # Admins can see all rooms
                    cursor.execute('''
                        SELECT id, name, description, room_type, created_by, created_at, max_members, is_active
                        FROM rooms WHERE is_active = TRUE
                        ORDER BY name
                    ''')
                else:
                    # Regular users can only see public rooms they're members of
                    cursor.execute('''
                        SELECT r.id, r.name, r.description, r.room_type, r.created_by, r.created_at, r.max_members, r.is_active
                        FROM rooms r
                        LEFT JOIN room_members rm ON r.id = rm.room_id AND rm.user_id = ?
                        WHERE r.is_active = TRUE 
                        AND (r.room_type = 'public' OR rm.user_id IS NOT NULL)
                        ORDER BY r.name
                    ''', (user_id,))
                
                rooms = []
                for row in cursor.fetchall():
                    rooms.append(Room(
                        id=row[0],
                        name=row[1],
                        description=row[2],
                        room_type=row[3],
                        created_by=row[4],
                        created_at=datetime.fromisoformat(row[5]) if row[5] else datetime.now(),
                        max_members=row[6],
                        is_active=bool(row[7])
                    ))
                
                return rooms
                
        except Exception as e:
            logger.error(f"Failed to get accessible rooms for user '{user_id}': {e}")
            return []
    
    def join_room(self, room_id: int, user_id: str, username: str) -> bool:
        """Add user to room"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Check if room exists and is active
                cursor.execute('SELECT max_members, room_type FROM rooms WHERE id = ? AND is_active = TRUE', (room_id,))
                room_info = cursor.fetchone()
                if not room_info:
                    logger.warning(f"Room {room_id} not found or inactive")
                    return False
                
                max_members, room_type = room_info
                
                # Check if already a member
                cursor.execute('SELECT user_id FROM room_members WHERE room_id = ? AND user_id = ? AND is_active = TRUE', (room_id, user_id))
                if cursor.fetchone():
                    logger.info(f"User {user_id} already member of room {room_id}")
                    return True
                
                # Check room capacity
                cursor.execute('SELECT COUNT(*) FROM room_members WHERE room_id = ? AND is_active = TRUE', (room_id,))
                member_count = cursor.fetchone()[0]
                if member_count >= max_members:
                    logger.warning(f"Room {room_id} is at capacity ({max_members} members)")
                    return False
                
                # Add user to room
                cursor.execute('''
                    INSERT OR REPLACE INTO room_members (room_id, user_id, username, role, joined_at, last_seen, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (room_id, user_id, username, 'member', datetime.now(), datetime.now(), True))
                
                conn.commit()
                logger.info(f"User {user_id} joined room {room_id}")
                return True
                
        except Exception as e:
            logger.error(f"Failed to join user {user_id} to room {room_id}: {e}")
            return False
    
    def leave_room(self, room_id: int, user_id: str) -> bool:
        """Remove user from room"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Set member as inactive instead of deleting
                cursor.execute('''
                    UPDATE room_members 
                    SET is_active = FALSE, last_seen = ?
                    WHERE room_id = ? AND user_id = ?
                ''', (datetime.now(), room_id, user_id))
                
                conn.commit()
                logger.info(f"User {user_id} left room {room_id}")
                return True
                
        except Exception as e:
            logger.error(f"Failed to remove user {user_id} from room {room_id}: {e}")
            return False
    
    def send_message(self, room_id: int, user_id: str, username: str, content: str, message_type: str = "text", reply_to_id: Optional[int] = None) -> Optional[Message]:
        """Send message to room"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Verify user is member of room
                cursor.execute('SELECT user_id FROM room_members WHERE room_id = ? AND user_id = ? AND is_active = TRUE', (room_id, user_id))
                if not cursor.fetchone():
                    logger.warning(f"User {user_id} not a member of room {room_id}")
                    return None
                
                # Insert message
                timestamp = datetime.now()
                cursor.execute('''
                    INSERT INTO messages (room_id, user_id, username, content, message_type, reply_to_id, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (room_id, user_id, username, content, message_type, reply_to_id, timestamp))
                
                message_id = cursor.lastrowid
                
                # Update user's last seen
                cursor.execute('''
                    UPDATE room_members 
                    SET last_seen = ?
                    WHERE room_id = ? AND user_id = ?
                ''', (timestamp, room_id, user_id))
                
                conn.commit()
                
                # Return the created message
                return Message(
                    id=message_id,
                    room_id=room_id,
                    user_id=user_id,
                    username=username,
                    content=content,
                    message_type=message_type,
                    timestamp=timestamp,
                    reply_to_id=reply_to_id
                )
                
        except Exception as e:
            logger.error(f"Failed to send message from user {user_id} to room {room_id}: {e}")
            return None
    
    def get_room_messages(self, room_id: int, limit: int = 50, before_id: Optional[int] = None) -> List[Message]:
        """Get message history for room"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                if before_id:
                    cursor.execute('''
                        SELECT id, room_id, user_id, username, content, message_type, reply_to_id, timestamp, edited_at, is_deleted
                        FROM messages 
                        WHERE room_id = ? AND id < ? AND is_deleted = FALSE
                        ORDER BY timestamp DESC
                        LIMIT ?
                    ''', (room_id, before_id, limit))
                else:
                    cursor.execute('''
                        SELECT id, room_id, user_id, username, content, message_type, reply_to_id, timestamp, edited_at, is_deleted
                        FROM messages 
                        WHERE room_id = ? AND is_deleted = FALSE
                        ORDER BY timestamp DESC
                        LIMIT ?
                    ''', (room_id, limit))
                
                messages = []
                for row in cursor.fetchall():
                    messages.append(Message(
                        id=row[0],
                        room_id=row[1],
                        user_id=row[2],
                        username=row[3],
                        content=row[4],
                        message_type=row[5],
                        reply_to_id=row[6],
                        timestamp=datetime.fromisoformat(row[7]) if row[7] else datetime.now(),
                        edited_at=datetime.fromisoformat(row[8]) if row[8] else None,
                        is_deleted=bool(row[9])
                    ))
                
                # Reverse to get chronological order
                return list(reversed(messages))
                
        except Exception as e:
            logger.error(f"Failed to get messages for room {room_id}: {e}")
            return []
    
    def get_room_members(self, room_id: int) -> List[RoomMember]:
        """Get active members of a room"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT room_id, user_id, username, role, joined_at, last_seen, is_active
                    FROM room_members 
                    WHERE room_id = ? AND is_active = TRUE
                    ORDER BY role DESC, joined_at ASC
                ''', (room_id,))
                
                members = []
                for row in cursor.fetchall():
                    members.append(RoomMember(
                        room_id=row[0],
                        user_id=row[1],
                        username=row[2],
                        role=row[3],
                        joined_at=datetime.fromisoformat(row[4]) if row[4] else datetime.now(),
                        last_seen=datetime.fromisoformat(row[5]) if row[5] else datetime.now(),
                        is_active=bool(row[6])
                    ))
                
                return members
                
        except Exception as e:
            logger.error(f"Failed to get members for room {room_id}: {e}")
            return []
    
    def update_user_presence(self, user_id: str, username: str, current_room_id: Optional[int] = None, status: str = "online") -> bool:
        """Update user presence information"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT OR REPLACE INTO user_presence 
                    (user_id, username, current_room_id, status, last_activity)
                    VALUES (?, ?, ?, ?, ?)
                ''', (user_id, username, current_room_id, status, datetime.now()))
                
                conn.commit()
                return True
                
        except Exception as e:
            logger.error(f"Failed to update presence for user {user_id}: {e}")
            return False
    
    def get_unread_counts(self, user_id: str) -> Dict[int, int]:
        """Get unread message counts per room for user"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Get last read message ID for each room
                cursor.execute('''
                    SELECT mrs.room_id, mrs.last_read_message_id, COUNT(m.id) as unread_count
                    FROM message_read_status mrs
                    LEFT JOIN messages m ON m.room_id = mrs.room_id AND m.id > mrs.last_read_message_id AND m.is_deleted = FALSE
                    WHERE mrs.user_id = ?
                    GROUP BY mrs.room_id
                ''', (user_id,))
                
                unread_counts = {}
                for row in cursor.fetchall():
                    room_id, last_read_id, count = row
                    unread_counts[room_id] = count or 0
                
                return unread_counts
                
        except Exception as e:
            logger.error(f"Failed to get unread counts for user {user_id}: {e}")
            return {}
    
    def mark_room_as_read(self, user_id: str, room_id: int) -> bool:
        """Mark all messages in room as read for user"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Get latest message ID in room
                cursor.execute('SELECT MAX(id) FROM messages WHERE room_id = ? AND is_deleted = FALSE', (room_id,))
                latest_message_id = cursor.fetchone()[0]
                
                if latest_message_id:
                    cursor.execute('''
                        INSERT OR REPLACE INTO message_read_status (user_id, room_id, last_read_message_id, last_read_at)
                        VALUES (?, ?, ?, ?)
                    ''', (user_id, room_id, latest_message_id, datetime.now()))
                    
                    conn.commit()
                    return True
                
                return False
                
        except Exception as e:
            logger.error(f"Failed to mark room {room_id} as read for user {user_id}: {e}")
            return False

# Global chat room manager instance
chat_room_manager = ChatRoomManager()
