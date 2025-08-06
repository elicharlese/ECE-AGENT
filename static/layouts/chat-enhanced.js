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
