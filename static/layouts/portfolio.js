/**
 * Portfolio Layout Controller
 * Handles portfolio management and analytics
 */

class PortfolioLayout {
    constructor() {
        this.websocket = null;
        this.allocationChart = null;
        this.performanceChart = null;
        this.holdings = [];
        this.selectedPeriod = '30d';
    }
    
    async initialize() {
        console.log('🚀 Initializing Portfolio Layout');
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize charts
            this.initializeCharts();
            
            // Load portfolio data
            await this.loadPortfolioData();
            
            // Setup WebSocket if available
            if (window.layoutManager && window.layoutManager.websocket) {
                this.websocket = window.layoutManager.websocket;
                this.setupWebSocketHandlers();
            }
            
            console.log('✅ Portfolio Layout initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Portfolio Layout:', error);
        }
    }
    
    setupEventListeners() {
        // Header controls
        const rebalanceBtn = document.getElementById('rebalanceBtn');
        const optimizeBtn = document.getElementById('optimizeBtn');
        
        // Period selectors
        const allocationPeriod = document.getElementById('allocationPeriod');
        const performancePeriod = document.getElementById('performancePeriod');
        
        // Timeframe buttons
        const timeframeBtns = document.querySelectorAll('.timeframe-btn');
        
        // Tool buttons
        const rebalanceTool = document.getElementById('rebalanceTool');
        const optimizeTool = document.getElementById('optimizeTool');
        const backtestTool = document.getElementById('backtestTool');
        const analysisTool = document.getElementById('analysisTool');
        
        // Holdings controls
        const holdingsSearch = document.getElementById('holdingsSearch');
        const sortBy = document.getElementById('sortBy');
        
        // Action buttons
        const actionBtns = document.querySelectorAll('.action-btn');
        
        if (rebalanceBtn) {
            rebalanceBtn.addEventListener('click', () => this.rebalancePortfolio());
        }
        
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => this.optimizePortfolio());
        }
        
        if (allocationPeriod) {
            allocationPeriod.addEventListener('change', (e) => this.updateAllocationChart(e.target.value));
        }
        
        if (performancePeriod) {
            performancePeriod.addEventListener('change', (e) => {
                this.selectedPeriod = e.target.value;
                this.updatePerformanceData();
            });
        }
        
        timeframeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                timeframeBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedPeriod = e.target.dataset.period;
                this.updatePerformanceChart();
            });
        });
        
        if (rebalanceTool) {
            rebalanceTool.addEventListener('click', () => this.showRebalanceDialog());
        }
        
        if (optimizeTool) {
            optimizeTool.addEventListener('click', () => this.showOptimizationDialog());
        }
        
        if (backtestTool) {
            backtestTool.addEventListener('click', () => this.runBacktest());
        }
        
        if (analysisTool) {
            analysisTool.addEventListener('click', () => this.showAnalysisDialog());
        }
        
        if (holdingsSearch) {
            holdingsSearch.addEventListener('input', (e) => this.filterHoldings(e.target.value));
        }
        
        if (sortBy) {
            sortBy.addEventListener('change', (e) => this.sortHoldings(e.target.value));
        }
        
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.textContent.toLowerCase();
                const row = e.target.closest('.holding-row');
                this.handleHoldingAction(action, row);
            });
        });
    }
    
    initializeCharts() {
        this.initializeAllocationChart();
        this.initializePerformanceChart();
    }
    
    initializeAllocationChart() {
        const ctx = document.getElementById('allocationChart');
        if (!ctx) return;
        
        this.allocationChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Bitcoin', 'Ethereum', 'Altcoins', 'Stablecoins'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#00ff88', '#00d4ff', '#fbbf24', '#8b5cf6'],
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
                    }
                }
            }
        });
    }
    
    initializePerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;
        
        this.performanceChart = new Chart(ctx, {
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
                            color: '#9ca3af',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
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
        
        switch (this.selectedPeriod) {
            case '1d':
                for (let i = 23; i >= 0; i--) {
                    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
                    labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                }
                break;
            case '7d':
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                    labels.push(date.toLocaleDateString([], { weekday: 'short' }));
                }
                break;
            case '30d':
                for (let i = 29; i >= 0; i--) {
                    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                    labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
                }
                break;
            default:
                for (let i = 29; i >= 0; i--) {
                    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                    labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
                }
        }
        
        return labels;
    }
    
    generatePerformanceData() {
        const baseValue = 125450;
        const data = [];
        let currentValue = baseValue * 0.9; // Start 10% lower
        
        const points = this.selectedPeriod === '1d' ? 24 : this.selectedPeriod === '7d' ? 7 : 30;
        const volatility = this.selectedPeriod === '1d' ? 0.02 : 0.05;
        
        for (let i = 0; i < points; i++) {
            const change = (Math.random() - 0.4) * currentValue * volatility; // Slight upward bias
            currentValue += change;
            data.push(Math.round(currentValue));
        }
        
        return data;
    }
    
    async loadPortfolioData() {
        try {
            // Simulate API call to load portfolio data
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.holdings = [
                {
                    symbol: 'BTC',
                    name: 'Bitcoin',
                    amount: 1.3052,
                    value: 56452.50,
                    allocation: 45,
                    change: 2.3,
                    icon: '₿'
                },
                {
                    symbol: 'ETH',
                    name: 'Ethereum',
                    amount: 11.708,
                    value: 31362.50,
                    allocation: 25,
                    change: 1.8,
                    icon: 'Ξ'
                },
                {
                    symbol: 'ADA',
                    name: 'Cardano',
                    amount: 18250,
                    value: 15045.00,
                    allocation: 12,
                    change: -0.5,
                    icon: '⟐'
                },
                {
                    symbol: 'USDC',
                    name: 'USD Coin',
                    amount: 12545,
                    value: 12545.00,
                    allocation: 10,
                    change: 0.0,
                    icon: '$'
                }
            ];
            
            this.updatePortfolioSummary();
            
        } catch (error) {
            console.error('Failed to load portfolio data:', error);
            this.showNotification('Failed to load portfolio data', 'error');
        }
    }
    
    updatePortfolioSummary() {
        const totalValue = this.holdings.reduce((sum, holding) => sum + holding.value, 0);
        const totalChange = this.holdings.reduce((sum, holding) => sum + (holding.value * holding.change / 100), 0);
        const totalChangePercent = (totalChange / totalValue) * 100;
        
        const totalValueEl = document.getElementById('totalValue');
        const dailyChangeEl = document.getElementById('dailyChange');
        
        if (totalValueEl) {
            totalValueEl.textContent = `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        
        if (dailyChangeEl) {
            const changeClass = totalChange >= 0 ? 'positive' : 'negative';
            const changeSign = totalChange >= 0 ? '+' : '';
            dailyChangeEl.textContent = `${changeSign}$${totalChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${changeSign}${totalChangePercent.toFixed(1)}%)`;
            dailyChangeEl.className = `summary-change ${changeClass}`;
        }
    }
    
    updateAllocationChart(period) {
        if (!this.allocationChart) return;
        
        // Simulate different allocations based on period
        let data, labels;
        
        switch (period) {
            case 'target':
                data = [40, 30, 20, 10];
                labels = ['Bitcoin (Target)', 'Ethereum (Target)', 'Altcoins (Target)', 'Stablecoins (Target)'];
                break;
            case 'optimal':
                data = [35, 35, 25, 5];
                labels = ['Bitcoin (Optimal)', 'Ethereum (Optimal)', 'Altcoins (Optimal)', 'Stablecoins (Optimal)'];
                break;
            default:
                data = [45, 25, 20, 10];
                labels = ['Bitcoin', 'Ethereum', 'Altcoins', 'Stablecoins'];
        }
        
        this.allocationChart.data.datasets[0].data = data;
        this.allocationChart.data.labels = labels;
        this.allocationChart.update();
    }
    
    updatePerformanceChart() {
        if (!this.performanceChart) return;
        
        this.performanceChart.data.labels = this.generateTimeLabels();
        this.performanceChart.data.datasets[0].data = this.generatePerformanceData();
        this.performanceChart.update();
        
        this.updatePerformanceData();
    }
    
    updatePerformanceData() {
        const periodReturn = this.calculatePeriodReturn();
        const periodReturnEl = document.getElementById('periodReturn');
        
        if (periodReturnEl) {
            const returnClass = periodReturn >= 0 ? 'positive' : 'negative';
            const returnSign = periodReturn >= 0 ? '+' : '';
            periodReturnEl.textContent = `${returnSign}${periodReturn.toFixed(1)}%`;
            periodReturnEl.className = `perf-value ${returnClass}`;
        }
    }
    
    calculatePeriodReturn() {
        // Simulate period return calculation
        const returns = {
            '1d': 1.2,
            '7d': 3.5,
            '30d': 12.5,
            '90d': 28.3,
            '1y': 85.7,
            'all': 156.2
        };
        
        return returns[this.selectedPeriod] || 12.5;
    }
    
    async rebalancePortfolio() {
        this.showNotification('Starting portfolio rebalancing...', 'info');
        
        try {
            // Simulate rebalancing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update allocation chart to target allocation
            this.updateAllocationChart('target');
            
            this.showNotification('Portfolio rebalanced successfully', 'success');
            this.addAlert('success', 'Portfolio rebalancing completed successfully', 'now');
            
        } catch (error) {
            console.error('Rebalancing failed:', error);
            this.showNotification('Portfolio rebalancing failed', 'error');
        }
    }
    
    async optimizePortfolio() {
        this.showNotification('Optimizing portfolio allocation...', 'info');
        
        try {
            // Simulate optimization
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Update allocation chart to optimal allocation
            this.updateAllocationChart('optimal');
            
            this.showNotification('Portfolio optimization complete', 'success');
            
        } catch (error) {
            console.error('Optimization failed:', error);
            this.showNotification('Portfolio optimization failed', 'error');
        }
    }
    
    showRebalanceDialog() {
        this.showNotification('Opening rebalance settings...', 'info');
        // In a real implementation, this would open a modal dialog
    }
    
    showOptimizationDialog() {
        this.showNotification('Opening optimization settings...', 'info');
        // In a real implementation, this would open a modal dialog
    }
    
    async runBacktest() {
        this.showNotification('Running portfolio backtest...', 'info');
        
        try {
            // Simulate backtest
            await new Promise(resolve => setTimeout(resolve, 4000));
            
            this.showNotification('Backtest complete - 73% win rate, 22% annual return', 'success');
            
        } catch (error) {
            console.error('Backtest failed:', error);
            this.showNotification('Backtest failed', 'error');
        }
    }
    
    showAnalysisDialog() {
        this.showNotification('Opening portfolio analysis...', 'info');
        // In a real implementation, this would open a detailed analysis view
    }
    
    filterHoldings(searchTerm) {
        const rows = document.querySelectorAll('.holding-row');
        
        rows.forEach(row => {
            const assetName = row.querySelector('.asset-name').textContent.toLowerCase();
            const assetSymbol = row.querySelector('.asset-symbol').textContent.toLowerCase();
            
            if (assetName.includes(searchTerm.toLowerCase()) || assetSymbol.includes(searchTerm.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    sortHoldings(sortBy) {
        // In a real implementation, this would sort the holdings table
        this.showNotification(`Sorting holdings by ${sortBy}`, 'info');
    }
    
    handleHoldingAction(action, row) {
        if (!row) return;
        
        const symbol = row.querySelector('.asset-symbol').textContent;
        
        switch (action) {
            case 'trade':
                this.openTradeDialog(symbol);
                break;
            case 'details':
                this.showAssetDetails(symbol);
                break;
        }
    }
    
    openTradeDialog(symbol) {
        this.showNotification(`Opening trade dialog for ${symbol}`, 'info');
        // In a real implementation, this would open a trading interface
    }
    
    showAssetDetails(symbol) {
        this.showNotification(`Showing details for ${symbol}`, 'info');
        // In a real implementation, this would show detailed asset information
    }
    
    addAlert(type, message, time) {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;
        
        const alertItem = document.createElement('div');
        alertItem.className = `alert-item ${type}`;
        alertItem.innerHTML = `
            <div class="alert-icon">${type === 'success' ? '✅' : '⚠️'}</div>
            <div class="alert-content">
                <div class="alert-message">${message}</div>
                <div class="alert-time">${time}</div>
            </div>
        `;
        
        alertsList.insertBefore(alertItem, alertsList.firstChild);
        
        // Remove oldest alert if more than 3
        if (alertsList.children.length > 3) {
            alertsList.removeChild(alertsList.lastChild);
        }
    }
    
    setupWebSocketHandlers() {
        // Handle WebSocket messages for real-time portfolio updates
        if (this.websocket) {
            // WebSocket handling is managed by layout manager
        }
    }
    
    handleWebSocketMessage(message) {
        if (message.type === 'portfolio_update') {
            this.updatePortfolioSummary();
        } else if (message.type === 'price_update') {
            this.updateHoldingsPrices(message.data);
        } else if (message.type === 'allocation_update') {
            this.updateAllocationChart('current');
        }
    }
    
    updateHoldingsPrices(priceData) {
        // Update holdings with new price data
        // In a real implementation, this would update the holdings table
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
        if (this.allocationChart) {
            this.allocationChart.destroy();
        }
        
        if (this.performanceChart) {
            this.performanceChart.destroy();
        }
    }
}

// Make PortfolioLayout available globally
window.PortfolioLayout = PortfolioLayout;

// Auto-initialize if we're in the portfolio layout
document.addEventListener('app:initialized', (event) => {
    if (event.detail.appName === 'portfolio') {
        window.portfolioLayout = new PortfolioLayout();
        window.portfolioLayout.initialize();
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
`;
document.head.appendChild(style);
