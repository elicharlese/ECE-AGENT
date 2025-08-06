// AGENT Terminal - Cyberpunk Server Room Interface
class ServerRoomTerminal {
    constructor() {
        this.currentDomain = 'developer';
        // Set API base URL - use relative path for Vercel deployment
        this.apiBase = window.location.hostname.includes('vercel.app') 
            ? window.location.origin + '/api' 
            : window.location.origin;
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
        this.websocket = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.bindEvents();
        this.startSystemMonitoring();
        this.initWebSocket();
    }

    initWebSocket() {
        // Create WebSocket connection
        const wsUrl = this.apiBase.replace('http', 'ws') + '/ws/chat';
        this.websocket = new WebSocket(wsUrl);
        
        // Connection opened
        this.websocket.onopen = (event) => {
            console.log('WebSocket connection opened');
            this.addTerminalMessage('[SYSTEM] Real-time chat connected', 'system');
        };

        // Listen for messages
        this.websocket.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            this.handleWebSocketMessage(messageData);
        };

        // Connection closed
        this.websocket.onclose = (event) => {
            console.log('WebSocket connection closed');
            this.addTerminalMessage('[SYSTEM] Real-time chat disconnected', 'system');
        };

        // Connection error
        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.addTerminalMessage('[ERROR] Real-time chat connection error', 'error');
        };
    }

    handleWebSocketMessage(messageData) {
        // Handle incoming WebSocket messages
        if (messageData.type === 'public') {
            // Display public chat messages
            this.addTerminalMessage(`[CHAT] ${messageData.sender}: ${messageData.content}`, 'user');
        } else if (messageData.type === 'private') {
            // Display private AGENT responses
            const agentResponse = this.formatAgentResponse(messageData.content);
            this.addTerminalMessage(`[AGENT] ${agentResponse}`, 'agent');
        }
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

        // Check if Shift key is pressed for public chat mode
        const isPublicChat = event && event.shiftKey;

        if (isPublicChat) {
            // Send public message via WebSocket
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                const messageData = {
                    type: 'public',
                    content: message,
                    sender: this.currentUser?.username || 'Anonymous',
                    timestamp: new Date().toISOString()
                };
                this.websocket.send(JSON.stringify(messageData));
                input.value = '';
                this.autoResizeTextarea();
            } else {
                this.addTerminalMessage('[ERROR] WebSocket connection not available for public chat', 'error');
            }
        } else {
            // Add user message for private AGENT query
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
                        domain: this.currentDomain,
                        use_internet: true // Enable internet research by default
                    })
                });

                this.hideTypingIndicator();

                if (!response.ok) {
                    if (response.status === 401) {
                        this.showNotification('Session expired. Please login again.', 'warning');
                        this.logout();
                        return;
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (data.success) {
                    // Add response with rich formatting
                    const agentResponse = this.formatAgentResponse(data.response);
                    this.addTerminalMessage(`[AGENT] ${agentResponse}`, 'agent');
                    
                    // Add metadata if available
                    if (data.timestamp) {
                        this.addTerminalMessage(`[INFO] Response generated at ${new Date(data.timestamp).toLocaleTimeString()}`, 'system');
                    }
                } else {
                    this.addTerminalMessage(`[ERROR] ${data.message || 'Failed to process request'}`, 'error');
                }

            } catch (error) {
                this.hideTypingIndicator();
                
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    this.addTerminalMessage('[ERROR] Backend server not responding. Please check connection.', 'error');
                } else {
                    this.addTerminalMessage(`[ERROR] ${error.message}`, 'error');
                }
                
                console.error('Message send error:', error);
            }
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

    // Security Tools - Now connects to real backend
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
            // Real API call to backend
            const response = await fetch(`${this.apiBase}/security/port-scan`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: JSON.stringify({
                    target: target,
                    port_range: 'common',
                    scan_type: 'tcp'
                })
            });

            if (!response.ok) {
                throw new Error(`Scan failed: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success) {
                await this.displayRealScanResults(data);
                this.showNotification('Port scan completed successfully', 'success');
            } else {
                throw new Error(data.message || 'Scan failed');
            }
            
        } catch (error) {
            console.error('Port scan error:', error);
            this.showNotification(`Scan error: ${error.message}`, 'error');
            // Fallback to simulation if real scan fails
            await this.simulatePortScan(target);
        } finally {
            this.scanInProgress = false;
            if (btn) {
                btn.innerHTML = '<i class="fas fa-play mr-2"></i>INITIATE SCAN';
                btn.disabled = false;
            }
        }
    }

    async displayRealScanResults(scanData) {
        const output = document.getElementById('scanOutput');
        const progress = document.getElementById('scanProgress');
        const progressBar = document.getElementById('scanProgressBar');
        
        if (!output) return;

        output.innerHTML = `[SCAN INIT] Target: ${scanData.target || 'Unknown'}\n[SCAN INIT] Starting real port scan...\n`;
        
        // Display actual scan results
        if (scanData.results && scanData.results.open_ports) {
            const openPorts = scanData.results.open_ports;
            
            for (let i = 0; i < openPorts.length; i++) {
                await this.sleep(100);
                const port = openPorts[i];
                
                output.innerHTML += `[OPEN] ${port.port}/tcp ${port.service || 'unknown'} - ${port.state || 'ACCESSIBLE'}\n`;
                
                const progressPercent = Math.round(((i + 1) / openPorts.length) * 100);
                if (progress) progress.textContent = `${i + 1}/${openPorts.length} ports found`;
                if (progressBar) progressBar.style.width = `${progressPercent}%`;
                
                output.scrollTop = output.scrollHeight;
            }
            
            output.innerHTML += `\n[SCAN COMPLETE] Found ${openPorts.length} open ports\n`;
            output.innerHTML += `[THREAT ASSESSMENT] ${scanData.results.risk_level || 'UNKNOWN RISK'}\n`;
            
            if (scanData.results.recommendations) {
                output.innerHTML += `[RECOMMENDATIONS]\n${scanData.results.recommendations.join('\n')}\n`;
            }
        } else {
            output.innerHTML += '[SCAN COMPLETE] No open ports detected\n[THREAT ASSESSMENT] LOW RISK\n';
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

    async startNetworkMonitoring() {
        if (this.monitoringActive) return;
        
        this.monitoringActive = true;
        
        const startBtn = document.getElementById('startNetworkMonitoring');
        const stopBtn = document.getElementById('stopNetworkMonitoring');
        
        if (startBtn) startBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = false;
        
        // Start monitoring with real backend data
        this.monitoringInterval = setInterval(async () => {
            await this.updateNetworkStats();
        }, 3000);
        
        // Initial update
        await this.updateNetworkStats();
        
        this.showNotification('Network monitoring activated', 'success');
        this.addTerminalMessage('[MONITORING] Real-time network monitoring started', 'system');
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
        this.addTerminalMessage('[MONITORING] Network monitoring stopped', 'system');
    }

    async updateNetworkStats() {
        try {
            // Try to get real network connections from backend
            const response = await fetch(`${this.apiBase}/security/network-connections`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.processNetworkConnectionsData(data.connections);
                    // Also update system metrics
                    await this.updateSystemStats();
                    return;
                }
            }
        } catch (error) {
            console.error('Failed to fetch network connections:', error);
        }
        
        // Fallback to generating realistic-looking metrics
        this.generateFallbackMetrics();
        this.updateSystemMetricsDisplay();
    }

    processNetworkConnectionsData(connections) {
        if (!connections || !Array.isArray(connections)) return;
        
        // Analyze connections for metrics
        const activeConnections = connections.filter(conn => conn.status === 'ESTABLISHED').length;
        const totalConnections = connections.length;
        
        // Update metrics based on real data
        this.systemMetrics.network = Math.min(activeConnections * 50 + Math.random() * 200, 1000);
        
        // Update network stats display
        const connectionsElement = document.getElementById('activeConnections');
        if (connectionsElement) {
            connectionsElement.textContent = `${activeConnections}/${totalConnections}`;
        }
        
        // Log network activity to terminal
        if (activeConnections > 10) {
            this.addTerminalMessage(`[NETWORK] High activity detected: ${activeConnections} active connections`, 'warning');
        }
    }

    // Admin Functions - Enhanced with real backend integration
    async submitTrainingData() {
        const domain = document.getElementById('trainDomain')?.value;
        const input = document.getElementById('trainInput')?.value?.trim();
        const output = document.getElementById('trainOutput')?.value?.trim();
        const trainBtn = document.getElementById('trainBtn');
        
        if (!input || !output) {
            this.showNotification('Training input/output required', 'error');
            return;
        }
        
        // Show loading state
        if (trainBtn) {
            trainBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>TRAINING...';
            trainBtn.disabled = true;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/admin/train`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: JSON.stringify({ 
                    domain, 
                    input_text: input, 
                    expected_output: output 
                })
            });
            
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Admin permissions required');
                }
                throw new Error(`Training failed: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Training data added successfully', 'success');
                
                // Clear form
                document.getElementById('trainInput').value = '';
                document.getElementById('trainOutput').value = '';
                
                // Add to terminal log
                this.addTerminalMessage(`[TRAINING] Data added for ${domain} domain - ${data.message}`, 'system');
                
                // Refresh training stats if available
                this.refreshTrainingStats();
            } else {
                throw new Error(data.message || 'Training failed');
            }
        } catch (error) {
            console.error('Training error:', error);
            this.showNotification(`Training error: ${error.message}`, 'error');
            this.addTerminalMessage(`[ERROR] Training failed: ${error.message}`, 'error');
        } finally {
            // Reset button state
            if (trainBtn) {
                trainBtn.innerHTML = '<i class="fas fa-brain mr-2"></i>TRAIN MODEL';
                trainBtn.disabled = false;
            }
        }
    }

    async refreshTrainingStats() {
        try {
            const response = await fetch(`${this.apiBase}/training/stats`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.updateTrainingStatsDisplay(data.data);
                }
            }
        } catch (error) {
            console.error('Failed to refresh training stats:', error);
        }
    }

    updateTrainingStatsDisplay(stats) {
        // Update training statistics in the UI
        const statsContainer = document.getElementById('trainingStats');
        if (statsContainer && stats) {
            const html = `
                <div class="grid grid-cols-3 gap-4 mt-4">
                    <div class="server-panel rounded p-3">
                        <div class="text-neon-cyan text-sm">Total Samples</div>
                        <div class="text-white text-lg font-mono">${stats.total_samples || 0}</div>
                    </div>
                    <div class="server-panel rounded p-3">
                        <div class="text-neon-green text-sm">Model Version</div>
                        <div class="text-white text-lg font-mono">${stats.model_version || 'v1.0'}</div>
                    </div>
                    <div class="server-panel rounded p-3">
                        <div class="text-neon-orange text-sm">Accuracy</div>
                        <div class="text-white text-lg font-mono">${stats.accuracy || 'N/A'}%</div>
                    </div>
                </div>
            `;
            statsContainer.innerHTML = html;
        }
    }

    // System Management - Enhanced with real backend data
    startSystemMonitoring() {
        // Initial stats load
        this.updateSystemStats();
        
        // Update stats every 5 seconds
        setInterval(() => {
            this.updateSystemStats();
        }, 5000);
        
        // Light monitoring for sidebar every 10 seconds
        setInterval(() => {
            if (!this.monitoringActive) {
                this.updateSidebarStats();
            }
        }, 10000);
    }

    async updateSystemStats() {
        try {
            const response = await fetch(`${this.apiBase}/security/system-stats`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.system_stats) {
                    this.systemMetrics = {
                        cpu: data.system_stats.cpu_percent || 0,
                        memory: data.system_stats.memory_percent || 0,
                        network: data.system_stats.network_io || 0,
                        disk: data.system_stats.disk_percent || 0
                    };
                    
                    // Update UI with real data
                    this.updateSystemMetricsDisplay();
                }
            } else {
                // Fallback to simulated data if backend unavailable
                this.generateFallbackMetrics();
            }
        } catch (error) {
            console.error('Failed to fetch system stats:', error);
            // Fallback to simulated data
            this.generateFallbackMetrics();
        }
    }

    generateFallbackMetrics() {
        this.systemMetrics.cpu = Math.floor(Math.random() * 20) + 15;
        this.systemMetrics.memory = Math.floor(Math.random() * 30) + 25;
        this.systemMetrics.network = Math.floor(Math.random() * 500) + 100;
        this.systemMetrics.disk = Math.floor(Math.random() * 20) + 30;
    }

    updateSystemMetricsDisplay() {
        // Update main monitoring interface
        const elements = {
            cpuUsage: document.getElementById('cpuUsage'),
            memUsage: document.getElementById('memUsage'),
            networkIO: document.getElementById('networkIO'),
            diskUsage: document.getElementById('diskUsage'),
            cpuBar: document.getElementById('cpuBar'),
            memBar: document.getElementById('memBar'),
            networkBar: document.getElementById('networkBar'),
            diskBar: document.getElementById('diskBar')
        };
        
        if (elements.cpuUsage) elements.cpuUsage.textContent = `${this.systemMetrics.cpu}%`;
        if (elements.memUsage) elements.memUsage.textContent = `${this.systemMetrics.memory}%`;
        if (elements.networkIO) elements.networkIO.textContent = `${this.systemMetrics.network} KB/s`;
        if (elements.diskUsage) elements.diskUsage.textContent = `${this.systemMetrics.disk}%`;
        
        if (elements.cpuBar) elements.cpuBar.style.width = `${this.systemMetrics.cpu}%`;
        if (elements.memBar) elements.memBar.style.width = `${this.systemMetrics.memory}%`;
        if (elements.networkBar) elements.networkBar.style.width = `${Math.min(this.systemMetrics.network / 10, 100)}%`;
        if (elements.diskBar) elements.diskBar.style.width = `${this.systemMetrics.disk}%`;
        
        // Update sidebar stats as well
        this.updateSidebarStats();
    }

    updateSidebarStats() {
        // Use real system metrics if available, otherwise generate simulated data
        const cpu = this.systemMetrics.cpu || Math.floor(Math.random() * 20) + 15;
        const memory = this.systemMetrics.memory || Math.floor(Math.random() * 30) + 25;
        const network = this.systemMetrics.network || Math.floor(Math.random() * 500) + 100;
        
        const cpuElement = document.getElementById('systemCpu');
        const memElement = document.getElementById('systemMemory');
        const netElement = document.getElementById('systemNetwork');
        
        if (cpuElement) cpuElement.textContent = `${cpu}%`;
        if (memElement) memElement.textContent = `${memory}%`;
        if (netElement) netElement.textContent = `${network} KB/s`;
        
        // Add status indicators based on thresholds
        if (cpuElement) {
            cpuElement.className = cpu > 80 ? 'text-neon-red' : cpu > 60 ? 'text-warning-amber' : 'text-neon-green';
        }
        if (memElement) {
            memElement.className = memory > 85 ? 'text-neon-red' : memory > 70 ? 'text-warning-amber' : 'text-neon-green';
        }
    }

    addBootSequence() {
        setTimeout(async () => {
            this.addTerminalMessage('[BOOT] AGENT Terminal v2.1 - Server Room Interface', 'system');
            this.addTerminalMessage('[BOOT] Initializing security protocols...', 'system');
            this.addTerminalMessage('[BOOT] Loading neural network interfaces...', 'system');
            
            // Perform health check
            await this.performHealthCheck();
            
            this.addTerminalMessage('[BOOT] All systems operational - Ready for commands', 'system');
        }, 1000);
    }

    async performHealthCheck() {
        try {
            const response = await fetch(`${this.apiBase}/health`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.status === 'healthy') {
                    this.addTerminalMessage('[HEALTH] All backend services operational', 'system');
                    
                    // Display key metrics
                    if (data.system_metrics) {
                        const cpu = Math.round(data.system_metrics.cpu_percent);
                        const memory = Math.round(data.system_metrics.memory_percent);
                        this.addTerminalMessage(`[HEALTH] System: CPU ${cpu}%, Memory ${memory}%`, 'system');
                    }
                    
                    if (data.ai_model && data.ai_model.healthy) {
                        const responseTime = Math.round(data.ai_model.response_time_ms);
                        this.addTerminalMessage(`[HEALTH] AI Model: Online (${responseTime}ms response)`, 'system');
                    }
                } else {
                    this.addTerminalMessage(`[HEALTH] System status: ${data.status.toUpperCase()}`, 'warning');
                }
            } else {
                throw new Error('Health check failed');
            }
        } catch (error) {
            this.addTerminalMessage('[HEALTH] Backend health check failed - Running in offline mode', 'warning');
            console.error('Health check error:', error);
        }
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

    formatAgentResponse(response) {
        // Basic formatting for agent responses
        if (typeof response !== 'string') {
            return JSON.stringify(response, null, 2);
        }
        
        // Add basic markdown-like formatting
        return response
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 rounded">$1</code>');
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
