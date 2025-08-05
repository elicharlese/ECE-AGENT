/**
 * AGENT Layout Manager
 * Handles dynamic loading and switching between different app layouts
 * while maintaining the base chat functionality
 */

class LayoutManager {
    constructor() {
        this.currentLayout = 'base';
        this.activeApps = new Set();
        this.layoutCache = new Map();
        this.componentCache = new Map();
        
        // Layout configurations
        this.layouts = {
            base: {
                name: 'Chat',
                path: '/static/layouts/base',
                components: ['chat-interface'],
                persistent: true
            },
            trading: {
                name: 'Trading',
                path: '/static/layouts/trading',
                components: ['arbitrage-panel', 'portfolio-panel', 'risk-panel', 'charts-panel'],
                persistent: false,
                requiresAuth: true
            },
            analytics: {
                name: 'Analytics',
                path: '/static/layouts/analytics',
                components: ['data-panel', 'insights-panel'],
                persistent: false
            }
        };
        
        this.init();
    }
    
    async init() {
        console.log('🔧 Initializing AGENT Layout Manager...');
        
        // Load base layout first
        await this.loadLayout('base');
        
        // Setup app selector
        await this.setupAppSelector();
        
        // Setup layout container
        this.setupLayoutContainer();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Layout Manager initialized');
    }
    
    setupLayoutContainer() {
        // Create main layout container if it doesn't exist
        if (!document.getElementById('layout-container')) {
            const container = document.createElement('div');
            container.id = 'layout-container';
            container.className = 'layout-container';
            
            // Insert after the app selector or at the beginning of body
            const appSelector = document.getElementById('app-selector');
            if (appSelector) {
                appSelector.after(container);
            } else {
                document.body.prepend(container);
            }
        }
    }
    
    async setupAppSelector() {
        try {
            const response = await fetch('/static/layouts/apps/app-selector.html');
            const html = await response.text();
            
            // Insert app selector at the top of the page
            const selectorContainer = document.createElement('div');
            selectorContainer.innerHTML = html;
            document.body.prepend(selectorContainer.firstElementChild);
            
            // Load app selector JavaScript
            await this.loadScript('/static/layouts/apps/app-selector.js');
            
        } catch (error) {
            console.error('Failed to load app selector:', error);
        }
    }
    
    async loadLayout(layoutName, options = {}) {
        console.log(`🔄 Loading layout: ${layoutName}`);
        
        try {
            const layout = this.layouts[layoutName];
            if (!layout) {
                throw new Error(`Layout '${layoutName}' not found`);
            }
            
            // Check authentication if required
            if (layout.requiresAuth && !this.isAuthenticated()) {
                throw new Error(`Layout '${layoutName}' requires authentication`);
            }
            
            // Load layout HTML if not cached
            let layoutHTML = this.layoutCache.get(layoutName);
            if (!layoutHTML) {
                const response = await fetch(`${layout.path}/${layoutName}-layout.html`);
                layoutHTML = await response.text();
                this.layoutCache.set(layoutName, layoutHTML);
            }
            
            // Load layout CSS
            await this.loadCSS(`${layout.path}/${layoutName}-layout.css`);
            
            // Create layout container
            const layoutContainer = document.getElementById('layout-container');
            const layoutDiv = document.createElement('div');
            layoutDiv.id = `${layoutName}-layout`;
            layoutDiv.className = `layout ${layoutName}-layout ${options.additive ? 'additive' : 'primary'}`;
            layoutDiv.innerHTML = layoutHTML;
            
            // If not additive, clear existing layouts (except persistent ones)
            if (!options.additive) {
                this.clearNonPersistentLayouts();
            }
            
            layoutContainer.appendChild(layoutDiv);
            
            // Load layout components
            await this.loadLayoutComponents(layoutName, layout);
            
            // Load layout JavaScript
            await this.loadScript(`${layout.path}/${layoutName}-layout.js`);
            
            // Update current layout
            if (!options.additive) {
                this.currentLayout = layoutName;
            }
            
            // Add to active apps
            this.activeApps.add(layoutName);
            
            // Trigger layout loaded event
            this.triggerEvent('layoutLoaded', { layout: layoutName, options });
            
            console.log(`✅ Layout '${layoutName}' loaded successfully`);
            
        } catch (error) {
            console.error(`❌ Failed to load layout '${layoutName}':`, error);
            throw error;
        }
    }
    
    async loadLayoutComponents(layoutName, layout) {
        const componentPromises = layout.components.map(async (componentName) => {
            try {
                const componentHTML = await this.loadComponent(layoutName, componentName);
                const componentContainer = document.querySelector(`#${layoutName}-layout .${componentName}-container`);
                if (componentContainer) {
                    componentContainer.innerHTML = componentHTML;
                }
            } catch (error) {
                console.warn(`Warning: Could not load component '${componentName}' for layout '${layoutName}':`, error);
            }
        });
        
        await Promise.all(componentPromises);
    }
    
    async loadComponent(layoutName, componentName) {
        const cacheKey = `${layoutName}-${componentName}`;
        
        let componentHTML = this.componentCache.get(cacheKey);
        if (!componentHTML) {
            const layout = this.layouts[layoutName];
            const response = await fetch(`${layout.path}/components/${componentName}.html`);
            componentHTML = await response.text();
            this.componentCache.set(cacheKey, componentHTML);
        }
        
        return componentHTML;
    }
    
    clearNonPersistentLayouts() {
        const layoutContainer = document.getElementById('layout-container');
        const layoutElements = layoutContainer.querySelectorAll('.layout');
        
        layoutElements.forEach(element => {
            const layoutName = element.id.replace('-layout', '');
            const layout = this.layouts[layoutName];
            
            if (!layout || !layout.persistent) {
                element.remove();
                this.activeApps.delete(layoutName);
            }
        });
    }
    
    async switchToLayout(layoutName, options = {}) {
        console.log(`🔄 Switching to layout: ${layoutName}`);
        
        try {
            // Load the new layout
            await this.loadLayout(layoutName, options);
            
            // Update app selector
            this.updateAppSelector(layoutName);
            
            // Trigger layout switch event
            this.triggerEvent('layoutSwitched', { from: this.currentLayout, to: layoutName });
            
        } catch (error) {
            console.error(`Failed to switch to layout '${layoutName}':`, error);
        }
    }
    
    async addLayout(layoutName) {
        if (this.activeApps.has(layoutName)) {
            console.log(`Layout '${layoutName}' is already active`);
            return;
        }
        
        await this.loadLayout(layoutName, { additive: true });
    }
    
    removeLayout(layoutName) {
        const layoutElement = document.getElementById(`${layoutName}-layout`);
        if (layoutElement) {
            layoutElement.remove();
            this.activeApps.delete(layoutName);
            
            this.triggerEvent('layoutRemoved', { layout: layoutName });
        }
    }
    
    updateAppSelector(activeLayoutName) {
        const appButtons = document.querySelectorAll('.app-button');
        appButtons.forEach(button => {
            const layoutName = button.dataset.layout;
            button.classList.toggle('active', layoutName === activeLayoutName);
        });
    }
    
    setupEventListeners() {
        // Listen for app selector clicks
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('app-button')) {
                event.preventDefault();
                const layoutName = event.target.dataset.layout;
                const isAdditive = event.target.dataset.additive === 'true';
                
                if (isAdditive) {
                    this.addLayout(layoutName);
                } else {
                    this.switchToLayout(layoutName);
                }
            }
        });
        
        // Listen for layout close buttons
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('layout-close')) {
                const layoutElement = event.target.closest('.layout');
                if (layoutElement) {
                    const layoutName = layoutElement.id.replace('-layout', '');
                    this.removeLayout(layoutName);
                }
            }
        });
    }
    
    async loadCSS(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }
    
    async loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    isAuthenticated() {
        // Check authentication status (implement based on your auth system)
        return localStorage.getItem('authToken') !== null;
    }
    
    triggerEvent(eventName, detail) {
        const event = new CustomEvent(`layout-${eventName}`, { detail });
        document.dispatchEvent(event);
    }
    
    // Public API methods
    getCurrentLayout() {
        return this.currentLayout;
    }
    
    getActiveApps() {
        return Array.from(this.activeApps);
    }
    
    isLayoutActive(layoutName) {
        return this.activeApps.has(layoutName);
    }
}

// Initialize layout manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.layoutManager = new LayoutManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LayoutManager;
}
