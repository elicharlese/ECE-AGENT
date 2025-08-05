/**
 * Chat Layout Controller
 * Handles chat functionality within the layout system
 */

class ChatLayout {
    constructor() {
        this.currentRoom = null;
        this.rooms = [];
        this.messages = new Map();
        this.websocket = null;
        this.isAuthenticated = false;
    }
    
    async initialize() {
        console.log('🚀 Initializing Chat Layout');
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Authenticate user
            await this.authenticate();
            
            // Load rooms
            await this.loadRooms();
            
            // Setup WebSocket if layout manager provides it
            if (window.layoutManager && window.layoutManager.websocket) {
                this.websocket = window.layoutManager.websocket;
                this.setupWebSocketHandlers();
            }
            
            console.log('✅ Chat Layout initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Chat Layout:', error);
            this.showError('Failed to initialize chat');
        }
    }
    
    setupEventListeners() {
        // Room management
        const refreshRoomsBtn = document.getElementById('refreshRoomsBtn');
        const createRoomBtn = document.getElementById('createRoomBtn');
        const newChatBtn = document.getElementById('newChatBtn');
        const tradingModeBtn = document.getElementById('tradingModeBtn');
        
        // Message input
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        // Quick actions
        const quickActions = document.querySelectorAll('.quick-action');
        
        if (refreshRoomsBtn) {
            refreshRoomsBtn.addEventListener('click', () => this.loadRooms());
        }
        
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => this.createRoom());
        }
        
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => this.createNewChat());
        }
        
        if (tradingModeBtn) {
            tradingModeBtn.addEventListener('click', () => this.switchToTradingMode());
        }
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            messageInput.addEventListener('input', () => {
                const sendBtn = document.getElementById('sendBtn');
                if (sendBtn) {
                    sendBtn.disabled = !messageInput.value.trim();
                }
            });
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // Quick actions
        quickActions.forEach(action => {
            action.addEventListener('click', (e) => {
                const actionType = e.target.dataset.action;
                this.handleQuickAction(actionType);
            });
        });
    }
    
    async authenticate() {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: 'admin',
                    password: 'admin123'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.isAuthenticated = data.success;
                
                if (this.isAuthenticated) {
                    console.log('✅ User authenticated successfully');
                    this.enableChatInput();
                }
            }
            
        } catch (error) {
            console.error('Authentication failed:', error);
            this.showError('Authentication failed');
        }
    }
    
    async loadRooms() {
        const roomList = document.getElementById('roomList');
        if (!roomList) return;
        
        // Show loading
        roomList.innerHTML = `
            <div class="loading-rooms">
                <div class="spinner"></div>
                <span>Loading rooms...</span>
            </div>
        `;
        
        try {
            const response = await fetch('/api/rooms');
            if (response.ok) {
                this.rooms = await response.json();
                this.renderRooms();
            } else {
                throw new Error('Failed to load rooms');
            }
            
        } catch (error) {
            console.error('Failed to load rooms:', error);
            roomList.innerHTML = `
                <div class="error-state">
                    <p>Failed to load rooms</p>
                    <button class="btn-secondary btn-small" onclick="window.chatLayout.loadRooms()">Retry</button>
                </div>
            `;
        }
    }
    
    renderRooms() {
        const roomList = document.getElementById('roomList');
        if (!roomList || !this.rooms.length) return;
        
        roomList.innerHTML = this.rooms.map(room => `
            <div class="room-item ${room.id === this.currentRoom?.id ? 'active' : ''}" 
                 data-room-id="${room.id}" 
                 onclick="window.chatLayout.selectRoom(${room.id})">
                <div class="room-name">${this.escapeHtml(room.name)}</div>
                <div class="room-description">${this.escapeHtml(room.description)}</div>
                <div class="room-status">
                    <span>${room.room_type}</span>
                    <span>💬 ${this.getMessageCount(room.id)}</span>
                </div>
            </div>
        `).join('');
    }
    
    async selectRoom(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        if (!room) return;
        
        console.log(`Selecting room: ${room.name}`);
        
        this.currentRoom = room;
        this.renderRooms(); // Update active state
        
        // Load messages for this room
        await this.loadMessages(roomId);
        
        // Enable input
        this.enableChatInput();
        
        // Hide welcome message
        this.hideWelcomeMessage();
    }
    
    async loadMessages(roomId) {
        try {
            const response = await fetch(`/api/rooms/${roomId}/messages`);
            if (response.ok) {
                const messages = await response.json();
                this.messages.set(roomId, messages);
                this.renderMessages(messages);
            }
            
        } catch (error) {
            console.error('Failed to load messages:', error);
            this.showError('Failed to load messages');
        }
    }
    
    renderMessages(messages) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;
        
        if (!messages || messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-chat">
                    <div class="empty-icon">💬</div>
                    <h3>No messages yet</h3>
                    <p>Start the conversation!</p>
                </div>
            `;
            return;
        }
        
        messagesContainer.innerHTML = messages.map(msg => `
            <div class="message">
                <div class="message-avatar">
                    ${msg.username.charAt(0).toUpperCase()}
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${this.escapeHtml(msg.username)}</span>
                        <span class="message-time">${this.formatTime(msg.timestamp)}</span>
                    </div>
                    <div class="message-text">${this.escapeHtml(msg.message)}</div>
                </div>
            </div>
        `).join('');
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (!messageInput || !messageInput.value.trim() || !this.currentRoom) return;
        
        const message = messageInput.value.trim();
        messageInput.value = '';
        
        if (sendBtn) sendBtn.disabled = true;
        
        try {
            // Send via API
            const response = await fetch(`/api/rooms/${this.currentRoom.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    room_id: this.currentRoom.id
                })
            });
            
            // Send via WebSocket if available
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    type: 'message',
                    room_id: this.currentRoom.id,
                    message: message
                }));
            }
            
            // Add message to local display immediately
            this.addMessageToDisplay({
                id: Date.now(),
                username: 'admin',
                message: message,
                timestamp: new Date().toISOString(),
                room_id: this.currentRoom.id
            });
            
        } catch (error) {
            console.error('Failed to send message:', error);
            this.showError('Failed to send message');
        }
        
        if (sendBtn) sendBtn.disabled = false;
    }
    
    addMessageToDisplay(message) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;
        
        // Remove empty state if present
        const emptyChat = messagesContainer.querySelector('.empty-chat');
        if (emptyChat) {
            emptyChat.remove();
        }
        
        // Add new message
        const messageHTML = `
            <div class="message">
                <div class="message-avatar">
                    ${message.username.charAt(0).toUpperCase()}
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${this.escapeHtml(message.username)}</span>
                        <span class="message-time">${this.formatTime(message.timestamp)}</span>
                    </div>
                    <div class="message-text">${this.escapeHtml(message.message)}</div>
                </div>
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Update local storage
        if (this.currentRoom) {
            const roomMessages = this.messages.get(this.currentRoom.id) || [];
            roomMessages.push(message);
            this.messages.set(this.currentRoom.id, roomMessages);
        }
    }
    
    handleQuickAction(actionType) {
        switch (actionType) {
            case 'trading':
                this.insertTradingQuery();
                break;
            case 'portfolio':
                this.insertPortfolioQuery();
                break;
            case 'opportunities':
                this.insertOpportunityQuery();
                break;
            case 'help':
                this.insertHelpQuery();
                break;
        }
    }
    
    insertTradingQuery() {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = '📊 Show me the current trading analysis and market opportunities';
            messageInput.focus();
            
            const sendBtn = document.getElementById('sendBtn');
            if (sendBtn) sendBtn.disabled = false;
        }
    }
    
    insertPortfolioQuery() {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = '💼 What is my current portfolio status and performance?';
            messageInput.focus();
            
            const sendBtn = document.getElementById('sendBtn');
            if (sendBtn) sendBtn.disabled = false;
        }
    }
    
    insertOpportunityQuery() {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = '🎯 Find profitable arbitrage opportunities right now';
            messageInput.focus();
            
            const sendBtn = document.getElementById('sendBtn');
            if (sendBtn) sendBtn.disabled = false;
        }
    }
    
    insertHelpQuery() {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = '❓ Help me understand how AGENT trading works';
            messageInput.focus();
            
            const sendBtn = document.getElementById('sendBtn');
            if (sendBtn) sendBtn.disabled = false;
        }
    }
    
    switchToTradingMode() {
        if (window.layoutManager) {
            window.layoutManager.switchToApp('trading');
        }
    }
    
    createNewChat() {
        // Reset to no room selected
        this.currentRoom = null;
        this.renderRooms();
        this.showWelcomeMessage();
        this.disableChatInput();
    }
    
    async createRoom() {
        const roomName = prompt('Enter room name:');
        if (!roomName) return;
        
        const roomDescription = prompt('Enter room description (optional):') || '';
        
        try {
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: roomName,
                    description: roomDescription,
                    room_type: 'general'
                })
            });
            
            if (response.ok) {
                await this.loadRooms();
                console.log('✅ Room created successfully');
            }
            
        } catch (error) {
            console.error('Failed to create room:', error);
            this.showError('Failed to create room');
        }
    }
    
    enableChatInput() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (messageInput) {
            messageInput.disabled = false;
            messageInput.placeholder = 'Type your message...';
        }
        
        if (sendBtn) {
            sendBtn.disabled = !messageInput?.value.trim();
        }
    }
    
    disableChatInput() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (messageInput) {
            messageInput.disabled = true;
            messageInput.placeholder = 'Select a room to start chatting...';
            messageInput.value = '';
        }
        
        if (sendBtn) {
            sendBtn.disabled = true;
        }
    }
    
    showWelcomeMessage() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">🤖</div>
                    <h3>Welcome to AGENT Chat!</h3>
                    <p>Select a room to start chatting, or create a new one.</p>
                    <div class="feature-highlights">
                        <div class="feature">
                            <span class="feature-icon">💹</span>
                            <span>Real-time trading insights</span>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">🧠</span>
                            <span>AI-powered analysis</span>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">📊</span>
                            <span>Market data integration</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    hideWelcomeMessage() {
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }
    }
    
    setupWebSocketHandlers() {
        // WebSocket message handling is done by layout manager
        // We just need to handle chat-specific messages
    }
    
    handleWebSocketMessage(message) {
        if (message.type === 'message' && message.data) {
            // New message received
            this.addMessageToDisplay(message.data);
        } else if (message.type === 'connection_established') {
            console.log('✅ Chat WebSocket connected');
        } else if (message.type === 'error') {
            console.error('WebSocket error:', message.message);
            this.showError(message.message);
        }
    }
    
    getMessageCount(roomId) {
        const roomMessages = this.messages.get(roomId);
        return roomMessages ? roomMessages.length : 0;
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showError(message) {
        console.error('Chat Error:', message);
        
        // You could implement a toast notification here
        // For now, just log to console
    }
}

// Make ChatLayout available globally
window.ChatLayout = ChatLayout;

// Auto-initialize if we're in the chat layout
document.addEventListener('app:initialized', (event) => {
    if (event.detail.appName === 'chat') {
        window.chatLayout = new ChatLayout();
    }
});
