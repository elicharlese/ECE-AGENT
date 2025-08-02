#!/usr/bin/env python3
"""
Vercel Serverless Function Entry Point for Enhanced AGENT System
Routes requests to the appropriate handlers
"""

import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Set environment variables for serverless
os.environ.setdefault('AGENT_ENV', 'production')
os.environ.setdefault('DATABASE_URL', 'sqlite:///./agent_knowledge.db')

from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from datetime import datetime, timezone

# Import our core components
try:
    from knowledge_server import app as knowledge_app
    from agent.enhanced_agent import EnhancedAgent
    from agent.legal_fiscal_optimizer import get_legal_fiscal_optimizer
except ImportError as e:
    print(f"Import error: {e}")
    # Create a minimal app for error handling
    knowledge_app = FastAPI(title="AGENT System - Import Error")

# Create the main Vercel app
app = FastAPI(
    title="Enhanced AGENT System",
    description="Production deployment of the Enhanced AGENT System with multi-domain capabilities",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
static_path = project_root / "static"
if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

# Global variables for serverless
enhanced_agent = None
legal_fiscal_optimizer = None

async def get_enhanced_agent():
    """Get or create enhanced agent instance"""
    global enhanced_agent
    if enhanced_agent is None:
        try:
            enhanced_agent = EnhancedAgent()
            await enhanced_agent.initialize()
        except Exception as e:
            print(f"Error initializing enhanced agent: {e}")
            enhanced_agent = None
    return enhanced_agent

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint - serve main interface"""
    try:
        with open(project_root / "static" / "index.html", "r") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse(f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Enhanced AGENT System</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }}
                .container {{ max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                h1 {{ color: #2c3e50; text-align: center; }}
                .status {{ padding: 20px; background: #e8f5e8; border-radius: 5px; margin: 20px 0; }}
                .api-links {{ margin: 30px 0; }}
                .api-links a {{ display: block; margin: 10px 0; padding: 10px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; text-align: center; }}
                .api-links a:hover {{ background: #2980b9; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 Enhanced AGENT System</h1>
                <div class="status">
                    <h3>✅ System Status: Operational</h3>
                    <p><strong>Version:</strong> 2.0.0</p>
                    <p><strong>Deployment:</strong> Vercel Serverless</p>
                    <p><strong>Timestamp:</strong> {datetime.now(timezone.utc).isoformat()}</p>
                </div>
                <div class="api-links">
                    <a href="/docs">📚 API Documentation</a>
                    <a href="/health">💚 Health Check</a>
                    <a href="/status">📊 System Status</a>
                    <a href="/graphql">🔍 GraphQL Playground</a>
                </div>
                <h3>🎯 Available Features:</h3>
                <ul>
                    <li>Multi-Domain Specialist Agents (Developer, Trader, Lawyer, Researcher, Data Engineer)</li>
                    <li>Knowledge Base with GraphQL API</li>
                    <li>Legal/Fiscal Compliance Monitoring</li>
                    <li>Real-time System Health Monitoring</li>
                    <li>Container Orchestration Capabilities</li>
                </ul>
            </div>
        </body>
        </html>
        """)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        agent = await get_enhanced_agent()
        optimizer = await get_legal_fiscal_optimizer()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": "2.0.0",
            "components": {
                "enhanced_agent": agent is not None,
                "legal_fiscal_optimizer": optimizer is not None,
                "knowledge_base": True,
                "graphql_api": True
            },
            "environment": "production",
            "platform": "vercel"
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )

@app.get("/status")
async def system_status():
    """Get comprehensive system status"""
    try:
        agent = await get_enhanced_agent()
        optimizer = await get_legal_fiscal_optimizer()
        
        status_data = {
            "system_name": "Enhanced AGENT System",
            "version": "2.0.0",
            "status": "operational",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "environment": "production",
            "platform": "vercel",
            "features": {
                "domain_agents": ["developer", "trader", "lawyer", "researcher", "data_engineer"],
                "knowledge_base": True,
                "graphql_api": True,
                "legal_compliance": True,
                "maintenance_monitoring": True,
                "container_orchestration": True
            }
        }
        
        if agent:
            try:
                agent_status = await agent.get_status()
                status_data["agent_metrics"] = agent_status
            except Exception as e:
                status_data["agent_error"] = str(e)
        
        if optimizer:
            try:
                compliance_status = await optimizer.get_compliance_status()
                status_data["compliance"] = compliance_status
            except Exception as e:
                status_data["compliance_error"] = str(e)
        
        return status_data
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )

@app.post("/query")
async def process_query(request: Request):
    """Process agent queries"""
    try:
        body = await request.json()
        query = body.get("query", "")
        domain = body.get("domain", "general")
        
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        agent = await get_enhanced_agent()
        if not agent:
            raise HTTPException(status_code=503, detail="Agent not available")
        
        result = await agent.process_query(query, domain)
        return {
            "success": True,
            "result": result,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )

# Mount the knowledge server endpoints
try:
    # Mount GraphQL and other knowledge server endpoints
    app.mount("/knowledge", knowledge_app)
except Exception as e:
    print(f"Error mounting knowledge server: {e}")

# Vercel serverless handler
handler = app

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
