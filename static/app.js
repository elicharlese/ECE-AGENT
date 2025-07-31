// Enhanced AGENT Frontend Application with Security Tools
class EnhancedAGENTApp {
    constructor() {
        this.currentDomain = 'developer';
        this.apiBase = window.location.origin;
        this.isTyping = false;
        this.currentTab = 'chat';
        this.monitoringInterval = null;
        this.scanInProgress = false;
        this.buildInProgress = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadAdminStats();
        this.loadContainerTemplates();
        this.loadRunningContainers();
    }

    bindEvents() {
        // Sidebar navigation
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });

        // Tab navigation
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
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        // Knowledge base
        document.querySelectorAll('.knowledge-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.searchKnowledge(e.currentTarget.dataset.type);
            });
        });

        document.getElementById('knowledgeSearch').addEventListener('input', (e) => {
            if (e.target.value.length > 2) {
                this.searchKnowledge('vulnerabilities', e.target.value);
            }
        });

        // Admin panel
        document.getElementById('trainBtn').addEventListener('click', () => {
            this.submitTraining();
        });

        // Security Tools event handlers
        document.getElementById('startScan').addEventListener('click', () => {
            this.startPortScan();
        });

        document.getElementById('buildContainer').addEventListener('click', () => {
            this.buildCustomContainer();
        });

        document.getElementById('startMonitoring').addEventListener('click', () => {
            this.startNetworkMonitoring();
        });

        document.getElementById('stopMonitoring').addEventListener('click', () => {
            this.stopNetworkMonitoring();
        });

        document.getElementById('exportLogs').addEventListener('click', () => {
            this.exportMonitoringLogs();
        });

        // Tool toggles in header
        document.getElementById('portScannerToggle').addEventListener('change', (e) => {
            this.toggleTool('port-scanner', e.target.checked);
        });

        document.getElementById('containerBuilderToggle').addEventListener('change', (e) => {
            this.toggleTool('container-builder', e.target.checked);
        });

        document.getElementById('monitorToggle').addEventListener('change', (e) => {
            this.toggleTool('network-monitor', e.target.checked);
        });

        // Quick tool buttons in sidebar
        document.querySelectorAll('.tool-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                this.activateQuickTool(tool);
            });
        });
    }

    switchTab(tabName) {
        // Update nav buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active', 'bg-blue-100', 'text-blue-800');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active', 'bg-blue-100', 'text-blue-800');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        if (tabName === 'knowledge') {
            this.loadKnowledgeBase();
        } else if (tabName === 'containers') {
            this.loadContainerTemplates();
            this.loadRunningContainers();
        } else if (tabName === 'admin') {
            this.loadAdminStats();
        }
    }

    selectDomain(domain) {
        this.currentDomain = domain;
        
        // Update UI
        document.querySelectorAll('.domain-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-domain="${domain}"]`).classList.add('active');
        
        // Update domain indicator
        const domainIndicator = document.getElementById('currentDomain');
        domainIndicator.textContent = domain.charAt(0).toUpperCase() + domain.slice(1);
        domainIndicator.className = `ml-2 px-3 py-1 text-sm rounded-full ${this.getDomainColors(domain)}`;

        // Add system message
        this.addMessage('system', `Switched to ${domain.charAt(0).toUpperCase() + domain.slice(1)} mode with enhanced agentic capabilities.`);
    }

    getDomainColors(domain) {
        const colors = {
            developer: 'bg-blue-100 text-blue-800',
            trader: 'bg-green-100 text-green-800',
            lawyer: 'bg-purple-100 text-purple-800'
        };
        return colors[domain] || 'bg-gray-100 text-gray-800';
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message || this.isTyping) return;

        // Add user message
        this.addMessage('user', message);
        input.value = '';

        // Show typing indicator
        this.showTyping();

        try {
            const useInternet = document.getElementById('useInternet').checked;
            
            const response = await fetch(`${this.apiBase}/agent/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: message,
                    domain: this.currentDomain,
                    use_internet: useInternet
                })
            });

            const data = await response.json();
            
            this.hideTyping();

            if (data.success) {
                this.addMessage('agent', data.response.answer, {
                    confidence: data.response.confidence,
                    reasoning_chain: data.response.reasoning_chain,
                    tools_used: data.response.tools_used,
                    proactive_suggestions: data.response.proactive_suggestions
                });
            } else {
                this.addMessage('agent', 'Sorry, I encountered an error processing your request. Please try again.');
            }

        } catch (error) {
            this.hideTyping();
            this.addMessage('agent', 'Sorry, I\'m having trouble connecting right now. Please check your connection and try again.');
            console.error('Error:', error);
        }
    }

    addMessage(type, content, metadata = {}) {
        const chatContainer = document.getElementById('chatContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message flex items-start space-x-3';

        let avatar, bgClass, textClass;
        
        if (type === 'user') {
            avatar = '<i class="fas fa-user text-white text-sm"></i>';
            bgClass = 'bg-blue-600';
            textClass = 'bg-blue-100 text-blue-900';
        } else if (type === 'agent') {
            avatar = '<i class="fas fa-robot text-white text-sm"></i>';
            bgClass = 'bg-gradient-to-r from-blue-500 to-purple-600';
            textClass = 'bg-gray-100 text-gray-800';
        } else {
            avatar = '<i class="fas fa-info text-white text-sm"></i>';
            bgClass = 'bg-gray-500';
            textClass = 'bg-yellow-100 text-yellow-800';
        }

        let metadataHtml = '';
        if (metadata.confidence) {
            const confidencePercent = Math.round(metadata.confidence * 100);
            metadataHtml += `<div class="text-xs text-gray-500 mt-2">Confidence: ${confidencePercent}%</div>`;
        }
        
        if (metadata.tools_used && metadata.tools_used.length > 0) {
            metadataHtml += `<div class="text-xs text-gray-500 mt-1">Tools Used: ${metadata.tools_used.join(', ')}</div>`;
        }
        
        if (metadata.reasoning_chain && metadata.reasoning_chain.length > 0) {
            metadataHtml += `<div class="text-xs text-gray-500 mt-1">Reasoning Steps: ${metadata.reasoning_chain.length}</div>`;
        }
        
        if (metadata.proactive_suggestions && metadata.proactive_suggestions.length > 0) {
            metadataHtml += '<div class="mt-3"><div class="text-xs font-semibold text-gray-600 mb-1">Suggestions:</div>';
            metadata.proactive_suggestions.forEach(suggestion => {
                metadataHtml += `<div class="text-xs text-blue-600 cursor-pointer hover:underline" onclick="document.getElementById('messageInput').value='${suggestion}'">${suggestion}</div>`;
            });
            metadataHtml += '</div>';
        }

        messageDiv.innerHTML = `
            <div class="w-8 h-8 ${bgClass} rounded-full flex items-center justify-center flex-shrink-0">
                ${avatar}
            </div>
            <div class="${textClass} rounded-lg p-3 max-w-3xl">
                <p class="whitespace-pre-wrap">${this.escapeHtml(content)}</p>
                ${metadataHtml}
            </div>
        `;

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    showTyping() {
        this.isTyping = true;
        const chatContainer = document.getElementById('chatContainer');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'message flex items-start space-x-3';
        
        typingDiv.innerHTML = `
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <i class="fas fa-robot text-white text-sm"></i>
            </div>
            <div class="bg-gray-100 rounded-lg p-3">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;

        chatContainer.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    hideTyping() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async searchKnowledge(type, query = '') {
        try {
            let endpoint = '';
            switch (type) {
                case 'vulnerabilities':
                    endpoint = '/knowledge/vulnerabilities';
                    break;
                case 'attack-techniques':
                    endpoint = '/knowledge/attack-techniques';
                    break;
                case 'tools':
                    endpoint = '/knowledge/tools';
                    break;
                case 'cs-concepts':
                    endpoint = '/knowledge/cs-concepts';
                    break;
            }

            const params = query ? `?query=${encodeURIComponent(query)}` : '';
            const response = await fetch(`${this.apiBase}${endpoint}${params}`);
            const data = await response.json();

            if (data.success) {
                this.displayKnowledgeResults(data.results, type);
            }
        } catch (error) {
            console.error('Error searching knowledge base:', error);
        }
    }

    displayKnowledgeResults(results, type) {
        const container = document.getElementById('knowledgeResults');
        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No results found</p>';
            return;
        }

        results.forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-gray-50 p-4 rounded-lg border';
            
            let cardContent = '';
            if (type === 'vulnerabilities') {
                cardContent = `
                    <h3 class="font-semibold text-lg">${item.name} (${item.cve_id})</h3>
                    <p class="text-gray-600 mb-2">${item.description}</p>
                    <div class="flex items-center space-x-4 text-sm">
                        <span class="px-2 py-1 bg-red-100 text-red-800 rounded">${item.severity}</span>
                        <span class="text-gray-500">${item.category}</span>
                    </div>
                    <p class="text-sm text-green-700 mt-2"><strong>Mitigation:</strong> ${item.mitigation}</p>
                `;
            } else if (type === 'attack-techniques') {
                cardContent = `
                    <h3 class="font-semibold text-lg">${item.name} (${item.technique_id})</h3>
                    <p class="text-gray-600 mb-2">${item.description}</p>
                    <div class="flex items-center space-x-4 text-sm mb-2">
                        <span class="px-2 py-1 bg-orange-100 text-orange-800 rounded">${item.hat_type}</span>
                        <span class="text-gray-500">${item.category}</span>
                    </div>
                    <p class="text-sm text-blue-700"><strong>Detection:</strong> ${item.detection_methods}</p>
                    <p class="text-sm text-green-700"><strong>Prevention:</strong> ${item.prevention}</p>
                `;
            } else if (type === 'tools') {
                cardContent = `
                    <h3 class="font-semibold text-lg">${item.name}</h3>
                    <p class="text-gray-600 mb-2">${item.description}</p>
                    <div class="flex items-center space-x-4 text-sm mb-2">
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">${item.category}</span>
                        <span class="text-gray-500">${item.usage_type}</span>
                    </div>
                    <p class="text-sm text-gray-700"><strong>Installation:</strong> ${item.installation}</p>
                    <p class="text-sm text-purple-700"><strong>Example:</strong> <code>${item.examples}</code></p>
                `;
            } else if (type === 'cs-concepts') {
                cardContent = `
                    <h3 class="font-semibold text-lg">${item.concept}</h3>
                    <p class="text-gray-600 mb-2">${item.description}</p>
                    <div class="flex items-center space-x-4 text-sm mb-2">
                        <span class="px-2 py-1 bg-green-100 text-green-800 rounded">${item.category}</span>
                        <span class="text-gray-500">Complexity: ${item.complexity}</span>
                    </div>
                    <p class="text-sm text-blue-700"><strong>Applications:</strong> ${item.applications}</p>
                `;
            }
            
            card.innerHTML = cardContent;
            container.appendChild(card);
        });
    }

    async loadContainerTemplates() {
        try {
            const response = await fetch(`${this.apiBase}/containers/templates`);
            const data = await response.json();
            
            if (data.success) {
                this.displayContainerTemplates(data.templates);
            }
        } catch (error) {
            console.error('Error loading container templates:', error);
        }
    }

    displayContainerTemplates(templates) {
        const container = document.getElementById('containerTemplates');
        container.innerHTML = '';

        templates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'tool-card bg-gray-50 p-4 rounded-lg border hover:shadow-md transition-all';
            
            card.innerHTML = `
                <h4 class="font-semibold text-lg mb-2">${template.name}</h4>
                <p class="text-gray-600 text-sm mb-3">${template.description}</p>
                <div class="flex flex-wrap gap-1 mb-3">
                    ${template.tools.map(tool => `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${tool}</span>`).join('')}
                </div>
                <button class="deploy-btn w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors" data-template="${template.id}">
                    <i class="fas fa-rocket mr-2"></i>Deploy
                </button>
            `;
            
            card.querySelector('.deploy-btn').addEventListener('click', () => {
                this.deployContainer(template.id);
            });
            
            container.appendChild(card);
        });
    }

    async deployContainer(templateName) {
        try {
            const response = await fetch(`${this.apiBase}/containers/deploy?template_name=${templateName}`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                alert(`Container deployed successfully: ${data.container_name}`);
                this.loadRunningContainers();
            } else {
                alert(`Deployment failed: ${data.error}`);
            }
        } catch (error) {
            alert('Error deploying container');
            console.error('Error:', error);
        }
    }

    async loadRunningContainers() {
        try {
            const response = await fetch(`${this.apiBase}/containers/list`);
            const data = await response.json();
            
            if (data.success) {
                this.displayRunningContainers(data.containers);
            }
        } catch (error) {
            console.error('Error loading running containers:', error);
        }
    }

    displayRunningContainers(containers) {
        const container = document.getElementById('runningContainers');
        container.innerHTML = '';

        if (containers.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No containers running</p>';
            return;
        }

        containers.forEach(cont => {
            const card = document.createElement('div');
            card.className = 'bg-gray-50 p-4 rounded-lg border';
            
            const statusColor = cont.status === 'running' ? 'text-green-600' : 'text-red-600';
            
            card.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="font-semibold">${cont.name}</h4>
                        <p class="text-sm ${statusColor}">${cont.status}</p>
                    </div>
                    <div class="space-x-2">
                        <button class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700" onclick="app.startContainer('${cont.name}')">Start</button>
                        <button class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700" onclick="app.stopContainer('${cont.name}')">Stop</button>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    async startContainer(containerName) {
        try {
            const response = await fetch(`${this.apiBase}/containers/${containerName}/start`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                alert('Container started successfully');
                this.loadRunningContainers();
            }
        } catch (error) {
            alert('Error starting container');
        }
    }

    async stopContainer(containerName) {
        try {
            const response = await fetch(`${this.apiBase}/containers/${containerName}/stop`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                alert('Container stopped successfully');
                this.loadRunningContainers();
            }
        } catch (error) {
            alert('Error stopping container');
        }
    }

    async loadAdminStats() {
        try {
            const response = await fetch(`${this.apiBase}/admin/status`);
            const data = await response.json();
            
            if (data.success && data.training_stats) {
                const stats = data.training_stats.data_counts || {};
                document.getElementById('devCount').textContent = stats.developer || 0;
                document.getElementById('traderCount').textContent = stats.trader || 0;
                document.getElementById('lawyerCount').textContent = stats.lawyer || 0;
            }
        } catch (error) {
            console.error('Error loading admin stats:', error);
        }
    }

    async submitTraining() {
        const domain = document.getElementById('trainDomain').value;
        const input = document.getElementById('trainInput').value.trim();
        const output = document.getElementById('trainOutput').value.trim();

        if (!input || !output) {
            alert('Please fill in both input and output fields.');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/admin/train`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    domain: domain,
                    input_text: input,
                    expected_output: output,
                    feedback: null
                })
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Training data added successfully!');
                document.getElementById('trainInput').value = '';
                document.getElementById('trainOutput').value = '';
                this.loadAdminStats();
            } else {
                alert('Error adding training data. Please try again.');
            }

        } catch (error) {
            alert('Error connecting to server. Please try again.');
            console.error('Error:', error);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Security Tools Methods
    async startPortScan() {
        if (this.scanInProgress) return;
        
        const target = document.getElementById('scanTarget').value.trim();
        const portRange = document.getElementById('portRange').value;
        const scanType = document.getElementById('scanType').value;
        
        if (!target) {
            alert('Please enter a target IP or domain');
            return;
        }
        
        this.scanInProgress = true;
        const scanBtn = document.getElementById('startScan');
        const originalText = scanBtn.innerHTML;
        scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Scanning...';
        scanBtn.disabled = true;
        
        const resultsDiv = document.getElementById('scanResults');
        const outputDiv = document.getElementById('scanOutput');
        resultsDiv.classList.remove('hidden');
        outputDiv.innerHTML = `Starting ${scanType.toUpperCase()} scan on ${target}...\n`;
        
        try {
            // Simulate port scanning (in real implementation, this would call backend API)
            const ports = this.getPortsForRange(portRange);
            
            for (let i = 0; i < ports.length; i++) {
                const port = ports[i];
                await this.sleep(100); // Simulate scan delay
                
                const isOpen = Math.random() > 0.8; // Simulate random open ports
                if (isOpen) {
                    const service = this.getServiceName(port);
                    outputDiv.innerHTML += `Port ${port}/tcp open  ${service}\n`;
                }
                
                // Update progress
                if (i % 10 === 0) {
                    outputDiv.innerHTML += `Scanned ${i + 1}/${ports.length} ports...\n`;
                    outputDiv.scrollTop = outputDiv.scrollHeight;
                }
            }
            
            outputDiv.innerHTML += `\nScan completed. Found ${outputDiv.innerHTML.split('open').length - 1} open ports.\n`;
            
        } catch (error) {
            outputDiv.innerHTML += `\nError: ${error.message}\n`;
        } finally {
            this.scanInProgress = false;
            scanBtn.innerHTML = originalText;
            scanBtn.disabled = false;
            outputDiv.scrollTop = outputDiv.scrollHeight;
        }
    }
    
    getPortsForRange(range) {
        switch (range) {
            case 'common':
                return [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3389, 5432, 3306];
            case '1-1000':
                return Array.from({length: 1000}, (_, i) => i + 1);
            case '1-65535':
                return Array.from({length: 65535}, (_, i) => i + 1);
            default:
                return [80, 443, 22, 21, 25];
        }
    }
    
    getServiceName(port) {
        const services = {
            21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp', 53: 'dns',
            80: 'http', 110: 'pop3', 143: 'imap', 443: 'https', 993: 'imaps',
            995: 'pop3s', 3389: 'rdp', 5432: 'postgresql', 3306: 'mysql'
        };
        return services[port] || 'unknown';
    }
    
    async buildCustomContainer() {
        if (this.buildInProgress) return;
        
        const containerName = document.getElementById('containerName').value.trim();
        const baseImage = document.getElementById('baseImage').value;
        const selectedTools = Array.from(document.querySelectorAll('.tool-checkbox:checked')).map(cb => cb.value);
        
        if (!containerName) {
            alert('Please enter a container name');
            return;
        }
        
        this.buildInProgress = true;
        const buildBtn = document.getElementById('buildContainer');
        const originalText = buildBtn.innerHTML;
        buildBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Building...';
        buildBtn.disabled = true;
        
        const statusDiv = document.getElementById('buildStatus');
        const outputDiv = document.getElementById('buildOutput');
        statusDiv.classList.remove('hidden');
        outputDiv.innerHTML = `Building container: ${containerName}\n`;
        outputDiv.innerHTML += `Base image: ${baseImage}\n`;
        outputDiv.innerHTML += `Selected tools: ${selectedTools.join(', ')}\n\n`;
        
        try {
            // Simulate container building process
            const buildSteps = [
                'Pulling base image...',
                'Setting up environment...',
                'Installing security tools...',
                'Configuring services...',
                'Creating user accounts...',
                'Setting up networking...',
                'Finalizing container...'
            ];
            
            for (const step of buildSteps) {
                outputDiv.innerHTML += `${step}\n`;
                outputDiv.scrollTop = outputDiv.scrollHeight;
                await this.sleep(1000);
            }
            
            // Simulate tool installation
            for (const tool of selectedTools) {
                outputDiv.innerHTML += `Installing ${tool}... ✓\n`;
                outputDiv.scrollTop = outputDiv.scrollHeight;
                await this.sleep(500);
            }
            
            outputDiv.innerHTML += `\n✅ Container '${containerName}' built successfully!\n`;
            outputDiv.innerHTML += `Container ID: ${this.generateContainerId()}\n`;
            outputDiv.innerHTML += `Status: Ready to deploy\n`;
            
        } catch (error) {
            outputDiv.innerHTML += `\n❌ Build failed: ${error.message}\n`;
        } finally {
            this.buildInProgress = false;
            buildBtn.innerHTML = originalText;
            buildBtn.disabled = false;
            outputDiv.scrollTop = outputDiv.scrollHeight;
        }
    }
    
    generateContainerId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    startNetworkMonitoring() {
        if (this.monitoringInterval) return;
        
        document.getElementById('startMonitoring').disabled = true;
        document.getElementById('stopMonitoring').disabled = false;
        
        // Start monitoring with real-time updates
        this.monitoringInterval = setInterval(() => {
            this.updateSystemStats();
            this.updateActiveConnections();
            this.updateSecurityAlerts();
        }, 2000);
        
        // Initial update
        this.updateSystemStats();
        this.updateActiveConnections();
        this.updateSecurityAlerts();
    }
    
    stopNetworkMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        document.getElementById('startMonitoring').disabled = false;
        document.getElementById('stopMonitoring').disabled = true;
    }
    
    updateSystemStats() {
        // Simulate system resource monitoring
        const cpuUsage = Math.floor(Math.random() * 100);
        const memUsage = Math.floor(Math.random() * 100);
        const networkIO = Math.floor(Math.random() * 100);
        
        document.getElementById('cpuUsage').textContent = `${cpuUsage}%`;
        document.getElementById('cpuBar').style.width = `${cpuUsage}%`;
        
        document.getElementById('memUsage').textContent = `${memUsage}%`;
        document.getElementById('memBar').style.width = `${memUsage}%`;
        
        document.getElementById('networkIO').textContent = `${networkIO}%`;
        document.getElementById('networkBar').style.width = `${networkIO}%`;
    }
    
    updateActiveConnections() {
        const connections = this.generateMockConnections();
        const container = document.getElementById('activeConnections');
        
        container.innerHTML = connections.map(conn => `
            <div class="text-xs bg-white rounded p-2 flex justify-between">
                <span class="font-mono">${conn.local} → ${conn.remote}</span>
                <span class="text-${conn.status === 'ESTABLISHED' ? 'green' : 'yellow'}-600">${conn.status}</span>
            </div>
        `).join('');
    }
    
    updateSecurityAlerts() {
        // Simulate security alerts
        if (Math.random() > 0.9) {
            const alerts = [
                'Suspicious login attempt detected',
                'Unusual network traffic pattern',
                'Port scan detected from external IP',
                'Failed authentication attempts',
                'Potential DDoS activity'
            ];
            
            const alert = alerts[Math.floor(Math.random() * alerts.length)];
            const container = document.getElementById('securityAlerts');
            
            const alertDiv = document.createElement('div');
            alertDiv.className = 'text-xs bg-red-50 border border-red-200 rounded p-2 text-red-800';
            alertDiv.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-exclamation-triangle text-red-500"></i>
                    <span>${alert}</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">${new Date().toLocaleTimeString()}</div>
            `;
            
            container.insertBefore(alertDiv, container.firstChild);
            
            // Keep only last 5 alerts
            while (container.children.length > 5) {
                container.removeChild(container.lastChild);
            }
        }
    }
    
    generateMockConnections() {
        const connections = [];
        const count = Math.floor(Math.random() * 8) + 2;
        
        for (let i = 0; i < count; i++) {
            connections.push({
                local: `127.0.0.1:${Math.floor(Math.random() * 65535)}`,
                remote: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}:${Math.floor(Math.random() * 65535)}`,
                status: Math.random() > 0.3 ? 'ESTABLISHED' : 'TIME_WAIT'
            });
        }
        
        return connections;
    }
    
    exportMonitoringLogs() {
        const logs = {
            timestamp: new Date().toISOString(),
            systemStats: {
                cpu: document.getElementById('cpuUsage').textContent,
                memory: document.getElementById('memUsage').textContent,
                network: document.getElementById('networkIO').textContent
            },
            connections: this.generateMockConnections(),
            alerts: Array.from(document.getElementById('securityAlerts').children).map(alert => alert.textContent.trim())
        };
        
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agent-monitoring-logs-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    toggleTool(toolName, enabled) {
        console.log(`Tool ${toolName} ${enabled ? 'enabled' : 'disabled'}`);
        
        // Visual feedback
        const toolElements = document.querySelectorAll(`[data-tool="${toolName}"]`);
        toolElements.forEach(el => {
            if (enabled) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
        
        // Show notification
        this.showNotification(`${toolName.replace('-', ' ')} ${enabled ? 'activated' : 'deactivated'}`, enabled ? 'success' : 'info');
    }
    
    activateQuickTool(toolName) {
        // Switch to tools tab and highlight the specific tool
        this.switchTab('tools');
        
        // Scroll to the specific tool
        const toolMap = {
            'port-scanner': 'scanTarget',
            'container-builder': 'containerName',
            'network-monitor': 'startMonitoring'
        };
        
        const elementId = toolMap[toolName];
        if (elementId) {
            setTimeout(() => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (element.tagName === 'INPUT') {
                        element.focus();
                    }
                }
            }, 300);
        }
        
        this.showNotification(`Activated ${toolName.replace('-', ' ')}`, 'success');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full`;
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        notification.classList.add(colors[type] || colors.info);
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : type === 'warning' ? 'exclamation' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EnhancedAGENTApp();
});

// Add responsive sidebar behavior
window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
        document.getElementById('sidebar').classList.remove('collapsed');
    }
});
