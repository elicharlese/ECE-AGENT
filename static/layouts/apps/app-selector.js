/**
 * App Selector Component
 * Handles the top navigation for switching between different app layouts
 */

class AppSelector {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateStatus();
        
        // Listen for layout changes
        document.addEventListener('layout-layoutLoaded', (e) => {
            this.updateActiveCount();
            this.updateStatus();
        });
        
        document.addEventListener('layout-layoutRemoved', (e) => {
            this.updateActiveCount();
        });
        
        document.addEventListener('layout-layoutSwitched', (e) => {
            this.updateActiveButton(e.detail.to);
        });
    }
    
    setupEventListeners() {
        // Button hover effects
        document.querySelectorAll('.app-button').forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target);
            });
            
            button.addEventListener('mouseleave', (e) => {
                this.hideTooltip();
            });
        });
    }
    
    updateActiveButton(layoutName) {
        document.querySelectorAll('.app-button').forEach(button => {
            button.classList.remove('active');
        });
        
        const activeButton = document.querySelector(`[data-layout="${layoutName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
    
    updateActiveCount() {
        const activeCount = window.layoutManager ? window.layoutManager.getActiveApps().length : 1;
        const countElement = document.getElementById('active-layout-count');
        if (countElement) {
            countElement.textContent = activeCount;
        }
    }
    
    updateStatus() {
        // Update MCP connection status
        this.checkMCPStatus().then(isConnected => {
            const statusDot = document.querySelector('.status-dot');
            const statusText = document.querySelector('.status-indicator span');
            
            if (statusDot && statusText) {
                statusDot.className = `status-dot ${isConnected ? 'online' : 'offline'}`;
                statusText.textContent = isConnected ? 'MCP Connected' : 'MCP Disconnected';
            }
        });
    }
    
    async checkMCPStatus() {
        try {
            // Check if MCP servers are connected
            const response = await fetch('/api/mcp/status');
            const data = await response.json();
            return data.connected || false;
        } catch (error) {
            console.warn('Could not check MCP status:', error);
            return false;
        }
    }
    
    showTooltip(element) {
        const tooltip = element.getAttribute('title');
        if (tooltip) {
            // Create tooltip element
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'app-tooltip';
            tooltipEl.textContent = tooltip;
            
            // Position tooltip
            const rect = element.getBoundingClientRect();
            tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
            tooltipEl.style.top = `${rect.bottom + 8}px`;
            
            document.body.appendChild(tooltipEl);
            
            // Remove title to prevent browser tooltip
            element.setAttribute('data-original-title', tooltip);
            element.removeAttribute('title');
        }
    }
    
    hideTooltip() {
        const tooltip = document.querySelector('.app-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
        
        // Restore original title
        document.querySelectorAll('[data-original-title]').forEach(el => {
            el.setAttribute('title', el.getAttribute('data-original-title'));
            el.removeAttribute('data-original-title');
        });
    }
}

// Initialize when the app selector is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the layout manager to initialize
    setTimeout(() => {
        window.appSelector = new AppSelector();
    }, 100);
});
