#!/usr/bin/env python3
"""
Simple FastAPI server for AGENT Arbitrage Trading Dashboard
Serves static files and provides trading API endpoints
"""

import asyncio
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import sys
from decimal import Decimal
from datetime import datetime
from typing import List

# Custom JSON encoder for Decimal objects
class DecimalJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if hasattr(obj, 'value'):  # Handle enums
            return obj.value
        if hasattr(obj, '__dict__'):  # Handle custom objects
            return obj.__dict__
        return super().default(obj)

def json_response(data, **kwargs):
    """Helper to create JSON response with Decimal support"""
    json_str = json.dumps(data, cls=DecimalJSONEncoder)
    return JSONResponse(content=json.loads(json_str), **kwargs)

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from agent.enhanced_trading import TradingEngine, TradingConfig
    from agent.arbitrage_strategies import ArbitrageManager, ArbitrageType
    TRADING_AVAILABLE = True
    print("✅ Trading modules imported successfully")
except ImportError as e:
    print(f"❌ Trading modules not available: {e}")
    TRADING_AVAILABLE = False

# Create FastAPI app
app = FastAPI(
    title="AGENT Arbitrage Trading",
    description="Professional arbitrage trading dashboard",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
static_path = os.path.join(os.path.dirname(__file__), "static")
print(f"Static path: {static_path}")
app.mount("/static", StaticFiles(directory=static_path), name="static")

# Global trading engine
trading_engine = None
websocket_clients: List[WebSocket] = []

@app.on_event("startup")
async def startup_event():
    """Initialize trading engine on startup"""
    global trading_engine
    
    if TRADING_AVAILABLE:
        try:
            config = TradingConfig(
                enabled=True,
                max_total_exposure=Decimal("50000"),
                max_single_position=Decimal("5000"),
                min_profitability=Decimal("0.003"),  # 0.3%
                cross_exchange_enabled=True,
                triangular_enabled=True,
                risk_management_enabled=True,
                stop_loss_pct=Decimal("0.02"),
                take_profit_pct=Decimal("0.05"),
                max_drawdown_pct=Decimal("0.10")
            )
            
            trading_engine = TradingEngine(config)
            await trading_engine.initialize()
            print("✅ Trading engine initialized successfully")
            
            # Start periodic updates
            asyncio.create_task(periodic_updates())
            
        except Exception as e:
            print(f"❌ Failed to initialize trading engine: {e}")
    else:
        print("⚠️  Trading engine not available")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global trading_engine
    
    if trading_engine:
        try:
            await trading_engine.stop()
            print("✅ Trading engine shut down successfully")
        except Exception as e:
            print(f"❌ Error shutting down trading engine: {e}")

# Routes
@app.get("/")
async def root():
    """Serve the main layout interface"""
    try:
        # Try to serve the new main layout first
        layout_path = os.path.join(static_path, "main-layout.html")
        if os.path.exists(layout_path):
            with open(layout_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return HTMLResponse(content)
        
        # Fallback to login page
        login_path = os.path.join(static_path, "index.html")
        if os.path.exists(login_path):
            with open(login_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return HTMLResponse(content)
        else:
            # Fallback login page
            return HTMLResponse("""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AGENT - Login</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .login-container {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(20px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 20px;
                        padding: 40px;
                        width: 400px;
                        text-align: center;
                        color: white;
                    }
                    .logo { font-size: 2rem; margin-bottom: 2rem; }
                    .form-group { margin-bottom: 1.5rem; text-align: left; }
                    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
                    .form-group input {
                        width: 100%;
                        padding: 12px;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        border-radius: 8px;
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                        font-size: 16px;
                    }
                    .form-group input::placeholder { color: rgba(255, 255, 255, 0.7); }
                    .login-btn {
                        width: 100%;
                        padding: 12px;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        margin-bottom: 1rem;
                    }
                    .login-btn:hover { opacity: 0.9; }
                    .dashboard-link {
                        display: block;
                        margin-top: 1rem;
                        color: rgba(255, 255, 255, 0.8);
                        text-decoration: none;
                        font-size: 14px;
                    }
                    .dashboard-link:hover { color: white; }
                </style>
            </head>
            <body>
                <div class="login-container">
                    <div class="logo">🤖 AGENT</div>
                    <form onsubmit="handleLogin(event)">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" name="username" placeholder="Enter username" value="admin" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" name="password" placeholder="Enter password" value="admin123" required>
                        </div>
                        <button type="submit" class="login-btn">Login to Chat</button>
                    </form>
                    <a href="/arbitrage" class="dashboard-link">🚀 Arbitrage Trading Dashboard</a>
                </div>
                <script>
                    function handleLogin(event) {
                        event.preventDefault();
                        const username = document.getElementById('username').value;
                        const password = document.getElementById('password').value;
                        
                        if (username === 'admin' && password === 'admin123') {
                            window.location.href = '/chat';
                        } else {
                            alert('Invalid credentials. Use admin/admin123');
                        }
                    }
                </script>
            </body>
            </html>
            """)
    except Exception as e:
        return HTMLResponse(f"<h1>Error: {str(e)}</h1>", status_code=500)

@app.get("/chat")
async def serve_chat_interface():
    """Serve the main chat rooms interface"""
    try:
        chat_path = os.path.join(static_path, "chat_rooms.html")
        if os.path.exists(chat_path):
            with open(chat_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return HTMLResponse(content)
        else:
            return HTMLResponse("""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Chat Interface Not Found</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a2e; color: white; }
                    .container { max-width: 600px; margin: 0 auto; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🤖 AGENT Chat Interface</h1>
                    <p>Chat interface file not found at expected location.</p>
                    <p><a href="/static/chat_rooms.html" style="color: #00ff88;">Try direct link</a></p>
                    <p><a href="/arbitrage" style="color: #00ff88;">Go to Trading Dashboard</a></p>
                    <p><a href="/" style="color: #00ff88;">Back to Login</a></p>
                </div>
            </body>
            </html>
            """, status_code=404)
    except Exception as e:
        return HTMLResponse(f"<h1>Chat Error: {str(e)}</h1>", status_code=500)

@app.get("/arbitrage")
async def serve_arbitrage_dashboard():
    """Serve the arbitrage trading dashboard"""
    try:
        dashboard_path = os.path.join(static_path, "arbitrage_dashboard.html")
        if os.path.exists(dashboard_path):
            with open(dashboard_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return HTMLResponse(content)
        else:
            return HTMLResponse("""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Dashboard Not Found</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a2e; color: white; }
                    .container { max-width: 600px; margin: 0 auto; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🚀 AGENT Arbitrage Trading</h1>
                    <p>Dashboard file not found at expected location.</p>
                    <p><a href="/static/arbitrage_dashboard.html" style="color: #00ff88;">Try direct link</a></p>
                </div>
            </body>
            </html>
            """, status_code=404)
    except Exception as e:
        return HTMLResponse(f"<h1>Error: {str(e)}</h1>", status_code=500)

# ============== CHAT API ENDPOINTS ==============

@app.post("/api/auth/login")
async def login():
    """Simple login endpoint for chat interface"""
    return JSONResponse({
        "success": True,
        "token": "demo_token_12345",
        "user": {"username": "admin", "role": "admin"}
    })

@app.get("/api/auth/validate")
async def validate_session():
    """Validate session for chat interface"""
    return JSONResponse({
        "valid": True,
        "user": {"username": "admin", "role": "admin"}
    })

@app.get("/api/rooms")
async def get_chat_rooms():
    """Get available chat rooms"""
    rooms = [
        {
            "id": 1,
            "name": "General",
            "description": "General discussion",
            "room_type": "general",
            "created_at": "2025-08-05T00:00:00Z"
        },
        {
            "id": 2,
            "name": "Trading",
            "description": "Trading and arbitrage discussion",
            "room_type": "trading",
            "created_at": "2025-08-05T00:00:00Z"
        },
        {
            "id": 3,
            "name": "Tech Talk",
            "description": "Technical discussions",
            "room_type": "tech",
            "created_at": "2025-08-05T00:00:00Z"
        }
    ]
    return JSONResponse(rooms)

@app.get("/api/rooms/{room_id}/messages")
async def get_room_messages(room_id: int):
    """Get messages for a specific room"""
    # Mock messages for demonstration
    messages = [
        {
            "id": 1,
            "room_id": room_id,
            "username": "admin",
            "message": f"Welcome to room {room_id}! 🎉",
            "timestamp": "2025-08-05T01:00:00Z",
            "message_type": "text"
        },
        {
            "id": 2,
            "room_id": room_id,
            "username": "system",
            "message": "🚀 AGENT Arbitrage Trading System is now live! Check out the trading dashboard for real-time arbitrage opportunities.",
            "timestamp": "2025-08-05T01:30:00Z",
            "message_type": "text"
        }
    ]
    return JSONResponse(messages)

@app.post("/api/rooms/{room_id}/messages")
async def send_message(room_id: int):
    """Send a message to a room"""
    return JSONResponse({
        "success": True,
        "message": "Message sent successfully",
        "id": 123
    })

@app.websocket("/ws/rooms")
async def websocket_chat_endpoint(websocket: WebSocket):
    """WebSocket endpoint for chat rooms"""
    await websocket.accept()
    
    try:
        # Send welcome message
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "message": "Connected to AGENT chat system with arbitrage trading!",
            "timestamp": datetime.now().isoformat()
        }))
        
        # Handle incoming messages
        while True:
            try:
                message = await websocket.receive_text()
                data = json.loads(message)
                
                # Echo the message back (in real implementation, would broadcast to room)
                response = {
                    "type": "message",
                    "data": {
                        "id": 123,
                        "username": "admin",
                        "message": data.get("message", ""),
                        "timestamp": datetime.now().isoformat(),
                        "room_id": data.get("room_id", 1)
                    }
                }
                
                await websocket.send_text(json.dumps(response))
                
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON format"
                }))
            except Exception as e:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": str(e)
                }))
                
    except Exception as e:
        print(f"Chat WebSocket error: {e}")

# ============== TRAINING API ENDPOINTS ==============

@app.get("/api/training/status")
async def get_training_status():
    """Get training status from MCP clients"""
    try:
        # Import training status function
        from agent.mcp_clients.mcp_trainer import get_training_status
        
        status = await get_training_status()
        return json_response(status)
        
    except ImportError:
        return json_response({
            "training_active": False,
            "error": "Training module not available",
            "mcp_clients": {}
        })
    except Exception as e:
        return json_response({"error": str(e)}, status_code=500)

@app.post("/api/training/start")
async def start_training():
    """Start MCP training"""
    try:
        from agent.mcp_clients.mcp_trainer import initialize_training
        
        success = await initialize_training()
        return json_response({"success": success, "message": "Training started" if success else "Failed to start training"})
        
    except ImportError:
        return json_response({"success": False, "error": "Training module not available"})
    except Exception as e:
        return json_response({"success": False, "error": str(e)})

@app.post("/api/training/stop")
async def stop_training():
    """Stop MCP training"""
    try:
        from agent.mcp_clients.mcp_trainer import stop_training
        
        await stop_training()
        return json_response({"success": True, "message": "Training stopped"})
        
    except ImportError:
        return json_response({"success": False, "error": "Training module not available"})
    except Exception as e:
        return json_response({"success": False, "error": str(e)})

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return json_response({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "trading_engine": trading_engine is not None,
        "version": "1.0.0"
    })

# ============== TRADING API ENDPOINTS ==============

@app.get("/api/trading/status")
async def get_trading_status():
    """Get current trading status"""
    try:
        if not trading_engine:
            return json_response({
                "error": "Trading engine not initialized",
                "available": TRADING_AVAILABLE
            }, status_code=503)
        
        status = await trading_engine.get_comprehensive_status()
        return json_response(status)
        
    except Exception as e:
        return json_response({"error": str(e)}, status_code=500)

@app.post("/api/trading/start")
async def start_trading():
    """Start arbitrage trading"""
    try:
        if not trading_engine:
            return JSONResponse({"error": "Trading engine not initialized"}, status_code=503)
        
        if not trading_engine.is_running:
            await trading_engine.start()
        
        return JSONResponse({
            "success": True,
            "message": "Trading started successfully",
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.post("/api/trading/stop")
async def stop_trading():
    """Stop arbitrage trading"""
    try:
        if not trading_engine:
            return JSONResponse({"error": "Trading engine not initialized"}, status_code=503)
        
        if trading_engine.is_running:
            await trading_engine.stop()
        
        return JSONResponse({
            "success": True,
            "message": "Trading stopped successfully",
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.post("/api/trading/emergency_stop")
async def emergency_stop():
    """Emergency stop all trading"""
    try:
        if not trading_engine:
            return JSONResponse({"error": "Trading engine not initialized"}, status_code=503)
        
        # Disable trading
        trading_engine.config.enabled = False
        
        # Stop arbitrage manager
        if trading_engine.arbitrage_manager:
            await trading_engine.arbitrage_manager.stop()
        
        # Broadcast emergency alert to WebSocket clients
        alert = {
            "type": "emergency_stop",
            "message": "Emergency stop activated",
            "timestamp": datetime.now().isoformat()
        }
        await broadcast_to_websockets(alert)
        
        return JSONResponse({
            "success": True,
            "message": "Emergency stop activated",
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/api/trading/opportunities")
async def get_arbitrage_opportunities():
    """Get current arbitrage opportunities"""
    try:
        if not trading_engine:
            return JSONResponse({"error": "Trading engine not initialized"}, status_code=503)
        
        # Get arbitrage status
        arb_status = trading_engine.arbitrage_manager.get_status()
        
        # Add some mock opportunities for demonstration
        opportunities = [
            {
                "type": "cross_exchange",
                "pair": "BTC-USDT",
                "buy_exchange": "binance",
                "sell_exchange": "coinbase",
                "profit_pct": 0.47,
                "volume": 0.1,
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "triangular",
                "path": "ETH→BTC→USDT→ETH",
                "exchange": "binance",
                "profit_pct": 0.23,
                "volume": 1.0,
                "timestamp": datetime.now().isoformat()
            }
        ]
        
        return JSONResponse({
            "opportunities": opportunities,
            "arbitrage_status": arb_status,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.websocket("/ws/trading")
async def websocket_trading_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time trading updates"""
    await websocket.accept()
    websocket_clients.append(websocket)
    
    try:
        # Send initial status
        if trading_engine:
            status = await trading_engine.get_comprehensive_status()
            await websocket.send_text(json.dumps({
                "type": "status_update",
                "data": status,
                "timestamp": datetime.now().isoformat()
            }))
        
        # Handle incoming messages
        while True:
            try:
                message = await websocket.receive_text()
                data = json.loads(message)
                
                command = data.get("command")
                
                if command == "get_status" and trading_engine:
                    status = await trading_engine.get_comprehensive_status()
                    await websocket.send_text(json.dumps({
                        "type": "status_update",
                        "data": status,
                        "timestamp": datetime.now().isoformat()
                    }))
                
                elif command == "start_trading" and trading_engine:
                    if not trading_engine.is_running:
                        await trading_engine.start()
                    await websocket.send_text(json.dumps({
                        "type": "command_response",
                        "success": True,
                        "message": "Trading started",
                        "timestamp": datetime.now().isoformat()
                    }))
                
                elif command == "stop_trading" and trading_engine:
                    if trading_engine.is_running:
                        await trading_engine.stop()
                    await websocket.send_text(json.dumps({
                        "type": "command_response",
                        "success": True,
                        "message": "Trading stopped",
                        "timestamp": datetime.now().isoformat()
                    }))
                
                else:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": f"Unknown command: {command}",
                        "timestamp": datetime.now().isoformat()
                    }))
                    
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON format",
                    "timestamp": datetime.now().isoformat()
                }))
            except Exception as e:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": str(e),
                    "timestamp": datetime.now().isoformat()
                }))
                
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if websocket in websocket_clients:
            websocket_clients.remove(websocket)

async def broadcast_to_websockets(data: dict):
    """Broadcast data to all connected WebSocket clients"""
    if not websocket_clients:
        return
    
    message = json.dumps(data)
    disconnected_clients = []
    
    for client in websocket_clients:
        try:
            await client.send_text(message)
        except Exception:
            disconnected_clients.append(client)
    
    # Remove disconnected clients
    for client in disconnected_clients:
        if client in websocket_clients:
            websocket_clients.remove(client)

# Background task to send periodic updates
async def periodic_updates():
    """Send periodic updates to WebSocket clients"""
    while True:
        try:
            if trading_engine and websocket_clients:
                status = await trading_engine.get_comprehensive_status()
                await broadcast_to_websockets({
                    "type": "periodic_update",
                    "data": status,
                    "timestamp": datetime.now().isoformat()
                })
            
            await asyncio.sleep(5)  # Update every 5 seconds
            
        except Exception as e:
            print(f"Error in periodic updates: {e}")
            await asyncio.sleep(5)

async def start_periodic_updates():
    """Start periodic updates task"""
    asyncio.create_task(periodic_updates())

if __name__ == "__main__":
    print("🚀 Starting AGENT Arbitrage Trading Server")
    print("=" * 50)
    print("📊 Dashboard: http://localhost:8000/arbitrage")
    print("🔌 WebSocket: ws://localhost:8000/ws/trading")
    print("📡 API: http://localhost:8000/api/trading/status")
    print("=" * 50)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
