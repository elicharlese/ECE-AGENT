/**
 * AGENT Layout Manager
 * Handles dynamic layout switching and app integration
 */

class LayoutManager {
    constructor() {
        this.currentApp = 'chat';
        this.layouts = new Map();
        this.loadedLayouts = new Set();
        this.websocket = null;
        
        // Layout configurations
        this.layoutConfigs = {
            chat: {
                name: 'Chat',
                url: '/static/layouts/chat-layout.html',
                component: 'ChatLayout',
                websocket: '/ws/rooms',
                apis: ['/api/auth/login', '/api/rooms']
            },
            trading: {
                name: 'Trading',
                url: '/static/layouts/trading-layout.html', 
                component: 'TradingLayout',
                websocket: '/ws/trading',
                apis: ['/api/trading/status', '/api/trading/opportunities']
            },
            portfolio: {
                name: 'Portfolio',
                url: '/static/layouts/portfolio-layout.html',
                component: 'PortfolioLayout',
                websocket: '/ws/portfolio',
                apis: ['/api/portfolio/status', '/api/portfolio/positions']
            },
            analytics: {
                name: 'Analytics', 
                url: '/static/layouts/analytics-layout.html',
                component: 'AnalyticsLayout',
                websocket: '/ws/analytics',
                apis: ['/api/analytics/performance', '/api/analytics/reports']
            },
            training: {
                name: 'AI Training',
                url: '/static/layouts/training-layout.html',
                component: 'TrainingLayout', 
                websocket: '/ws/training',
                apis: ['/api/training/status', '/api/training/models']
            },
            settings: {
                name: 'Settings',
                url: '/static/layouts/settings-layout.html',
                component: 'SettingsLayout',
                websocket: null,
                apis: ['/api/settings', '/api/user/preferences']
            }
        };
    }
    
    async initialize() {
        console.log('🚀 Initializing AGENT Layout Manager');
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial layout (chat)
            await this.switchToApp('chat');
            
            // Initialize WebSocket connections
            this.initializeWebSocket();
            
            // Start health monitoring
            this.startHealthMonitoring();
            
            console.log('✅ Layout Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Layout Manager:', error);
        }
    }
    
    setupEventListeners() {
        // App selection listeners
        const appItems = document.querySelectorAll('.app-item');
        appItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const appName = e.currentTarget.dataset.app;
                if (appName) {
                    this.switchToApp(appName);
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchToApp('chat');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchToApp('trading');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchToApp('portfolio');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchToApp('analytics');
                        break;
                    case '5':
                        e.preventDefault();
                        this.switchToApp('training');
                        break;
                    case ',':
                        e.preventDefault();
                        this.switchToApp('settings');
                        break;
                }
            }
        });
    }
    
    async switchToApp(appName) {
        if (!this.layoutConfigs[appName]) {
            console.error(`Unknown app: ${appName}`);
            return;
        }
        
        console.log(`🔄 Switching to ${appName} app`);
        
        try {
            // Update UI state
            this.updateAppSelection(appName);
            this.updateStatusBar(appName);
            
            // Load layout if not already loaded
            if (!this.loadedLayouts.has(appName)) {
                await this.loadLayout(appName);
            }
            
            // Switch layout visibility
            this.showLayout(appName);
            
            // Update current app
            this.currentApp = appName;
            
            // Initialize app-specific functionality
            await this.initializeApp(appName);
            
            console.log(`✅ Successfully switched to ${appName}`);
            
        } catch (error) {
            console.error(`❌ Failed to switch to ${appName}:`, error);
            this.showError(`Failed to load ${appName} app`);
        }
    }
    
    async loadLayout(appName) {
        const config = this.layoutConfigs[appName];
        const layoutElement = document.getElementById(`${appName}Layout`);
        
        if (!layoutElement) {
            throw new Error(`Layout element not found for ${appName}`);
        }
        
        try {
            console.log(`📥 Loading ${appName} layout from ${config.url}`);
            
            // Fetch layout HTML
            const response = await fetch(config.url);
            if (!response.ok) {
                throw new Error(`Failed to fetch layout: ${response.status}`);
            }
            
            const layoutHTML = await response.text();
            
            // Update layout content
            layoutElement.innerHTML = layoutHTML;
            
            // Load layout-specific scripts and styles
            await this.loadLayoutAssets(appName);
            
            // Mark as loaded
            this.loadedLayouts.add(appName);
            
            console.log(`✅ ${appName} layout loaded successfully`);
            
        } catch (error) {
            console.error(`❌ Failed to load ${appName} layout:`, error);
            layoutElement.innerHTML = this.getErrorHTML(`Failed to load ${config.name} layout`);
        }
    }
    
    async loadLayoutAssets(appName) {
        const config = this.layoutConfigs[appName];
        
        // Load CSS if exists
        const cssPath = `/static/layouts/${appName}.css`;
        try {
            const cssResponse = await fetch(cssPath);
            if (cssResponse.ok) {
                const cssText = await cssResponse.text();
                const style = document.createElement('style');
                style.textContent = cssText;
                style.id = `${appName}-layout-styles`;
                document.head.appendChild(style);
            }
        } catch (error) {
            // CSS file might not exist, that's ok
        }
        
        // Load JavaScript if exists
        const jsPath = `/static/layouts/${appName}.js`;
        try {
            const jsResponse = await fetch(jsPath);
            if (jsResponse.ok) {
                const script = document.createElement('script');
                script.src = jsPath;
                script.id = `${appName}-layout-script`;
                document.head.appendChild(script);
            }
        } catch (error) {
            // JS file might not exist, that's ok
        }
    }
    
    showLayout(appName) {
        // Hide all layouts
        const allLayouts = document.querySelectorAll('.layout');
        allLayouts.forEach(layout => {
            layout.classList.remove('active');
        });
        
        // Show target layout
        const targetLayout = document.getElementById(`${appName}Layout`);
        if (targetLayout) {
            targetLayout.classList.add('active');
        }
    }
    
    updateAppSelection(appName) {
        // Update app selector
        const appItems = document.querySelectorAll('.app-item');
        appItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.app === appName) {
                item.classList.add('active');
            }
        });
    }
    
    updateStatusBar(appName) {
        const config = this.layoutConfigs[appName];
        const currentAppText = document.getElementById('currentAppText');
        if (currentAppText) {
            currentAppText.textContent = config.name;
        }
    }
    
    async initializeApp(appName) {
        const config = this.layoutConfigs[appName];
        
        // Initialize app-specific WebSocket if needed
        if (config.websocket && config.websocket !== this.currentWebSocket) {
            await this.switchWebSocket(config.websocket);
        }
        
        // Initialize app component if available
        if (window[config.component]) {
            try {
                const component = new window[config.component]();
                if (component.initialize) {
                    await component.initialize();
                }
                this.layouts.set(appName, component);
            } catch (error) {
                console.error(`Failed to initialize ${config.component}:`, error);
            }
        }
        
        // Trigger app-specific initialization event
        this.dispatchAppEvent('app:initialized', { appName, config });
    }
    
    initializeWebSocket() {
        // Start with chat WebSocket
        this.switchWebSocket('/ws/rooms');
    }
    
    async switchWebSocket(wsPath) {
        if (this.websocket) {
            this.websocket.close();
        }
        
        try {
            const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${wsPath}`;
            console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
            
            this.websocket = new WebSocket(wsUrl);
            this.currentWebSocket = wsPath;
            
            this.websocket.onopen = () => {
                console.log('✅ WebSocket connected');
                this.updateConnectionStatus(true);
            };
            
            this.websocket.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                this.updateConnectionStatus(false);
            };
            
            this.websocket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.updateConnectionStatus(false);
            };
            
            this.websocket.onmessage = (event) => {
                this.handleWebSocketMessage(event.data);
            };
            
        } catch (error) {
            console.error('❌ Failed to connect WebSocket:', error);
            this.updateConnectionStatus(false);
        }
    }
    
    handleWebSocketMessage(data) {
        try {
            const message = JSON.parse(data);
            
            // Dispatch to current app component
            const currentComponent = this.layouts.get(this.currentApp);
            if (currentComponent && currentComponent.handleWebSocketMessage) {
                currentComponent.handleWebSocketMessage(message);
            }
            
            // Dispatch global event
            this.dispatchAppEvent('websocket:message', { message, app: this.currentApp });
            
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    }
    
    updateConnectionStatus(connected) {
        const statusDot = document.getElementById('connectionStatus');
        const statusText = document.getElementById('connectionText');
        
        if (statusDot) {
            statusDot.className = `status-dot ${connected ? '' : 'error'}`;
        }
        
        if (statusText) {
            statusText.textContent = connected ? 'Connected' : 'Disconnected';
        }
    }
    
    startHealthMonitoring() {
        // Check health every 30 seconds
        setInterval(async () => {
            await this.performHealthCheck();
        }, 30000);
        
        // Initial health check
        this.performHealthCheck();
    }
    
    async performHealthCheck() {
        try {
            // Check API health
            const healthResponse = await fetch('/api/health');
            const isHealthy = healthResponse.ok;
            
            // Check MCP status
            const mcpResponse = await fetch('/api/training/status');
            const mcpData = mcpResponse.ok ? await mcpResponse.json() : null;
            
            // Update MCP status
            const mcpStatusText = document.getElementById('mcpStatusText');
            if (mcpStatusText) {
                const mcpStatus = mcpData?.training_active ? 'Training Active' : 'Disconnected';
                mcpStatusText.textContent = `MCP: ${mcpStatus}`;
            }
            
        } catch (error) {
            console.error('Health check failed:', error);
        }
    }
    
    dispatchAppEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
    
    showError(message) {
        // Show error notification
        console.error(message);
        
        // You could implement a toast notification system here
        // For now, just update the status
        const statusText = document.getElementById('connectionText');
        if (statusText) {
            statusText.textContent = 'Error';
            statusText.style.color = '#ef4444';
            
            setTimeout(() => {
                statusText.style.color = '';
            }, 5000);
        }
    }
    
    getErrorHTML(message) {
        return `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Error Loading Layout</h3>
                <p>${message}</p>
                <button onclick="location.reload()">Reload Page</button>
            </div>
        `;
    }
    
    // Public API methods
    getCurrentApp() {
        return this.currentApp;
    }
    
    getLayoutConfig(appName) {
        return this.layoutConfigs[appName];
    }
    
    isLayoutLoaded(appName) {
        return this.loadedLayouts.has(appName);
    }
    
    sendWebSocketMessage(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected');
        }
    }
}

// Global layout manager instance
window.LayoutManager = LayoutManager;
