# PATCH 6: Full Chat Room System Implementation

## 🎯 Overview

Transform the current single-user iMessage-style interface into a comprehensive multi-user chat room system with real-time messaging, user management, and collaborative features while maintaining the existing aesthetic and simplicity.

## 📋 Requirements Analysis

Based on `/docs/architecture/chat_tool.md` architecture and current system capabilities:

### Current System Assets
- ✅ Authentication system (`agent/auth.py`)
- ✅ WebSocket connection manager (`knowledge_server.py`)
- ✅ iMessage-style UI foundation (`static/imessage_new.html`)
- ✅ Admin panel with user management
- ✅ Toast notification system
- ✅ Responsive design framework

### Missing Components for Chat Rooms
- ❌ Room/channel data models
- ❌ Message persistence system
- ❌ Multi-room message routing
- ❌ User presence tracking
- ❌ Room member management
- ❌ Message badge notifications
- ❌ Room-based UI components

## 🏗️ Technical Architecture

### Database Schema

```sql
-- Chat Rooms
CREATE TABLE rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    room_type VARCHAR(20) DEFAULT 'public', -- public, private, admin
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    max_members INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE
);

-- Room Messages
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, system, file, reaction
    reply_to_id INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (reply_to_id) REFERENCES messages(id)
);

-- Room Membership
CREATE TABLE room_members (
    room_id INTEGER NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(20) DEFAULT 'member', -- owner, admin, moderator, member
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (room_id, user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- User Presence
CREATE TABLE user_presence (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    current_room_id INTEGER,
    status VARCHAR(20) DEFAULT 'offline', -- online, away, busy, offline
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    typing_in_room INTEGER,
    typing_started_at TIMESTAMP,
    FOREIGN KEY (current_room_id) REFERENCES rooms(id),
    FOREIGN KEY (typing_in_room) REFERENCES rooms(id)
);

-- Message Read Status
CREATE TABLE message_read_status (
    user_id VARCHAR(50) NOT NULL,
    room_id INTEGER NOT NULL,
    last_read_message_id INTEGER NOT NULL,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, room_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (last_read_message_id) REFERENCES messages(id)
);
```

### API Endpoints

```python
# Room Management
GET    /api/rooms                    # List all accessible rooms
POST   /api/rooms                    # Create new room
GET    /api/rooms/{id}               # Get room details
PUT    /api/rooms/{id}               # Update room (admin only)
DELETE /api/rooms/{id}               # Delete room (owner only)

# Room Membership
GET    /api/rooms/{id}/members       # List room members
POST   /api/rooms/{id}/join          # Join room
DELETE /api/rooms/{id}/leave         # Leave room
POST   /api/rooms/{id}/invite        # Invite user (admin)
DELETE /api/rooms/{id}/kick/{user}   # Kick user (admin)

# Messages
GET    /api/rooms/{id}/messages      # Get message history
POST   /api/rooms/{id}/messages      # Send message
PUT    /api/messages/{id}            # Edit message
DELETE /api/messages/{id}            # Delete message
POST   /api/messages/{id}/react      # Add reaction

# User Presence
GET    /api/users/online             # List online users
POST   /api/users/status             # Update user status
GET    /api/rooms/{id}/typing        # Get typing users

# WebSocket Events
/ws/rooms/{room_id}                  # Room-specific WebSocket
```

### WebSocket Event Types

```javascript
// Client to Server
{
  "type": "join_room",
  "room_id": 1,
  "user_token": "..."
}

{
  "type": "send_message",
  "room_id": 1,
  "content": "Hello world!",
  "reply_to": null
}

{
  "type": "typing_start",
  "room_id": 1
}

{
  "type": "typing_stop",
  "room_id": 1
}

// Server to Client
{
  "type": "message",
  "room_id": 1,
  "message": {
    "id": 123,
    "username": "alice",
    "content": "Hello world!",
    "timestamp": "2025-01-01T12:00:00Z"
  }
}

{
  "type": "user_joined",
  "room_id": 1,
  "username": "bob"
}

{
  "type": "typing_indicator",
  "room_id": 1,
  "users": ["alice", "charlie"]
}

{
  "type": "presence_update",
  "user_id": "alice",
  "status": "online",
  "current_room": 1
}
```

## 🎨 UI Component Design

### Layout Structure

```
┌─────────────────────────────────────────────────┐
│ Header (AGENT Logo, User Profile, Settings)    │
├─────────────┬───────────────────┬───────────────┤
│ Room        │ Chat Area         │ Members       │
│ Sidebar     │                   │ Panel         │
│             │ ┌─────────────────┐ │             │
│ • General   │ │ Message History │ │ 👤 alice    │
│ • Developer │ │                 │ │ 👤 bob      │
│ • Trading   │ │                 │ │ 👤 charlie  │
│ • Security  │ │                 │ │             │
│ • Admin     │ │                 │ │ 💤 david    │
│             │ └─────────────────┘ │ 💤 eve      │
│ [+ New]     │ ┌─────────────────┐ │             │
│             │ │ Input Area      │ │             │
│             │ └─────────────────┘ │             │
├─────────────┴───────────────────┴───────────────┤
│ Status Bar (Connection, Notifications)          │
└─────────────────────────────────────────────────┘
```

### Key UI Components

#### 1. Room Sidebar
```html
<div class="room-sidebar">
  <div class="room-header">
    <h3>Rooms</h3>
    <button class="create-room-btn">+</button>
  </div>
  <div class="room-list">
    <div class="room-item active" data-room-id="1">
      <div class="room-icon">💬</div>
      <div class="room-info">
        <div class="room-name">General</div>
        <div class="room-preview">Last message...</div>
      </div>
      <div class="room-badge">3</div>
    </div>
    <!-- More rooms... -->
  </div>
</div>
```

#### 2. Message Area
```html
<div class="message-area">
  <div class="room-header">
    <h2>General</h2>
    <div class="room-info">
      <span class="member-count">5 members</span>
      <button class="room-menu">⋯</button>
    </div>
  </div>
  <div class="message-history">
    <div class="message user-message">
      <div class="message-avatar">👤</div>
      <div class="message-content">
        <div class="message-header">
          <span class="username">alice</span>
          <span class="timestamp">2:30 PM</span>
        </div>
        <div class="message-text">Hello everyone!</div>
      </div>
    </div>
    <!-- More messages... -->
  </div>
  <div class="typing-indicator">
    <span>bob is typing...</span>
  </div>
  <div class="message-input">
    <input type="text" placeholder="Message #general">
    <button class="send-btn">➤</button>
  </div>
</div>
```

#### 3. Members Panel
```html
<div class="members-panel">
  <div class="members-header">
    <h3>Members (5)</h3>
  </div>
  <div class="members-list">
    <div class="member online">
      <div class="member-avatar">👤</div>
      <div class="member-info">
        <div class="member-name">alice</div>
        <div class="member-status">online</div>
      </div>
    </div>
    <!-- More members... -->
  </div>
</div>
```

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
**Priority: Critical**

#### Backend Components
- [ ] Create database models and migrations
- [ ] Implement `ChatRoomManager` class
- [ ] Extend `ConnectionManager` for room-based routing
- [ ] Create basic room CRUD API endpoints
- [ ] Integrate with existing authentication system

#### Files to Create/Modify
- `agent/chat_rooms.py` - Core room management logic
- `agent/message_manager.py` - Message handling and persistence
- `api/index.py` - Add room API endpoints
- `knowledge_server.py` - Enhance WebSocket manager

#### Deliverables
- Working room creation and joining
- Basic message sending between users
- Database schema implemented
- Authentication integration complete

### Phase 2: Basic UI Implementation (Week 2)
**Priority: High**

#### Frontend Components
- [ ] Create room sidebar component
- [ ] Implement message display area
- [ ] Add basic room switching functionality
- [ ] Integrate with existing iMessage styling

#### Files to Create/Modify
- `static/chat_rooms.html` - New chat room interface
- `static/js/chat_rooms.js` - Room management JavaScript
- `static/css/chat_rooms.css` - Room-specific styling
- Update `api/index.py` to serve new interface

#### Deliverables
- Functional room switching
- Message display with user info
- Basic real-time messaging
- Responsive layout working

### Phase 3: Advanced Features (Week 3)
**Priority: Medium**

#### Enhanced Functionality
- [ ] Implement message badges/notifications
- [ ] Add user presence indicators
- [ ] Create typing indicators
- [ ] Add member management features
- [ ] Implement room creation modal

#### Files to Create/Modify
- `agent/presence_manager.py` - User presence tracking
- `agent/notification_manager.py` - Badge and notification logic
- Update JavaScript for real-time features
- Enhance CSS for badges and indicators

#### Deliverables
- Accurate unread message counting
- Real-time presence tracking
- Typing indicators working
- Room administration features

### Phase 4: Polish & Integration (Week 4)
**Priority: Low**

#### Final Features
- [ ] Message search functionality
- [ ] File sharing capabilities
- [ ] Message reactions
- [ ] Room settings and preferences
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Admin panel integration

#### Files to Create/Modify
- Add search endpoints and UI
- Implement file upload handling
- Create room settings modals
- Update admin panel for room management

#### Deliverables
- Complete feature set
- Optimized performance
- Full mobile support
- Admin management tools

## 🔧 Technical Implementation Details

### ChatRoomManager Class

```python
class ChatRoomManager:
    def __init__(self, db_path: str = "data/chat_rooms.db"):
        self.db_path = db_path
        self.init_database()
    
    def create_room(self, name: str, description: str, creator: str, room_type: str = "public") -> int:
        """Create a new chat room"""
        pass
    
    def join_room(self, room_id: int, user_id: str, username: str) -> bool:
        """Add user to room"""
        pass
    
    def send_message(self, room_id: int, user_id: str, username: str, content: str) -> dict:
        """Send message to room"""
        pass
    
    def get_room_messages(self, room_id: int, limit: int = 50, before_id: int = None) -> list:
        """Get message history for room"""
        pass
    
    def get_user_rooms(self, user_id: str) -> list:
        """Get all rooms user has access to"""
        pass
    
    def get_unread_counts(self, user_id: str) -> dict:
        """Get unread message counts per room"""
        pass
```

### Enhanced ConnectionManager

```python
class RoomConnectionManager:
    def __init__(self):
        self.room_connections: Dict[int, List[WebSocket]] = {}
        self.user_rooms: Dict[str, int] = {}  # user_id -> current_room_id
        self.chat_manager = ChatRoomManager()
    
    async def join_room(self, websocket: WebSocket, room_id: int, user_id: str):
        """Join user to room WebSocket"""
        pass
    
    async def leave_room(self, websocket: WebSocket, room_id: int, user_id: str):
        """Remove user from room WebSocket"""
        pass
    
    async def broadcast_to_room(self, room_id: int, message: dict, exclude_user: str = None):
        """Send message to all users in room"""
        pass
    
    async def handle_typing(self, room_id: int, user_id: str, is_typing: bool):
        """Handle typing indicators"""
        pass
```

### Default Room Setup

```python
DEFAULT_ROOMS = [
    {"name": "General", "description": "General discussion", "room_type": "public"},
    {"name": "Developer", "description": "Development topics", "room_type": "public"},
    {"name": "Trading", "description": "Financial discussions", "room_type": "public"},
    {"name": "Security", "description": "Cybersecurity topics", "room_type": "public"},
    {"name": "Admin", "description": "Administrator discussions", "room_type": "private"}
]
```

## 📱 Mobile Responsiveness

### Responsive Breakpoints
- **Desktop**: 1024px+ (3-column layout)
- **Tablet**: 768px-1023px (2-column layout, collapsible sidebar)
- **Mobile**: <768px (single column, overlay modals)

### Mobile UI Adaptations
- Room sidebar becomes slide-out drawer
- Members panel becomes modal overlay
- Touch-friendly message input
- Swipe gestures for navigation
- Optimized message bubble sizing

## 🔒 Security Considerations

### Access Control
- Room-based permissions (public/private/admin)
- User role validation for admin actions
- Message content sanitization
- Rate limiting for message sending

### Data Protection
- Message encryption in transit (WebSocket TLS)
- User session validation for all actions
- Input validation and XSS prevention
- SQL injection protection

## 🧪 Testing Strategy

### Unit Tests
- Room creation and management
- Message sending and retrieval
- User presence tracking
- Permission validation

### Integration Tests
- WebSocket room communication
- Real-time message delivery
- Multi-user scenarios
- Database consistency

### User Acceptance Tests
- Room switching functionality
- Message badge accuracy
- Typing indicator responsiveness
- Mobile interface usability

## 📊 Success Metrics

### Functional Requirements
- ✅ Multiple users can join different rooms simultaneously
- ✅ Real-time message delivery with <100ms latency
- ✅ Accurate unread message counting
- ✅ Smooth room switching without page refresh
- ✅ User presence tracking with 95% accuracy
- ✅ Message history persisted and accessible
- ✅ Support for 100+ concurrent users per room

### Performance Requirements
- Page load time <2 seconds
- Message delivery latency <100ms
- WebSocket reconnection handling
- Responsive UI on all device sizes
- Memory usage optimization

### User Experience Goals
- Intuitive room navigation
- Clear visual hierarchy
- Consistent with existing UI patterns
- Accessible keyboard navigation
- Smooth animations and transitions

## 🔄 Integration Points

### Existing System Integration
- Use `AuthenticationManager` for user sessions
- Extend `ConnectionManager` for WebSocket handling
- Integrate with admin panel for room management
- Maintain existing toast notification system
- Preserve current responsive design patterns

### Agent Integration
- Allow AI agents to join specific rooms
- Agent responses routed to appropriate rooms
- Maintain existing domain-specific agents
- Integrate with self-training feedback system

## 📈 Future Enhancements (Post-Patch 6)

### Planned Features
- Voice/video calling within rooms
- Screen sharing capabilities
- Message threads and replies
- Advanced search with filters
- Room analytics and insights
- Bot integration framework
- Message scheduling
- Custom emoji reactions

### Scalability Considerations
- Redis for WebSocket scaling
- Database sharding for large deployments
- CDN integration for file sharing
- Microservice architecture preparation

## 🎯 Success Criteria

### Phase 1 Complete When:
- Users can create and join rooms
- Basic messaging works between multiple users
- Database schema is stable and tested

### Phase 2 Complete When:
- UI allows smooth room switching
- Messages display correctly with user info
- Real-time updates work consistently

### Phase 3 Complete When:
- Message badges show accurate counts
- User presence is tracked and displayed
- Typing indicators work smoothly

### Final Success When:
- All features work as specified
- Performance meets requirements
- User acceptance testing passes
- Mobile experience is optimal
- Admin management tools are functional

---

**Estimated Timeline**: 4 weeks
**Team Requirements**: 1 Full-stack Developer
**Dependencies**: Current authentication system, WebSocket infrastructure
**Risk Level**: Medium (building on existing foundation)
