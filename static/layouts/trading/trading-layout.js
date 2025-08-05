/**
 * Trading Layout Controller
 * Handles all trading-related functionality and real-time data updates
 */

class TradingLayout {
    constructor() {
        this.tradingSocket = null;
        this.isInitialized = false;
        this.currentData = {
            status: 'offline',
            portfolio: {},
            opportunities: [],
            risk: {},
            performance: []
        };
        
        // Chart instance
        this.performanceChart = null;
        
        this.init();
    }
    
    async init() {
        if (this.isInitialized) return;
        
        console.log('🔧 Initializing Trading Layout...');
        
        try {
            // Initialize chart
            await this.initializeChart();
            
            // Connect to trading WebSocket
            this.initializeTradingWebSocket();
            
            // Load initial data
            await this.loadInitialData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start periodic updates
            this.startPeriodicUpdates();
            
            this.isInitialized = true;
            console.log('✅ Trading Layout initialized');
            
            // Trigger trading ready event
            document.dispatchEvent(new CustomEvent('trading-layout-ready'));
            
        } catch (error) {
            console.error('❌ Failed to initialize Trading Layout:', error);
        }
    }
    
    async loadInitialData() {
        try {
            // Load trading status
            await this.updateTradingStatus();
            
            // Load portfolio data
            await this.updatePortfolioData();
            
            // Load arbitrage opportunities
            await this.updateArbitrageData();
            
            // Load risk data
            await this.updateRiskData();
            
            // Load performance data
            await this.updatePerformanceData();
            
        } catch (error) {
            console.error('Error loading initial trading data:', error);
        }
    }
    
    async updateTradingStatus() {
        try {
            const response = await fetch('/api/trading/status');
            const data = await response.json();
            
            this.currentData.status = data.engine_status || 'offline';
            this.updateStatusUI(data);
            
        } catch (error) {
            console.error('Error updating trading status:', error);
            this.currentData.status = 'error';
            this.updateStatusUI({ engine_status: 'error', error: error.message });
        }
    }
    
    updateStatusUI(data) {
        const statusIndicator = document.getElementById('tradingStatus');
        const startBtn = document.getElementById('startTradingBtn');
        const stopBtn = document.getElementById('stopTradingBtn');
        
        if (!statusIndicator) return;
        
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('span');
        
        if (data.error) {
            statusDot.className = 'status-dot error';
            statusText.textContent = 'Error';
            if (startBtn) startBtn.disabled = true;
            if (stopBtn) stopBtn.disabled = true;
        } else {
            switch (data.engine_status) {
                case 'running':
                    statusDot.className = 'status-dot online';
                    statusText.textContent = 'Active';
                    if (startBtn) startBtn.disabled = true;
                    if (stopBtn) stopBtn.disabled = false;
                    break;
                case 'stopped':
                    statusDot.className = 'status-dot offline';
                    statusText.textContent = 'Stopped';
                    if (startBtn) startBtn.disabled = false;
                    if (stopBtn) stopBtn.disabled = true;
                    break;
                default:
                    statusDot.className = 'status-dot warning';
                    statusText.textContent = 'Initializing';
                    if (startBtn) startBtn.disabled = true;
                    if (stopBtn) stopBtn.disabled = true;
            }
        }
    }
    
    async updatePortfolioData() {
        try {
            const response = await fetch('/api/trading/status');
            const data = await response.json();
            
            if (data.portfolio) {
                this.currentData.portfolio = data.portfolio;
                this.updatePortfolioUI(data.portfolio);
            }
            
        } catch (error) {
            console.error('Error updating portfolio data:', error);
        }
    }
    
    updatePortfolioUI(portfolio) {
        // Update sidebar summary
        const totalValue = document.getElementById('totalValue');
        const dailyPnL = document.getElementById('dailyPnL');
        const activePositions = document.getElementById('activePositions');
        
        if (totalValue) {
            totalValue.textContent = this.formatCurrency(portfolio.total_value || 0);
        }
        
        if (dailyPnL) {
            const pnl = portfolio.daily_pnl || 0;
            dailyPnL.textContent = this.formatCurrency(pnl);
            dailyPnL.className = pnl >= 0 ? 'positive' : 'negative';
        }
        
        if (activePositions) {
            activePositions.textContent = portfolio.active_positions || 0;
        }
        
        // Update detailed portfolio panel
        const portfolioTotal = document.getElementById('portfolioTotal');
        const availableCash = document.getElementById('availableCash');
        const dailyPnLDetailed = document.getElementById('dailyPnLDetailed');
        const totalPnL = document.getElementById('totalPnL');
        
        if (portfolioTotal) {
            portfolioTotal.textContent = this.formatCurrency(portfolio.total_value || 0);
        }
        
        if (availableCash) {
            availableCash.textContent = this.formatCurrency(portfolio.available_cash || 0);
        }
        
        if (dailyPnLDetailed) {
            const pnl = portfolio.daily_pnl || 0;
            dailyPnLDetailed.textContent = this.formatCurrency(pnl);
            dailyPnLDetailed.className = `metric-value ${pnl >= 0 ? 'positive' : 'negative'}`;
        }
        
        if (totalPnL) {
            const pnl = portfolio.total_pnl || 0;
            totalPnL.textContent = this.formatCurrency(pnl);
            totalPnL.className = `metric-value ${pnl >= 0 ? 'positive' : 'negative'}`;
        }
        
        // Update positions list
        this.updatePositionsList(portfolio.positions || []);
    }
    
    updatePositionsList(positions) {
        const positionsList = document.getElementById('positionsList');
        if (!positionsList) return;
        
        if (positions.length === 0) {
            positionsList.innerHTML = `
                <div class="no-positions">
                    <i class="fas fa-chart-line"></i>
                    <span>No active positions</span>
                </div>
            `;
            return;
        }
        
        positionsList.innerHTML = positions.map(position => `
            <div class="position-item">
                <div class="position-header">
                    <span class="position-symbol">${position.symbol}</span>
                    <span class="position-pnl ${position.pnl >= 0 ? 'positive' : 'negative'}">
                        ${this.formatCurrency(position.pnl)}
                    </span>
                </div>
                <div class="position-details">
                    <span>Size: ${position.size}</span>
                    <span>Entry: ${this.formatCurrency(position.entry_price)}</span>
                </div>
            </div>
        `).join('');
    }
    
    async updateArbitrageData() {
        try {
            const response = await fetch('/api/trading/arbitrage/opportunities');
            const data = await response.json();
            
            if (data.opportunities) {
                this.currentData.opportunities = data.opportunities;
                this.updateArbitrageUI(data.opportunities);
            }
            
        } catch (error) {
            console.error('Error updating arbitrage data:', error);
        }
    }
    
    updateArbitrageUI(opportunities) {
        const opportunitiesList = document.getElementById('opportunitiesList');
        if (!opportunitiesList) return;
        
        if (opportunities.length === 0) {
            opportunitiesList.innerHTML = `
                <div class="opportunity-item loading">
                    <i class="fas fa-search"></i>
                    <span>No opportunities found</span>
                </div>
            `;
            return;
        }
        
        opportunitiesList.innerHTML = opportunities.slice(0, 5).map(opp => `
            <div class="opportunity-item">
                <div class="opportunity-header">
                    <span class="opportunity-type">${opp.type}</span>
                    <span class="opportunity-profit">${(opp.profit_potential * 100).toFixed(2)}%</span>
                </div>
                <div class="opportunity-details">
                    <div class="detail-item">
                        <span>Symbol:</span>
                        <span>${opp.symbol}</span>
                    </div>
                    <div class="detail-item">
                        <span>Volume:</span>
                        <span>${this.formatCurrency(opp.volume)}</span>
                    </div>
                    <div class="detail-item">
                        <span>Buy:</span>
                        <span>${opp.buy_exchange}</span>
                    </div>
                    <div class="detail-item">
                        <span>Sell:</span>
                        <span>${opp.sell_exchange}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    async updateRiskData() {
        try {
            const response = await fetch('/api/trading/risk/status');
            const data = await response.json();
            
            if (data.risk_metrics) {
                this.currentData.risk = data.risk_metrics;
                this.updateRiskUI(data.risk_metrics);
            }
            
        } catch (error) {
            console.error('Error updating risk data:', error);
        }
    }
    
    updateRiskUI(riskMetrics) {
        // Update exposure gauge
        this.updateGauge('exposureGauge', 'exposureValue', 
            riskMetrics.exposure_percentage || 0, '%');
        
        // Update drawdown gauge
        this.updateGauge('drawdownGauge', 'drawdownValue', 
            riskMetrics.drawdown_percentage || 0, '%');
        
        // Update risk score gauge
        this.updateGauge('riskScoreGauge', 'riskScoreValue', 
            riskMetrics.risk_score || 0, '');
        
        // Update risk alerts
        this.updateRiskAlerts(riskMetrics.alerts || []);
    }
    
    updateGauge(gaugeId, valueId, value, suffix) {
        const gauge = document.getElementById(gaugeId);
        const valueEl = document.getElementById(valueId);
        
        if (gauge) {
            gauge.style.width = `${Math.min(value, 100)}%`;
        }
        
        if (valueEl) {
            valueEl.textContent = `${value.toFixed(1)}${suffix}`;
        }
    }
    
    updateRiskAlerts(alerts) {
        const alertsContainer = document.getElementById('riskAlerts');
        if (!alertsContainer) return;
        
        if (alerts.length === 0) {
            alertsContainer.innerHTML = '';
            return;
        }
        
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.level || 'info'}">
                ${alert.message}
            </div>
        `).join('');
    }
    
    async updatePerformanceData() {
        try {
            const response = await fetch('/api/trading/performance');
            const data = await response.json();
            
            if (data.performance) {
                this.currentData.performance = data.performance;
                this.updatePerformanceUI(data.performance);
            }
            
        } catch (error) {
            console.error('Error updating performance data:', error);
        }
    }
    
    updatePerformanceUI(performance) {
        // Update chart stats
        const totalTrades = document.getElementById('totalTrades');
        const winRate = document.getElementById('winRate');
        const avgProfit = document.getElementById('avgProfit');
        const sharpeRatio = document.getElementById('sharpeRatio');
        
        if (totalTrades) {
            totalTrades.textContent = performance.total_trades || 0;
        }
        
        if (winRate) {
            winRate.textContent = `${(performance.win_rate * 100 || 0).toFixed(1)}%`;
        }
        
        if (avgProfit) {
            avgProfit.textContent = this.formatCurrency(performance.avg_profit || 0);
        }
        
        if (sharpeRatio) {
            sharpeRatio.textContent = (performance.sharpe_ratio || 0).toFixed(2);
        }
        
        // Update chart
        this.updatePerformanceChart(performance.equity_curve || []);
    }
    
    async initializeChart() {
        // Load Chart.js if not already loaded
        if (typeof Chart === 'undefined') {
            await this.loadScript('https://cdn.jsdelivr.net/npm/chart.js');
        }
        
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        this.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Portfolio Value',
                    data: [],
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        });
    }
    
    updatePerformanceChart(equityCurve) {
        if (!this.performanceChart || !equityCurve.length) return;
        
        const labels = equityCurve.map((_, index) => index);
        const data = equityCurve.map(point => point.value);
        
        this.performanceChart.data.labels = labels;
        this.performanceChart.data.datasets[0].data = data;
        this.performanceChart.update('none');
    }
    
    initializeTradingWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws/trading`;
            
            this.tradingSocket = new WebSocket(wsUrl);
            
            this.tradingSocket.onopen = () => {
                console.log('✅ Trading WebSocket connected');
            };
            
            this.tradingSocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleTradingWebSocketMessage(data);
            };
            
            this.tradingSocket.onclose = () => {
                console.log('❌ Trading WebSocket disconnected');
                // Attempt to reconnect after 3 seconds
                setTimeout(() => this.initializeTradingWebSocket(), 3000);
            };
            
            this.tradingSocket.onerror = (error) => {
                console.error('Trading WebSocket error:', error);
            };
            
        } catch (error) {
            console.error('Failed to initialize Trading WebSocket:', error);
        }
    }
    
    handleTradingWebSocketMessage(data) {
        switch (data.type) {
            case 'status_update':
                this.updateStatusUI(data.data);
                break;
                
            case 'portfolio_update':
                this.updatePortfolioUI(data.data);
                break;
                
            case 'opportunity_update':
                this.updateArbitrageUI(data.data.opportunities || []);
                break;
                
            case 'risk_update':
                this.updateRiskUI(data.data);
                break;
                
            case 'performance_update':
                this.updatePerformanceUI(data.data);
                break;
                
            default:
                console.log('Unknown trading message type:', data.type);
        }
    }
    
    setupEventListeners() {
        // Listen for layout events
        document.addEventListener('layout-layoutSwitched', (e) => {
            if (e.detail.to === 'trading') {
                this.refresh();
            }
        });
    }
    
    startPeriodicUpdates() {
        // Update data every 5 seconds
        setInterval(() => {
            if (this.isInitialized) {
                this.loadInitialData();
            }
        }, 5000);
    }
    
    // Utility functions
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }
    
    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Public API
    async startTrading() {
        try {
            const response = await fetch('/api/trading/start', { method: 'POST' });
            const data = await response.json();
            
            if (data.success) {
                console.log('Trading started successfully');
                await this.updateTradingStatus();
            } else {
                throw new Error(data.error || 'Failed to start trading');
            }
        } catch (error) {
            console.error('Error starting trading:', error);
            alert(`Failed to start trading: ${error.message}`);
        }
    }
    
    async stopTrading() {
        try {
            const response = await fetch('/api/trading/stop', { method: 'POST' });
            const data = await response.json();
            
            if (data.success) {
                console.log('Trading stopped successfully');
                await this.updateTradingStatus();
            } else {
                throw new Error(data.error || 'Failed to stop trading');
            }
        } catch (error) {
            console.error('Error stopping trading:', error);
            alert(`Failed to stop trading: ${error.message}`);
        }
    }
    
    async emergencyStop() {
        if (!confirm('Are you sure you want to trigger emergency stop? This will close all positions immediately.')) {
            return;
        }
        
        try {
            const response = await fetch('/api/trading/emergency-stop', { method: 'POST' });
            const data = await response.json();
            
            if (data.success) {
                console.log('Emergency stop triggered successfully');
                await this.updateTradingStatus();
            } else {
                throw new Error(data.error || 'Failed to trigger emergency stop');
            }
        } catch (error) {
            console.error('Error triggering emergency stop:', error);
            alert(`Failed to trigger emergency stop: ${error.message}`);
        }
    }
    
    async toggleStrategy(strategyName, enabled) {
        try {
            const response = await fetch('/api/trading/strategy/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ strategy: strategyName, enabled })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log(`Strategy ${strategyName} ${enabled ? 'enabled' : 'disabled'}`);
            } else {
                throw new Error(data.error || 'Failed to toggle strategy');
            }
        } catch (error) {
            console.error('Error toggling strategy:', error);
            alert(`Failed to toggle strategy: ${error.message}`);
        }
    }
    
    refresh() {
        this.loadInitialData();
    }
}

// Initialize trading layout when loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!window.tradingLayout) {
        window.tradingLayout = new TradingLayout();
    }
});

// Global functions for compatibility
window.startTrading = () => {
    if (window.tradingLayout) {
        window.tradingLayout.startTrading();
    }
};

window.stopTrading = () => {
    if (window.tradingLayout) {
        window.tradingLayout.stopTrading();
    }
};

window.emergencyStop = () => {
    if (window.tradingLayout) {
        window.tradingLayout.emergencyStop();
    }
};

window.toggleStrategy = (strategy, enabled) => {
    if (window.tradingLayout) {
        window.tradingLayout.toggleStrategy(strategy, enabled);
    }
};

window.refreshArbitrageData = () => {
    if (window.tradingLayout) {
        window.tradingLayout.updateArbitrageData();
    }
};

window.refreshPortfolioData = () => {
    if (window.tradingLayout) {
        window.tradingLayout.updatePortfolioData();
    }
};

window.refreshRiskData = () => {
    if (window.tradingLayout) {
        window.tradingLayout.updateRiskData();
    }
};

window.refreshChartData = () => {
    if (window.tradingLayout) {
        window.tradingLayout.updatePerformanceData();
    }
};

window.updateChartTimeframe = (timeframe) => {
    console.log(`Chart timeframe changed to: ${timeframe}`);
    // Implement timeframe change logic
};

window.switchChart = (chartType) => {
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelector(`[data-chart="${chartType}"]`).classList.add('active');
    
    console.log(`Switched to ${chartType} chart`);
    // Implement chart switching logic
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TradingLayout;
}
