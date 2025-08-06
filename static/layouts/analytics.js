// Analytics Layout JavaScript Controller
class AnalyticsController {
    constructor() {
        this.socket = null;
        this.charts = {};
        this.refreshIntervals = new Map();
        this.currentTimeframe = '30d';
        this.currentAnalysis = 'summary';
        this.isFullscreen = false;
        
        this.init();
    }

    init() {
        console.log('Analytics Controller initializing...');
        this.initWebSocket();
        this.initEventListeners();
        this.initCharts();
        this.loadAnalyticsData();
        this.startRealTimeUpdates();
    }

    initWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            this.socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
            
            this.socket.onopen = () => {
                console.log('Analytics WebSocket connected');
                this.socket.send(JSON.stringify({
                    type: 'subscribe',
                    channel: 'analytics'
                }));
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Analytics WebSocket message parse error:', error);
                }
            };

            this.socket.onclose = () => {
                console.log('Analytics WebSocket disconnected');
                setTimeout(() => this.initWebSocket(), 5000);
            };

            this.socket.onerror = (error) => {
                console.error('Analytics WebSocket error:', error);
            };
        } catch (error) {
            console.error('WebSocket initialization error:', error);
        }
    }

    initEventListeners() {
        // Timeframe selection
        document.getElementById('analyticsTimeframe')?.addEventListener('change', (e) => {
            this.currentTimeframe = e.target.value;
            this.updateAnalytics();
        });

        // Chart tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartType = e.target.dataset.chart;
                this.switchChart(chartType);
            });
        });

        // Analysis tabs
        document.querySelectorAll('.analysis-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const analysisType = e.target.dataset.analysis;
                this.switchAnalysis(analysisType);
            });
        });

        // Report buttons
        document.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reportType = e.target.dataset.report;
                this.generateReport(reportType);
            });
        });

        // Control buttons
        document.getElementById('refreshKPIBtn')?.addEventListener('click', () => {
            this.refreshKPI();
        });

        document.getElementById('optimizeStrategiesBtn')?.addEventListener('click', () => {
            this.optimizeStrategies();
        });

        document.getElementById('generateReportBtn')?.addEventListener('click', () => {
            this.generateCustomReport();
        });

        document.getElementById('exportReportBtn')?.addEventListener('click', () => {
            this.exportReport();
        });

        document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        document.getElementById('breakdownPeriod')?.addEventListener('change', (e) => {
            this.updateBreakdownChart(e.target.value);
        });

        document.getElementById('customizeReportsBtn')?.addEventListener('click', () => {
            this.customizeReports();
        });
    }

    initCharts() {
        this.initMainChart();
        this.initRiskGauge();
        this.initBreakdownChart();
    }

    initMainChart() {
        const ctx = document.getElementById('mainChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.main = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(),
                datasets: [{
                    label: 'Portfolio Value',
                    data: this.generatePerformanceData(),
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Benchmark',
                    data: this.generateBenchmarkData(),
                    borderColor: '#6b7280',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#e4e4e7'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
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
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    initRiskGauge() {
        const ctx = document.getElementById('riskGauge')?.getContext('2d');
        if (!ctx) return;

        this.charts.riskGauge = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [3.2, 6.8],
                    backgroundColor: [
                        '#00ff88',
                        'rgba(255, 255, 255, 0.1)'
                    ],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                rotation: -90,
                circumference: 180
            }
        });
    }

    initBreakdownChart() {
        const ctx = document.getElementById('breakdownChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.breakdown = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Winning Trades', 'Losing Trades'],
                datasets: [{
                    data: [68, 32],
                    backgroundColor: [
                        '#00ff88',
                        '#ff4444'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 35, 0.9)',
                        titleColor: '#e4e4e7',
                        bodyColor: '#e4e4e7',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    switchChart(chartType) {
        // Update tab states
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.chart === chartType) {
                btn.classList.add('active');
            }
        });

        // Update chart data based on type
        switch (chartType) {
            case 'performance':
                this.updateMainChart('performance');
                break;
            case 'drawdown':
                this.updateMainChart('drawdown');
                break;
            case 'distribution':
                this.updateMainChart('distribution');
                break;
            case 'correlation':
                this.updateMainChart('correlation');
                break;
        }
    }

    switchAnalysis(analysisType) {
        // Update tab states
        document.querySelectorAll('.analysis-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.analysis === analysisType) {
                tab.classList.add('active');
            }
        });

        // Update content visibility
        document.querySelectorAll('.analysis-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(analysisType + 'Analysis')?.classList.add('active');

        this.currentAnalysis = analysisType;
    }

    updateMainChart(type) {
        if (!this.charts.main) return;

        let newData, newLabel, newColor;
        
        switch (type) {
            case 'performance':
                newData = this.generatePerformanceData();
                newLabel = 'Portfolio Value';
                newColor = '#00ff88';
                break;
            case 'drawdown':
                newData = this.generateDrawdownData();
                newLabel = 'Drawdown %';
                newColor = '#ff4444';
                break;
            case 'distribution':
                newData = this.generateDistributionData();
                newLabel = 'Return Distribution';
                newColor = '#00d4ff';
                break;
            case 'correlation':
                newData = this.generateCorrelationData();
                newLabel = 'Strategy Correlation';
                newColor = '#8b5cf6';
                break;
        }

        this.charts.main.data.datasets[0].data = newData;
        this.charts.main.data.datasets[0].label = newLabel;
        this.charts.main.data.datasets[0].borderColor = newColor;
        this.charts.main.data.datasets[0].backgroundColor = newColor + '20';
        this.charts.main.update('none');
    }

    updateBreakdownChart(period) {
        if (!this.charts.breakdown) return;

        let data;
        switch (period) {
            case 'daily':
                data = [72, 28];
                break;
            case 'weekly':
                data = [68, 32];
                break;
            case 'monthly':
                data = [65, 35];
                break;
            default:
                data = [68, 32];
        }

        this.charts.breakdown.data.datasets[0].data = data;
        this.charts.breakdown.update('none');
    }

    generateTimeLabels() {
        const labels = [];
        const now = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        
        return labels;
    }

    generatePerformanceData() {
        const data = [];
        let value = 100000;
        
        for (let i = 0; i < 30; i++) {
            value += (Math.random() - 0.3) * 2000;
            data.push(Math.max(value, 90000));
        }
        
        return data;
    }

    generateBenchmarkData() {
        const data = [];
        let value = 100000;
        
        for (let i = 0; i < 30; i++) {
            value += (Math.random() - 0.4) * 1000;
            data.push(Math.max(value, 95000));
        }
        
        return data;
    }

    generateDrawdownData() {
        const data = [];
        for (let i = 0; i < 30; i++) {
            data.push(-Math.random() * 10);
        }
        return data;
    }

    generateDistributionData() {
        const data = [];
        for (let i = 0; i < 30; i++) {
            data.push((Math.random() - 0.5) * 20);
        }
        return data;
    }

    generateCorrelationData() {
        const data = [];
        for (let i = 0; i < 30; i++) {
            data.push(Math.random());
        }
        return data;
    }

    loadAnalyticsData() {
        console.log('Loading analytics data...');
        
        // Simulate loading real data
        setTimeout(() => {
            this.updateKPIMetrics();
            this.updateInsights();
            this.updateStrategies();
        }, 1000);
    }

    updateAnalytics() {
        console.log(`Updating analytics for timeframe: ${this.currentTimeframe}`);
        
        // Update all charts and metrics based on new timeframe
        this.updateMainChart('performance');
        this.updateKPIMetrics();
        
        this.showNotification('Analytics updated successfully', 'success');
    }

    updateKPIMetrics() {
        const metrics = {
            totalTrades: Math.floor(Math.random() * 2000) + 1000,
            winRate: (Math.random() * 20 + 60).toFixed(1) + '%',
            totalPnL: '$' + (Math.random() * 50000 + 10000).toLocaleString(),
            avgProfit: '$' + (Math.random() * 200 + 50).toFixed(2),
            sharpeRatio: (Math.random() * 2 + 1).toFixed(2),
            avgTradeTime: Math.floor(Math.random() * 60 + 20) + 'm',
            successRate: (Math.random() * 15 + 60).toFixed(1) + '%'
        };

        Object.entries(metrics).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = value;
            }
        });
    }

    updateInsights() {
        // Update AI insights dynamically
        console.log('Updating AI insights...');
    }

    updateStrategies() {
        // Update strategy performance data
        console.log('Updating strategy performance...');
    }

    refreshKPI() {
        console.log('Refreshing KPI metrics...');
        this.updateKPIMetrics();
        this.showNotification('KPI metrics refreshed', 'success');
    }

    optimizeStrategies() {
        console.log('Optimizing strategies...');
        this.showNotification('Strategy optimization started...', 'info');
        
        // Simulate optimization process
        setTimeout(() => {
            this.showNotification('Strategies optimized successfully', 'success');
        }, 3000);
    }

    generateReport(reportType) {
        console.log(`Generating ${reportType} report...`);
        this.showNotification(`Generating ${reportType} report...`, 'info');
        
        // Simulate report generation
        setTimeout(() => {
            this.showNotification(`${reportType} report generated successfully`, 'success');
        }, 2000);
    }

    generateCustomReport() {
        console.log('Generating custom report...');
        this.showNotification('Generating custom report...', 'info');
        
        setTimeout(() => {
            this.showNotification('Custom report generated successfully', 'success');
        }, 2500);
    }

    exportReport() {
        console.log('Exporting report...');
        this.showNotification('Exporting report...', 'info');
        
        // Simulate export process
        setTimeout(() => {
            this.showNotification('Report exported successfully', 'success');
        }, 1500);
    }

    toggleFullscreen() {
        const chartContainer = document.querySelector('.chart-container');
        if (!chartContainer) return;

        if (!this.isFullscreen) {
            chartContainer.style.position = 'fixed';
            chartContainer.style.top = '0';
            chartContainer.style.left = '0';
            chartContainer.style.width = '100vw';
            chartContainer.style.height = '100vh';
            chartContainer.style.zIndex = '9999';
            chartContainer.style.background = 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)';
            this.isFullscreen = true;
        } else {
            chartContainer.style.position = '';
            chartContainer.style.top = '';
            chartContainer.style.left = '';
            chartContainer.style.width = '';
            chartContainer.style.height = '';
            chartContainer.style.zIndex = '';
            chartContainer.style.background = '';
            this.isFullscreen = false;
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

    customizeReports() {
        console.log('Opening report customization...');
        this.showNotification('Report customization opened', 'info');
    }

    startRealTimeUpdates() {
        // Update metrics every 30 seconds
        this.refreshIntervals.set('metrics', setInterval(() => {
            this.updateKPIMetrics();
        }, 30000));

        // Update charts every minute
        this.refreshIntervals.set('charts', setInterval(() => {
            if (this.charts.main) {
                // Add new data point
                const newValue = this.charts.main.data.datasets[0].data.slice(-1)[0] + 
                                (Math.random() - 0.3) * 2000;
                
                this.charts.main.data.datasets[0].data.push(Math.max(newValue, 90000));
                this.charts.main.data.labels.push(new Date().toLocaleTimeString());
                
                // Keep only last 30 points
                if (this.charts.main.data.datasets[0].data.length > 30) {
                    this.charts.main.data.datasets[0].data.shift();
                    this.charts.main.data.labels.shift();
                }
                
                this.charts.main.update('none');
            }
        }, 60000));
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'analytics_update':
                this.handleAnalyticsUpdate(data.payload);
                break;
            case 'trade_completed':
                this.handleTradeUpdate(data.payload);
                break;
            case 'risk_alert':
                this.handleRiskAlert(data.payload);
                break;
            case 'strategy_update':
                this.handleStrategyUpdate(data.payload);
                break;
        }
    }

    handleAnalyticsUpdate(payload) {
        console.log('Analytics update received:', payload);
        this.updateKPIMetrics();
    }

    handleTradeUpdate(payload) {
        console.log('Trade update received:', payload);
        // Update trade-related metrics
    }

    handleRiskAlert(payload) {
        console.log('Risk alert received:', payload);
        this.showNotification(`Risk Alert: ${payload.message}`, 'warning');
    }

    handleStrategyUpdate(payload) {
        console.log('Strategy update received:', payload);
        this.updateStrategies();
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

    destroy() {
        // Clear intervals
        this.refreshIntervals.forEach((interval) => {
            clearInterval(interval);
        });
        this.refreshIntervals.clear();

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

        console.log('Analytics Controller destroyed');
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

// Initialize Analytics Controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsController = new AnalyticsController();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.analyticsController) {
        window.analyticsController.destroy();
    }
});
