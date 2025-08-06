// Main Layout JavaScript Controller
class MainLayoutController {
    constructor() {
        this.currentRoom = 'general';
        this.isAppsModalOpen = false;
        this.isProfileDropdownOpen = false;
        this.isNotificationPanelOpen = false;
        
        this.init();
    }

    init() {
        console.log('Main Layout Controller initializing...');
        this.initEventListeners();
        this.initMessageInput();
        this.initSidebarState();
        this.addSidebarHoverEffects();
        this.loadInitialContent();
        this.startRealTimeUpdates();
    }

    initEventListeners() {
        // Navigation buttons
        document.getElementById('terminalBtn')?.addEventListener('click', () => {
            this.openApp('terminal');
        });

        document.getElementById('chartBtn')?.addEventListener('click', () => {
            this.openApp('charts');
        });

        document.getElementById('walletBtn')?.addEventListener('click', () => {
            this.openApp('wallet');
        });

        document.getElementById('docsBtn')?.addEventListener('click', () => {
            this.openApp('docs');
        });

        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.openApp('settings');
        });

        // Profile menu
        document.getElementById('profileBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleProfileDropdown();
        });

        // Profile dropdown actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action]')) {
                const action = e.target.closest('[data-action]').dataset.action;
                this.handleProfileAction(action);
            }
        });

        // Notification panel
        document.getElementById('notificationBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleNotificationPanel();
        });

        // Sidebar controls
        document.getElementById('sidebarCollapseBtn')?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('newRoomBtn')?.addEventListener('click', () => {
            this.createNewRoom();
        });

        document.getElementById('joinRoomBtn')?.addEventListener('click', () => {
            this.showJoinRoomDialog();
        });

        // Room search
        document.getElementById('roomSearch')?.addEventListener('input', (e) => {
            this.filterRooms(e.target.value);
        });

        // Room selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.room-item')) {
                const roomItem = e.target.closest('.room-item');
                const roomId = roomItem.dataset.room;
                this.switchRoom(roomId);
            }
        });

        // Chat actions
        document.getElementById('appsBtn')?.addEventListener('click', () => {
            this.toggleAppsModal();
        });

        document.getElementById('chatSettingsBtn')?.addEventListener('click', () => {
            this.openChatSettings();
        });

        document.getElementById('chatInfoBtn')?.addEventListener('click', () => {
            this.showChatInfo();
        });

        // Message input actions
        document.getElementById('attachBtn')?.addEventListener('click', () => {
            this.showAttachmentOptions();
        });

        document.getElementById('appsInputBtn')?.addEventListener('click', () => {
            this.toggleQuickApps();
        });

        document.getElementById('emojiBtn')?.addEventListener('click', () => {
            this.showEmojiPicker();
        });

        document.getElementById('sendBtn')?.addEventListener('click', () => {
            this.sendMessage();
        });

        // Apps modal
        document.getElementById('closeAppsModal')?.addEventListener('click', () => {
            this.closeAppsModal();
        });

        // App category filters
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-btn')) {
                const categoryBtn = e.target.closest('.category-btn');
                const category = categoryBtn.dataset.category;
                this.filterApps(category);
            }
        });

        // App launch buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.app-launch-btn')) {
                const appCard = e.target.closest('.app-card');
                const appId = appCard.dataset.app;
                this.launchApp(appId);
            }
        });

        // Quick app buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quick-app-btn')) {
                const appBtn = e.target.closest('.quick-app-btn');
                const appId = appBtn.dataset.app;
                this.launchApp(appId);
            }
        });

        // Modal backdrop clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeAppsModal();
            }
        });

        // Global click handler for closing dropdowns
        document.addEventListener('click', () => {
            this.closeAllDropdowns();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    initMessageInput() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');

        if (!messageInput || !sendBtn) return;

        // Auto-resize textarea
        messageInput.addEventListener('input', () => {
            this.autoResizeTextarea(messageInput);
            this.updateSendButton();
        });

        // Send on Enter (but not Shift+Enter)
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Update send button state
        this.updateSendButton();
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    updateSendButton() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (!messageInput || !sendBtn) return;

        const hasContent = messageInput.value.trim().length > 0;
        sendBtn.disabled = !hasContent;
    }

    // Navigation Methods
    openApp(appId) {
        console.log(`Opening app: ${appId}`);
        
        // Update breadcrumb
        this.updateBreadcrumb(appId);
        
        // Here you would load the appropriate layout/content
        switch (appId) {
            case 'terminal':
                this.loadTerminalApp();
                break;
            case 'charts':
                this.loadChartsApp();
                break;
            case 'wallet':
                this.loadWalletApp();
                break;
            case 'docs':
                this.loadDocsApp();
                break;
            case 'settings':
                this.loadSettingsApp();
                break;
            default:
                console.warn(`Unknown app: ${appId}`);
        }
    }

    updateBreadcrumb(location) {
        const breadcrumb = document.getElementById('currentLocation');
        if (breadcrumb) {
            breadcrumb.textContent = location.charAt(0).toUpperCase() + location.slice(1);
        }
    }

    // Profile Methods
    toggleProfileDropdown() {
        const profileMenu = document.querySelector('.profile-menu');
        if (!profileMenu) return;

        this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
        profileMenu.classList.toggle('open', this.isProfileDropdownOpen);
    }

    handleProfileAction(action) {
        console.log(`Profile action: ${action}`);
        
        switch (action) {
            case 'profile':
                this.openApp('profile');
                break;
            case 'settings':
                this.openApp('settings');
                break;
            case 'help':
                this.openApp('help');
                break;
            case 'logout':
                this.logout();
                break;
        }
        
        this.closeAllDropdowns();
    }

    // Notification Methods
    toggleNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        if (!panel) return;

        this.isNotificationPanelOpen = !this.isNotificationPanelOpen;
        panel.classList.toggle('open', this.isNotificationPanelOpen);
    }

    // Sidebar Methods
    toggleSidebar() {
        const sidebar = document.getElementById('roomsSidebar');
        if (!sidebar) return;

        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            sidebar.classList.remove('collapsed');
            localStorage.setItem('sidebarCollapsed', 'false');
        } else {
            sidebar.classList.add('collapsed');
            localStorage.setItem('sidebarCollapsed', 'true');
        }

        // Update button icon
        const icon = document.querySelector('#sidebarCollapseBtn i');
        if (icon) {
            icon.className = sidebar.classList.contains('collapsed') ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
        }
        
        console.log(`Sidebar ${sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded'}`);
    }

    initSidebarState() {
        const sidebar = document.getElementById('roomsSidebar');
        if (!sidebar) return;

        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            const icon = document.querySelector('#sidebarCollapseBtn i');
            if (icon) {
                icon.className = 'fas fa-chevron-right';
            }
        }
    }

    addSidebarHoverEffects() {
        // Removed complex hover effects for better reliability
    }

    // Room Methods
    switchRoom(roomId) {
        if (roomId === this.currentRoom) return;

        console.log(`Switching to room: ${roomId}`);
        
        // Add loading state
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.style.opacity = '0.6';
            messagesContainer.style.transition = 'opacity 0.3s ease';
        }
        
        // Update active room with smooth transition
        document.querySelectorAll('.room-item').forEach(item => {
            item.classList.remove('active');
            item.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        
        const newRoomItem = document.querySelector(`[data-room="${roomId}"]`);
        if (newRoomItem) {
            // Smooth activation
            setTimeout(() => {
                newRoomItem.classList.add('active');
            }, 150);
        }

        // Update chat header with animation
        this.updateChatHeader(roomId);
        
        // Load room messages with delay for smooth transition
        setTimeout(() => {
            this.loadRoomMessages(roomId);
            if (messagesContainer) {
                messagesContainer.style.opacity = '1';
            }
        }, 300);
        
        this.currentRoom = roomId;
        
        // Clear any unread badges for this room
        const unreadBadge = newRoomItem?.querySelector('.unread-badge');
        if (unreadBadge) {
            unreadBadge.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                unreadBadge.remove();
            }, 300);
        }
    }

    updateChatHeader(roomId) {
        const chatAvatar = document.getElementById('chatAvatar');
        const chatTitle = document.getElementById('chatTitle');
        const chatSubtitle = document.getElementById('chatSubtitle');

        // Room configurations
        const roomConfigs = {
            'general': {
                avatar: '🤖',
                title: 'General AI Assistant',
                subtitle: 'Online • AI Agent ready'
            },
            'trading': {
                avatar: '📈',
                title: 'Trading AI',
                subtitle: 'Online • Market data streaming'
            },
            'research': {
                avatar: '🔬',
                title: 'Research AI',
                subtitle: 'Online • Analysis ready'
            }
        };

        const config = roomConfigs[roomId] || roomConfigs['general'];
        
        if (chatAvatar) chatAvatar.textContent = config.avatar;
        if (chatTitle) chatTitle.textContent = config.title;
        if (chatSubtitle) {
            chatSubtitle.innerHTML = `
                <div class="status-online"></div>
                <span>${config.subtitle}</span>
            `;
        }
    }

    filterRooms(query) {
        const roomItems = document.querySelectorAll('.room-item');
        const searchTerm = query.toLowerCase();

        roomItems.forEach(item => {
            const roomName = item.querySelector('.room-name')?.textContent.toLowerCase();
            const roomPreview = item.querySelector('.room-preview')?.textContent.toLowerCase();
            
            const matches = roomName?.includes(searchTerm) || roomPreview?.includes(searchTerm);
            item.style.display = matches ? 'flex' : 'none';
        });
    }

    createNewRoom() {
        // Show room creation dialog
        const roomName = prompt('Enter room name:');
        if (roomName) {
            console.log(`Creating new room: ${roomName}`);
            // Add room creation logic here
        }
    }

    showJoinRoomDialog() {
        // Show join room dialog
        const roomCode = prompt('Enter room code or URL:');
        if (roomCode) {
            console.log(`Joining room: ${roomCode}`);
            // Add room joining logic here
        }
    }

    // Apps Modal Methods
    toggleAppsModal() {
        this.isAppsModalOpen = !this.isAppsModalOpen;
        const modal = document.getElementById('appsModal');
        if (modal) {
            modal.classList.toggle('open', this.isAppsModalOpen);
        }
    }

    closeAppsModal() {
        this.isAppsModalOpen = false;
        const modal = document.getElementById('appsModal');
        if (modal) {
            modal.classList.remove('open');
        }
    }

    filterApps(category) {
        // Update active category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-category="${category}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Filter app cards
        const appCards = document.querySelectorAll('.app-card');
        appCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const shouldShow = category === 'all' || cardCategory === category;
            card.style.display = shouldShow ? 'block' : 'none';
        });
    }

    launchApp(appId) {
        console.log(`Launching app: ${appId}`);
        this.closeAppsModal();
        this.openApp(appId);
    }

    // Message Methods
    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;

        const message = messageInput.value.trim();
        if (!message) return;

        console.log(`Sending message: ${message}`);
        
        // Add message to chat
        this.addMessageToChat(message, 'user');
        
        // Clear input
        messageInput.value = '';
        this.updateSendButton();
        this.autoResizeTextarea(messageInput);
        
        // Simulate AI response
        setTimeout(() => {
            this.simulateAIResponse(message);
        }, 1000);
    }

    addMessageToChat(content, sender = 'user') {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const avatar = sender === 'user' ? '👤' : '🤖';
        const author = sender === 'user' ? 'You' : 'AI Assistant';

        messageElement.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${author}</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-bubble">${content}</div>
                <div class="message-actions">
                    <button class="message-action-btn" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="message-action-btn" title="React">
                        <i class="fas fa-thumbs-up"></i>
                    </button>
                    <button class="message-action-btn" title="Reply">
                        <i class="fas fa-reply"></i>
                    </button>
                </div>
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    simulateAIResponse(userMessage) {
        // Simple AI response simulation
        const responses = [
            "I understand you're asking about that. Let me help you with some insights.",
            "That's an interesting question! Here's what I can tell you...",
            "Based on current market data, I'd recommend considering these factors:",
            "I'm analyzing the latest information to provide you with the best answer.",
            "Let me process that request and get back to you with detailed analysis."
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];
        this.addMessageToChat(response, 'ai');
    }

    // Quick Apps Methods
    toggleQuickApps() {
        const quickApps = document.getElementById('quickAppButtons');
        if (quickApps) {
            const isVisible = quickApps.style.display !== 'none';
            quickApps.style.display = isVisible ? 'none' : 'flex';
        }
    }

    // Utility Methods
    closeAllDropdowns() {
        this.isProfileDropdownOpen = false;
        this.isNotificationPanelOpen = false;
        
        document.querySelector('.profile-menu')?.classList.remove('open');
        document.getElementById('notificationPanel')?.classList.remove('open');
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K to open apps
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.toggleAppsModal();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            this.closeAppsModal();
            this.closeAllDropdowns();
        }
    }

    // Content Loading Methods
    loadInitialContent() {
        console.log('Loading initial content...');
        // Load initial room content, user data, etc.
    }

    loadRoomMessages(roomId) {
        console.log(`Loading messages for room: ${roomId}`);
        // Load room-specific messages
    }

    // App Loading Methods (stubs for now)
    loadTerminalApp() {
        console.log('Loading terminal app...');
        // Load terminal interface
    }

    loadChartsApp() {
        console.log('Loading charts app...');
        // Load charts interface
    }

    loadWalletApp() {
        console.log('Loading wallet app...');
        // Load wallet interface
    }

    loadDocsApp() {
        console.log('Loading docs app...');
        // Load documentation
    }

    loadSettingsApp() {
        console.log('Loading settings app...');
        // Load settings interface
    }

    // Real-time Updates
    startRealTimeUpdates() {
        console.log('Starting real-time updates...');
        
        // Simulate periodic updates
        setInterval(() => {
            this.updateNotifications();
            this.updateRoomStatuses();
        }, 30000); // Update every 30 seconds
    }

    updateNotifications() {
        // Update notification badge
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            // Simulate notification count updates
            const count = Math.floor(Math.random() * 5);
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }

    updateRoomStatuses() {
        // Update room online indicators, timestamps, etc.
        console.log('Updating room statuses...');
    }

    // Additional utility methods
    showAttachmentOptions() {
        console.log('Showing attachment options...');
        // Show file upload options
    }

    showEmojiPicker() {
        console.log('Showing emoji picker...');
        // Show emoji selection interface
    }

    openChatSettings() {
        console.log('Opening chat settings...');
        // Open chat-specific settings
    }

    showChatInfo() {
        console.log('Showing chat info...');
        // Show chat information panel
    }

    logout() {
        console.log('Logging out...');
        // Handle logout process
    }
}

// Initialize the layout controller when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.mainLayout = new MainLayoutController();
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainLayoutController;
}
