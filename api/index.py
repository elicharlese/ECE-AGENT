#!/usr/bin/env python3
"""
Vercel Serverless Function Entry Point for Enhanced AGENT System
Using iMessage-style interface with chat bar and different modes
"""

import sys
import traceback

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.responses import HTMLResponse, JSONResponse
    from fastapi.middleware.cors import CORSMiddleware
    from datetime import datetime, timezone
    import logging

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
    
    log.info("CORS middleware added successfully")

    # Add video training capabilities (optional)
    try:
        from agent.video_api import add_video_routes
        add_video_routes(app)
        log.info("Video training routes added successfully")
    except ImportError:
        log.info("Video training not available - dependencies not installed")
    except Exception as e:
        log.warning(f"Could not add video training routes: {e}")

    @app.get("/", response_class=HTMLResponse)
    async def root():
        """Root endpoint - serve iMessage-style interface"""
        try:
            # Try multiple paths for the iMessage interface HTML file
            import os
            possible_paths = [
                'static/imessage_new.html',
                '../static/imessage_new.html',
                '/workspaces/AGENT/static/imessage_new.html',
                './static/imessage_new.html'
            ]
            
            html_content = None
            for path in possible_paths:
                try:
                    if os.path.exists(path):
                        with open(path, 'r') as f:
                            html_content = f.read()
                        log.info(f"Successfully loaded iMessage interface from: {path}")
                        break
                except Exception as e:
                    log.debug(f"Could not load from {path}: {e}")
                    continue
            
            if html_content:
                return HTMLResponse(html_content)
            else:
                raise FileNotFoundError("iMessage interface file not found in any expected location")
                
        except FileNotFoundError:
            # Fallback to simple interface if static file not found
            return HTMLResponse("""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Enhanced AGENT System</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                    .container { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; backdrop-filter: blur(10px); }
                    h1 { text-align: center; font-size: 3rem; margin-bottom: 20px; }
                    .status { padding: 20px; background: rgba(34, 197, 94, 0.2); border-radius: 10px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🚀 Enhanced AGENT System</h1>
                    <div class="status">
                        <h3>✅ System Status: Operational (Fallback Mode)</h3>
                        <p><strong>Note:</strong> iMessage interface file not found, using fallback.</p>
                    </div>
                </div>
            </body>
            </html>
            """)
        except Exception as e:
            log.error(f"Error serving root: {str(e)}")
            return HTMLResponse(f"<h1>Error: {str(e)}</h1>", status_code=500)

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

    log.info("AGENT API serverless function initialized successfully with iMessage interface")

except Exception as e:
    log.error(f"Failed to configure app: {str(e)}")
    print(f"ERROR: Failed to configure app: {str(e)}", file=sys.stderr)
    print(f"Traceback: {traceback.format_exc()}", file=sys.stderr)
    raise
