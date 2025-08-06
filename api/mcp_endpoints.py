#!/usr/bin/env python3
"""
MCP Management API Endpoints
Provides RESTful endpoints for managing Model Context Protocol connections
"""

import os
import sys
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from agent.mcp_clients.enhanced_mcp_manager import mcp_manager
    from agent.mcp_clients.mcp_registry import MCPServerRegistry
    registry = MCPServerRegistry()
except ImportError as e:
    print(f"Import error: {e}")
    # Fallback for testing
    mcp_manager = None
    MCPServerRegistry = None
    registry = None

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import asyncio
import logging
from datetime import datetime

# Create router for MCP endpoints
router = APIRouter(prefix="/api/mcp", tags=["mcp"])

# Pydantic models for request/response
class MCPTestRequest(BaseModel):
    client_type: str

class MCPConfigRequest(BaseModel):
    server_url: str
    timeout: int = 30
    enabled: bool = True
    retry_attempts: int = 3

class CustomServerRequest(BaseModel):
    name: str
    url: str
    description: str = ""
    auth: str = ""

class MCPResponse(BaseModel):
    success: bool
    message: str = ""
    data: Dict[str, Any] = {}
    timestamp: str = ""

@router.get("/status")
async def get_mcp_status():
    """Get status of all MCP connections"""
    try:
        status = mcp_manager.get_comprehensive_status()
        
        return MCPResponse(
            success=True,
            message="MCP status retrieved successfully",
            data=status,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logging.error(f"Failed to get MCP status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test/{client_type}")
async def test_mcp_connection(client_type: str):
    """Test a specific MCP client connection"""
    try:
        if client_type not in ["developer", "trading", "legal"]:
            raise HTTPException(status_code=400, detail="Invalid client type")
        
        client = mcp_manager.get_client(client_type)
        if not client:
            raise HTTPException(status_code=404, detail=f"Client {client_type} not found")
        
        # Perform health check
        is_healthy = await client.health_check()
        
        return MCPResponse(
            success=is_healthy,
            message=f"{client_type} connection test {'successful' if is_healthy else 'failed'}",
            data={"client_type": client_type, "healthy": is_healthy},
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"MCP connection test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/disconnect/{client_type}")
async def disconnect_mcp_client(client_type: str):
    """Disconnect a specific MCP client"""
    try:
        if client_type not in ["developer", "trading", "legal"]:
            raise HTTPException(status_code=400, detail="Invalid client type")
        
        client = mcp_manager.get_client(client_type)
        if not client:
            raise HTTPException(status_code=404, detail=f"Client {client_type} not found")
        
        await client.disconnect()
        
        return MCPResponse(
            success=True,
            message=f"{client_type} client disconnected successfully",
            data={"client_type": client_type, "status": "disconnected"},
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"MCP disconnect failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/config/{client_type}")
async def update_mcp_config(client_type: str, config: MCPConfigRequest):
    """Update configuration for a specific MCP client"""
    try:
        if client_type not in ["developer", "trading", "legal"]:
            raise HTTPException(status_code=400, detail="Invalid client type")
        
        config_dict = config.dict()
        result = await mcp_manager.update_client_config(client_type, config_dict)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return MCPResponse(
            success=True,
            message=f"{client_type} configuration updated successfully",
            data=result,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"MCP config update failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scan")
async def scan_for_mcp_servers():
    """Scan for available MCP servers"""
    try:
        # Mock server discovery - in production this would scan network/registry
        available_servers = [
            {
                "type": "finance",
                "name": "Finance MCP Server",
                "description": "Financial analysis and accounting tools",
                "url": "ws://localhost:8084",
                "icon": "💰",
                "status": "available"
            },
            {
                "type": "healthcare",
                "name": "Healthcare MCP Server", 
                "description": "Medical research and healthcare analysis",
                "url": "ws://localhost:8085",
                "icon": "🏥",
                "status": "available"
            },
            {
                "type": "research",
                "name": "Research MCP Server",
                "description": "Academic and scientific research tools",
                "url": "ws://localhost:8086",
                "icon": "🔬",
                "status": "available"
            },
            {
                "type": "marketing",
                "name": "Marketing MCP Server",
                "description": "Marketing and customer analysis",
                "url": "ws://localhost:8087",
                "icon": "📊",
                "status": "available"
            },
            {
                "type": "security",
                "name": "Security MCP Server",
                "description": "Cybersecurity and threat analysis",
                "url": "ws://localhost:8088",
                "icon": "🔒",
                "status": "available"
            },
            {
                "type": "analytics",
                "name": "Analytics MCP Server",
                "description": "Data analytics and visualization",
                "url": "ws://localhost:8089",
                "icon": "📈",
                "status": "available"
            }
        ]
        
        return MCPResponse(
            success=True,
            message=f"Found {len(available_servers)} available servers",
            data={"servers": available_servers},
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logging.error(f"Server scan failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/add")
async def add_mcp_server(request: Dict[str, str]):
    """Add a new MCP server"""
    try:
        server_type = request.get("serverType")
        if not server_type:
            raise HTTPException(status_code=400, detail="Server type is required")
        
        # Mock adding server - in production this would configure and initialize the client
        logging.info(f"Adding {server_type} MCP server")
        
        # Simulate some processing time
        await asyncio.sleep(0.5)
        
        return MCPResponse(
            success=True,
            message=f"{server_type} server added successfully",
            data={"server_type": server_type, "status": "added"},
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Add server failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-custom")
async def test_custom_server(request: CustomServerRequest):
    """Test connection to a custom MCP server"""
    try:
        # Mock testing custom server
        logging.info(f"Testing custom server: {request.name} at {request.url}")
        
        # Simulate connection test
        await asyncio.sleep(1.0)
        
        # For demo purposes, randomly succeed/fail based on URL
        success = not request.url.endswith("8999")  # Fail if port 8999
        
        return MCPResponse(
            success=success,
            message=f"Custom server test {'successful' if success else 'failed'}",
            data={
                "name": request.name,
                "url": request.url,
                "test_result": "passed" if success else "failed"
            },
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logging.error(f"Custom server test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/add-custom")
async def add_custom_server(request: CustomServerRequest):
    """Add a custom MCP server"""
    try:
        logging.info(f"Adding custom server: {request.name}")
        
        # Mock adding custom server
        await asyncio.sleep(0.5)
        
        return MCPResponse(
            success=True,
            message=f"Custom server '{request.name}' added successfully",
            data={
                "name": request.name,
                "url": request.url,
                "description": request.description,
                "status": "added"
            },
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logging.error(f"Add custom server failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def mcp_health_check():
    """Comprehensive health check of all MCP connections"""
    try:
        health_status = await mcp_manager.enhanced_health_check()
        
        return MCPResponse(
            success=health_status["overall_status"] == "healthy",
            message=f"MCP system status: {health_status['overall_status']}",
            data=health_status,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logging.error(f"MCP health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/training-data")
async def get_mcp_training_data():
    """Get unified training data from all MCP clients"""
    try:
        training_data = await mcp_manager.get_unified_training_data()
        
        return MCPResponse(
            success=training_data["success"],
            message="Training data retrieved successfully",
            data=training_data,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logging.error(f"Get training data failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute/{client_type}/{task_type}")
async def execute_mcp_task(client_type: str, task_type: str, request: Dict[str, Any]):
    """Execute a specific task on an MCP client"""
    try:
        if client_type not in ["developer", "trading", "legal"]:
            raise HTTPException(status_code=400, detail="Invalid client type")
        
        # Route to appropriate task executor
        if client_type == "developer":
            result = await mcp_manager.execute_developer_task(task_type, **request)
        elif client_type == "trading":
            result = await mcp_manager.execute_trading_task(task_type, **request)
        elif client_type == "legal":
            result = await mcp_manager.execute_legal_task(task_type, **request)
        else:
            raise HTTPException(status_code=400, detail="Invalid client type")
        
        return MCPResponse(
            success=result.get("success", False),
            message=f"Task {task_type} executed on {client_type} client",
            data=result,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Task execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/initialize")
async def initialize_mcp_system(background_tasks: BackgroundTasks):
    """Initialize the entire MCP system"""
    try:
        # Initialize in background
        background_tasks.add_task(mcp_manager.enhanced_initialize_all)
        
        return MCPResponse(
            success=True,
            message="MCP system initialization started",
            data={"status": "initializing"},
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logging.error(f"MCP initialization failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/registry/search")
async def search_mcp_servers(
    category: Optional[str] = None,
    query: Optional[str] = None,
    limit: int = 20
):
    """Search MCP servers in the registry"""
    try:
        if not registry:
            return MCPResponse(
                success=False,
                error="Registry not available",
                data={"servers": []}
            )
        
        servers = await registry.search_servers(
            category=category,
            query=query,
            limit=limit
        )
        
        return MCPResponse(
            success=True,
            data={"servers": servers, "count": len(servers)}
        )
    except Exception as e:
        logging.error(f"Server search error: {e}")
        return MCPResponse(
            success=False,
            error=str(e),
            data={"servers": []}
        )

@router.get("/registry/popular")
async def get_popular_servers(limit: int = 10):
    """Get most popular MCP servers"""
    try:
        servers = registry.get_popular_servers(limit)
        
        return MCPResponse(
            success=True,
            message=f"Retrieved {len(servers)} popular servers",
            data={"servers": servers},
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logging.error(f"Get popular servers failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/registry/recommended")
async def get_recommended_servers(interests: List[str] = None):
    """Get recommended MCP servers based on interests"""
    try:
        if interests is None:
            interests = ["developer", "trading", "legal"]
        
        servers = registry.get_recommended_servers(interests)
        
        return MCPResponse(
            success=True,
            message=f"Retrieved {len(servers)} recommended servers",
            data={"servers": servers, "interests": interests},
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logging.error(f"Get recommended servers failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/registry/server/{server_name}")
async def get_server_details(server_name: str):
    """Get detailed information about a specific server"""
    try:
        server = await registry.get_server_details(server_name)
        
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        return MCPResponse(
            success=True,
            message=f"Retrieved details for {server_name}",
            data={"server": server},
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get server details failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/registry/installation/{server_name}")
async def get_installation_guide(server_name: str):
    """Get installation guide for a specific server"""
    try:
        server = await registry.get_server_details(server_name)
        
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        guide = registry.get_installation_guide(server)
        
        return MCPResponse(
            success=True,
            message=f"Retrieved installation guide for {server_name}",
            data={"guide": guide},
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get installation guide failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/registry/validate")
async def validate_server_url(request: Dict[str, str]):
    """Validate if a server URL is MCP-compliant"""
    try:
        server_url = request.get("url")
        if not server_url:
            raise HTTPException(status_code=400, detail="Server URL is required")
        
        validation_result = await registry.validate_server(server_url)
        
        return MCPResponse(
            success=validation_result["valid"],
            message="Server validation completed",
            data=validation_result,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Server validation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/registry/discover")
async def discover_online_servers():
    """Discover servers from online registries"""
    try:
        servers = await registry.discover_online_servers()
        
        return MCPResponse(
            success=True,
            message=f"Discovered {len(servers)} servers from online registries",
            data={"servers": servers},
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logging.error(f"Online discovery failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/registry/health-check")
async def check_servers_health(request: Dict[str, List[Dict]]):
    """Check health status of multiple servers"""
    try:
        servers = request.get("servers", [])
        
        if not servers:
            raise HTTPException(status_code=400, detail="Server list is required")
        
        health_results = await registry.check_server_health(servers)
        
        return MCPResponse(
            success=True,
            message=f"Health check completed for {len(servers)} servers",
            data={"health_results": health_results},
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
