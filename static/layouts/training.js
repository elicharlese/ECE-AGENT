// Training Layout JavaScript Controller
class TrainingController {
    constructor() {
        this.socket = null;
        this.charts = {};
        this.currentView = 'progress';
        this.trainingActive = true;
        this.refreshIntervals = new Map();
        this.logUpdateInterval = null;
        
        this.init();
    }

    init() {
        console.log('Training Controller initializing...');
        this.initWebSocket();
        this.initEventListeners();
        this.initCharts();
        this.loadTrainingData();
        this.startRealTimeUpdates();
    }

    initWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            this.socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
            
            this.socket.onopen = () => {
                console.log('Training WebSocket connected');
                this.socket.send(JSON.stringify({
                    type: 'subscribe',
                    channel: 'training'
                }));
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Training WebSocket message parse error:', error);
                }
            };

            this.socket.onclose = () => {
                console.log('Training WebSocket disconnected');
                setTimeout(() => this.initWebSocket(), 5000);
            };

            this.socket.onerror = (error) => {
                console.error('Training WebSocket error:', error);
            };
        } catch (error) {
            console.error('WebSocket initialization error:', error);
        }
    }

    initEventListeners() {
        // Training controls
        document.getElementById('pauseTrainingBtn')?.addEventListener('click', () => {
            this.pauseTraining();
        });

        document.getElementById('stopTrainingBtn')?.addEventListener('click', () => {
            this.stopTraining();
        });

        document.getElementById('newTrainingBtn')?.addEventListener('click', () => {
            this.startNewTraining();
        });

        // Dashboard tabs
        document.querySelectorAll('.dashboard-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // Model actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.classList.contains('view') ? 'view' :
                              e.target.classList.contains('config') ? 'config' :
                              e.target.classList.contains('deploy') ? 'deploy' :
                              e.target.classList.contains('retrain') ? 'retrain' :
                              e.target.classList.contains('monitor') ? 'monitor' :
                              e.target.classList.contains('update') ? 'update' : null;
                
                const model = e.target.dataset.model;
                if (action && model) {
                    this.handleModelAction(action, model);
                }
            });
        });

        // Quick actions
        document.getElementById('quickTrainBtn')?.addEventListener('click', () => {
            this.quickTrain();
        });

        document.getElementById('autoTuneBtn')?.addEventListener('click', () => {
            this.autoTune();
        });

        document.getElementById('modelCompareBtn')?.addEventListener('click', () => {
            this.compareModels();
        });

        document.getElementById('dataAugmentBtn')?.addEventListener('click', () => {
            this.augmentData();
        });

        // Configuration controls
        document.getElementById('saveConfigBtn')?.addEventListener('click', () => {
            this.saveConfiguration();
        });

        document.getElementById('refreshDataBtn')?.addEventListener('click', () => {
            this.refreshDataSources();
        });

        document.getElementById('createTemplateBtn')?.addEventListener('click', () => {
            this.createTemplate();
        });

        // Template buttons
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateName = e.target.closest('.template-item').querySelector('.template-name').textContent;
                this.useTemplate(templateName);
            });
        });

        // Log controls
        document.getElementById('logLevel')?.addEventListener('change', (e) => {
            this.filterLogs(e.target.value);
        });

        document.getElementById('clearLogsBtn')?.addEventListener('click', () => {
            this.clearLogs();
        });

        document.getElementById('downloadLogsBtn')?.addEventListener('click', () => {
            this.downloadLogs();
        });

        document.getElementById('exportLogsBtn')?.addEventListener('click', () => {
            this.exportLogs();
        });

        document.getElementById('fullscreenDashboardBtn')?.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Experiment controls
        document.getElementById('newExperimentBtn')?.addEventListener('click', () => {
            this.createNewExperiment();
        });

        // Configuration inputs
        document.getElementById('validationSplit')?.addEventListener('input', (e) => {
            const value = e.target.value;
            const display = document.querySelector('.range-value');
            if (display) {
                display.textContent = `${Math.round(value * 100)}%`;
            }
        });

        // Add model button
        document.getElementById('addModelBtn')?.addEventListener('click', () => {
            this.addNewModel();
        });
    }

    initCharts() {
        this.initAccuracyChart();
        this.initLossChart();
        this.initPerformanceChart();
    }

    initAccuracyChart() {
        const ctx = document.getElementById('accuracyChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.accuracy = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateEpochLabels(),
                datasets: [{
                    label: 'Training Accuracy',
                    data: this.generateAccuracyData(),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Validation Accuracy',
                    data: this.generateValidationAccuracyData(),
                    borderColor: '#06b6d4',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#e4e4e7',
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 35, 0.9)',
                        titleColor: '#e4e4e7',
                        bodyColor: '#e4e4e7',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af',
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af',
                            font: {
                                size: 10
                            },
                            callback: function(value) {
                                return (value * 100).toFixed(1) + '%';
                            }
                        },
                        min: 0,
                        max: 1
                    }
                }
            }
        });
    }

    initLossChart() {
        const ctx = document.getElementById('lossChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.loss = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateEpochLabels(),
                datasets: [{
                    label: 'Training Loss',
                    data: this.generateLossData(),
                    borderColor: '#ff4444',
                    backgroundColor: 'rgba(255, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Validation Loss',
                    data: this.generateValidationLossData(),
                    borderColor: '#fbbf24',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#e4e4e7',
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 35, 0.9)',
                        titleColor: '#e4e4e7',
                        bodyColor: '#e4e4e7',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af',
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af',
                            font: {
                                size: 10
                            },
                            callback: function(value) {
                                return value.toFixed(4);
                            }
                        }
                    }
                }
            }
        });
    }

    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.performance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Precision', 'Recall', 'F1-Score', 'AUC-ROC', 'Accuracy', 'Speed'],
                datasets: [{
                    label: 'Current Model',
                    data: [0.942, 0.918, 0.930, 0.967, 0.942, 0.85],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderWidth: 2
                }, {
                    label: 'Baseline',
                    data: [0.85, 0.82, 0.83, 0.88, 0.85, 0.75],
                    borderColor: '#6b7280',
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    borderWidth: 1,
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#e4e4e7',
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: '#9ca3af',
                            font: {
                                size: 10
                            }
                        },
                        ticks: {
                            color: '#9ca3af',
                            font: {
                                size: 9
                            },
                            backdropColor: 'transparent',
                            stepSize: 0.2
                        },
                        min: 0,
                        max: 1
                    }
                }
            }
        });
    }

    switchView(view) {
        // Update tab states
        document.querySelectorAll('.dashboard-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.view === view) {
                tab.classList.add('active');
            }
        });

        // Update content visibility
        document.querySelectorAll('.dashboard-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(view + 'View')?.classList.add('active');

        this.currentView = view;

        // Start specific updates for the view
        if (view === 'logs') {
            this.startLogUpdates();
        } else {
            this.stopLogUpdates();
        }
    }

    generateEpochLabels() {
        const labels = [];
        for (let i = 1; i <= 50; i++) {
            labels.push(`${i * 5}`);
        }
        return labels;
    }

    generateAccuracyData() {
        const data = [];
        let accuracy = 0.3;
        
        for (let i = 0; i < 50; i++) {
            accuracy += (Math.random() - 0.3) * 0.02;
            accuracy = Math.min(Math.max(accuracy, 0), 0.95);
            data.push(accuracy);
        }
        
        return data;
    }

    generateValidationAccuracyData() {
        const data = [];
        let accuracy = 0.25;
        
        for (let i = 0; i < 50; i++) {
            accuracy += (Math.random() - 0.4) * 0.025;
            accuracy = Math.min(Math.max(accuracy, 0), 0.94);
            data.push(accuracy);
        }
        
        return data;
    }

    generateLossData() {
        const data = [];
        let loss = 0.8;
        
        for (let i = 0; i < 50; i++) {
            loss *= (0.98 + Math.random() * 0.02);
            loss = Math.max(loss, 0.001);
            data.push(loss);
        }
        
        return data;
    }

    generateValidationLossData() {
        const data = [];
        let loss = 0.9;
        
        for (let i = 0; i < 50; i++) {
            loss *= (0.97 + Math.random() * 0.04);
            loss = Math.max(loss, 0.002);
            data.push(loss);
        }
        
        return data;
    }

    loadTrainingData() {
        console.log('Loading training data...');
        this.updateTrainingProgress();
        this.updateResourceMetrics();
    }

    updateTrainingProgress() {
        // Simulate progress updates
        const progressBar = document.querySelector('.progress-fill');
        const progressValue = document.querySelector('.progress-value');
        
        if (progressBar && progressValue) {
            const currentProgress = Math.random() * 100;
            progressBar.style.width = `${currentProgress}%`;
            progressValue.textContent = `${Math.round(currentProgress)}%`;
        }
    }

    updateResourceMetrics() {
        const resources = [
            { id: 'gpu', min: 60, max: 90 },
            { id: 'cpu', min: 30, max: 70 },
            { id: 'memory', min: 40, max: 80 },
            { id: 'storage', min: 20, max: 50 }
        ];

        resources.forEach(resource => {
            const fill = document.querySelector(`.resource-fill.${resource.id}`);
            const value = document.querySelector(`.resource-item:nth-child(${resources.indexOf(resource) + 1}) .resource-value`);
            
            if (fill && value) {
                const usage = Math.random() * (resource.max - resource.min) + resource.min;
                fill.style.width = `${usage}%`;
                value.textContent = `${Math.round(usage)}%`;
            }
        });
    }

    pauseTraining() {
        console.log('Pausing training...');
        this.trainingActive = false;
        this.updateTrainingStatus('PAUSED');
        this.showNotification('Training paused', 'warning');
    }

    stopTraining() {
        console.log('Stopping training...');
        this.trainingActive = false;
        this.updateTrainingStatus('STOPPED');
        this.showNotification('Training stopped', 'error');
    }

    startNewTraining() {
        console.log('Starting new training session...');
        this.trainingActive = true;
        this.updateTrainingStatus('TRAINING');
        this.showNotification('New training session started', 'success');
    }

    updateTrainingStatus(status) {
        const statusIndicator = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        
        if (statusIndicator && statusText) {
            statusIndicator.className = 'status-dot';
            statusText.textContent = status;
            
            switch (status) {
                case 'TRAINING':
                    statusIndicator.classList.add('active');
                    break;
                case 'PAUSED':
                    statusIndicator.style.background = '#fbbf24';
                    break;
                case 'STOPPED':
                    statusIndicator.style.background = '#ff4444';
                    break;
            }
        }
    }

    handleModelAction(action, model) {
        console.log(`Executing ${action} on model ${model}`);
        
        switch (action) {
            case 'view':
                this.viewModel(model);
                break;
            case 'config':
                this.configureModel(model);
                break;
            case 'deploy':
                this.deployModel(model);
                break;
            case 'retrain':
                this.retrainModel(model);
                break;
            case 'monitor':
                this.monitorModel(model);
                break;
            case 'update':
                this.updateModel(model);
                break;
        }
    }

    viewModel(model) {
        console.log(`Viewing model: ${model}`);
        this.showNotification(`Opening ${model} details...`, 'info');
    }

    configureModel(model) {
        console.log(`Configuring model: ${model}`);
        this.showNotification(`Opening ${model} configuration...`, 'info');
    }

    deployModel(model) {
        console.log(`Deploying model: ${model}`);
        this.showNotification(`Deploying ${model}...`, 'info');
        
        setTimeout(() => {
            this.showNotification(`${model} deployed successfully`, 'success');
        }, 2000);
    }

    retrainModel(model) {
        console.log(`Retraining model: ${model}`);
        this.showNotification(`Starting ${model} retraining...`, 'info');
        
        setTimeout(() => {
            this.showNotification(`${model} retraining initiated`, 'success');
        }, 1500);
    }

    monitorModel(model) {
        console.log(`Monitoring model: ${model}`);
        this.showNotification(`Opening ${model} monitoring dashboard...`, 'info');
    }

    updateModel(model) {
        console.log(`Updating model: ${model}`);
        this.showNotification(`Updating ${model}...`, 'info');
        
        setTimeout(() => {
            this.showNotification(`${model} updated successfully`, 'success');
        }, 2500);
    }

    quickTrain() {
        console.log('Starting quick training...');
        this.showNotification('Quick training initiated', 'success');
    }

    autoTune() {
        console.log('Starting auto-tuning...');
        this.showNotification('Auto-tuning hyperparameters...', 'info');
        
        setTimeout(() => {
            this.showNotification('Auto-tuning completed', 'success');
        }, 3000);
    }

    compareModels() {
        console.log('Opening model comparison...');
        this.showNotification('Opening model comparison tool', 'info');
    }

    augmentData() {
        console.log('Starting data augmentation...');
        this.showNotification('Data augmentation started', 'info');
        
        setTimeout(() => {
            this.showNotification('Data augmentation completed', 'success');
        }, 2000);
    }

    saveConfiguration() {
        console.log('Saving training configuration...');
        
        const config = {
            learningRate: document.getElementById('learningRate')?.value,
            batchSize: document.getElementById('batchSize')?.value,
            epochs: document.getElementById('epochs')?.value,
            optimizer: document.getElementById('optimizer')?.value,
            earlyStopping: document.getElementById('earlyStopping')?.checked,
            validationSplit: document.getElementById('validationSplit')?.value
        };
        
        console.log('Configuration:', config);
        this.showNotification('Configuration saved', 'success');
    }

    refreshDataSources() {
        console.log('Refreshing data sources...');
        this.showNotification('Refreshing data sources...', 'info');
        
        setTimeout(() => {
            this.showNotification('Data sources refreshed', 'success');
        }, 1500);
    }

    createTemplate() {
        console.log('Creating new template...');
        this.showNotification('Opening template creator...', 'info');
    }

    useTemplate(templateName) {
        console.log(`Using template: ${templateName}`);
        this.showNotification(`Loading ${templateName} template...`, 'info');
    }

    addNewModel() {
        console.log('Adding new model...');
        this.showNotification('Opening model creation wizard...', 'info');
    }

    filterLogs(level) {
        console.log(`Filtering logs by level: ${level}`);
        const logEntries = document.querySelectorAll('.log-entry');
        
        logEntries.forEach(entry => {
            if (level === 'all') {
                entry.style.display = 'flex';
            } else {
                const entryLevel = entry.querySelector('.log-level').textContent.toLowerCase();
                entry.style.display = entryLevel.includes(level) ? 'flex' : 'none';
            }
        });
    }

    clearLogs() {
        console.log('Clearing logs...');
        const logsContent = document.getElementById('logsContent');
        if (logsContent) {
            logsContent.innerHTML = '';
        }
        this.showNotification('Logs cleared', 'info');
    }

    downloadLogs() {
        console.log('Downloading logs...');
        this.showNotification('Downloading logs...', 'info');
    }

    exportLogs() {
        console.log('Exporting logs...');
        this.showNotification('Exporting logs...', 'info');
    }

    toggleFullscreen() {
        const dashboard = document.querySelector('.training-dashboard');
        if (!dashboard) return;

        if (!dashboard.classList.contains('fullscreen')) {
            dashboard.style.position = 'fixed';
            dashboard.style.top = '0';
            dashboard.style.left = '0';
            dashboard.style.width = '100vw';
            dashboard.style.height = '100vh';
            dashboard.style.zIndex = '9999';
            dashboard.classList.add('fullscreen');
        } else {
            dashboard.style.position = '';
            dashboard.style.top = '';
            dashboard.style.left = '';
            dashboard.style.width = '';
            dashboard.style.height = '';
            dashboard.style.zIndex = '';
            dashboard.classList.remove('fullscreen');
        }

        // Resize charts after fullscreen toggle
        setTimeout(() => {
            Object.values(this.charts).forEach(chart => {
                if (chart && chart.resize) {
                    chart.resize();
                }
            });
        }, 100);
    }

    createNewExperiment() {
        console.log('Creating new experiment...');
        this.showNotification('Creating new experiment...', 'info');
    }

    startLogUpdates() {
        if (this.logUpdateInterval) return;

        this.logUpdateInterval = setInterval(() => {
            this.addLogEntry();
        }, 3000);
    }

    stopLogUpdates() {
        if (this.logUpdateInterval) {
            clearInterval(this.logUpdateInterval);
            this.logUpdateInterval = null;
        }
    }

    addLogEntry() {
        const logsContent = document.getElementById('logsContent');
        if (!logsContent) return;

        const logTypes = [
            { level: 'INFO', message: 'Processing batch 3125/3200' },
            { level: 'INFO', message: 'Validation accuracy: 94.3%' },
            { level: 'WARN', message: 'Learning rate adjusted to 0.0009' },
            { level: 'INFO', message: 'Completed epoch 246 - Loss: 0.0022' },
            { level: 'INFO', message: 'Saving model checkpoint...' }
        ];

        const randomLog = logTypes[Math.floor(Math.random() * logTypes.length)];
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false });

        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${randomLog.level.toLowerCase()}`;
        logEntry.innerHTML = `
            <span class="log-time">${timeString}</span>
            <span class="log-level">${randomLog.level}</span>
            <span class="log-message">${randomLog.message}</span>
        `;

        logsContent.appendChild(logEntry);
        logsContent.scrollTop = logsContent.scrollHeight;

        // Keep only last 50 entries
        const entries = logsContent.querySelectorAll('.log-entry');
        if (entries.length > 50) {
            entries[0].remove();
        }
    }

    startRealTimeUpdates() {
        // Update charts every 5 seconds
        this.refreshIntervals.set('charts', setInterval(() => {
            if (this.trainingActive) {
                this.updateCharts();
            }
        }, 5000));

        // Update progress every 10 seconds
        this.refreshIntervals.set('progress', setInterval(() => {
            if (this.trainingActive) {
                this.updateTrainingProgress();
            }
        }, 10000));

        // Update resources every 3 seconds
        this.refreshIntervals.set('resources', setInterval(() => {
            this.updateResourceMetrics();
        }, 3000));
    }

    updateCharts() {
        // Update accuracy chart
        if (this.charts.accuracy) {
            const dataset = this.charts.accuracy.data.datasets[0];
            const newAccuracy = Math.min(dataset.data[dataset.data.length - 1] + (Math.random() - 0.3) * 0.01, 0.95);
            dataset.data.push(newAccuracy);
            
            if (dataset.data.length > 50) {
                dataset.data.shift();
                this.charts.accuracy.data.labels.shift();
            }
            
            this.charts.accuracy.data.labels.push((this.charts.accuracy.data.labels.length * 5).toString());
            this.charts.accuracy.update('none');
        }

        // Update loss chart
        if (this.charts.loss) {
            const dataset = this.charts.loss.data.datasets[0];
            const newLoss = Math.max(dataset.data[dataset.data.length - 1] * (0.99 + Math.random() * 0.02), 0.001);
            dataset.data.push(newLoss);
            
            if (dataset.data.length > 50) {
                dataset.data.shift();
                this.charts.loss.data.labels.shift();
            }
            
            this.charts.loss.data.labels.push((this.charts.loss.data.labels.length * 5).toString());
            this.charts.loss.update('none');
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'training_update':
                this.handleTrainingUpdate(data.payload);
                break;
            case 'model_status':
                this.handleModelStatus(data.payload);
                break;
            case 'resource_update':
                this.handleResourceUpdate(data.payload);
                break;
            case 'experiment_complete':
                this.handleExperimentComplete(data.payload);
                break;
        }
    }

    handleTrainingUpdate(payload) {
        console.log('Training update received:', payload);
        this.updateTrainingProgress();
    }

    handleModelStatus(payload) {
        console.log('Model status update:', payload);
    }

    handleResourceUpdate(payload) {
        console.log('Resource update:', payload);
        this.updateResourceMetrics();
    }

    handleExperimentComplete(payload) {
        console.log('Experiment completed:', payload);
        this.showNotification(`Experiment ${payload.id} completed`, 'success');
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
                notification.style.background = 'linear-gradient(135deg, #8b5cf6, #06b6d4)';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    destroy() {
        // Clear intervals
        this.refreshIntervals.forEach((interval) => {
            clearInterval(interval);
        });
        this.refreshIntervals.clear();

        // Stop log updates
        this.stopLogUpdates();

        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        this.charts = {};

        // Close WebSocket
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        console.log('Training Controller destroyed');
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
`;
document.head.appendChild(style);

// Initialize Training Controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.trainingController = new TrainingController();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.trainingController) {
        window.trainingController.destroy();
    }
});
