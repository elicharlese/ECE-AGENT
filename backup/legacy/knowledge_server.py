#!/usr/bin/env python3
"""
Enhanced AGENT Server v2.0 - Batch 2 Patch 4
Knowledge Base with GraphQL Integration Test
"""

import os
import sys
import json
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from fastapi import WebSocket, WebSocketDisconnect

# Add agent module to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Core imports
from agent.knowledge_base_v2 import KnowledgeBase, KnowledgeEntry, CrawlerBackdoor


# Web framework imports
try:
    from fastapi import FastAPI, HTTPException, Request
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
    from pydantic import BaseModel
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install required dependencies: pip install fastapi uvicorn graphene")
    sys.exit(1)


# Initialize FastAPI app
app = FastAPI(
    title="Enhanced AGENT System - Knowledge Base",
    description="Knowledge Base with GraphQL Integration - Batch 2 Patch 4",
    version="2.0.4"
)

# --- Batch 3: WebSocket Real-Time Streaming Endpoint ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/ai-stream")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time AI streaming responses.
    Accepts a JSON message: {"query": "...", "domain": "..."}
    Streams back partial responses as text.
    """
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                query = payload.get("query", "")
                domain = payload.get("domain", "general")
            except Exception:
                await manager.send_personal_message("Invalid input format. Send JSON with 'query' and 'domain' fields.", websocket)
                continue

            # Simulate streaming AI response (replace with real model integration)
            await manager.send_personal_message(f"[AI] Processing query: {query[:50]}...", websocket)
            for i in range(1, 6):
                await asyncio.sleep(0.5)
                await manager.send_personal_message(f"[AI] Partial response {i}/5 for: {query[:30]}...", websocket)
            await manager.send_personal_message(f"[AI] Complete response for: {query[:30]}...", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logging.getLogger(__name__).info("WebSocket client disconnected.")


class QueryRequest(BaseModel):
    query: str
    domain: str = "general"

class QueryResponse(BaseModel):
    success: bool
    result: Dict[str, Any]
    timestamp: str

# Initialize FastAPI app
app = FastAPI(
    title="Enhanced AGENT System - Knowledge Base",
    description="Knowledge Base with GraphQL Integration - Batch 2 Patch 4",
    version="2.0.4"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global knowledge base instance
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
        entries = await knowledge_base.search_entries("", limit=100)
        return [KnowledgeEntryType(
            id=entry.id,
            title=entry.title,
            content=entry.content,
            category=entry.category.value,
            tags=entry.tags,
            confidence_score=entry.confidence,
            source=entry.source_url,
            created_at=entry.created_at,
            updated_at=entry.updated_at
        ) for entry in entries]

    async def resolve_knowledge_entry(self, info, id):
        entry = await knowledge_base.get_entry_by_id(id)
        if not entry:
            return None
        return KnowledgeEntryType(
            id=entry.id,
            title=entry.title,
            content=entry.content,
            category=entry.category.value,
            tags=entry.tags,
            confidence_score=entry.confidence,
            source=entry.source_url,
            created_at=entry.created_at,
            updated_at=entry.updated_at
        )

    async def resolve_crawler_backdoors(self, info):
        backdoors_list = [backdoor.__dict__ for backdoor in knowledge_base.backdoors.values()]
        return [CrawlerBackdoorType(**backdoor) for backdoor in backdoors_list]

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
        from agent.knowledge_base_v2 import KnowledgeCategory, SourceType
        entry_id = await knowledge_base.add_entry(
            title=title,
            content=content,
            category=KnowledgeCategory(category or 'general'),
            source_type=SourceType(source or 'manual'),
            confidence=confidence_score or 0.8,
            tags=tags or [],
            metadata={}
        )
        entry = await knowledge_base.get_entry_by_id(entry_id)
        return AddKnowledgeEntry(entry=KnowledgeEntryType(**entry.__dict__))

class AddCrawlerBackdoor(Mutation):
    class Arguments:
        crawler_name = String(required=True)
        backdoor_type = String(required=True)
        parameters = String()

    backdoor = Field(CrawlerBackdoorType)

    async def mutate(self, info, crawler_name, backdoor_type, parameters=None):
        backdoor_id = await knowledge_base.create_backdoor(
            name=crawler_name,
            endpoint=f"/crawler/{backdoor_type}",
            purpose=f"Backdoor for {crawler_name} - {backdoor_type}",
            security_level="restricted"
        )
        backdoor = knowledge_base.backdoors.get(backdoor_id)
        return AddCrawlerBackdoor(backdoor=CrawlerBackdoorType(**backdoor.__dict__))

class Mutations(ObjectType):
    add_knowledge_entry = AddKnowledgeEntry.Field()
    add_crawler_backdoor = AddCrawlerBackdoor.Field()

# Create GraphQL schema
schema = Schema(query=Query, mutation=Mutations)

@app.on_event("startup")
async def startup_event():
    """Initialize the knowledge base on startup"""
    global knowledge_base
    try:
        logger.info("🚀 Initializing Knowledge Base with GraphQL...")
        knowledge_base = KnowledgeBase()
        await knowledge_base.initialize()
        logger.info("✅ Knowledge Base with GraphQL integration ready")
        
        # Add sample data for testing
        from agent.knowledge_base_v2 import KnowledgeCategory, SourceType
        
        sample_entry_id = await knowledge_base.add_entry(
            title="GraphQL Integration Test",
            content="Testing GraphQL functionality in Batch 2 Patch 4",
            category=KnowledgeCategory.TECHNICAL,
            source_type=SourceType.MANUAL,
            confidence=0.95,
            tags=["graphql", "batch2", "patch4"],
            metadata={"patch": "batch2_patch4"}
        )
        
        sample_backdoor_id = await knowledge_base.create_backdoor(
            name="test_crawler",
            endpoint="/crawler/retrain",
            purpose="Testing soft backdoor functionality for crawler retraining",
            security_level="restricted"
        )
        
        logger.info("🗃️  Sample data added to knowledge base")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize Knowledge Base: {e}")
        raise

@app.post("/query")
async def process_query(request: QueryRequest):
    """Process a general query (simplified version)"""
    try:
        logger.info(f"🔍 Processing query: {request.query[:100]}...")
        
        # Simple query processing
        result = {
            "response": f"Query processed: {request.query}",
            "domain": request.domain,
            "timestamp": datetime.now().isoformat(),
            "status": "success",
            "knowledge_base_ready": knowledge_base is not None
        }
        
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
    """Get system status"""
    try:
        return {
            "status": "operational",
            "timestamp": datetime.now().isoformat(),
            "knowledge_base_ready": knowledge_base is not None,
            "graphql_endpoint": "/graphql",
            "batch": "Batch 2 Patch 4",
            "features": [
                "Knowledge Base with SQLite backend",
                "GraphQL schema for queries and mutations",
                "Crawler backdoor management",
                "REST API endpoints"
            ]
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# GraphQL endpoint
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

# REST endpoints for knowledge base
@app.get("/knowledge/entries")
async def get_knowledge_entries():
    """Get all knowledge base entries (REST endpoint)"""
    try:
        if not knowledge_base:
            raise HTTPException(status_code=503, detail="Knowledge base not initialized")
        
        # Use search with empty query to get all entries
        entries = await knowledge_base.search_entries("", limit=100)
        entries_dict = []
        for entry in entries:
            entries_dict.append({
                "id": entry.id,
                "title": entry.title,
                "content": entry.content,
                "category": entry.category.value,
                "source_type": entry.source_type.value,
                "source_url": entry.source_url,
                "confidence": entry.confidence,
                "relevance_score": entry.relevance_score,
                "created_at": entry.created_at.isoformat(),
                "updated_at": entry.updated_at.isoformat(),
                "metadata": entry.metadata,
                "tags": entry.tags
            })
        return {"entries": entries_dict, "count": len(entries_dict)}
    except Exception as e:
        logger.error(f"❌ Error getting knowledge entries: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/knowledge/entries")
async def add_knowledge_entry(entry_data: dict):
    """Add a new knowledge base entry (REST endpoint)"""
    try:
        if not knowledge_base:
            raise HTTPException(status_code=503, detail="Knowledge base not initialized")
        
        from agent.knowledge_base_v2 import KnowledgeCategory, SourceType
        
        entry_id = await knowledge_base.add_entry(
            title=entry_data.get('title', ''),
            content=entry_data.get('content', ''),
            category=KnowledgeCategory(entry_data.get('category', 'general')),
            source_type=SourceType(entry_data.get('source_type', 'manual')),
            source_url=entry_data.get('source_url'),
            confidence=entry_data.get('confidence', 0.5),
            tags=entry_data.get('tags', []),
            metadata=entry_data.get('metadata', {})
        )
        
        saved_entry = await knowledge_base.get_entry_by_id(entry_id)
        if saved_entry:
            entry_dict = {
                "id": saved_entry.id,
                "title": saved_entry.title,
                "content": saved_entry.content,
                "category": saved_entry.category.value,
                "source_type": saved_entry.source_type.value,
                "source_url": saved_entry.source_url,
                "confidence": saved_entry.confidence,
                "relevance_score": saved_entry.relevance_score,
                "created_at": saved_entry.created_at.isoformat(),
                "updated_at": saved_entry.updated_at.isoformat(),
                "metadata": saved_entry.metadata,
                "tags": saved_entry.tags
            }
        else:
            entry_dict = None
        return {"success": True, "entry_id": entry_id, "entry": entry_dict}
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
        results_dict = []
        for entry in results:
            results_dict.append({
                "id": entry.id,
                "title": entry.title,
                "content": entry.content,
                "category": entry.category.value,
                "source_type": entry.source_type.value,
                "source_url": entry.source_url,
                "confidence": entry.confidence,
                "relevance_score": entry.relevance_score,
                "created_at": entry.created_at.isoformat(),
                "updated_at": entry.updated_at.isoformat(),
                "metadata": entry.metadata,
                "tags": entry.tags
            })
        return {"results": results_dict, "count": len(results_dict), "query": query}
    except Exception as e:
        logger.error(f"❌ Error searching knowledge base: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/crawler/backdoors")
async def get_crawler_backdoors():
    """Get all crawler backdoors (REST endpoint)"""
    try:
        if not knowledge_base:
            raise HTTPException(status_code=503, detail="Knowledge base not initialized")
        
        # Return the backdoors dict as a list
        backdoors_list = [backdoor.__dict__ for backdoor in knowledge_base.backdoors.values()]
        return {"backdoors": backdoors_list, "count": len(backdoors_list)}
    except Exception as e:
        logger.error(f"❌ Error getting crawler backdoors: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/crawler/backdoors")
async def add_crawler_backdoor(backdoor_data: dict):
    """Add a new crawler backdoor (REST endpoint)"""
    try:
        if not knowledge_base:
            raise HTTPException(status_code=503, detail="Knowledge base not initialized")
        
        backdoor_id = await knowledge_base.create_backdoor(
            name=backdoor_data.get('name', ''),
            endpoint=backdoor_data.get('endpoint', '/default'),
            purpose=backdoor_data.get('purpose', 'General crawler access'),
            security_level=backdoor_data.get('security_level', 'restricted')
        )
        
        saved_backdoor = knowledge_base.backdoors.get(backdoor_id)
        backdoor_dict = saved_backdoor.__dict__ if saved_backdoor else None
        return {"success": True, "backdoor_id": backdoor_id, "backdoor": backdoor_dict}
    except Exception as e:
        logger.error(f"❌ Error adding crawler backdoor: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "2.0.4",
            "batch": "Batch 2 Patch 4",
            "knowledge_base": "operational" if knowledge_base else "not_initialized"
        }
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# Try to serve static files if available
try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
    logger.info("✅ Static files mounted")
except Exception as e:
    logger.warning(f"⚠️  Could not mount static files: {e}")

def main():
    """Main function to start the server"""
    print("🚀 Starting Enhanced AGENT Knowledge Base Server...")
    print("📋 Batch 2 Patch 4: Knowledge Base with GraphQL Integration")
    print("🌐 Server will be available at: http://0.0.0.0:8000")
    print("📖 API Documentation: http://0.0.0.0:8000/docs")
    print("🗃️  GraphQL Endpoint: http://0.0.0.0:8000/graphql")
    print("")
    
    uvicorn.run(
        "knowledge_server:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    main()
