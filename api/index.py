#!/usr/bin/env python3
"""
Vercel Serverless Function Entry Point for Enhanced AGENT System
Using iMessage-style interface with chat bar and different modes
"""

import sys
import traceback

try:
    from fastapi import FastAPI, HTTPException, Request, Header, Query, WebSocket, WebSocketDisconnect
    from fastapi.responses import HTMLResponse, JSONResponse
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.staticfiles import StaticFiles
    from datetime import datetime, timezone
    from typing import Optional
    import logging
    import json
    import os
    from decimal import Decimal
    
    # Try to import trading modules
    try:
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from agent.enhanced_trading import TradingEngine, TradingConfig
        from agent.arbitrage_strategies import ArbitrageManager, ArbitrageType
        TRADING_AVAILABLE = True
        print("Trading modules imported successfully")
    except ImportError as e:
        print(f"Trading modules not available: {e}")
        TRADING_AVAILABLE = False

    # Configure logging
    logging.basicConfig(level=logging.INFO)
    log = logging.getLogger(__name__)
    
    log.info("Starting imports and app initialization...")

    # Create the main app
    app = FastAPI(
        title="Enhanced AGENT System",
        description="Production deployment of the Enhanced AGENT System with iMessage interface",
        version="2.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )
    
    log.info("FastAPI app created successfully")

except Exception as e:
    # If we can't even import or create the app, log the error
    print(f"CRITICAL: Failed to initialize app: {str(e)}", file=sys.stderr)
    print(f"Traceback: {traceback.format_exc()}", file=sys.stderr)
    raise

try:
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Mount static files
    app.mount("/static", StaticFiles(directory="static"), name="static")
    
    log.info("CORS middleware added successfully")

    # Initialize Enhanced Agent
    agent = None
    try:
        from agent.enhanced_agent import EnhancedAgent
        agent = EnhancedAgent()
        log.info("Enhanced Agent initialized successfully")
    except Exception as e:
        log.error(f"Could not initialize Enhanced Agent: {e}")
        agent = None

    # Initialize authentication manager
    try:
        from agent.auth import auth_manager
        log.info("Authentication manager initialized successfully")
    except Exception as e:
        log.error(f"Could not initialize auth manager: {e}")
        auth_manager = None

    # Add video training capabilities (optional)
    try:
        from agent.video_api import add_video_routes
        add_video_routes(app)
        log.info("Video training routes added successfully")
    except ImportError:
        log.info("Video training not available - dependencies not installed")
    except Exception as e:
        log.warning(f"Could not add video training routes: {e}")

    # Pydantic models for API requests
    from pydantic import BaseModel
    
    class QueryRequest(BaseModel):
        query: str
        domain: str = "general"
        app: str = "general"
    
    class FeedbackRequest(BaseModel):
        query: str
        response: str
        feedback: dict

    class BiasReportRequest(BaseModel):
        include_examples: bool = False
        
    class ImprovementRequest(BaseModel):
        force_improvement: bool = False

    @app.get("/", response_class=HTMLResponse)
    async def root():
        """Root endpoint - serve login page"""
        try:
            import os
            possible_paths = [
                'static/login.html',
                '../static/login.html',
                '/workspaces/AGENT/static/login.html',
                './static/login.html'
            ]
            
            html_content = None
            for path in possible_paths:
                try:
                    if os.path.exists(path):
                        with open(path, 'r') as f:
                            html_content = f.read()
                        log.info(f"Successfully loaded login page from: {path}")
                        break
                except Exception as e:
                    log.debug(f"Could not load login page from {path}: {e}")
                    continue
            
            if html_content:
                return HTMLResponse(html_content)
            else:
                raise FileNotFoundError("Login page not found")
                
        except FileNotFoundError:
            # Fallback login page
            return HTMLResponse("""
            <!DOCTYPE html>
            <html>
            <head>
                <title>AGENT - Login</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100vh; display: flex; align-items: center; justify-content: center; }
                    .login { background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; backdrop-filter: blur(10px); color: white; }
                    input { width: 100%; padding: 12px; margin: 8px 0; border: none; border-radius: 8px; background: rgba(255,255,255,0.2); color: white; }
                    button { width: 100%; padding: 12px; background: #007aff; border: none; border-radius: 8px; color: white; cursor: pointer; }
                </style>
            </head>
            <body>
                <div class="login">
                    <h2>AGENT Login</h2>
                    <form action="/api/auth/login" method="post">
                        <input type="text" name="username" placeholder="Username" value="admin" required>
                        <input type="password" name="password" placeholder="Password" value="admin123" required>
                        <button type="submit">Login</button>
                    </form>
                </div>
            </body>
            </html>
            """)

    @app.get("/chat", response_class=HTMLResponse)
    async def chat_rooms():
        """Chat Rooms interface"""
        try:
            import os
            possible_paths = [
                'static/chat_rooms.html',
                '../static/chat_rooms.html',
                '/workspaces/AGENT/static/chat_rooms.html',
                './static/chat_rooms.html'
            ]
            
            html_content = None
            for path in possible_paths:
                try:
                    if os.path.exists(path):
                        with open(path, 'r') as f:
                            html_content = f.read()
                        log.info(f"Successfully loaded chat rooms interface from: {path}")
                        break
                except Exception as e:
                    log.debug(f"Could not load chat rooms from {path}: {e}")
                    continue
            
            if html_content:
                return HTMLResponse(html_content)
            else:
                raise FileNotFoundError("Chat rooms interface file not found")
                
        except FileNotFoundError:
            return HTMLResponse("""
            <html><body><h1>Chat Rooms Interface Not Found</h1>
            <p>Please ensure chat_rooms.html is available in the static directory.</p>
            </body></html>
            """)

    @app.get("/health")
    async def health_check():
        """Health check endpoint"""
        try:
            return JSONResponse(
                content={
                    "status": "healthy",
                    "service": "Enhanced AGENT System",
                    "version": "2.0.0",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "environment": "production",
                    "interface": "iMessage-style"
                }
            )
        except Exception as e:
            return JSONResponse(
                content={
                    "status": "error",
                    "error": str(e),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                },
                status_code=500
            )

    # ============== AUTHENTICATION ENDPOINTS ==============
    
    @app.post("/api/auth/login")
    async def login(request: Request):
        """Handle user login"""
        try:
            body = await request.json()
            username = body.get('username', '').strip()
            password = body.get('password', '')
            
            if not username or not password:
                return JSONResponse({
                    "success": False,
                    "error": "Username and password are required"
                }, status_code=400)
            
            # Validate credentials
            if username == "admin" and password == "admin123":
                # Create session
                if auth_manager:
                    session = auth_manager.create_session(username, password)
                    if session:
                        response = JSONResponse({
                            "success": True,
                            "message": "Login successful",
                            "user": {
                                "username": username,
                                "role": "admin"
                            },
                            "token": session.get('token')
                        })
                        # Set secure cookie
                        response.set_cookie(
                            key="auth_token",
                            value=session.get('token'),
                            httponly=True,
                            secure=False,  # Set to True in production with HTTPS
                            samesite="lax",
                            max_age=86400  # 24 hours
                        )
                        return response
                    else:
                        return JSONResponse({
                            "success": False,
                            "error": "Failed to create session"
                        }, status_code=500)
                else:
                    # Fallback when auth_manager is not available
                    fake_token = "demo_token_" + str(datetime.now().timestamp())
                    response = JSONResponse({
                        "success": True,
                        "message": "Login successful (demo mode)",
                        "user": {
                            "username": username,
                            "role": "admin"
                        },
                        "token": fake_token
                    })
                    response.set_cookie(
                        key="auth_token",
                        value=fake_token,
                        httponly=True,
                        secure=False,
                        samesite="lax",
                        max_age=86400
                    )
                    return response
            else:
                return JSONResponse({
                    "success": False,
                    "error": "Invalid username or password"
                }, status_code=401)
                
        except Exception as e:
            log.error(f"Login error: {str(e)}")
            return JSONResponse({
                "success": False,
                "error": "Login failed"
            }, status_code=500)
    
    @app.get("/api/auth/validate")
    async def validate_session(request: Request):
        """Validate user session"""
        try:
            # Check for token in cookie or Authorization header
            token = None
            
            # First try cookie
            if "auth_token" in request.cookies:
                token = request.cookies["auth_token"]
            
            # Then try Authorization header
            auth_header = request.headers.get("authorization")
            if not token and auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
            
            if not token:
                return JSONResponse({
                    "valid": False,
                    "error": "No authentication token provided"
                }, status_code=401)
            
            # Validate token
            if auth_manager:
                user_session = auth_manager.validate_session(token)
                if user_session:
                    return JSONResponse({
                        "valid": True,
                        "user_id": user_session.get('user_id'),
                        "username": user_session.get('username'),
                        "role": user_session.get('role', 'member')
                    })
                else:
                    return JSONResponse({
                        "valid": False,
                        "error": "Invalid or expired session"
                    }, status_code=401)
            else:
                # Demo mode - validate demo token
                if token.startswith("demo_token_"):
                    return JSONResponse({
                        "valid": True,
                        "user_id": "admin",
                        "username": "admin",
                        "role": "admin"
                    })
                else:
                    return JSONResponse({
                        "valid": False,
                        "error": "Invalid token format"
                    }, status_code=401)
                    
        except Exception as e:
            log.error(f"Session validation error: {str(e)}")
            return JSONResponse({
                "valid": False,
                "error": "Session validation failed"
            }, status_code=500)
    
    @app.post("/api/auth/logout")
    async def logout(request: Request):
        """Handle user logout"""
        try:
            token = None
            
            # Get token from cookie or header
            if "auth_token" in request.cookies:
                token = request.cookies["auth_token"]
            
            auth_header = request.headers.get("authorization")
            if not token and auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
            
            if token and auth_manager:
                # Invalidate session
                auth_manager.invalidate_session(token)
            
            # Clear cookie
            response = JSONResponse({
                "success": True,
                "message": "Logged out successfully"
            })
            response.delete_cookie("auth_token")
            return response
            
        except Exception as e:
            log.error(f"Logout error: {str(e)}")
            return JSONResponse({
                "success": False,
                "error": "Logout failed"
            }, status_code=500)

    @app.post("/query")
    async def process_query(request: dict):
        """Process general queries - Enhanced for different modes"""
        try:
            query = request.get("query", "")
            domain = request.get("domain", "general")
            app_mode = request.get("app", "general")
            
            if not query:
                raise HTTPException(status_code=400, detail="Query is required")

            # Enhanced response based on the selected app/mode
            mode_responses = {
                "general": f"🤖 **General AI Response:**\n\nI understand you're asking: '{query}'\n\nThis is a simplified response for serverless deployment. In a full deployment, I would process this query using advanced AI models and provide detailed assistance.",
                "developer": f"💻 **Developer Mode Response:**\n\nQuery: '{query}'\n\nAs your development assistant, I would help with coding, debugging, architecture design, and technical problem-solving. This simplified version shows the structure for developer-focused responses.",
                "trader": f"📈 **Trader Mode Response:**\n\nMarket Query: '{query}'\n\nIn full deployment, I would provide real-time market analysis, trading strategies, risk assessment, and financial insights. This is a preview of trading-focused responses.",
                "lawyer": f"⚖️ **Legal Mode Response:**\n\nLegal Query: '{query}'\n\nI would provide legal analysis, document review, compliance guidance, and legal research assistance. This simplified version demonstrates legal-focused response structure.",
                "researcher": f"🔬 **Research Mode Response:**\n\nResearch Topic: '{query}'\n\nI would conduct comprehensive research, analyze sources, provide citations, and deliver detailed findings. This shows the research-focused response format.",
                "data-engineer": f"🗄️ **Data Engineering Response:**\n\nData Query: '{query}'\n\nI would help with data pipeline design, ETL processes, database optimization, and data architecture. This demonstrates data engineering assistance structure.",
                "drawing": f"🎨 **Creative Mode Response:**\n\nCreative Request: '{query}'\n\nI would help with artistic concepts, design ideas, and creative problem-solving. This shows creative assistance capabilities.",
                "terminal": f"⌨️ **Terminal Mode Response:**\n\nCommand Context: '{query}'\n\nI would provide command-line assistance, script generation, and system administration help. This demonstrates terminal-focused responses.",
                "vm": f"🖥️ **VM/Docker Mode Response:**\n\nInfrastructure Query: '{query}'\n\nI would assist with containerization, virtual machine management, and deployment strategies. This shows infrastructure assistance format.",
                "multi-model": f"🧠 **Multi-AI Mode Response:**\n\nAdvanced Query: '{query}'\n\nI would utilize multiple AI models for comprehensive analysis, cross-referencing different AI perspectives. This demonstrates advanced multi-model capabilities."
            }
            
            response_text = mode_responses.get(app_mode, mode_responses["general"])
            
            return JSONResponse(
                content={
                    "success": True,
                    "query": query,
                    "domain": domain,
                    "app": app_mode,
                    "result": {
                        "answer": response_text
                    },
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            )
            
        except Exception as e:
            return JSONResponse(
                content={
                    "success": False,
                    "error": f"Query processing error: {str(e)}",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                },
                status_code=500
            )

    @app.get("/api/models/status")
    async def models_status():
        """Get status of available AI models - Enhanced for different modes"""
        return JSONResponse(
            content={
                "status": "operational",
                "interface": "iMessage-style with horizontal app bar",
                "available_modes": {
                    "general": {"status": "active", "description": "General AI assistance"},
                    "developer": {"status": "active", "description": "Code and development help"},
                    "trader": {"status": "active", "description": "Trading and financial analysis"},
                    "lawyer": {"status": "active", "description": "Legal analysis and research"},
                    "researcher": {"status": "active", "description": "Research and information gathering"},
                    "data-engineer": {"status": "active", "description": "Data engineering and ETL"},
                    "drawing": {"status": "active", "description": "Creative and artistic assistance"},
                    "terminal": {"status": "active", "description": "Command-line and scripting help"},
                    "vm": {"status": "active", "description": "VM and container management"},
                    "multi-model": {"status": "active", "description": "Advanced multi-AI processing"}
                },
                "total_modes": 10,
                "active_modes": 10,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )
    
    # Self-training endpoints
    @app.post("/api/feedback")
    async def process_feedback(feedback_data: dict):
        """Process user feedback for self-training"""
        try:
            if agent is None:
                return JSONResponse({"error": "Enhanced Agent not available"}, status_code=503)
                
            result = await agent.process_feedback(
                query=feedback_data.get("query", ""),
                response=feedback_data.get("response", ""),
                feedback=feedback_data.get("feedback", {})
            )
            return JSONResponse(result)
        except Exception as e:
            log.error(f"Error processing feedback: {str(e)}")
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.get("/api/self-training/patterns")
    async def analyze_patterns():
        """Analyze response patterns for bias and consistency"""
        try:
            if agent is None:
                return JSONResponse({"error": "Enhanced Agent not available"}, status_code=503)
                
            patterns = await agent.analyze_self_patterns()
            return JSONResponse(patterns)
        except Exception as e:
            log.error(f"Error analyzing patterns: {str(e)}")
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.post("/api/self-training/improve") 
    async def trigger_improvement(improvement_data: dict):
        """Trigger self-improvement based on accumulated feedback"""
        try:
            if agent is None:
                return JSONResponse({"error": "Enhanced Agent not available"}, status_code=503)
                
            force_improvement = improvement_data.get("force_improvement", False)
            result = await agent.trigger_self_improvement(force_improvement)
            return JSONResponse(result)
        except Exception as e:
            log.error(f"Error triggering improvement: {str(e)}")
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.get("/api/self-training/bias-report")
    async def generate_bias_report():
        """Generate bias analysis report"""
        try:
            if agent is None:
                return JSONResponse({"error": "Enhanced Agent not available"}, status_code=503)
                
            result = await agent.get_bias_report()
            return JSONResponse(result)
        except Exception as e:
            log.error(f"Error generating bias report: {str(e)}")
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.post("/api/self-training/improve")
    async def trigger_improvement():
        """Trigger self-improvement cycle"""
        try:
            if agent is None:
                return JSONResponse({"error": "Enhanced Agent not available"}, status_code=503)
                
            result = await agent.trigger_self_improvement()
            return JSONResponse(result)
        except Exception as e:
            log.error(f"Error triggering improvement: {str(e)}")
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.get("/api/self-training/bias-report")
    async def get_bias_report():
        """Get comprehensive bias analysis report"""
        try:
            if agent is None:
                return JSONResponse({"error": "Enhanced Agent not available"}, status_code=503)
                
            result = await agent.get_bias_report()
            return JSONResponse(result)
        except Exception as e:
            log.error(f"Error generating bias report: {str(e)}")
            return JSONResponse({"error": str(e)}, status_code=500)

    # ============== CHAT ROOM API ENDPOINTS (PATCH 6) ==============
    
    @app.get("/api/rooms")
    async def get_rooms(authorization: str = Header(None)):
        """Get all rooms accessible to the user"""
        try:
            # Validate user session
            if not authorization or not authorization.startswith('Bearer '):
                return JSONResponse({"error": "Authentication required"}, status_code=401)
            
            token = authorization.split(' ')[1]
            user_session = auth_manager.validate_session(token)
            if not user_session:
                return JSONResponse({"error": "Invalid session"}, status_code=401)
            
            # Get accessible rooms
            from agent.chat_rooms import chat_room_manager
            rooms = chat_room_manager.get_user_accessible_rooms(
                user_id=user_session['username'],
                user_role=user_session.get('role', 'member')
            )
            
            # Get unread counts
            unread_counts = chat_room_manager.get_unread_counts(user_session['username'])
            
            # Format response
            rooms_data = []
            for room in rooms:
                rooms_data.append({
                    "id": room.id,
                    "name": room.name,
                    "description": room.description,
                    "room_type": room.room_type,
                    "created_by": room.created_by,
                    "created_at": room.created_at.isoformat(),
                    "max_members": room.max_members,
                    "unread_count": unread_counts.get(room.id, 0)
                })
            
            return JSONResponse({
                "success": True,
                "rooms": rooms_data
            })
            
        except Exception as e:
            log.error(f"Error getting rooms: {str(e)}")
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.post("/api/rooms")
    async def create_room(request: Request, authorization: str = Header(None)):
        """Create a new room"""
        try:
            # Validate user session
            if not authorization or not authorization.startswith('Bearer '):
                return JSONResponse({"error": "Authentication required"}, status_code=401)
            
            token = authorization.split(' ')[1]
            user_session = auth_manager.validate_session(token)
            if not user_session:
                return JSONResponse({"error": "Invalid session"}, status_code=401)
            
            # Parse request body
            body = await request.json()
            name = body.get('name', '').strip()
            description = body.get('description', '').strip()
            room_type = body.get('room_type', 'public')
            
            if not name:
                return JSONResponse({"error": "Room name is required"}, status_code=400)
            
            # Create room
            from agent.chat_rooms import chat_room_manager
            room_id = chat_room_manager.create_room(
                name=name,
                description=description,
                creator=user_session['username'],
                room_type=room_type
            )
            
            if room_id:
                return JSONResponse({
                    "success": True,
                    "room_id": room_id,
                    "message": f"Room '{name}' created successfully"
                })
            else:
                return JSONResponse({"error": "Failed to create room"}, status_code=400)
            
        except Exception as e:
            log.error(f"Error creating room: {str(e)}")
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.get("/api/rooms/{room_id}/messages")
    async def get_room_messages(room_id: int, limit: int = 50, before_id: Optional[int] = None, authorization: str = Header(None)):
        """Get message history for a room"""
        try:
            # Validate user session
            if not authorization or not authorization.startswith('Bearer '):
                return JSONResponse({"error": "Authentication required"}, status_code=401)
            
            token = authorization.split(' ')[1]
            user_session = auth_manager.validate_session(token)
            if not user_session:
                return JSONResponse({"error": "Invalid session"}, status_code=401)
            
            # Get messages
            from agent.chat_rooms import chat_room_manager
            messages = chat_room_manager.get_room_messages(room_id, limit, before_id)
            
            # Format response
            messages_data = []
            for msg in messages:
                messages_data.append({
                    "id": msg.id,
                    "room_id": msg.room_id,
                    "user_id": msg.user_id,
                    "username": msg.username,
                    "content": msg.content,
                    "message_type": msg.message_type,
                    "timestamp": msg.timestamp.isoformat(),
                    "reply_to_id": msg.reply_to_id,
                    "edited_at": msg.edited_at.isoformat() if msg.edited_at else None
                })
            
            return JSONResponse({
                "success": True,
                "messages": messages_data
            })
            
        except Exception as e:
            log.error(f"Error getting messages for room {room_id}: {str(e)}")
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.get("/api/rooms/{room_id}/members")
    async def get_room_members(room_id: int, authorization: str = Header(None)):
        """Get members of a room"""
        try:
            # Validate user session
            if not authorization or not authorization.startswith('Bearer '):
                return JSONResponse({"error": "Authentication required"}, status_code=401)
            
            token = authorization.split(' ')[1]
            user_session = auth_manager.validate_session(token)
            if not user_session:
                return JSONResponse({"error": "Invalid session"}, status_code=401)
            
            # Get members
            from agent.chat_rooms import chat_room_manager
            members = chat_room_manager.get_room_members(room_id)
            
            # Get online status
            from agent.room_websocket import room_connection_manager
            online_users = room_connection_manager.get_online_users()
            
            # Format response
            members_data = []
            for member in members:
                members_data.append({
                    "user_id": member.user_id,
                    "username": member.username,
                    "role": member.role,
                    "joined_at": member.joined_at.isoformat(),
                    "last_seen": member.last_seen.isoformat(),
                    "is_online": member.username in online_users
                })
            
            return JSONResponse({
                "success": True,
                "members": members_data
            })
            
        except Exception as e:
            log.error(f"Error getting members for room {room_id}: {str(e)}")
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.post("/api/rooms/{room_id}/join")
    async def join_room(room_id: int, authorization: str = Header(None)):
        """Join a room"""
        try:
            # Validate user session
            if not authorization or not authorization.startswith('Bearer '):
                return JSONResponse({"error": "Authentication required"}, status_code=401)
            
            token = authorization.split(' ')[1]
            user_session = auth_manager.validate_session(token)
            if not user_session:
                return JSONResponse({"error": "Invalid session"}, status_code=401)
            
            # Join room
            from agent.chat_rooms import chat_room_manager
            success = chat_room_manager.join_room(room_id, user_session['username'], user_session['username'])
            
            if success:
                return JSONResponse({
                    "success": True,
                    "message": f"Joined room {room_id}"
                })
            else:
                return JSONResponse({"error": "Failed to join room"}, status_code=400)
            
        except Exception as e:
            log.error(f"Error joining room {room_id}: {str(e)}")
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.post("/api/rooms/{room_id}/leave")
    async def leave_room(room_id: int, authorization: str = Header(None)):
        """Leave a room"""
        try:
            # Validate user session
            if not authorization or not authorization.startswith('Bearer '):
                return JSONResponse({"error": "Authentication required"}, status_code=401)
            
            token = authorization.split(' ')[1]
            user_session = auth_manager.validate_session(token)
            if not user_session:
                return JSONResponse({"error": "Invalid session"}, status_code=401)
            
            # Leave room
            from agent.chat_rooms import chat_room_manager
            success = chat_room_manager.leave_room(room_id, user_session['username'])
            
            if success:
                return JSONResponse({
                    "success": True,
                    "message": f"Left room {room_id}"
                })
            else:
                return JSONResponse({"error": "Failed to leave room"}, status_code=400)
            
        except Exception as e:
            log.error(f"Error leaving room {room_id}: {str(e)}")
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.post("/api/rooms/{room_id}/mark-read")
    async def mark_room_read(room_id: int, authorization: str = Header(None)):
        """Mark all messages in room as read"""
        try:
            # Validate user session
            if not authorization or not authorization.startswith('Bearer '):
                return JSONResponse({"error": "Authentication required"}, status_code=401)
            
            token = authorization.split(' ')[1]
            user_session = auth_manager.validate_session(token)
            if not user_session:
                return JSONResponse({"error": "Invalid session"}, status_code=401)
            
            # Mark as read
            from agent.chat_rooms import chat_room_manager
            success = chat_room_manager.mark_room_as_read(user_session['username'], room_id)
            
            if success:
                return JSONResponse({
                    "success": True,
                    "message": f"Room {room_id} marked as read"
                })
            else:
                return JSONResponse({"error": "Failed to mark room as read"}, status_code=400)
            
        except Exception as e:
            log.error(f"Error marking room {room_id} as read: {str(e)}")
            return JSONResponse({"error": str(e)}, status_code=500)

    # ============== WEBSOCKET ENDPOINT FOR CHAT ROOMS ==============
    
    @app.websocket("/ws/rooms")
    async def websocket_rooms_endpoint(websocket: WebSocket, token: str = Query(...)):
        """WebSocket endpoint for real-time chat room communication"""
        from agent.room_websocket import room_connection_manager
        
        connection_id = None
        try:
            # Connect user
            connection_id = await room_connection_manager.connect_user(websocket, token)
            if not connection_id:
                return
            
            # Handle messages
            while True:
                data = await websocket.receive_text()
                try:
                    message_data = json.loads(data)
                    await room_connection_manager.handle_websocket_message(connection_id, message_data)
                except json.JSONDecodeError:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Invalid JSON format"
                    }))
                except Exception as e:
                    log.error(f"Error handling WebSocket message: {e}")
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": str(e)
                    }))
        
        except WebSocketDisconnect:
            if connection_id:
                await room_connection_manager.disconnect_user(connection_id, "WebSocket disconnected")
        except Exception as e:
            log.error(f"WebSocket error: {e}")
            if connection_id:
                await room_connection_manager.disconnect_user(connection_id, f"Error: {str(e)}")

    @app.get("/admin", response_class=HTMLResponse)
    async def admin_panel():
        """Admin panel interface"""
        try:
            # Read the admin interface HTML file
            with open('/workspaces/AGENT/static/admin.html', 'r') as f:
                html_content = f.read()
            
            return HTMLResponse(html_content)
        except FileNotFoundError:
            return HTMLResponse("""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin Panel</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
                    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🛠️ Admin Panel</h1>
                    <p><strong>Status:</strong> Admin interface file not found</p>
                    <a href="/">← Back to Main Interface</a>
                </div>
            </body>
            </html>
            """)
        except Exception as e:
            log.error(f"Error serving admin: {str(e)}")
            return HTMLResponse(f"<h1>Admin Error: {str(e)}</h1>", status_code=500)

    # ============== TRADING AND ARBITRAGE ENDPOINTS ==============
    
    # Global trading engine instance
    trading_engine = None
    
    if TRADING_AVAILABLE:
        @app.on_event("startup")
        async def startup_trading():
            """Initialize trading engine on startup"""
            global trading_engine
            try:
                config = TradingConfig(
                    max_total_exposure=Decimal("50000"),
                    min_profitability=Decimal("0.003"),  # 0.3%
                    cross_exchange_enabled=True,
                    triangular_enabled=True
                )
                trading_engine = TradingEngine(config)
                await trading_engine.initialize()
                log.info("Trading engine initialized successfully")
            except Exception as e:
                log.error(f"Failed to initialize trading engine: {e}")
        
        @app.on_event("shutdown")
        async def shutdown_trading():
            """Cleanup trading engine on shutdown"""
            global trading_engine
            if trading_engine:
                try:
                    await trading_engine.stop()
                    log.info("Trading engine shut down successfully")
                except Exception as e:
                    log.error(f"Error shutting down trading engine: {e}")
        
        @app.get("/api/trading/status")
        async def get_trading_status():
            """Get current trading status"""
            try:
                if not trading_engine:
                    return JSONResponse({"error": "Trading engine not initialized"}, status_code=503)
                
                status = await trading_engine.get_comprehensive_status()
                return JSONResponse(status)
            except Exception as e:
                log.error(f"Error getting trading status: {e}")
                return JSONResponse({"error": str(e)}, status_code=500)
        
        @app.post("/api/trading/start")
        async def start_trading():
            """Start arbitrage trading"""
            try:
                if not trading_engine:
                    return JSONResponse({"error": "Trading engine not initialized"}, status_code=503)
                
                await trading_engine.start()
                return JSONResponse({
                    "success": True,
                    "message": "Trading started successfully"
                })
            except Exception as e:
                log.error(f"Error starting trading: {e}")
                return JSONResponse({"error": str(e)}, status_code=500)
        
        @app.post("/api/trading/stop")
        async def stop_trading():
            """Stop arbitrage trading"""
            try:
                if not trading_engine:
                    return JSONResponse({"error": "Trading engine not initialized"}, status_code=503)
                
                await trading_engine.stop()
                return JSONResponse({
                    "success": True,
                    "message": "Trading stopped successfully"
                })
            except Exception as e:
                log.error(f"Error stopping trading: {e}")
                return JSONResponse({"error": str(e)}, status_code=500)
        
        @app.post("/api/trading/emergency_stop")
        async def emergency_stop_trading():
            """Emergency stop all trading"""
            try:
                if not trading_engine:
                    return JSONResponse({"error": "Trading engine not initialized"}, status_code=503)
                
                trading_engine.config.enabled = False
                await trading_engine.arbitrage_manager.stop()
                
                return JSONResponse({
                    "success": True,
                    "message": "Emergency stop activated"
                })
            except Exception as e:
                log.error(f"Error in emergency stop: {e}")
                return JSONResponse({"error": str(e)}, status_code=500)
        
        @app.post("/api/trading/config")
        async def update_trading_config(request: Request):
            """Update trading configuration"""
            try:
                if not trading_engine:
                    return JSONResponse({"error": "Trading engine not initialized"}, status_code=503)
                
                body = await request.json()
                await trading_engine._update_trading_config(body)
                
                return JSONResponse({
                    "success": True,
                    "message": "Configuration updated successfully"
                })
            except Exception as e:
                log.error(f"Error updating config: {e}")
                return JSONResponse({"error": str(e)}, status_code=500)
        
        @app.get("/api/trading/arbitrage")
        async def get_arbitrage_opportunities():
            """Get current arbitrage opportunities"""
            try:
                if not trading_engine:
                    return JSONResponse({"error": "Trading engine not initialized"}, status_code=503)
                
                arb_status = trading_engine.arbitrage_manager.get_status()
                return JSONResponse(arb_status)
            except Exception as e:
                log.error(f"Error getting arbitrage opportunities: {e}")
                return JSONResponse({"error": str(e)}, status_code=500)
        
        @app.websocket("/ws/trading")
        async def websocket_trading_endpoint(websocket: WebSocket):
            """WebSocket endpoint for real-time trading updates"""
            await websocket.accept()
            
            try:
                # Add client to trading engine's WebSocket clients
                if trading_engine:
                    trading_engine.websocket_clients.append(websocket)
                
                # Keep connection alive
                while True:
                    try:
                        message = await websocket.receive_text()
                        data = json.loads(message)
                        
                        # Handle commands
                        if data.get("command") == "get_status" and trading_engine:
                            status = await trading_engine.get_comprehensive_status()
                            await websocket.send_text(json.dumps(status))
                        
                    except WebSocketDisconnect:
                        break
                    except Exception as e:
                        await websocket.send_text(json.dumps({"error": str(e)}))
            
            except Exception as e:
                log.error(f"WebSocket trading error: {e}")
            finally:
                # Remove client from trading engine
                if trading_engine and websocket in trading_engine.websocket_clients:
                    trading_engine.websocket_clients.remove(websocket)
        
        @app.get("/arbitrage")
        async def serve_arbitrage_dashboard():
            """Serve the arbitrage trading dashboard"""
            try:
                # First try to serve the file from static directory
                static_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "arbitrage_dashboard.html")
                if os.path.exists(static_file_path):
                    with open(static_file_path, 'r', encoding='utf-8') as f:
                        return HTMLResponse(f.read())
                else:
                    # Fallback HTML if file not found
                    return HTMLResponse("""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Arbitrage Dashboard</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a2e; color: white; }
                            .container { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 10px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>🚀 AGENT Arbitrage Trading Dashboard</h1>
                            <p><strong>Status:</strong> Dashboard file not found</p>
                            <p>The arbitrage trading dashboard is being loaded...</p>
                            <a href="/" style="color: #00ff88;">← Back to Main Interface</a>
                        </div>
                    </body>
                    </html>
                    """)
            except Exception as e:
                log.error(f"Error serving arbitrage dashboard: {str(e)}")
                return HTMLResponse(f"<h1>Dashboard Error: {str(e)}</h1>", status_code=500)
    
    else:
        @app.get("/api/trading/status")
        async def trading_not_available():
            return JSONResponse({
                "error": "Trading modules not available",
                "available": False
            }, status_code=503)

    log.info("AGENT API serverless function initialized successfully with iMessage interface")

except Exception as e:
    log.error(f"Failed to configure app: {str(e)}")
    print(f"ERROR: Failed to configure app: {str(e)}", file=sys.stderr)
    print(f"Traceback: {traceback.format_exc()}", file=sys.stderr)
    raise
