/**
 * AGENT WebSocket Manager
 * Handles WebSocket connections across the application
 */

class WebSocketManager {
    constructor() {
        this.connections = new Map();
        this.messageHandlers = new Map();
        this.reconnectAttempts = new Map();
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }
    
    connect(name, url, options = {}) {
        console.log(`🔌 Connecting to ${name} WebSocket: ${url}`);
        
        try {
            const ws = new WebSocket(url);
            this.connections.set(name, ws);
            this.reconnectAttempts.set(name, 0);
            
            ws.onopen = () => {
                console.log(`✅ ${name} WebSocket connected`);
                this.reconnectAttempts.set(name, 0);
                
                if (options.onOpen) {
                    options.onOpen();
                }
                
                this.dispatchEvent('websocket:connected', { name, url });
            };
            
            ws.onclose = (event) => {
                console.log(`🔌 ${name} WebSocket disconnected`);
                this.connections.delete(name);
                
                if (options.onClose) {
                    options.onClose(event);
                }
                
                this.dispatchEvent('websocket:disconnected', { name, url, event });
                
                // Auto-reconnect if not a clean close
                if (!event.wasClean && options.autoReconnect !== false) {
                    this.attemptReconnect(name, url, options);
                }
            };
            
            ws.onerror = (error) => {
                console.error(`❌ ${name} WebSocket error:`, error);
                
                if (options.onError) {
                    options.onError(error);
                }
                
                this.dispatchEvent('websocket:error', { name, url, error });
            };
            
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    // Call specific message handler
                    const handler = this.messageHandlers.get(name);
                    if (handler) {
                        handler(data);
                    }
                    
                    // Call global message handler if provided
                    if (options.onMessage) {
                        options.onMessage(data);
                    }
                    
                    this.dispatchEvent('websocket:message', { name, data });
                    
                } catch (error) {
                    console.error(`Failed to parse ${name} WebSocket message:`, error);
                }
            };
            
            return ws;
            
        } catch (error) {
            console.error(`Failed to connect to ${name} WebSocket:`, error);
            throw error;
        }
    }
    
    disconnect(name) {
        const ws = this.connections.get(name);
        if (ws) {
            ws.close();
            this.connections.delete(name);
            this.messageHandlers.delete(name);
            this.reconnectAttempts.delete(name);
            console.log(`🔌 ${name} WebSocket disconnected`);
        }
    }
    
    send(name, data) {
        const ws = this.connections.get(name);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
            return true;
        } else {
            console.warn(`Cannot send to ${name} WebSocket: not connected`);
            return false;
        }
    }
    
    setMessageHandler(name, handler) {
        this.messageHandlers.set(name, handler);
    }
    
    isConnected(name) {
        const ws = this.connections.get(name);
        return ws && ws.readyState === WebSocket.OPEN;
    }
    
    getConnection(name) {
        return this.connections.get(name);
    }
    
    getAllConnections() {
        return Array.from(this.connections.keys());
    }
    
    attemptReconnect(name, url, options) {
        const attempts = this.reconnectAttempts.get(name) || 0;
        
        if (attempts >= this.maxReconnectAttempts) {
            console.error(`❌ Max reconnection attempts reached for ${name}`);
            return;
        }
        
        this.reconnectAttempts.set(name, attempts + 1);
        
        setTimeout(() => {
            console.log(`🔄 Reconnecting to ${name} (attempt ${attempts + 1})`);
            this.connect(name, url, options);
        }, this.reconnectDelay * Math.pow(2, attempts)); // Exponential backoff
    }
    
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
    
    disconnectAll() {
        for (const name of this.connections.keys()) {
            this.disconnect(name);
        }
    }
}

// Global WebSocket manager instance
window.wsManager = new WebSocketManager();

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
    window.wsManager.disconnectAll();
});
