/**
 * Trading Layout Controller
 * Handles trading functionality and real-time data
 */

class TradingLayout {
    constructor() {
        this.websocket = null;
        this.chart = null;
        this.updateInterval = null;
        this.selectedPair = 'BTC/USDT';
        this.selectedTimeframe = '1h';
    }
    
    async initialize() {
        console.log('🚀 Initializing Trading Layout');
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize chart
            this.initializeChart();
            
            // Setup WebSocket if available
            if (window.layoutManager && window.layoutManager.websocket) {
                this.websocket = window.layoutManager.websocket;
                this.setupWebSocketHandlers();
            }
            
            // Start real-time updates
            this.startRealTimeUpdates();
            
            console.log('✅ Trading Layout initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Trading Layout:', error);
        }
    }
    
    setupEventListeners() {
        // Trading controls
        const enableTradingBtn = document.getElementById('enableTradingBtn');
        const refreshMarketsBtn = document.getElementById('refreshMarketsBtn');
        const scanMarketsBtn = document.getElementById('scanMarketsBtn');
        const optimizePortfolioBtn = document.getElementById('optimizePortfolioBtn');
        const riskAnalysisBtn = document.getElementById('riskAnalysisBtn');
        const backtestBtn = document.getElementById('backtestBtn');
        
        // Chart controls
        const pairSelector = document.getElementById('pairSelector');
        const timeframeSelector = document.getElementById('timeframeSelector');
        
        // Tab controls
        const tabBtns = document.querySelectorAll('.tab-btn');
        
        // Execute buttons
        const executeBtns = document.querySelectorAll('.execute-btn');
        
        if (enableTradingBtn) {
            enableTradingBtn.addEventListener('click', () => this.toggleLiveTrading());
        }
        
        if (refreshMarketsBtn) {
            refreshMarketsBtn.addEventListener('click', () => this.refreshMarketData());
        }
        
        if (scanMarketsBtn) {
            scanMarketsBtn.addEventListener('click', () => this.scanMarkets());
        }
        
        if (optimizePortfolioBtn) {
            optimizePortfolioBtn.addEventListener('click', () => this.optimizePortfolio());
        }
        
        if (riskAnalysisBtn) {
            riskAnalysisBtn.addEventListener('click', () => this.performRiskAnalysis());
        }
        
        if (backtestBtn) {
            backtestBtn.addEventListener('click', () => this.runBacktest());
        }
        
        if (pairSelector) {
            pairSelector.addEventListener('change', (e) => {
                this.selectedPair = e.target.value;
                this.updateChart();
            });
        }
        
        if (timeframeSelector) {
            timeframeSelector.addEventListener('change', (e) => {
                this.selectedTimeframe = e.target.value;
                this.updateChart();
            });
        }
        
        // Tab switching
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Execute opportunity buttons
        executeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const opportunityItem = e.target.closest('.opportunity-item');
                this.executeOpportunity(opportunityItem);
            });
        });
    }
    
    initializeChart() {
        const ctx = document.getElementById('priceChart');
        if (!ctx) return;
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(),
                datasets: [{
                    label: this.selectedPair,
                    data: this.generateMockPriceData(),
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
                        display: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        display: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
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
    
    generateTimeLabels() {
        const labels = [];
        const now = new Date();
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        return labels;
    }
    
    generateMockPriceData() {
        const basePrice = 43000;
        const data = [];
        let currentPrice = basePrice;
        
        for (let i = 0; i < 24; i++) {
            const change = (Math.random() - 0.5) * 1000;
            currentPrice += change;
            data.push(currentPrice);
        }
        
        return data;
    }
    
    updateChart() {
        if (!this.chart) return;
        
        // Update chart data
        this.chart.data.datasets[0].label = this.selectedPair;
        this.chart.data.datasets[0].data = this.generateMockPriceData();
        this.chart.update('none');
        
        // Update current price display
        const currentPrice = this.chart.data.datasets[0].data.slice(-1)[0];
        const priceElement = document.getElementById('currentPrice');
        if (priceElement) {
            priceElement.textContent = `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    }
    
    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }
    
    async toggleLiveTrading() {
        const btn = document.getElementById('enableTradingBtn');
        if (!btn) return;
        
        const isEnabled = btn.textContent.includes('Disable');
        
        try {
            const response = await fetch('/api/trading/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !isEnabled })
            });
            
            if (response.ok) {
                btn.textContent = isEnabled ? 'Enable Live Trading' : 'Disable Live Trading';
                btn.classList.toggle('btn-primary');
                btn.classList.toggle('btn-secondary');
                
                this.showNotification(
                    isEnabled ? 'Live trading disabled' : 'Live trading enabled',
                    isEnabled ? 'warning' : 'success'
                );
            }
        } catch (error) {
            console.error('Failed to toggle trading:', error);
            this.showNotification('Failed to toggle trading', 'error');
        }
    }
    
    async refreshMarketData() {
        const btn = document.getElementById('refreshMarketsBtn');
        if (btn) {
            btn.textContent = '⟳';
            btn.style.animation = 'spin 1s linear infinite';
        }
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update market stats with new data
            this.updateMarketStats();
            this.updateOpportunities();
            
            this.showNotification('Market data refreshed', 'success');
        } catch (error) {
            console.error('Failed to refresh market data:', error);
            this.showNotification('Failed to refresh market data', 'error');
        } finally {
            if (btn) {
                btn.textContent = '↻';
                btn.style.animation = '';
            }
        }
    }
    
    updateMarketStats() {
        const stats = {
            totalVolume: (Math.random() * 2 + 1).toFixed(1) + 'B',
            activePairs: Math.floor(Math.random() * 100 + 800),
            volatility: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
        };
        
        document.getElementById('totalVolume').textContent = '$' + stats.totalVolume;
        document.getElementById('activePairs').textContent = stats.activePairs;
        document.getElementById('volatility').textContent = stats.volatility;
    }
    
    updateOpportunities() {
        // Simulate new opportunities
        const opportunities = [
            { pair: 'BTC/USDT', profit: (Math.random() * 2).toFixed(1), confidence: Math.floor(Math.random() * 20 + 80) },
            { pair: 'ETH/USDT', profit: (Math.random() * 1.5).toFixed(1), confidence: Math.floor(Math.random() * 20 + 70) },
            { pair: 'ADA/USDT', profit: (Math.random() * 0.8).toFixed(1), confidence: Math.floor(Math.random() * 20 + 60) }
        ];
        
        const opportunitiesList = document.getElementById('opportunitiesList');
        if (opportunitiesList) {
            // Update existing opportunities with new data
            const items = opportunitiesList.querySelectorAll('.opportunity-item');
            items.forEach((item, index) => {
                if (opportunities[index]) {
                    const profitElement = item.querySelector('.opp-profit');
                    const confidenceElement = item.querySelector('.opp-confidence');
                    
                    if (profitElement) profitElement.textContent = `+${opportunities[index].profit}%`;
                    if (confidenceElement) confidenceElement.textContent = `${opportunities[index].confidence}%`;
                }
            });
        }
    }
    
    async executeOpportunity(opportunityItem) {
        if (!opportunityItem) return;
        
        const pair = opportunityItem.querySelector('.opp-pair').textContent;
        const profit = opportunityItem.querySelector('.opp-profit').textContent;
        
        try {
            // Simulate execution
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.showNotification(`Executed ${pair} opportunity (${profit})`, 'success');
            
            // Update positions or orders list
            this.addNewPosition(pair, profit);
            
        } catch (error) {
            console.error('Failed to execute opportunity:', error);
            this.showNotification('Failed to execute opportunity', 'error');
        }
    }
    
    addNewPosition(pair, profit) {
        // Add new position to the positions list
        const positionsList = document.getElementById('positionsList');
        if (!positionsList) return;
        
        const newPosition = document.createElement('div');
        newPosition.className = 'position-item profit';
        newPosition.innerHTML = `
            <div class="position-header">
                <span class="position-pair">${pair}</span>
                <span class="position-side long">LONG</span>
            </div>
            <div class="position-details">
                <div class="position-size">0.1 ${pair.split('/')[0]}</div>
                <div class="position-entry">Entry: Market</div>
                <div class="position-current">Status: Active</div>
                <div class="position-pnl positive">${profit}</div>
            </div>
            <div class="position-actions">
                <button class="btn-small btn-secondary">Close 25%</button>
                <button class="btn-small btn-primary">Close All</button>
            </div>
        `;
        
        positionsList.insertBefore(newPosition, positionsList.firstChild);
        
        // Update position count
        const positionCount = document.getElementById('positionCount');
        if (positionCount) {
            const current = parseInt(positionCount.textContent) || 0;
            positionCount.textContent = current + 1;
        }
    }
    
    async scanMarkets() {
        this.showNotification('Scanning markets for opportunities...', 'info');
        
        try {
            // Simulate market scan
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update opportunities list
            this.updateOpportunities();
            
            this.showNotification('Market scan complete - new opportunities found', 'success');
        } catch (error) {
            console.error('Market scan failed:', error);
            this.showNotification('Market scan failed', 'error');
        }
    }
    
    async optimizePortfolio() {
        this.showNotification('Optimizing portfolio allocation...', 'info');
        
        try {
            // Simulate optimization
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.showNotification('Portfolio optimization complete', 'success');
        } catch (error) {
            console.error('Portfolio optimization failed:', error);
            this.showNotification('Portfolio optimization failed', 'error');
        }
    }
    
    async performRiskAnalysis() {
        this.showNotification('Performing risk analysis...', 'info');
        
        try {
            // Simulate risk analysis
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showNotification('Risk analysis complete - portfolio within limits', 'success');
        } catch (error) {
            console.error('Risk analysis failed:', error);
            this.showNotification('Risk analysis failed', 'error');
        }
    }
    
    async runBacktest() {
        this.showNotification('Running strategy backtest...', 'info');
        
        try {
            // Simulate backtest
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            this.showNotification('Backtest complete - 68% win rate, 15% annual return', 'success');
        } catch (error) {
            console.error('Backtest failed:', error);
            this.showNotification('Backtest failed', 'error');
        }
    }
    
    startRealTimeUpdates() {
        // Update data every 30 seconds
        this.updateInterval = setInterval(() => {
            this.updateChart();
            this.updateMarketStats();
            
            // Randomly update opportunities
            if (Math.random() > 0.7) {
                this.updateOpportunities();
            }
        }, 30000);
    }
    
    setupWebSocketHandlers() {
        // Handle WebSocket messages for real-time trading data
        if (this.websocket) {
            // WebSocket handling is managed by layout manager
        }
    }
    
    handleWebSocketMessage(message) {
        if (message.type === 'price_update') {
            this.updateChart();
        } else if (message.type === 'opportunity_update') {
            this.updateOpportunities();
        } else if (message.type === 'position_update') {
            this.updatePositions();
        }
    }
    
    showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : type === 'warning' ? '#fbbf24' : '#00d4ff'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (this.chart) {
            this.chart.destroy();
        }
    }
}

// Make TradingLayout available globally
window.TradingLayout = TradingLayout;

// Auto-initialize if we're in the trading layout
document.addEventListener('app:initialized', (event) => {
    if (event.detail.appName === 'trading') {
        window.tradingLayout = new TradingLayout();
        window.tradingLayout.initialize();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
