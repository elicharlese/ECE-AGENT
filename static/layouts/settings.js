// Settings Layout JavaScript Controller
class SettingsController {
    constructor() {
        this.currentCategory = 'account';
        this.settings = {};
        this.pendingChanges = new Set();
        this.autoSave = false;
        
        this.init();
    }

    init() {
        console.log('Settings Controller initializing...');
        this.initEventListeners();
        this.loadSettings();
        this.updateSystemStatus();
        this.startRealTimeUpdates();
    }

    initEventListeners() {
        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.switchCategory(category);
            });
        });

        // Header actions
        document.getElementById('resetDefaultsBtn')?.addEventListener('click', () => {
            this.resetDefaults();
        });

        document.getElementById('exportConfigBtn')?.addEventListener('click', () => {
            this.exportConfiguration();
        });

        document.getElementById('saveAllBtn')?.addEventListener('click', () => {
            this.saveAllSettings();
        });

        // Account form
        this.initAccountListeners();
        
        // Preferences form
        this.initPreferencesListeners();
        
        // Notifications form
        this.initNotificationsListeners();
        
        // Security form
        this.initSecurityListeners();
        
        // Trading form
        this.initTradingListeners();
        
        // MCP form
        this.initMCPListeners();
        
        // Performance form
        this.initPerformanceListeners();
        
        // About form
        this.initAboutListeners();

        // Right panel actions
        this.initRightPanelListeners();

        // Auto-save on input changes
        this.initAutoSave();
    }

    initAccountListeners() {
        const inputs = ['username', 'displayName', 'email', 'timezone'];
        inputs.forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                this.handleSettingChange('account', id, e.target.value);
            });
        });

        document.getElementById('changeAvatarBtn')?.addEventListener('click', () => {
            this.changeAvatar();
        });
    }

    initPreferencesListeners() {
        // Theme selection
        document.getElementById('theme')?.addEventListener('change', (e) => {
            this.handleSettingChange('preferences', 'theme', e.target.value);
            this.applyTheme(e.target.value);
        });

        // Color picker
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
                e.target.classList.add('active');
                this.handleSettingChange('preferences', 'accentColor', e.target.dataset.color);
                this.applyAccentColor(e.target.dataset.color);
            });
        });

        // Font size
        document.getElementById('fontSize')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.querySelector('.range-value').textContent = `${value}px`;
            this.handleSettingChange('preferences', 'fontSize', value);
            this.applyFontSize(value);
        });

        // Compact mode
        document.getElementById('compactMode')?.addEventListener('change', (e) => {
            this.handleSettingChange('preferences', 'compactMode', e.target.checked);
            this.applyCompactMode(e.target.checked);
        });

        // Language and region
        ['language', 'currency', 'dateFormat', 'numberFormat'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                this.handleSettingChange('preferences', id, e.target.value);
            });
        });
    }

    initNotificationsListeners() {
        // Notification toggles
        const notifications = ['tradeExecutions', 'plAlerts', 'riskWarnings', 'strategyUpdates'];
        notifications.forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                this.handleSettingChange('notifications', id, e.target.checked);
            });
        });

        // Delivery methods
        const deliveryMethods = ['browserNotifications', 'soundAlerts', 'emailNotifications'];
        deliveryMethods.forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                this.handleSettingChange('notifications', id, e.target.checked);
            });
        });

        // Quiet hours
        ['quietStart', 'quietEnd'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                this.handleSettingChange('notifications', id, e.target.value);
            });
        });
    }

    initSecurityListeners() {
        // Password change
        document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
            this.changePassword();
        });

        // 2FA
        document.getElementById('enable2FABtn')?.addEventListener('click', () => {
            this.enable2FA();
        });

        // Security settings
        ['autoLogout', 'loginNotifications'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                this.handleSettingChange('security', id, value);
            });
        });
    }

    initTradingListeners() {
        // Trading parameters
        ['defaultPositionSize', 'maxPositionSize', 'stopLossPercentage', 'takeProfitPercentage'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                this.handleSettingChange('trading', id, parseFloat(e.target.value));
            });
        });

        // Trading mode
        document.querySelectorAll('input[name="tradingMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.handleSettingChange('trading', 'mode', e.target.value);
                }
            });
        });
    }

    initMCPListeners() {
        // Developer client actions
        document.getElementById('devTestBtn')?.addEventListener('click', () => {
            this.testMCPConnection('developer');
        });
        
        document.getElementById('devConfigBtn')?.addEventListener('click', () => {
            this.configureMCPClient('developer');
        });
        
        document.getElementById('devDisconnectBtn')?.addEventListener('click', () => {
            this.disconnectMCPClient('developer');
        });

        // Trading client actions
        document.getElementById('tradingTestBtn')?.addEventListener('click', () => {
            this.testMCPConnection('trading');
        });
        
        document.getElementById('tradingConfigBtn')?.addEventListener('click', () => {
            this.configureMCPClient('trading');
        });
        
        document.getElementById('tradingDisconnectBtn')?.addEventListener('click', () => {
            this.disconnectMCPClient('trading');
        });

        // Legal client actions
        document.getElementById('legalTestBtn')?.addEventListener('click', () => {
            this.testMCPConnection('legal');
        });
        
        document.getElementById('legalConfigBtn')?.addEventListener('click', () => {
            this.configureMCPClient('legal');
        });
        
        document.getElementById('legalDisconnectBtn')?.addEventListener('click', () => {
            this.disconnectMCPClient('legal');
        });

        // Server discovery and adding
        document.getElementById('scanServersBtn')?.addEventListener('click', () => {
            this.scanForMCPServers();
        });

        document.getElementById('browseRegistryBtn')?.addEventListener('click', () => {
            this.browseServerRegistry();
        });

        document.getElementById('popularServersBtn')?.addEventListener('click', () => {
            this.loadPopularServers();
        });

        document.getElementById('searchServersBtn')?.addEventListener('click', () => {
            this.searchServers();
        });

        document.getElementById('loadMoreServers')?.addEventListener('click', () => {
            this.loadMoreServers();
        });

        // Server action handlers
        document.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'details') {
                this.showServerDetails(e.target.dataset.server);
            } else if (e.target.dataset.action === 'install') {
                this.installServer(e.target.dataset.server);
            }
        });

        ['addFinanceBtn', 'addHealthcareBtn', 'addResearchBtn', 'addMarketingBtn'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', (e) => {
                const serverType = id.replace('add', '').replace('Btn', '').toLowerCase();
                this.addMCPServer(serverType);
            });
        });

        // Custom server
        document.getElementById('testCustomServerBtn')?.addEventListener('click', () => {
            this.testCustomServer();
        });

        document.getElementById('addCustomServerBtn')?.addEventListener('click', () => {
            this.addCustomServer();
        });

        // Global MCP settings
        document.getElementById('mcpAutoReconnect')?.addEventListener('change', (e) => {
            this.handleSettingChange('mcp', 'autoReconnect', e.target.checked);
        });

        ['mcpHealthInterval', 'mcpTimeout', 'mcpMaxRequests'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                const setting = id.replace('mcp', '').replace(/([A-Z])/g, '_$1').toLowerCase().substring(1);
                this.handleSettingChange('mcp', setting, parseInt(e.target.value));
            });
        });

        // Initialize MCP status monitoring
        this.startMCPStatusMonitoring();
    }

    initPerformanceListeners() {
        // Performance settings
        ['chartUpdateFreq', 'marketDataRefresh'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                this.handleSettingChange('performance', id, parseInt(e.target.value));
            });
        });

        ['enableAnimations', 'hardwareAcceleration'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                this.handleSettingChange('performance', id, e.target.checked);
            });
        });
    }

    initAboutListeners() {
        // Support buttons
        document.querySelectorAll('.support-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.textContent.trim();
                this.handleSupportAction(action);
            });
        });

        // Legal buttons
        document.querySelectorAll('.legal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.textContent.trim();
                this.handleLegalAction(action);
            });
        });
    }

    initRightPanelListeners() {
        // Quick actions
        document.getElementById('restartSystemBtn')?.addEventListener('click', () => {
            this.restartSystem();
        });

        document.getElementById('clearCacheBtn')?.addEventListener('click', () => {
            this.clearCache();
        });

        document.getElementById('backupNowBtn')?.addEventListener('click', () => {
            this.backupNow();
        });

        document.getElementById('testConnectionBtn')?.addEventListener('click', () => {
            this.testConnections();
        });

        document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
            this.clearChangeHistory();
        });
    }

    initAutoSave() {
        // Monitor all form inputs for changes
        document.querySelectorAll('.form-input, .form-select, input[type="checkbox"], input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => {
                this.markFormDirty();
            });
        });
    }

    switchCategory(category) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.category === category) {
                item.classList.add('active');
            }
        });

        // Update form visibility
        document.querySelectorAll('.settings-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(category + 'Form')?.classList.add('active');

        this.currentCategory = category;
        console.log(`Switched to category: ${category}`);
    }

    handleSettingChange(category, key, value) {
        if (!this.settings[category]) {
            this.settings[category] = {};
        }
        
        this.settings[category][key] = value;
        this.pendingChanges.add(`${category}.${key}`);
        
        console.log(`Setting changed: ${category}.${key} = ${value}`);
        this.markFormDirty();
        this.addChangeToHistory(`Changed ${key} in ${category}`);

        // Auto-save for non-critical settings
        if (this.autoSave && category !== 'security') {
            this.saveSettings(category);
        }
    }

    loadSettings() {
        console.log('Loading settings...');
        
        // Load from localStorage or use defaults
        const saved = localStorage.getItem('agentSettings');
        if (saved) {
            try {
                this.settings = JSON.parse(saved);
                this.applyLoadedSettings();
            } catch (error) {
                console.error('Error loading settings:', error);
                this.loadDefaultSettings();
            }
        } else {
            this.loadDefaultSettings();
        }
    }

    loadDefaultSettings() {
        this.settings = {
            account: {
                username: 'admin',
                displayName: 'AGENT Admin',
                email: 'admin@agent.local',
                timezone: 'EST'
            },
            preferences: {
                theme: 'dark',
                accentColor: 'purple',
                fontSize: '14',
                compactMode: false,
                language: 'en',
                currency: 'USD',
                dateFormat: 'MM/DD/YYYY',
                numberFormat: '1,234.56'
            },
            notifications: {
                tradeExecutions: true,
                plAlerts: true,
                riskWarnings: true,
                strategyUpdates: false,
                browserNotifications: true,
                soundAlerts: true,
                emailNotifications: false,
                quietStart: '22:00',
                quietEnd: '07:00'
            },
            security: {
                autoLogout: '60',
                loginNotifications: true,
                twoFactorEnabled: false
            },
            trading: {
                defaultPositionSize: 1000,
                maxPositionSize: 10000,
                stopLossPercentage: 2,
                takeProfitPercentage: 5,
                mode: 'auto'
            },
            performance: {
                chartUpdateFreq: 5000,
                marketDataRefresh: 3000,
                enableAnimations: true,
                hardwareAcceleration: true
            }
        };
    }

    applyLoadedSettings() {
        // Apply account settings
        if (this.settings.account) {
            Object.entries(this.settings.account).forEach(([key, value]) => {
                const input = document.getElementById(key);
                if (input) input.value = value;
            });
        }

        // Apply preferences
        if (this.settings.preferences) {
            this.applyTheme(this.settings.preferences.theme);
            this.applyAccentColor(this.settings.preferences.accentColor);
            this.applyFontSize(this.settings.preferences.fontSize);
            this.applyCompactMode(this.settings.preferences.compactMode);
        }

        // Apply other settings...
        console.log('Settings applied successfully');
    }

    applyTheme(theme) {
        document.body.className = theme === 'light' ? 'light-theme' : 'dark-theme';
        console.log(`Applied theme: ${theme}`);
    }

    applyAccentColor(color) {
        const colorMap = {
            purple: '#8b5cf6',
            blue: '#06b6d4',
            green: '#00ff88',
            orange: '#fbbf24'
        };
        
        document.documentElement.style.setProperty('--accent-color', colorMap[color] || colorMap.purple);
        console.log(`Applied accent color: ${color}`);
    }

    applyFontSize(size) {
        document.documentElement.style.setProperty('--base-font-size', `${size}px`);
        console.log(`Applied font size: ${size}px`);
    }

    applyCompactMode(enabled) {
        document.body.classList.toggle('compact-mode', enabled);
        console.log(`Compact mode: ${enabled ? 'enabled' : 'disabled'}`);
    }

    saveSettings(category = null) {
        try {
            localStorage.setItem('agentSettings', JSON.stringify(this.settings));
            
            if (category) {
                console.log(`Saved ${category} settings`);
                this.showNotification(`${category} settings saved`, 'success');
            } else {
                console.log('All settings saved');
                this.showNotification('All settings saved successfully', 'success');
            }
            
            this.pendingChanges.clear();
            this.markFormClean();
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Error saving settings', 'error');
        }
    }

    saveAllSettings() {
        this.saveSettings();
    }

    resetDefaults() {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            console.log('Resetting to default settings...');
            this.loadDefaultSettings();
            this.applyLoadedSettings();
            this.saveSettings();
            this.showNotification('Settings reset to defaults', 'warning');
            this.addChangeToHistory('Reset all settings to defaults');
        }
    }

    exportConfiguration() {
        console.log('Exporting configuration...');
        
        const config = {
            version: '3.2.1',
            exported: new Date().toISOString(),
            settings: this.settings
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `agent-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Configuration exported', 'success');
        this.addChangeToHistory('Exported configuration');
    }

    changeAvatar() {
        console.log('Opening avatar selection...');
        this.showNotification('Avatar selection opened', 'info');
    }

    changePassword() {
        const current = document.getElementById('currentPassword')?.value;
        const newPassword = document.getElementById('newPassword')?.value;
        const confirm = document.getElementById('confirmPassword')?.value;
        
        if (!current || !newPassword || !confirm) {
            this.showNotification('Please fill all password fields', 'warning');
            return;
        }
        
        if (newPassword !== confirm) {
            this.showNotification('New passwords do not match', 'error');
            return;
        }
        
        if (newPassword.length < 8) {
            this.showNotification('Password must be at least 8 characters', 'warning');
            return;
        }
        
        console.log('Changing password...');
        // Simulate password change
        setTimeout(() => {
            this.showNotification('Password changed successfully', 'success');
            this.addChangeToHistory('Changed password');
            // Clear password fields
            ['currentPassword', 'newPassword', 'confirmPassword'].forEach(id => {
                const input = document.getElementById(id);
                if (input) input.value = '';
            });
        }, 1000);
    }

    enable2FA() {
        console.log('Enabling 2FA...');
        this.showNotification('2FA setup initiated', 'info');
        this.addChangeToHistory('Enabled two-factor authentication');
    }

    handleSupportAction(action) {
        console.log(`Support action: ${action}`);
        
        switch (action) {
            case '📚 Documentation':
                this.showNotification('Opening documentation...', 'info');
                break;
            case '🐛 Report Bug':
                this.showNotification('Opening bug report form...', 'info');
                break;
            case '💬 Contact Support':
                this.showNotification('Opening support chat...', 'info');
                break;
            case '🔄 Check Updates':
                this.checkForUpdates();
                break;
        }
    }

    handleLegalAction(action) {
        console.log(`Legal action: ${action}`);
        this.showNotification(`Opening ${action.replace(/[📜🔒⚠️©]/g, '').trim()}...`, 'info');
    }

    checkForUpdates() {
        console.log('Checking for updates...');
        this.showNotification('Checking for updates...', 'info');
        
        setTimeout(() => {
            this.showNotification('You are running the latest version', 'success');
        }, 2000);
    }

    restartSystem() {
        if (confirm('Are you sure you want to restart the system? This will temporarily interrupt trading.')) {
            console.log('Restarting system...');
            this.showNotification('System restart initiated...', 'warning');
            this.addChangeToHistory('Initiated system restart');
        }
    }

    clearCache() {
        console.log('Clearing cache...');
        this.showNotification('Cache cleared successfully', 'success');
        this.addChangeToHistory('Cleared system cache');
    }

    backupNow() {
        console.log('Starting backup...');
        this.showNotification('Backup started...', 'info');
        
        setTimeout(() => {
            this.showNotification('Backup completed successfully', 'success');
            this.addChangeToHistory('Created system backup');
        }, 3000);
    }

    testConnections() {
        console.log('Testing connections...');
        this.showNotification('Testing all connections...', 'info');
        
        setTimeout(() => {
            this.showNotification('All connections tested successfully', 'success');
        }, 2000);
    }

    clearChangeHistory() {
        const changesList = document.querySelector('.changes-list');
        if (changesList) {
            changesList.innerHTML = '<div class="change-item"><div class="change-time">Now</div><div class="change-text">Change history cleared</div></div>';
        }
        this.showNotification('Change history cleared', 'info');
    }

    updateSystemStatus() {
        // Simulate system status updates
        const statusItems = document.querySelectorAll('.status-item');
        statusItems.forEach(item => {
            const indicator = item.querySelector('.status-indicator');
            if (indicator && Math.random() > 0.1) { // 90% chance to be online
                indicator.className = 'status-indicator online';
            } else {
                indicator.className = 'status-indicator offline';
            }
        });

        // Update resource usage
        this.updateResourceUsage();
    }

    updateResourceUsage() {
        const resources = document.querySelectorAll('.resource-item');
        resources.forEach(resource => {
            const fill = resource.querySelector('.resource-fill');
            const value = resource.querySelector('.resource-value');
            
            if (fill && value) {
                const usage = Math.random() * 80 + 10; // 10-90%
                fill.style.width = `${usage}%`;
                value.textContent = `${Math.round(usage)}%`;
            }
        });
    }

    startRealTimeUpdates() {
        // Update system status every 30 seconds
        setInterval(() => {
            this.updateSystemStatus();
        }, 30000);

        // Update resource usage every 5 seconds
        setInterval(() => {
            this.updateResourceUsage();
        }, 5000);
    }

    markFormDirty() {
        const saveBtn = document.getElementById('saveAllBtn');
        if (saveBtn && this.pendingChanges.size > 0) {
            saveBtn.textContent = '💾 Save All *';
            saveBtn.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
        }
    }

    markFormClean() {
        const saveBtn = document.getElementById('saveAllBtn');
        if (saveBtn) {
            saveBtn.textContent = '💾 Save All';
            saveBtn.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
        }
    }

    addChangeToHistory(changeText) {
        const changesList = document.querySelector('.changes-list');
        if (!changesList) return;

        const changeItem = document.createElement('div');
        changeItem.className = 'change-item';
        changeItem.innerHTML = `
            <div class="change-time">Just now</div>
            <div class="change-text">${changeText}</div>
        `;

        changesList.insertBefore(changeItem, changesList.firstChild);

        // Keep only last 10 changes
        const items = changesList.querySelectorAll('.change-item');
        if (items.length > 10) {
            items[items.length - 1].remove();
        }

        // Update timestamps
        setTimeout(() => {
            this.updateChangeTimestamps();
        }, 1000);
    }

    updateChangeTimestamps() {
        const changeItems = document.querySelectorAll('.change-item');
        changeItems.forEach((item, index) => {
            const timeEl = item.querySelector('.change-time');
            if (timeEl && index > 0) {
                const minutes = index * 2 + Math.floor(Math.random() * 10);
                if (minutes < 60) {
                    timeEl.textContent = `${minutes} minutes ago`;
                } else {
                    const hours = Math.floor(minutes / 60);
                    timeEl.textContent = `${hours} hour${hours > 1 ? 's' : ''} ago`;
                }
            }
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #00ff88, #00d4ff)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #ff4444, #dc2626)';
                break;
            default:
                notification.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // MCP Connection Management Methods
    async testMCPConnection(clientType) {
        this.showNotification(`Testing ${clientType} MCP connection...`, 'info');
        
        try {
            const response = await fetch(`/api/mcp/test/${clientType}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`${clientType} MCP connection test successful`, 'success');
                this.updateMCPStatus(clientType, 'connected');
            } else {
                this.showNotification(`${clientType} MCP connection test failed: ${result.error}`, 'error');
                this.updateMCPStatus(clientType, 'disconnected');
            }
        } catch (error) {
            this.showNotification(`${clientType} MCP connection test error: ${error.message}`, 'error');
            this.updateMCPStatus(clientType, 'disconnected');
        }
    }

    async disconnectMCPClient(clientType) {
        this.showNotification(`Disconnecting ${clientType} MCP client...`, 'info');
        
        try {
            const response = await fetch(`/api/mcp/disconnect/${clientType}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`${clientType} MCP client disconnected`, 'success');
                this.updateMCPStatus(clientType, 'disconnected');
            } else {
                this.showNotification(`Failed to disconnect ${clientType}: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Disconnect error: ${error.message}`, 'error');
        }
    }

    configureMCPClient(clientType) {
        // Open configuration modal
        this.showConfigurationModal(clientType);
    }

    showConfigurationModal(clientType) {
        const modal = document.createElement('div');
        modal.className = 'mcp-config-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div class="modal-content" style="background: #1e293b; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; border: 1px solid rgba(255,255,255,0.1);">
                    <h3 style="color: #e4e4e7; margin: 0 0 20px 0;">Configure ${clientType.charAt(0).toUpperCase() + clientType.slice(1)} MCP Client</h3>
                    
                    <div class="config-form">
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="color: #9ca3af; font-size: 12px; display: block; margin-bottom: 5px;">Server URL</label>
                            <input type="text" id="configServerUrl" value="ws://localhost:808${clientType === 'developer' ? '1' : clientType === 'trading' ? '2' : '3'}" style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #e4e4e7;">
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="color: #9ca3af; font-size: 12px; display: block; margin-bottom: 5px;">Connection Timeout (seconds)</label>
                            <input type="number" id="configTimeout" value="30" min="5" max="120" style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #e4e4e7;">
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="color: #9ca3af; font-size: 12px; display: block; margin-bottom: 5px;">
                                <input type="checkbox" id="configEnabled" checked style="margin-right: 8px;"> Enabled
                            </label>
                        </div>
                    </div>
                    
                    <div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button id="cancelConfig" style="padding: 8px 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #e4e4e7; cursor: pointer;">Cancel</button>
                        <button id="saveConfig" style="padding: 8px 16px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border: none; border-radius: 6px; color: white; cursor: pointer;">Save</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Modal event listeners
        document.getElementById('cancelConfig').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('saveConfig').addEventListener('click', async () => {
            await this.saveMCPConfig(clientType, {
                serverUrl: document.getElementById('configServerUrl').value,
                timeout: parseInt(document.getElementById('configTimeout').value),
                enabled: document.getElementById('configEnabled').checked
            });
            document.body.removeChild(modal);
        });
        
        // Close on backdrop click
        modal.querySelector('.modal-backdrop').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-backdrop')) {
                document.body.removeChild(modal);
            }
        });
    }

    async saveMCPConfig(clientType, config) {
        try {
            const response = await fetch(`/api/mcp/config/${clientType}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`${clientType} configuration saved`, 'success');
                this.loadMCPStatus(); // Refresh status
            } else {
                this.showNotification(`Failed to save configuration: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Configuration save error: ${error.message}`, 'error');
        }
    }

    async scanForMCPServers() {
        document.getElementById('scanServersBtn').textContent = '🔄 Scanning...';
        document.getElementById('scanStatus').textContent = 'Scanning for servers...';
        
        try {
            const response = await fetch('/api/mcp/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`Found ${result.servers.length} available servers`, 'success');
                this.updateAvailableServers(result.servers);
            } else {
                this.showNotification(`Server scan failed: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Scan error: ${error.message}`, 'error');
        } finally {
            document.getElementById('scanServersBtn').textContent = '🔍 Scan for Servers';
            document.getElementById('scanStatus').textContent = `Last scan: ${new Date().toLocaleTimeString()}`;
        }
    }

    async addMCPServer(serverType) {
        this.showNotification(`Adding ${serverType} MCP server...`, 'info');
        
        try {
            const response = await fetch('/api/mcp/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serverType })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`${serverType} server added successfully`, 'success');
                this.loadMCPStatus(); // Refresh status
            } else {
                this.showNotification(`Failed to add server: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Add server error: ${error.message}`, 'error');
        }
    }

    async testCustomServer() {
        const name = document.getElementById('customServerName').value;
        const url = document.getElementById('customServerUrl').value;
        
        if (!name || !url) {
            this.showNotification('Please provide server name and URL', 'warning');
            return;
        }
        
        this.showNotification('Testing custom server connection...', 'info');
        
        try {
            const response = await fetch('/api/mcp/test-custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, url })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Custom server connection successful', 'success');
            } else {
                this.showNotification(`Connection failed: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Test error: ${error.message}`, 'error');
        }
    }

    async addCustomServer() {
        const name = document.getElementById('customServerName').value;
        const url = document.getElementById('customServerUrl').value;
        const description = document.getElementById('customServerDesc').value;
        const auth = document.getElementById('customServerAuth').value;
        
        if (!name || !url) {
            this.showNotification('Please provide server name and URL', 'warning');
            return;
        }
        
        try {
            const response = await fetch('/api/mcp/add-custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, url, description, auth })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Custom server added successfully', 'success');
                
                // Clear form
                ['customServerName', 'customServerUrl', 'customServerDesc', 'customServerAuth'].forEach(id => {
                    document.getElementById(id).value = '';
                });
                
                this.loadMCPStatus(); // Refresh status
            } else {
                this.showNotification(`Failed to add server: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Add server error: ${error.message}`, 'error');
        }
    }

    updateMCPStatus(clientType, status) {
        const statusEl = document.getElementById(`${clientType}Status`);
        if (statusEl) {
            statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            statusEl.className = `status-badge ${status}`;
        }
    }

    async loadMCPStatus() {
        try {
            const response = await fetch('/api/mcp/status');
            const status = await response.json();
            
            if (status.success) {
                Object.entries(status.clients).forEach(([clientType, clientStatus]) => {
                    this.updateMCPStatus(clientType, clientStatus.connected ? 'connected' : 'disconnected');
                });
            }
        } catch (error) {
            console.error('Failed to load MCP status:', error);
        }
    }

    startMCPStatusMonitoring() {
        // Load initial status
        this.loadMCPStatus();
        
        // Set up periodic status updates
        setInterval(() => {
            this.loadMCPStatus();
        }, 30000); // Update every 30 seconds
    }

    updateAvailableServers(servers) {
        const container = document.getElementById('availableServers');
        if (!container) return;
        
        container.innerHTML = servers.map(server => `
            <div class="server-item">
                <div class="server-info">
                    <h6>${server.icon} ${server.name}</h6>
                    <p>${server.description}</p>
                    <span class="server-url">${server.url}</span>
                </div>
                <button class="btn-small btn-primary" onclick="settingsController.addMCPServer('${server.type}')">Add</button>
            </div>
        `).join('');
    }

    // MCP Connection Management Methods
    async testMCPConnection(clientType) {
        this.showNotification(`Testing ${clientType} MCP connection...`, 'info');
        
        try {
            const response = await fetch(`/api/mcp/test/${clientType}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`${clientType} MCP connection test successful`, 'success');
                this.updateMCPStatus(clientType, 'connected');
            } else {
                this.showNotification(`${clientType} MCP connection test failed: ${result.error}`, 'error');
                this.updateMCPStatus(clientType, 'disconnected');
            }
        } catch (error) {
            this.showNotification(`${clientType} MCP connection test error: ${error.message}`, 'error');
            this.updateMCPStatus(clientType, 'disconnected');
        }
    }

    async disconnectMCPClient(clientType) {
        this.showNotification(`Disconnecting ${clientType} MCP client...`, 'info');
        
        try {
            const response = await fetch(`/api/mcp/disconnect/${clientType}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`${clientType} MCP client disconnected`, 'success');
                this.updateMCPStatus(clientType, 'disconnected');
            } else {
                this.showNotification(`Failed to disconnect ${clientType}: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Disconnect error: ${error.message}`, 'error');
        }
    }

    configureMCPClient(clientType) {
        // Open configuration modal
        this.showConfigurationModal(clientType);
    }

    showConfigurationModal(clientType) {
        const modal = document.createElement('div');
        modal.className = 'mcp-config-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div class="modal-content" style="background: #1e293b; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; border: 1px solid rgba(255,255,255,0.1);">
                    <h3 style="color: #e4e4e7; margin: 0 0 20px 0;">Configure ${clientType.charAt(0).toUpperCase() + clientType.slice(1)} MCP Client</h3>
                    
                    <div class="config-form">
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="color: #9ca3af; font-size: 12px; display: block; margin-bottom: 5px;">Server URL</label>
                            <input type="text" id="configServerUrl" value="ws://localhost:808${clientType === 'developer' ? '1' : clientType === 'trading' ? '2' : '3'}" style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #e4e4e7;">
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="color: #9ca3af; font-size: 12px; display: block; margin-bottom: 5px;">Connection Timeout (seconds)</label>
                            <input type="number" id="configTimeout" value="30" min="5" max="120" style="width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #e4e4e7;">
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="color: #9ca3af; font-size: 12px; display: block; margin-bottom: 5px;">
                                <input type="checkbox" id="configEnabled" checked style="margin-right: 8px;"> Enabled
                            </label>
                        </div>
                    </div>
                    
                    <div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button id="cancelConfig" style="padding: 8px 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #e4e4e7; cursor: pointer;">Cancel</button>
                        <button id="saveConfig" style="padding: 8px 16px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border: none; border-radius: 6px; color: white; cursor: pointer;">Save</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Modal event listeners
        document.getElementById('cancelConfig').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('saveConfig').addEventListener('click', async () => {
            await this.saveMCPConfig(clientType, {
                serverUrl: document.getElementById('configServerUrl').value,
                timeout: parseInt(document.getElementById('configTimeout').value),
                enabled: document.getElementById('configEnabled').checked
            });
            document.body.removeChild(modal);
        });
        
        // Close on backdrop click
        modal.querySelector('.modal-backdrop').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-backdrop')) {
                document.body.removeChild(modal);
            }
        });
    }

    async saveMCPConfig(clientType, config) {
        try {
            const response = await fetch(`/api/mcp/config/${clientType}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`${clientType} configuration saved`, 'success');
                this.loadMCPStatus(); // Refresh status
            } else {
                this.showNotification(`Failed to save configuration: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Configuration save error: ${error.message}`, 'error');
        }
    }

    async scanForMCPServers() {
        document.getElementById('scanServersBtn').textContent = '🔄 Scanning...';
        document.getElementById('scanStatus').textContent = 'Scanning for servers...';
        
        try {
            const response = await fetch('/api/mcp/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`Found ${result.servers.length} available servers`, 'success');
                this.updateAvailableServers(result.servers);
            } else {
                this.showNotification(`Server scan failed: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Scan error: ${error.message}`, 'error');
        } finally {
            document.getElementById('scanServersBtn').textContent = '🔍 Scan for Servers';
            document.getElementById('scanStatus').textContent = `Last scan: ${new Date().toLocaleTimeString()}`;
        }
    }

    async addMCPServer(serverType) {
        this.showNotification(`Adding ${serverType} MCP server...`, 'info');
        
        try {
            const response = await fetch('/api/mcp/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serverType })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`${serverType} server added successfully`, 'success');
                this.loadMCPStatus(); // Refresh status
            } else {
                this.showNotification(`Failed to add server: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Add server error: ${error.message}`, 'error');
        }
    }

    async testCustomServer() {
        const name = document.getElementById('customServerName').value;
        const url = document.getElementById('customServerUrl').value;
        
        if (!name || !url) {
            this.showNotification('Please provide server name and URL', 'warning');
            return;
        }
        
        this.showNotification('Testing custom server connection...', 'info');
        
        try {
            const response = await fetch('/api/mcp/test-custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, url })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Custom server connection successful', 'success');
            } else {
                this.showNotification(`Connection failed: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Test error: ${error.message}`, 'error');
        }
    }

    async addCustomServer() {
        const name = document.getElementById('customServerName').value;
        const url = document.getElementById('customServerUrl').value;
        const description = document.getElementById('customServerDesc').value;
        const auth = document.getElementById('customServerAuth').value;
        
        if (!name || !url) {
            this.showNotification('Please provide server name and URL', 'warning');
            return;
        }
        
        try {
            const response = await fetch('/api/mcp/add-custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, url, description, auth })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Custom server added successfully', 'success');
                
                // Clear form
                ['customServerName', 'customServerUrl', 'customServerDesc', 'customServerAuth'].forEach(id => {
                    document.getElementById(id).value = '';
                });
                
                this.loadMCPStatus(); // Refresh status
            } else {
                this.showNotification(`Failed to add server: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Add server error: ${error.message}`, 'error');
        }
    }

    updateMCPStatus(clientType, status) {
        const statusEl = document.getElementById(`${clientType}Status`);
        if (statusEl) {
            statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            statusEl.className = `status-badge ${status}`;
        }
    }

    async loadMCPStatus() {
        try {
            const response = await fetch('/api/mcp/status');
            const status = await response.json();
            
            if (status.success) {
                Object.entries(status.clients).forEach(([clientType, clientStatus]) => {
                    this.updateMCPStatus(clientType, clientStatus.connected ? 'connected' : 'disconnected');
                });
            }
        } catch (error) {
            console.error('Failed to load MCP status:', error);
        }
    }

    startMCPStatusMonitoring() {
        // Load initial status
        this.loadMCPStatus();
        
        // Set up periodic status updates
        setInterval(() => {
            this.loadMCPStatus();
        }, 30000); // Update every 30 seconds
    }

    updateAvailableServers(servers) {
        const container = document.getElementById('availableServers');
        if (!container) return;
        
        container.innerHTML = servers.map(server => `
            <div class="server-item">
                <div class="server-info">
                    <h6>${server.icon} ${server.name}</h6>
                    <p>${server.description}</p>
                    <span class="server-url">${server.url}</span>
                </div>
                <button class="btn-small btn-primary" onclick="settingsController.addMCPServer('${server.type}')">Add</button>
            </div>
        `).join('');
    }

    async browseServerRegistry() {
        this.showNotification('Loading server registry...', 'info');
        
        try {
            const response = await fetch('/api/mcp/registry/search');
            const result = await response.json();
            
            if (result.success) {
                this.updateAvailableServers(result.data.servers);
                this.showNotification(`Loaded ${result.data.servers.length} servers from registry`, 'success');
            } else {
                this.showNotification('Failed to load server registry', 'error');
            }
        } catch (error) {
            this.showNotification(`Registry error: ${error.message}`, 'error');
        }
    }

    async loadPopularServers() {
        this.showNotification('Loading popular servers...', 'info');
        
        try {
            const response = await fetch('/api/mcp/registry/popular?limit=10');
            const result = await response.json();
            
            if (result.success) {
                this.updateAvailableServers(result.data.servers);
                this.showNotification(`Loaded ${result.data.servers.length} popular servers`, 'success');
            } else {
                this.showNotification('Failed to load popular servers', 'error');
            }
        } catch (error) {
            this.showNotification(`Popular servers error: ${error.message}`, 'error');
        }
    }

    async searchServers() {
        const category = document.getElementById('categoryFilter').value;
        const query = document.getElementById('searchQuery').value;
        
        if (!category && !query) {
            this.showNotification('Please select a category or enter a search query', 'warning');
            return;
        }
        
        this.showNotification('Searching servers...', 'info');
        
        try {
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (query) params.append('query', query);
            
            const response = await fetch(`/api/mcp/registry/search?${params}`);
            const result = await response.json();
            
            if (result.success) {
                this.updateAvailableServers(result.data.servers);
                this.showNotification(`Found ${result.data.servers.length} servers`, 'success');
            } else {
                this.showNotification('Search failed', 'error');
            }
        } catch (error) {
            this.showNotification(`Search error: ${error.message}`, 'error');
        }
    }

    async loadMoreServers() {
        this.showNotification('Loading more servers...', 'info');
        
        try {
            const response = await fetch('/api/mcp/registry/discover');
            const result = await response.json();
            
            if (result.success) {
                const currentServers = this.getCurrentServers();
                const newServers = result.data.servers.filter(
                    newServer => !currentServers.some(existing => existing.name === newServer.name)
                );
                
                this.appendServers(newServers);
                this.showNotification(`Loaded ${newServers.length} additional servers`, 'success');
            } else {
                this.showNotification('Failed to load more servers', 'error');
            }
        } catch (error) {
            this.showNotification(`Load more error: ${error.message}`, 'error');
        }
    }

    getCurrentServers() {
        const serverElements = document.querySelectorAll('.server-item');
        return Array.from(serverElements).map(el => ({
            name: el.querySelector('h6').textContent.trim()
        }));
    }

    appendServers(servers) {
        const container = document.getElementById('availableServers');
        if (!container) return;
        
        const newServersHTML = servers.map(server => `
            <div class="server-item">
                <div class="server-info">
                    <div class="server-header">
                        <h6>${server.icon || '🔧'} ${server.name}</h6>
                        <div class="server-badges">
                            ${server.rating ? `<span class="badge rating">⭐ ${server.rating}</span>` : ''}
                        </div>
                    </div>
                    <p>${server.description}</p>
                    <div class="server-meta">
                        <span class="server-url">${server.url}</span>
                        ${server.downloads ? `<span class="downloads">📦 ${server.downloads} downloads</span>` : ''}
                    </div>
                </div>
                <div class="server-actions">
                    <button class="btn-small btn-secondary" data-action="details" data-server="${server.name.toLowerCase().replace(/\s+/g, '-')}">Details</button>
                    <button class="btn-small btn-primary" data-action="install" data-server="${server.name.toLowerCase().replace(/\s+/g, '-')}">Install</button>
                </div>
            </div>
        `).join('');
        
        // Insert before the load more section
        const loadMoreSection = container.querySelector('.load-more-section');
        if (loadMoreSection) {
            loadMoreSection.insertAdjacentHTML('beforebegin', newServersHTML);
        } else {
            container.insertAdjacentHTML('beforeend', newServersHTML);
        }
    }

    async showServerDetails(serverName) {
        this.showNotification('Loading server details...', 'info');
        
        try {
            const response = await fetch(`/api/mcp/registry/server/${serverName}`);
            const result = await response.json();
            
            if (result.success) {
                this.showServerDetailsModal(result.data.server);
            } else {
                this.showNotification('Failed to load server details', 'error');
            }
        } catch (error) {
            this.showNotification(`Details error: ${error.message}`, 'error');
        }
    }

    showServerDetailsModal(server) {
        const modal = document.createElement('div');
        modal.className = 'server-details-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div class="modal-content" style="background: #1e293b; border-radius: 12px; padding: 24px; max-width: 600px; width: 90%; border: 1px solid rgba(255,255,255,0.1); max-height: 80vh; overflow-y: auto;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: #e4e4e7; margin: 0;">${server.name}</h3>
                        <button id="closeModal" style="background: none; border: none; color: #9ca3af; font-size: 20px; cursor: pointer;">×</button>
                    </div>
                    
                    <div class="server-details">
                        <div class="detail-section" style="margin-bottom: 20px;">
                            <h4 style="color: #e4e4e7; margin: 0 0 10px 0; font-size: 14px;">Description</h4>
                            <p style="color: #9ca3af; margin: 0; line-height: 1.4;">${server.description}</p>
                        </div>
                        
                        <div class="detail-section" style="margin-bottom: 20px;">
                            <h4 style="color: #e4e4e7; margin: 0 0 10px 0; font-size: 14px;">Capabilities</h4>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                ${server.capabilities ? server.capabilities.map(cap => `
                                    <span style="background: rgba(251, 191, 36, 0.2); color: #fbbf24; padding: 4px 8px; border-radius: 6px; font-size: 11px;">${cap}</span>
                                `).join('') : 'No capabilities listed'}
                            </div>
                        </div>
                        
                        <div class="detail-section" style="margin-bottom: 20px;">
                            <h4 style="color: #e4e4e7; margin: 0 0 10px 0; font-size: 14px;">Installation</h4>
                            <div style="background: rgba(255,255,255,0.05); border-radius: 6px; padding: 12px;">
                                <code style="color: #e4e4e7; font-family: Monaco, monospace; font-size: 12px;">${server.install_command || 'Installation command not available'}</code>
                            </div>
                        </div>
                        
                        <div class="detail-section" style="margin-bottom: 20px;">
                            <h4 style="color: #e4e4e7; margin: 0 0 10px 0; font-size: 14px;">Statistics</h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
                                <div style="background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 6px; text-align: center;">
                                    <div style="color: #fbbf24; font-weight: 600;">⭐ ${server.rating || 'N/A'}</div>
                                    <div style="color: #9ca3af; font-size: 11px;">Rating</div>
                                </div>
                                <div style="background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 6px; text-align: center;">
                                    <div style="color: #22c55e; font-weight: 600;">📦 ${server.downloads || 'N/A'}</div>
                                    <div style="color: #9ca3af; font-size: 11px;">Downloads</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button id="installFromModal" style="padding: 8px 16px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border: none; border-radius: 6px; color: white; cursor: pointer;">Install Server</button>
                        <button id="getGuide" style="padding: 8px 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #e4e4e7; cursor: pointer;">Installation Guide</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Modal event listeners
        document.getElementById('closeModal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('installFromModal').addEventListener('click', () => {
            this.installServer(server.name.toLowerCase().replace(/\s+/g, '-'));
            document.body.removeChild(modal);
        });
        
        document.getElementById('getGuide').addEventListener('click', () => {
            this.showInstallationGuide(server.name);
        });
        
        // Close on backdrop click
        modal.querySelector('.modal-backdrop').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-backdrop')) {
                document.body.removeChild(modal);
            }
        });
    }

    async showInstallationGuide(serverName) {
        try {
            const response = await fetch(`/api/mcp/registry/installation/${serverName}`);
            const result = await response.json();
            
            if (result.success) {
                const guide = result.data.guide;
                this.showNotification(`Installation guide for ${serverName} copied to clipboard`, 'success');
                
                // Copy installation command to clipboard
                if (navigator.clipboard && guide.installation_steps[0].command) {
                    navigator.clipboard.writeText(guide.installation_steps[0].command);
                }
            } else {
                this.showNotification('Failed to load installation guide', 'error');
            }
        } catch (error) {
            this.showNotification(`Guide error: ${error.message}`, 'error');
        }
    }

    async installServer(serverName) {
        this.showNotification(`Installing ${serverName} server...`, 'info');
        
        try {
            const response = await fetch('/api/mcp/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serverType: serverName })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`${serverName} server installed successfully`, 'success');
                this.loadMCPStatus(); // Refresh status
            } else {
                this.showNotification(`Installation failed: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Installation error: ${error.message}`, 'error');
        }
    }

    destroy() {
        // Save any pending changes before destruction
        if (this.pendingChanges.size > 0) {
            this.saveAllSettings();
        }
        
        console.log('Settings Controller destroyed');
    }
}

// Add required CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .status-indicator.offline {
        background: #ff4444;
    }

    .light-theme {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        color: #1e293b;
    }

    .compact-mode .panel-section {
        padding: 12px;
    }

    .compact-mode .form-section {
        padding-bottom: 16px;
    }
`;
document.head.appendChild(style);

// Initialize Settings Controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.settingsController = new SettingsController();
});

// Save settings before page unload
window.addEventListener('beforeunload', () => {
    if (window.settingsController) {
        window.settingsController.destroy();
    }
});
