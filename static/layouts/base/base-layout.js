/**
 * Base Chat Layout Controller
 * Handles the core chat functionality that persists across all layouts
 */

class BaseChatLayout {
    constructor() {
        this.currentRoom = null;
        this.currentUser = null;
        this.socket = null;
        this.typingTimeout = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        if (this.isInitialized) return;
        
        console.log('🔧 Initializing Base Chat Layout...');
        
        try {
            // Get current user from session
            await this.getCurrentUser();
            
            // Load available rooms
            await this.loadRooms();
            
            // Initialize WebSocket connection
            this.initializeWebSocket();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Base Chat Layout initialized');
            
            // Trigger layout ready event
            document.dispatchEvent(new CustomEvent('base-chat-ready', {
                detail: { user: this.currentUser }
            }));
            
        } catch (error) {
            console.error('❌ Failed to initialize Base Chat Layout:', error);
        }
    }
    
    async getCurrentUser() {
        try {
            const response = await fetch('/api/auth/validate', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.currentUser = {
                    id: data.user?.id || 'demo_user',
                    username: data.user?.username || 'Demo User',
                    role: data.user?.role || 'member'
                };
            } else {
                // Demo mode fallback
                this.currentUser = {
                    id: 'demo_user',
                    username: 'Demo User',
                    role: 'member'
                };
            }
            
            console.log('Current user:', this.currentUser);
        } catch (error) {
            console.error('Error getting current user:', error);
            // Fallback to demo user
            this.currentUser = {
                id: 'demo_user',
                username: 'Demo User',
                role: 'member'
            };
        }
    }
    
    async loadRooms() {
        try {
            const response = await fetch('/api/rooms');
            const rooms = await response.json();
            
            const roomList = document.getElementById('roomList');
            if (!roomList) return;
            
            roomList.innerHTML = '';
            
            rooms.forEach(room => {
                const roomElement = this.createRoomElement(room);
                roomList.appendChild(roomElement);
            });
            
            // Auto-select first room if available
            if (rooms.length > 0) {
                await this.selectRoom(rooms[0]);
            }
            
        } catch (error) {
            console.error('Error loading rooms:', error);
            this.showNotification('Failed to load chat rooms', 'error');
        }
    }
    
    createRoomElement(room) {
        const div = document.createElement('div');
        div.className = 'room-item';
        div.setAttribute('data-room-id', room.id);
        div.onclick = () => this.selectRoom(room);
        
        const iconClass = this.getRoomIconClass(room.room_type);
        
        div.innerHTML = `
            <div class="room-icon ${room.room_type}">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="room-info">
                <div class="room-name">${room.name}</div>
                <div class="room-last-message">${room.description}</div>
            </div>
        `;
        
        return div;
    }
    
    getRoomIconClass(roomType) {
        const icons = {
            'general': 'fa-comments',
            'developer': 'fa-code',
            'trading': 'fa-chart-line',
            'security': 'fa-shield-alt',
            'admin': 'fa-crown',
            'public': 'fa-users',
            'tech': 'fa-microchip'
        };
        return icons[roomType] || 'fa-comments';
    }
    
    async selectRoom(room) {
        try {
            // Update UI
            document.querySelectorAll('.room-item').forEach(item => {
                item.classList.remove('active');
            });
            
            const roomElement = document.querySelector(`[data-room-id="${room.id}"]`);
            if (roomElement) {
                roomElement.classList.add('active');
            }
            
            // Update current room
            this.currentRoom = room;
            
            // Update header
            const roomNameEl = document.getElementById('currentRoomName');
            const roomSubtitleEl = document.getElementById('currentRoomSubtitle');
            const roomIconEl = document.getElementById('chatRoomIcon');
            
            if (roomNameEl) roomNameEl.textContent = room.name;
            if (roomSubtitleEl) roomSubtitleEl.textContent = room.description;
            if (roomIconEl) {
                roomIconEl.innerHTML = `<i class="fas ${this.getRoomIconClass(room.room_type)}"></i>`;
                roomIconEl.className = `chat-room-icon ${room.room_type}`;
            }
            
            // Enable message input
            const messageInput = document.getElementById('messageInput');
            const sendBtn = document.getElementById('sendBtn');
            if (messageInput && sendBtn) {
                messageInput.disabled = false;
                sendBtn.disabled = false;
                messageInput.placeholder = `Message #${room.name.toLowerCase()}`;
            }
            
            // Hide empty state
            const emptyState = document.getElementById('emptyState');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // Join room via WebSocket
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({
                    type: 'join_room',
                    room_id: room.id,
                    user_id: this.currentUser.id,
                    username: this.currentUser.username
                }));
            }
            
            // Load room messages
            await this.loadRoomMessages(room.id);
            
            // Trigger room selected event
            document.dispatchEvent(new CustomEvent('room-selected', {
                detail: { room, user: this.currentUser }
            }));
            
            console.log('Selected room:', room.name);
            
        } catch (error) {
            console.error('Error selecting room:', error);
            this.showNotification('Failed to select room', 'error');
        }
    }
    
    async loadRoomMessages(roomId) {
        try {
            const response = await fetch(`/api/rooms/${roomId}/messages?limit=50`);
            const messages = await response.json();
            
            const messagesContainer = document.getElementById('messagesContainer');
            if (!messagesContainer) return;
            
            // Clear existing messages
            messagesContainer.innerHTML = '';
            
            messages.forEach(message => {
                this.addMessageToUI(message);
            });
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
        } catch (error) {
            console.error('Error loading room messages:', error);
            this.showNotification('Failed to load messages', 'error');
        }
    }
    
    addMessageToUI(message) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        
        const isOwnMessage = message.user_id === this.currentUser.id || message.username === this.currentUser.username;
        messageElement.className = `message ${isOwnMessage ? 'own' : ''}`;
        
        const avatar = (message.username || 'U').charAt(0).toUpperCase();
        const time = this.formatTime(new Date(message.timestamp));
        
        messageElement.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${message.username || 'User'}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-text">${this.escapeHtml(message.message || message.content || '')}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        
        // Auto-scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    initializeWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws/rooms`;
            
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = () => {
                console.log('✅ Chat WebSocket connected');
            };
            
            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };
            
            this.socket.onclose = () => {
                console.log('❌ Chat WebSocket disconnected');
                // Attempt to reconnect after 3 seconds
                setTimeout(() => this.initializeWebSocket(), 3000);
            };
            
            this.socket.onerror = (error) => {
                console.error('Chat WebSocket error:', error);
            };
            
        } catch (error) {
            console.error('Failed to initialize Chat WebSocket:', error);
        }
    }
    
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'message':
                if (this.currentRoom && data.data && data.data.room_id === this.currentRoom.id) {
                    this.addMessageToUI(data.data);
                }
                break;
                
            case 'connection_established':
                console.log('Chat WebSocket connection established');
                break;
                
            case 'user_joined':
                console.log(`${data.username} joined the chat`);
                break;
                
            case 'user_left':
                console.log(`${data.username} left the chat`);
                break;
                
            case 'typing_start':
                if (data.user_id !== this.currentUser.id) {
                    this.showTypingIndicator(data.username);
                }
                break;
                
            case 'typing_stop':
                if (data.user_id !== this.currentUser.id) {
                    this.hideTypingIndicator();
                }
                break;
                
            default:
                console.log('Unknown chat message type:', data.type);
        }
    }
    
    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;
        
        // Auto-resize textarea
        messageInput.addEventListener('input', () => {
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
            
            // Send typing indicator
            this.sendTypingIndicator();
        });
        
        // Send message on Enter
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }
    
    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;
        
        const content = messageInput.value.trim();
        
        if (!content || !this.currentRoom) return;
        
        try {
            const response = await fetch(`/api/rooms/${this.currentRoom.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    message: content,
                    user_id: this.currentUser.id,
                    username: this.currentUser.username
                })
            });
            
            if (response.ok) {
                messageInput.value = '';
                messageInput.style.height = 'auto';
                
                // Send via WebSocket for real-time delivery
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    this.socket.send(JSON.stringify({
                        type: 'message',
                        room_id: this.currentRoom.id,
                        message: content,
                        user_id: this.currentUser.id,
                        username: this.currentUser.username
                    }));
                }
            } else {
                throw new Error('Failed to send message');
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('Failed to send message', 'error');
        }
    }
    
    sendTypingIndicator() {
        if (!this.currentRoom || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        
        // Clear previous timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        // Send typing start
        this.socket.send(JSON.stringify({
            type: 'typing_start',
            room_id: this.currentRoom.id,
            user_id: this.currentUser.id,
            username: this.currentUser.username
        }));
        
        // Send typing stop after 3 seconds
        this.typingTimeout = setTimeout(() => {
            this.socket.send(JSON.stringify({
                type: 'typing_stop',
                room_id: this.currentRoom.id,
                user_id: this.currentUser.id,
                username: this.currentUser.username
            }));
        }, 3000);
    }
    
    showTypingIndicator(username) {
        const indicator = document.getElementById('typingIndicator');
        const usersSpan = document.getElementById('typingUsers');
        if (indicator && usersSpan) {
            usersSpan.textContent = `${username} is typing`;
            indicator.style.display = 'flex';
        }
    }
    
    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    // Utility functions
    formatTime(date) {
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        // Integration with layout manager's notification system
        if (window.layoutManager && window.layoutManager.showNotification) {
            window.layoutManager.showNotification(message, type);
        }
    }
    
    // Public API
    getCurrentRoom() {
        return this.currentRoom;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }
    
    refresh() {
        this.loadRooms();
    }
}

// Initialize base chat layout when loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!window.baseChatLayout) {
        window.baseChatLayout = new BaseChatLayout();
    }
});

// Global functions for compatibility
window.sendMessage = () => {
    if (window.baseChatLayout) {
        window.baseChatLayout.sendMessage();
    }
};

window.showCreateRoomModal = () => {
    console.log('Create room modal - functionality to be implemented');
};

window.showRoomMembers = () => {
    console.log('Room members - functionality to be implemented');
};

window.showRoomInfo = () => {
    console.log('Room info - functionality to be implemented');
};

window.showRoomSettings = () => {
    console.log('Room settings - functionality to be implemented');
};

window.attachFile = () => {
    console.log('File attachment - functionality to be implemented');
};

window.toggleEmoji = () => {
    console.log('Emoji picker - functionality to be implemented');
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseChatLayout;
}
