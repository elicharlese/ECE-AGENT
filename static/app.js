// AGENT Terminal - Cyberpunk Server Room Interface
class ServerRoomTerminal {
    constructor() {
        this.currentDomain = 'developer';
        this.apiBase = window.location.origin;
        this.isTyping = false;
        this.currentTab = 'chat';
        this.monitoringActive = false;
        this.scanInProgress = false;
        this.attachedFiles = [];
        this.chatHistory = [];
        this.systemMetrics = {
            cpu: 0,
            memory: 0,
            network: 0
        };
        this.accessToken = null;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.bindEvents();
        this.startSystemMonitoring();
    }

    checkAuthentication() {
        // Check if user is already logged in
        this.accessToken = localStorage.getItem('agent_access_token');
        
        if (this.accessToken) {
            this.validateSession();
        } else {
            this.showLoginModal();
        }
    }

    async validateSession() {
        try {
            const response = await fetch(`${this.apiBase}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.hideLoginModal();
                this.showUserInfo();
                this.addBootSequence();
            } else {
                throw new Error('Invalid session');
            }
        } catch (error) {
            console.error('Session validation failed:', error);
            this.logout();
        }
    }

    showLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.remove('hidden');
        }
    }

    hideLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.add('hidden');
        }
    }

    showUserInfo() {
        const userInfo = document.getElementById('userInfo');
        const currentUserSpan = document.getElementById('currentUser');
        
        if (userInfo) userInfo.classList.remove('hidden');
        if (userInfo) userInfo.classList.add('flex');
        if (currentUserSpan && this.currentUser) {
            currentUserSpan.textContent = this.currentUser.username;
        }
    }

    hideUserInfo() {
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.classList.add('hidden');
            userInfo.classList.remove('flex');
        }
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) sidebar.classList.toggle('collapsed');
            });
        }

        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // Domain selection
        document.querySelectorAll('.domain-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectDomain(e.currentTarget.dataset.domain);
            });
        });

        // Chat functionality
        this.setupChatEvents();
        
        // Security tools
        this.setupSecurityToolEvents();

        // Admin functions
        this.setupAdminEvents();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    async handleLogin() {
        const username = document.getElementById('loginUsername')?.value;
        const password = document.getElementById('loginPassword')?.value;
        const loginBtn = document.getElementById('loginBtn');
        const loginError = document.getElementById('loginError');

        if (!username || !password) {
            this.showLoginError('Please enter both username and password');
            return;
        }

        // Show loading state
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>AUTHENTICATING...';
            loginBtn.disabled = true;
        }

        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                this.accessToken = data.access_token;
                this.currentUser = data.user;
                
                // Store token for future sessions
                localStorage.setItem('agent_access_token', this.accessToken);
                
                // Hide login modal and show main interface
                this.hideLoginModal();
                this.showUserInfo();
                this.addBootSequence();
                this.showNotification('Authentication successful', 'success');
            } else {
                this.showLoginError('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError('Connection failed. Please try again.');
        } finally {
            // Reset button state
            if (loginBtn) {
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>AUTHENTICATE';
                loginBtn.disabled = false;
            }
        }
    }

    showLoginError(message) {
        const loginError = document.getElementById('loginError');
        const loginErrorText = document.getElementById('loginErrorText');
        
        if (loginError && loginErrorText) {
            loginErrorText.textContent = message;
            loginError.classList.remove('hidden');
            
            setTimeout(() => {
                loginError.classList.add('hidden');
            }, 5000);
        }
    }

    async logout() {
        try {
            if (this.accessToken) {
                await fetch(`${this.apiBase}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage and reset state
            localStorage.removeItem('agent_access_token');
            this.accessToken = null;
            this.currentUser = null;
            
            // Reset UI
            this.hideUserInfo();
            this.showLoginModal();
            this.clearChat();
            
            this.showNotification('Logged out successfully', 'info');
        }
    }
    }

    setupChatEvents() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            messageInput.addEventListener('input', () => {
                this.autoResizeTextarea();
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // Chat controls
        const clearChat = document.getElementById('clearChat');
        if (clearChat) {
            clearChat.addEventListener('click', () => {
                this.clearChat();
            });
        }

        const exportChat = document.getElementById('exportChat');
        if (exportChat) {
            exportChat.addEventListener('click', () => {
                this.exportChat();
            });
        }
    }

    setupSecurityToolEvents() {
        // Port scanner
        const startScan = document.getElementById('startAdvancedScan');
        if (startScan) {
            startScan.addEventListener('click', () => {
                this.startPortScan();
            });
        }

        const stopScan = document.getElementById('stopScan');
        if (stopScan) {
            stopScan.addEventListener('click', () => {
                this.stopPortScan();
            });
        }

        // Network monitoring
        const startMonitoring = document.getElementById('startNetworkMonitoring');
        if (startMonitoring) {
            startMonitoring.addEventListener('click', () => {
                this.startNetworkMonitoring();
            });
        }

        const stopMonitoring = document.getElementById('stopNetworkMonitoring');
        if (stopMonitoring) {
            stopMonitoring.addEventListener('click', () => {
                this.stopNetworkMonitoring();
            });
        }

        // Tool category switching
        document.querySelectorAll('.tool-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchToolCategory(e.currentTarget.dataset.category);
            });
        });
    }

    setupAdminEvents() {
        const trainBtn = document.getElementById('trainBtn');
        if (trainBtn) {
            trainBtn.addEventListener('click', () => {
                this.submitTrainingData();
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+` for terminal toggle
            if (e.ctrlKey && e.key === '`') {
                e.preventDefault();
                this.toggleFullTerminal();
            }
            
            // Escape for close modals
            if (e.key === 'Escape') {
                this.closeModals();
            }
            
            // Ctrl+Enter to send message
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    switchTab(tabName) {
        // Update nav buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const activeContent = document.getElementById(`${tabName}-tab`);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        this.currentTab = tabName;
    }

    selectDomain(domain) {
        this.currentDomain = domain;
        
        // Update domain buttons
        document.querySelectorAll('.domain-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-domain="${domain}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Add system message
        this.addTerminalMessage(`[SYSTEM] Domain switched to ${domain.toUpperCase()}`, 'system');
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message || this.isTyping) return;

        // Add user message
        this.addTerminalMessage(`[USER] ${message}`, 'user');
        input.value = '';
        this.autoResizeTextarea();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await fetch(`${this.apiBase}/agent/query`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: JSON.stringify({
                    query: message,
                    domain: this.currentDomain
                })
            });

            const data = await response.json();
            
            this.hideTypingIndicator();

            if (data.success) {
                this.addTerminalMessage(`[AGENT] ${data.response}`, 'agent');
            } else {
                this.addTerminalMessage('[ERROR] Failed to process request', 'error');
            }

        } catch (error) {
            this.hideTypingIndicator();
            this.addTerminalMessage('[ERROR] Connection failed', 'error');
            console.error('Error:', error);
        }
    }

    addTerminalMessage(content, type = 'info') {
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `terminal-line mb-2 font-mono text-sm`;

        const timestamp = new Date().toLocaleTimeString();
        let typeClass = 'text-terminal-green';

        switch (type) {
            case 'user':
                typeClass = 'text-neon-cyan';
                break;
            case 'agent':
                typeClass = 'text-neon-green';
                break;
            case 'system':
                typeClass = 'text-neon-orange';
                break;
            case 'error':
                typeClass = 'text-neon-red';
                break;
            case 'warning':
                typeClass = 'text-warning-amber';
                break;
        }

        messageDiv.innerHTML = `
            <div class="${typeClass}">
                <span class="text-neon-blue">[${timestamp}]</span> 
                <span>${this.escapeHtml(content)}</span>
            </div>
        `;

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Add to history
        this.chatHistory.push({ type, content, timestamp });
    }

    showTypingIndicator() {
        this.isTyping = true;
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'terminal-line mb-2 font-mono text-sm';
        
        typingDiv.innerHTML = `
            <div class="text-neon-green flex items-center">
                <span class="text-neon-blue">[${new Date().toLocaleTimeString()}]</span>
                <span class="ml-2">[AGENT] Processing</span>
                <div class="flex ml-2 space-x-1">
                    <div class="w-1 h-1 bg-neon-cyan rounded-full animate-bounce"></div>
                    <div class="w-1 h-1 bg-neon-cyan rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-1 h-1 bg-neon-cyan rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;

        chatContainer.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Security Tools
    async startPortScan() {
        if (this.scanInProgress) return;
        
        const target = document.getElementById('scanTargets')?.value?.trim();
        if (!target) {
            this.showNotification('Target required for scan', 'error');
            return;
        }
        
        this.scanInProgress = true;
        const btn = document.getElementById('startAdvancedScan');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>SCANNING...';
            btn.disabled = true;
        }
        
        const resultsDiv = document.getElementById('scanResults');
        if (resultsDiv) {
            resultsDiv.classList.remove('hidden');
        }
        
        try {
            await this.simulatePortScan(target);
        } finally {
            this.scanInProgress = false;
            if (btn) {
                btn.innerHTML = '<i class="fas fa-play mr-2"></i>INITIATE SCAN';
                btn.disabled = false;
            }
        }
    }

    async simulatePortScan(target) {
        const output = document.getElementById('scanOutput');
        const progress = document.getElementById('scanProgress');
        const progressBar = document.getElementById('scanProgressBar');
        
        if (!output) return;

        output.innerHTML = `[SCAN INIT] Target: ${target}\n[SCAN INIT] Starting advanced port scan...\n`;
        
        const ports = [21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 993, 995, 1433, 3306, 3389, 5432];
        
        for (let i = 0; i < ports.length; i++) {
            await this.sleep(150);
            const port = ports[i];
            const isOpen = Math.random() > 0.7;
            
            if (isOpen) {
                const service = this.getServiceName(port);
                output.innerHTML += `[OPEN] ${port}/tcp ${service} - ACCESSIBLE\n`;
            }
            
            const progressPercent = Math.round(((i + 1) / ports.length) * 100);
            if (progress) progress.textContent = `${i + 1}/${ports.length} ports`;
            if (progressBar) progressBar.style.width = `${progressPercent}%`;
            
            output.scrollTop = output.scrollHeight;
        }
        
        const openPorts = output.innerHTML.split('[OPEN]').length - 1;
        output.innerHTML += `\n[SCAN COMPLETE] Found ${openPorts} open ports\n`;
        output.innerHTML += `[THREAT ASSESSMENT] ${openPorts > 5 ? 'HIGH RISK' : openPorts > 2 ? 'MEDIUM RISK' : 'LOW RISK'}\n`;
    }

    stopPortScan() {
        this.scanInProgress = false;
        const btn = document.getElementById('startAdvancedScan');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-play mr-2"></i>INITIATE SCAN';
            btn.disabled = false;
        }
        this.showNotification('Port scan stopped', 'info');
    }

    getServiceName(port) {
        const services = {
            21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp', 53: 'dns',
            80: 'http', 110: 'pop3', 135: 'msrpc', 139: 'netbios',
            143: 'imap', 443: 'https', 993: 'imaps', 995: 'pop3s',
            1433: 'mssql', 3306: 'mysql', 3389: 'rdp', 5432: 'postgresql'
        };
        return services[port] || 'unknown';
    }

    switchToolCategory(category) {
        // Update category buttons
        document.querySelectorAll('.tool-category-btn').forEach(btn => {
            btn.classList.remove('active', 'neon-border');
        });
        
        const activeBtn = document.querySelector(`[data-category="${category}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'neon-border');
        }
        
        // Show/hide tool sections
        document.querySelectorAll('.tool-section').forEach(section => {
            section.style.display = 'none';
        });
        
        const targetSection = document.getElementById(`${category}-tools`);
        if (targetSection) {
            targetSection.style.display = 'block';
        } else {
            // Default to network tools if section not found
            const networkSection = document.getElementById('network-tools');
            if (networkSection) {
                networkSection.style.display = 'block';
            }
        }
    }

    startNetworkMonitoring() {
        if (this.monitoringActive) return;
        
        this.monitoringActive = true;
        
        const startBtn = document.getElementById('startNetworkMonitoring');
        const stopBtn = document.getElementById('stopNetworkMonitoring');
        
        if (startBtn) startBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = false;
        
        this.monitoringInterval = setInterval(() => {
            this.updateNetworkStats();
        }, 2000);
        
        this.showNotification('Network monitoring activated', 'success');
    }

    stopNetworkMonitoring() {
        this.monitoringActive = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        const startBtn = document.getElementById('startNetworkMonitoring');
        const stopBtn = document.getElementById('stopNetworkMonitoring');
        
        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
        
        this.showNotification('Network monitoring deactivated', 'info');
    }

    updateNetworkStats() {
        // Generate realistic-looking metrics
        this.systemMetrics.cpu = Math.floor(Math.random() * 30) + 20; // 20-50%
        this.systemMetrics.memory = Math.floor(Math.random() * 40) + 30; // 30-70%
        this.systemMetrics.network = Math.floor(Math.random() * 800) + 200; // 200-1000 KB/s
        
        // Update UI elements
        const elements = {
            cpuUsage: document.getElementById('cpuUsage'),
            memUsage: document.getElementById('memUsage'),
            networkIO: document.getElementById('networkIO'),
            cpuBar: document.getElementById('cpuBar'),
            memBar: document.getElementById('memBar'),
            networkBar: document.getElementById('networkBar')
        };
        
        if (elements.cpuUsage) elements.cpuUsage.textContent = `${this.systemMetrics.cpu}%`;
        if (elements.memUsage) elements.memUsage.textContent = `${this.systemMetrics.memory}%`;
        if (elements.networkIO) elements.networkIO.textContent = `${this.systemMetrics.network} KB/s`;
        
        if (elements.cpuBar) elements.cpuBar.style.width = `${this.systemMetrics.cpu}%`;
        if (elements.memBar) elements.memBar.style.width = `${this.systemMetrics.memory}%`;
        if (elements.networkBar) elements.networkBar.style.width = `${Math.min(this.systemMetrics.network / 10, 100)}%`;
    }

    // Admin Functions
    async submitTrainingData() {
        const domain = document.getElementById('trainDomain')?.value;
        const input = document.getElementById('trainInput')?.value?.trim();
        const output = document.getElementById('trainOutput')?.value?.trim();
        
        if (!input || !output) {
            this.showNotification('Training input/output required', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/api/admin/train`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    domain, 
                    input_text: input, 
                    expected_output: output 
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Training data added successfully', 'success');
                document.getElementById('trainInput').value = '';
                document.getElementById('trainOutput').value = '';
                this.addTerminalMessage(`[TRAINING] Data added for ${domain} domain`, 'system');
            } else {
                this.showNotification('Training failed', 'error');
            }
        } catch (error) {
            this.showNotification('Training connection error', 'error');
        }
    }

    // System Management
    startSystemMonitoring() {
        setInterval(() => {
            if (!this.monitoringActive) {
                // Update sidebar stats periodically
                this.updateSidebarStats();
            }
        }, 5000);
    }

    updateSidebarStats() {
        // Light system monitoring for sidebar
        const cpu = Math.floor(Math.random() * 20) + 15; // 15-35%
        const memory = Math.floor(Math.random() * 30) + 25; // 25-55%
        const network = Math.floor(Math.random() * 500) + 100; // 100-600 KB/s
        
        const cpuElement = document.getElementById('systemCpu');
        const memElement = document.getElementById('systemMemory');
        const netElement = document.getElementById('systemNetwork');
        
        if (cpuElement) cpuElement.textContent = `${cpu}%`;
        if (memElement) memElement.textContent = `${memory}%`;
        if (netElement) netElement.textContent = `${network} KB/s`;
    }

    addBootSequence() {
        setTimeout(() => {
            this.addTerminalMessage('[BOOT] AGENT Terminal v2.1 - Server Room Interface', 'system');
            this.addTerminalMessage('[BOOT] Initializing security protocols...', 'system');
            this.addTerminalMessage('[BOOT] Loading neural network interfaces...', 'system');
            this.addTerminalMessage('[BOOT] All systems operational - Ready for commands', 'system');
        }, 1000);
    }

    // Utility Functions
    autoResizeTextarea() {
        const textarea = document.getElementById('messageInput');
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    }

    clearChat() {
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.innerHTML = '';
        }
        this.chatHistory = [];
        this.addTerminalMessage('[SYSTEM] Terminal cleared', 'system');
    }

    exportChat() {
        const chatData = {
            timestamp: new Date().toISOString(),
            domain: this.currentDomain,
            messages: this.chatHistory,
            systemMetrics: this.systemMetrics
        };
        
        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agent-terminal-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Terminal session exported', 'success');
    }

    toggleFullTerminal() {
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.classList.toggle('terminal-fullscreen');
        }
    }

    closeModals() {
        document.querySelectorAll('.modal, .dropdown').forEach(el => {
            el.classList.add('hidden');
        });
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) {
            console.log(`[${type.toUpperCase()}] ${message}`);
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast server-panel rounded-lg p-3 shadow-lg flex items-center space-x-3 transform translate-x-full transition-transform duration-300`;
        
        const colors = {
            success: 'text-neon-green border-neon-green',
            error: 'text-neon-red border-neon-red',
            warning: 'text-warning-amber border-warning-amber',
            info: 'text-neon-cyan border-neon-cyan'
        };
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        toast.classList.add(colors[type] || colors.info);
        toast.innerHTML = `
            <i class="fas fa-${icons[type] || icons.info} text-sm"></i>
            <span class="font-mono text-sm">${message}</span>
            <button class="ml-auto text-current hover:text-white text-sm" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('translate-x-full');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the terminal interface
let terminal;
document.addEventListener('DOMContentLoaded', () => {
    terminal = new ServerRoomTerminal();
    window.terminal = terminal; // Make globally accessible
});

// Handle responsive behavior
window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('collapsed');
        }
    }
});
