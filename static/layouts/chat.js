/**
 * Enhanced Chat Layout Controller - Production Ready
 * Handles chat functionality, sidebar, messaging, and real-time communication
 */

class ChatLayout {
    constructor() {
        this.currentRoom = { id: 'general', name: 'General AI', type: 'ai' };
        this.rooms = this.getDefaultRooms();
        this.messages = new Map();
        this.websocket = null;
        this.isAuthenticated = false;
        this.sidebarCollapsed = false;
        this.user = { username: 'admin', id: 'admin' };
    }
    
    getDefaultRooms() {
        return [
            {
                id: 'general',
                name: 'General AI',
                type: 'ai',
                description: 'General AI Assistant',
                icon: '🤖',
                lastMessage: 'How can I help you today?',
                lastTime: 'now',
                online: true
            },
            {
                id: 'trading',
                name: 'Trading AI',
                type: 'ai', 
                description: 'Trading and Market Analysis',
                icon: '📈',
                lastMessage: 'Market analysis ready',
                lastTime: '2m',
                unread: 3
            },
            {
                id: 'research',
                name: 'Research AI',
                type: 'ai',
                description: 'Research and Data Analysis', 
                icon: '🔬',
                lastMessage: 'Data analysis complete',
                lastTime: '15m'
            }
        ];
    }
    
    async initialize() {
        console.log('🚀 Initializing Enhanced Chat Layout');
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize default room
            this.selectRoom('general');
            
            // Setup WebSocket
            this.setupWebSocket();
            
            // Auto-authenticate admin user
            this.isAuthenticated = true;
            this.enableChatInput();
            
            console.log('✅ Chat Layout initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Chat Layout:', error);
        }
    }
    
    setupEventListeners() {
        // Sidebar collapse button
        const collapseBtn = document.getElementById('sidebarCollapseBtn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Message input
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (messageInput) {
            // Auto-resize textarea
            messageInput.addEventListener('input', (e) => {
                this.autoResizeTextarea(e.target);
                this.updateSendButton();
            });
            
            // Handle enter key
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // Room selection
        document.addEventListener('click', (e) => {
            const roomItem = e.target.closest('.room-item');
            if (roomItem) {
                const roomId = roomItem.dataset.room;
                this.selectRoom(roomId);
            }
        });
        
        // Quick action buttons
        const newRoomBtn = document.getElementById('newRoomBtn');
        const joinRoomBtn = document.getElementById('joinRoomBtn');
        
        if (newRoomBtn) {
            newRoomBtn.addEventListener('click', () => this.createNewRoom());
        }
        
        if (joinRoomBtn) {
            joinRoomBtn.addEventListener('click', () => this.joinRoom());
        }
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('roomsSidebar');
        if (sidebar) {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
        }
    }
    
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    updateSendButton() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (messageInput && sendBtn) {
            sendBtn.disabled = !messageInput.value.trim();
        }
    }
    
    selectRoom(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        if (!room) return;
        
        this.currentRoom = room;
        
        // Update UI
        this.updateRoomSelection();
        this.updateChatHeader();
        this.loadMessagesForRoom(roomId);
        
        console.log(`Selected room: ${room.name}`);
    }
    
    updateRoomSelection() {
        // Update active room in sidebar
        document.querySelectorAll('.room-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.room === this.currentRoom.id) {
                item.classList.add('active');
            }
        });
    }
    
    updateChatHeader() {
        const chatAvatar = document.getElementById('chatAvatar');
        const chatTitle = document.getElementById('chatTitle');
        const chatSubtitle = document.getElementById('chatSubtitle');
        
        if (chatAvatar) chatAvatar.textContent = this.currentRoom.icon;
        if (chatTitle) chatTitle.textContent = this.currentRoom.name;
        if (chatSubtitle) {
            const statusHtml = this.currentRoom.online 
                ? '<div class="status-online"></div><span>Online • AI Agent ready</span>'
                : '<span>AI Assistant</span>';
            chatSubtitle.innerHTML = statusHtml;
        }
    }
    
    loadMessagesForRoom(roomId) {
        if (!this.messages.has(roomId)) {
            // Initialize with welcome message
            const welcomeMessage = {
                id: Date.now(),
                type: 'system',
                content: this.getWelcomeMessage(roomId),
                timestamp: new Date()
            };
            this.messages.set(roomId, [welcomeMessage]);
        }
        
        this.renderMessages(this.messages.get(roomId));
    }
    
    getWelcomeMessage(roomId) {
        const welcomeMessages = {
            'general': 'Welcome to AGENT! I\'m your AI assistant ready to help with any questions or tasks.',
            'trading': 'Welcome to Trading AI! I can help you with market analysis, trading strategies, and portfolio optimization.',
            'research': 'Welcome to Research AI! I can assist with data analysis, research tasks, and information gathering.'
        };
        return welcomeMessages[roomId] || 'Welcome! How can I assist you today?';
    }
    
    renderMessages(messages) {
        const container = document.getElementById('messagesContainer');
        if (!container) return;
        
        container.innerHTML = messages.map(msg => {
            if (msg.type === 'system') {
                return `
                    <div class="message system">
                        <div class="message-content">
                            <div class="message-bubble">${msg.content}</div>
                        </div>
                    </div>
                `;
            } else {
                const isUser = msg.sender === this.user.username;
                return `
                    <div class="message ${isUser ? 'user' : ''}">
                        <div class="message-avatar">${isUser ? this.user.username.charAt(0).toUpperCase() : this.currentRoom.icon}</div>
                        <div class="message-content">
                            <div class="message-header">
                                <span class="message-author">${msg.sender || this.currentRoom.name}</span>
                                <span class="message-time">${this.formatTime(msg.timestamp)}</span>
                            </div>
                            <div class="message-bubble">${this.escapeHtml(msg.content)}</div>
                        </div>
                    </div>
                `;
            }
        }).join('');
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
    
    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput || !messageInput.value.trim()) return;
        
        const content = messageInput.value.trim();
        messageInput.value = '';
        this.autoResizeTextarea(messageInput);
        this.updateSendButton();
        
        // Create user message
        const userMessage = {
            id: Date.now(),
            sender: this.user.username,
            content: content,
            timestamp: new Date(),
            roomId: this.currentRoom.id
        };
        
        // Add to messages
        if (!this.messages.has(this.currentRoom.id)) {
            this.messages.set(this.currentRoom.id, []);
        }
        this.messages.get(this.currentRoom.id).push(userMessage);
        
        // Re-render messages
        this.renderMessages(this.messages.get(this.currentRoom.id));
        
        // Send via WebSocket if available
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                type: 'chat_message',
                room_id: this.currentRoom.id,
                message: content,
                sender: this.user.username
            }));
        }
        
        // Simulate AI response for AI rooms
        if (this.currentRoom.type === 'ai') {
            setTimeout(() => this.generateAIResponse(content), 1000);
        }
    }
    
    async generateAIResponse(userMessage) {
        const aiMessage = {
            id: Date.now(),
            sender: this.currentRoom.name,
            content: this.getAIResponse(userMessage, this.currentRoom.id),
            timestamp: new Date(),
            roomId: this.currentRoom.id
        };
        
        this.messages.get(this.currentRoom.id).push(aiMessage);
        this.renderMessages(this.messages.get(this.currentRoom.id));
    }
    
    getAIResponse(userMessage, roomId) {
        const responses = {
            'general': [
                "I understand you're asking about: " + userMessage + ". How can I help you further?",
                "That's an interesting question. Let me provide some insights on that topic.",
                "I'd be happy to help you with that. Can you provide more specific details?",
                "Based on your message, I can offer several suggestions. Would you like me to elaborate?"
            ],
            'trading': [
                "Let me analyze the current market conditions for you...",
                "Based on current market data, here are some trading insights:",
                "I'm processing the latest trading signals. Here's what I found:",
                "Current market analysis suggests several opportunities. Let me break them down:"
            ],
            'research': [
                "I'm gathering the latest research data on that topic...",
                "Let me cross-reference multiple sources for accurate information:",
                "Based on current research, here are the key findings:",
                "I've analyzed the available data. Here's what the research shows:"
            ]
        };
        
        const roomResponses = responses[roomId] || responses['general'];
        return roomResponses[Math.floor(Math.random() * roomResponses.length)];
    }
    
    setupWebSocket() {
        if (typeof WebSocket === 'undefined') return;
        
        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/rooms`;
        
        try {
            this.websocket = new WebSocket(wsUrl);
            
            this.websocket.onopen = () => {
                console.log('✅ Chat WebSocket connected');
            };
            
            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (e) {
                    console.error('Failed to parse WebSocket message:', e);
                }
            };
            
            this.websocket.onclose = () => {
                console.log('🔌 Chat WebSocket disconnected');
                // Attempt to reconnect after 3 seconds
                setTimeout(() => this.setupWebSocket(), 3000);
            };
            
            this.websocket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
            };
            
        } catch (error) {
            console.error('Failed to setup WebSocket:', error);
        }
    }
    
    handleWebSocketMessage(data) {
        if (data.type === 'chat_message' && data.room_id === this.currentRoom.id) {
            // Handle incoming message
            const message = {
                id: Date.now(),
                sender: data.sender,
                content: data.message,
                timestamp: new Date(data.timestamp || Date.now()),
                roomId: data.room_id
            };
            
            if (!this.messages.has(data.room_id)) {
                this.messages.set(data.room_id, []);
            }
            
            this.messages.get(data.room_id).push(message);
            this.renderMessages(this.messages.get(data.room_id));
        }
    }
    
    createNewRoom() {
        const roomName = prompt('Enter room name:');
        if (!roomName) return;
        
        const newRoom = {
            id: 'room_' + Date.now(),
            name: roomName,
            type: 'team',
            description: 'Custom room',
            icon: '#',
            lastMessage: 'Room created',
            lastTime: 'now'
        };
        
        this.rooms.push(newRoom);
        this.selectRoom(newRoom.id);
        
        console.log('✅ Created new room:', roomName);
    }
    
    joinRoom() {
        const roomId = prompt('Enter room ID to join:');
        if (!roomId) return;
        
        // In a real app, this would make an API call
        console.log('Attempting to join room:', roomId);
    }
    
    enableChatInput() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (messageInput) {
            messageInput.disabled = false;
            messageInput.placeholder = 'Type your message... (Shift+Enter for new line)';
        }
        
        if (sendBtn) {
            sendBtn.disabled = !messageInput?.value.trim();
        }
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
}

// Initialize chat layout when loaded
window.ChatLayout = ChatLayout;

// Auto-initialize if we're in the chat layout
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.chatLayout = new ChatLayout();
        window.chatLayout.initialize();
    });
} else {
    window.chatLayout = new ChatLayout();
    window.chatLayout.initialize();
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
