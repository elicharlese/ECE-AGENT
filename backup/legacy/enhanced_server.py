#!/usr/bin/env python3
"""
Enhanced AGENT Server v2.0
Advanced agentic system with FastAPI web interface and GraphQL integration
"""

import os
import sys
import json
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
import concurrent.futures
from pathlib import Path

# Add agent module to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Core imports
from agent.enhanced_agent import EnhancedAgent
from agent.knowledge_base_v2 import KnowledgeBase, KnowledgeEntry, CrawlerBackdoor
from agent.performance_monitor import PerformanceMonitor

# Web framework imports
try:
    from fastapi import FastAPI, HTTPException, Request
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
    from pydantic import BaseModel
    import uvicorn
    # GraphQL imports
    import graphene
    from graphene import ObjectType, String, Int, List, DateTime, Float, Field, Mutation, Schema
    import json
    print("✅ All required modules imported successfully")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install required dependencies: pip install fastapi uvicorn graphene starlette")
    sys.exit(1)

# Initialize logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic models for API
class QueryRequest(BaseModel):
    query: str
    domain: str = "general"
    use_enhanced: bool = True

class QueryResponse(BaseModel):
    success: bool
    result: Dict[str, Any]
    timestamp: str

# Initialize FastAPI app
app = FastAPI(
    title="Enhanced AGENT System",
    description="Advanced AI system with agentic capabilities - Batch 1 Implementation",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global enhanced agent instance
enhanced_agent = None
knowledge_base = None

# GraphQL Schema Definitions
class KnowledgeEntryType(ObjectType):
    id = String()
    title = String()
    content = String()
    category = String()
    tags = List(String)
    confidence_score = Float()
    source = String()
    created_at = DateTime()
    updated_at = DateTime()

class CrawlerBackdoorType(ObjectType):
    id = String()
    crawler_name = String()
    backdoor_type = String()
    parameters = String()
    active = String()
    created_at = DateTime()
    updated_at = DateTime()

class Query(ObjectType):
    knowledge_entries = List(KnowledgeEntryType)
    knowledge_entry = Field(KnowledgeEntryType, id=String(required=True))
    crawler_backdoors = List(CrawlerBackdoorType)
    search_knowledge = List(KnowledgeEntryType, query=String(required=True))

    async def resolve_knowledge_entries(self, info):
        entries = await knowledge_base.get_all_entries()
        return [KnowledgeEntryType(**entry) for entry in entries]

    async def resolve_knowledge_entry(self, info, id):
        entry = await knowledge_base.get_entry(id)
        return KnowledgeEntryType(**entry) if entry else None

    async def resolve_crawler_backdoors(self, info):
        backdoors = await knowledge_base.get_all_backdoors()
        return [CrawlerBackdoorType(**backdoor) for backdoor in backdoors]

    async def resolve_search_knowledge(self, info, query):
        results = await knowledge_base.search_entries(query)
        return [KnowledgeEntryType(**entry) for entry in results]

class AddKnowledgeEntry(Mutation):
    class Arguments:
        title = String(required=True)
        content = String(required=True)
        category = String()
        tags = List(String)
        confidence_score = Float()
        source = String()

    entry = Field(KnowledgeEntryType)

    async def mutate(self, info, title, content, category=None, tags=None, confidence_score=None, source=None):
        entry_data = {
            'title': title,
            'content': content,
            'category': category,
            'tags': tags or [],
            'confidence_score': confidence_score,
            'source': source
        }
        entry_id = await knowledge_base.add_entry(KnowledgeEntry(**entry_data))
        entry = await knowledge_base.get_entry(entry_id)
        return AddKnowledgeEntry(entry=KnowledgeEntryType(**entry))

class AddCrawlerBackdoor(Mutation):
    class Arguments:
        crawler_name = String(required=True)
        backdoor_type = String(required=True)
        parameters = String()

    backdoor = Field(CrawlerBackdoorType)

    async def mutate(self, info, crawler_name, backdoor_type, parameters=None):
        backdoor_data = {
            'crawler_name': crawler_name,
            'backdoor_type': backdoor_type,
            'parameters': parameters or "{}"
        }
        backdoor_id = await knowledge_base.add_backdoor(CrawlerBackdoor(**backdoor_data))
        backdoor = await knowledge_base.get_backdoor(backdoor_id)
        return AddCrawlerBackdoor(backdoor=CrawlerBackdoorType(**backdoor))

class Mutations(ObjectType):
    add_knowledge_entry = AddKnowledgeEntry.Field()
    add_crawler_backdoor = AddCrawlerBackdoor.Field()

# Create GraphQL schema
schema = Schema(query=Query, mutation=Mutations)

# Global enhanced agent instance
enhanced_agent = None

@app.on_event("startup")
async def startup_event():
    """Initialize the enhanced agent and knowledge base on startup"""
    global enhanced_agent, knowledge_base
    try:
        logger.info("🚀 Initializing Enhanced AGENT System...")
        enhanced_agent = EnhancedAgent()
        knowledge_base = KnowledgeBase()
        await knowledge_base.initialize()
        logger.info("✅ Enhanced AGENT System and Knowledge Base initialized successfully")
        
        # Log system capabilities
        status = await enhanced_agent.get_enhanced_status()
        logger.info(f"🧠 Enhanced capabilities: {list(status['enhanced_capabilities'].keys())}")
        logger.info(f"🔧 Available tools: {status['available_tools']}")
        logger.info(f"⚡ Rust integration: {status['rust_integration_enhanced']['available']}")
        logger.info("🗃️  Knowledge Base with GraphQL integration ready")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize Enhanced AGENT: {e}")
        raise

@app.get("/")
async def root():
    """Root endpoint with system information"""
    return {
        "message": "Enhanced AGENT System v2.0",
        "status": "running",
        "capabilities": [
            "Advanced reasoning",
            "Multi-step planning", 
            "Memory management",
            "Self-reflection",
            "Tool integration",
            "Domain expertise (Developer, Trader, Lawyer)"
        ],
        "batch": "Batch 1 - Core System Implementation",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """Enhanced query processing endpoint"""
    try:
        if not enhanced_agent:
            raise HTTPException(status_code=500, detail="Enhanced AGENT not initialized")
        
        logger.info(f"🔍 Processing query: {request.query[:100]}...")
        
        if request.use_enhanced:
            # Use enhanced processing with full agentic capabilities
            result = await enhanced_agent.process_enhanced_query(
                query=request.query,
                domain=request.domain
            )
        else:
            # Use core processing only
            result = await enhanced_agent.process_query(
                query=request.query,
                domain=request.domain
            )
        
        logger.info(f"✅ Query processed successfully with confidence: {result.get('confidence', 'N/A')}")
        
        return QueryResponse(
            success=True,
            result=result,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"❌ Error processing query: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status")
async def get_system_status():
    """Get comprehensive system status"""
    try:
        if not enhanced_agent:
            return {"status": "not_initialized", "error": "Enhanced AGENT not initialized"}
        
        status = await enhanced_agent.get_enhanced_status()
        
        return {
            "status": "operational",
            "timestamp": datetime.now().isoformat(),
            "system_info": status,
            "batch_1_features": {
                "rust_integration": status.get("rust_integration_enhanced", {}).get("available", False),
                "enhanced_capabilities": status.get("enhanced_capabilities", {}),
                "memory_items": status.get("memory_items", 0),
                "active_plans": status.get("active_plans", 0),
                "available_tools": status.get("available_tools", [])
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/domains")
async def get_available_domains():
    """Get available domain agents"""
    return {
        "domains": [
            {
                "name": "developer",
                "description": "Software development, code review, architecture, debugging",
                "capabilities": ["Code analysis", "Best practices", "Architecture design", "Bug fixing"]
            },
            {
                "name": "trader",
                "description": "Financial markets, trading strategies, risk management",
                "capabilities": ["Market analysis", "Risk assessment", "Trading strategies", "Portfolio optimization"]
            },
            {
                "name": "lawyer",
                "description": "Legal analysis, contract review, compliance",
                "capabilities": ["Legal research", "Contract analysis", "Compliance guidance", "Risk assessment"]
            },
            {
                "name": "general",
                "description": "General AI capabilities with enhanced reasoning",
                "capabilities": ["Multi-step reasoning", "Planning", "Research", "Analysis"]
            }
        ]
    }

@app.get("/metrics")
async def get_system_metrics():
    """Get system performance metrics"""
    try:
        if not enhanced_agent:
            raise HTTPException(status_code=500, detail="Enhanced AGENT not initialized")
        
        status = await enhanced_agent.get_enhanced_status()
        
        return {
            "core_metrics": status.get("metrics", {}),
            "enhanced_metrics": status.get("enhanced_metrics", {}),
            "performance_metrics": status.get("performance_metrics", {}),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    try:
        if not enhanced_agent:
            return {
                "status": "unhealthy",
                "reason": "Enhanced AGENT not initialized",
                "timestamp": datetime.now().isoformat()
            }
        
        # Quick test query
        test_result = await enhanced_agent.process_enhanced_query(
            "Health check test", "general"
        )
        
        is_healthy = test_result.get("confidence", 0) > 0
        
        return {
            "status": "healthy" if is_healthy else "degraded",
            "confidence": test_result.get("confidence", 0),
            "enhanced": test_result.get("enhanced", False),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# GraphQL endpoints
@app.post("/graphql")
async def graphql_endpoint(request: Request):
    """GraphQL endpoint for knowledge base queries"""
    try:
        if not knowledge_base:
            raise HTTPException(status_code=503, detail="Knowledge base not initialized")
        
        body = await request.body()
        data = json.loads(body)
        
        query = data.get('query')
        variables = data.get('variables', {})
        
        result = await schema.execute_async(query, variable_values=variables)
        
        response_data = {'data': result.data}
        if result.errors:
            response_data['errors'] = [str(error) for error in result.errors]
        
        return JSONResponse(response_data)
    except Exception as e:
        logger.error(f"❌ GraphQL endpoint error: {e}")
        return JSONResponse({'errors': [str(e)]}, status_code=500)

@app.get("/knowledge/entries")
async def get_knowledge_entries():
    """Get all knowledge base entries (REST endpoint)"""
    try:
        if not knowledge_base:
            raise HTTPException(status_code=503, detail="Knowledge base not initialized")
        
        entries = await knowledge_base.get_all_entries()
        return {"entries": entries, "count": len(entries)}
    except Exception as e:
        logger.error(f"❌ Error getting knowledge entries: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/knowledge/entries")
async def add_knowledge_entry(entry_data: dict):
    """Add a new knowledge base entry (REST endpoint)"""
    try:
        if not knowledge_base:
            raise HTTPException(status_code=503, detail="Knowledge base not initialized")
        
        entry = KnowledgeEntry(
            title=entry_data.get('title', ''),
            content=entry_data.get('content', ''),
            category=entry_data.get('category'),
            tags=entry_data.get('tags', []),
            confidence_score=entry_data.get('confidence_score'),
            source=entry_data.get('source')
        )
        
        entry_id = await knowledge_base.add_entry(entry)
        saved_entry = await knowledge_base.get_entry(entry_id)
        return {"success": True, "entry_id": entry_id, "entry": saved_entry}
    except Exception as e:
        logger.error(f"❌ Error adding knowledge entry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/knowledge/search")
async def search_knowledge(query: str):
    """Search knowledge base entries (REST endpoint)"""
    try:
        if not knowledge_base:
            raise HTTPException(status_code=503, detail="Knowledge base not initialized")
        
        results = await knowledge_base.search_entries(query)
        return {"results": results, "count": len(results), "query": query}
    except Exception as e:
        logger.error(f"❌ Error searching knowledge base: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/crawler/backdoors")
async def get_crawler_backdoors():
    """Get all crawler backdoors (REST endpoint)"""
    try:
        if not knowledge_base:
            raise HTTPException(status_code=503, detail="Knowledge base not initialized")
        
        backdoors = await knowledge_base.get_all_backdoors()
        return {"backdoors": backdoors, "count": len(backdoors)}
    except Exception as e:
        logger.error(f"❌ Error getting crawler backdoors: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/crawler/backdoors")
async def add_crawler_backdoor(backdoor_data: dict):
    """Add a new crawler backdoor (REST endpoint)"""
    try:
        if not knowledge_base:
            raise HTTPException(status_code=503, detail="Knowledge base not initialized")
        
        backdoor = CrawlerBackdoor(
            crawler_name=backdoor_data.get('crawler_name', ''),
            backdoor_type=backdoor_data.get('backdoor_type', ''),
            parameters=backdoor_data.get('parameters', '{}')
        )
        
        backdoor_id = await knowledge_base.add_backdoor(backdoor)
        saved_backdoor = await knowledge_base.get_backdoor(backdoor_id)
        return {"success": True, "backdoor_id": backdoor_id, "backdoor": saved_backdoor}
    except Exception as e:
        logger.error(f"❌ Error adding crawler backdoor: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Try to serve static files if available
try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
    logger.info("✅ Static files mounted")
except Exception as e:
    logger.warning(f"⚠️  Could not mount static files: {e}")

def main():
    """Main function to start the server"""
    print("🚀 Starting Enhanced AGENT Web Server...")
    print("📋 Batch 1 Implementation: Core System with Enhanced Capabilities")
    print("🌐 Server will be available at: http://0.0.0.0:8000")
    print("📖 API Documentation: http://0.0.0.0:8000/docs")
    print("")
    
    try:
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            log_level="info",
            reload=False
        )
    except KeyboardInterrupt:
        print("\n🛑 Server shutdown requested by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
