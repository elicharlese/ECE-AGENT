from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
import os
from typing import Dict, List, Optional
import asyncio
import json
from datetime import datetime

from agent.core import AGENTCore
from agent.trainer import AGENTTrainer
from agent.web_scraper import WebScraper
from agent.knowledge_base import CyberSecurityKnowledgeBase
from agent.container_orchestrator import ContainerOrchestrator
from agent.security_tools import SecurityToolsManager
import psutil
import time
from datetime import datetime

app = FastAPI(title="AGENT - AI Developer, Trader & Lawyer", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AGENT components
agent_core = AGENTCore()
agent_trainer = AGENTTrainer()
web_scraper = WebScraper()
knowledge_base = CyberSecurityKnowledgeBase()
container_orchestrator = ContainerOrchestrator()
security_tools = SecurityToolsManager()

# Pydantic models
class TrainingData(BaseModel):
    domain: str  # "developer", "trader", "lawyer"
    input_text: str
    expected_output: str
    feedback: Optional[str] = None

class QueryRequest(BaseModel):
    query: str
    domain: str
    use_internet: bool = True

class AdminCommand(BaseModel):
    command: str
    parameters: Dict = {}

# Main AGENT endpoint
@app.post("/agent/query")
async def query_agent(request: QueryRequest):
    """Main endpoint for querying the AGENT"""
    try:
        # Get internet data if requested
        web_context = []
        if request.use_internet:
            web_context = await web_scraper.search_and_scrape(request.query, request.domain)
        
        # Process query through AGENT
        response = await agent_core.process_query(
            query=request.query,
            domain=request.domain,
            web_context=web_context
        )
        
        return {
            "success": True,
            "response": response,
            "domain": request.domain,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Admin endpoints
@app.post("/admin/train")
async def train_model(training_data: TrainingData, background_tasks: BackgroundTasks):
    """Admin endpoint for training the model"""
    try:
        # Add training task to background
        background_tasks.add_task(
            agent_trainer.train_on_data,
            training_data.domain,
            training_data.input_text,
            training_data.expected_output,
            training_data.feedback
        )
        
        return {
            "success": True,
            "message": f"Training initiated for {training_data.domain} domain",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/status")
async def get_agent_status():
    """Get current AGENT status and metrics"""
    try:
        status = await agent_core.get_status()
        training_stats = await agent_trainer.get_training_stats()
        
        return {
            "success": True,
            "agent_status": status,
            "training_stats": training_stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/command")
async def execute_admin_command(command: AdminCommand):
    """Execute admin commands"""
    try:
        result = await agent_core.execute_admin_command(
            command.command,
            command.parameters
        )
        
        return {
            "success": True,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Knowledge Base endpoints
@app.get("/knowledge/vulnerabilities")
async def search_vulnerabilities(query: str, category: str = None):
    """Search cybersecurity vulnerabilities"""
    try:
        results = await knowledge_base.search_vulnerabilities(query, category)
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/knowledge/attack-techniques")
async def search_attack_techniques(query: str, hat_type: str = None):
    """Search attack techniques"""
    try:
        results = await knowledge_base.search_attack_techniques(query, hat_type)
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/knowledge/tools")
async def search_security_tools(query: str, category: str = None):
    """Search security tools"""
    try:
        results = await knowledge_base.search_tools(query, category)
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/knowledge/cs-concepts")
async def get_cs_concepts(category: str = None):
    """Get computer science concepts"""
    try:
        results = await knowledge_base.get_cs_concepts(category)
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Container Orchestrator endpoints
@app.get("/containers/templates")
async def list_container_templates():
    """List available container templates"""
    try:
        templates = await container_orchestrator.list_templates()
        return {"success": True, "templates": templates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/containers/deploy")
async def deploy_container(template_name: str, container_name: str = None):
    """Deploy a container from template"""
    try:
        result = await container_orchestrator.deploy_template(template_name, container_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/containers/list")
async def list_containers():
    """List deployed containers"""
    try:
        containers = await container_orchestrator.list_containers()
        return {"success": True, "containers": containers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/containers/{container_name}/stop")
async def stop_container(container_name: str):
    """Stop a container"""
    try:
        result = await container_orchestrator.stop_container(container_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Security Tools Endpoints
@app.post("/security/port-scan")
async def port_scan(target: str, port_range: str = "common", scan_type: str = "tcp"):
    """Perform port scan on target"""
    try:
        result = await security_tools.port_scan(target, port_range, scan_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/security/build-container")
async def build_security_container(container_name: str, base_image: str, tools: list):
    """Build custom security container"""
    try:
        result = await security_tools.build_container(container_name, base_image, tools)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/security/system-stats")
async def get_system_stats():
    """Get real-time system statistics"""
    try:
        result = await security_tools.get_system_stats()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/security/network-connections")
async def get_network_connections():
    """Get active network connections"""
    try:
        result = await security_tools.get_network_connections()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/security/threats")
async def detect_threats():
    """Detect potential security threats"""
    try:
        result = await security_tools.detect_security_threats()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/security/export-scan/{target}")
async def export_scan_results(target: str):
    """Export scan results for target"""
    try:
        result = await security_tools.export_scan_results(target)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/containers/{container_name}/start")
async def start_container(container_name: str):
    """Start a container"""
    try:
        result = await container_orchestrator.start_container(container_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Comprehensive Health Check
@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint"""
    try:
        # Basic system metrics
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Test AI model responsiveness
        ai_healthy = True
        ai_response_time = 0
        try:
            start_time = time.time()
            test_response = await agent_core.process_query(
                "Health check test", "developer", use_internet=False
            )
            ai_response_time = (time.time() - start_time) * 1000
            ai_healthy = test_response.get("success", False)
        except Exception as e:
            ai_healthy = False
            ai_response_time = 0
        
        # Test database connectivity
        db_healthy = True
        try:
            knowledge_base.search_vulnerabilities("test", limit=1)
        except Exception:
            db_healthy = False
        
        # Calculate overall health
        overall_healthy = (
            cpu_percent < 90 and
            memory.percent < 90 and
            disk.percent < 95 and
            ai_healthy and
            db_healthy
        )
        
        return {
            "status": "healthy" if overall_healthy else "degraded",
            "timestamp": datetime.now().isoformat(),
            "overall_healthy": overall_healthy,
            "system_metrics": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available_gb": memory.available / (1024**3),
                "disk_percent": disk.percent,
                "disk_free_gb": disk.free / (1024**3),
                "uptime_seconds": time.time() - psutil.boot_time()
            },
            "ai_model": {
                "healthy": ai_healthy,
                "response_time_ms": ai_response_time
            },
            "database": {
                "healthy": db_healthy
            },
            "services": {
                "agent_core": True,
                "knowledge_base": db_healthy,
                "security_tools": True,
                "container_orchestrator": True
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "timestamp": datetime.now().isoformat(),
            "overall_healthy": False,
            "error": str(e)
        }

# Serve static files (Enhanced frontend)
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
