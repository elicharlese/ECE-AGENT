#!/usr/bin/env python3
"""
AGENT LLM Server - FastAPI backend for AGENT LLM system
Integrates RAISE framework, ReAct processing, and vector store
"""

import asyncio
import os
import sys
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

# Add lib directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import AGENT components
from memory.vector_store import FreeVectorStore
from llm.base_wrapper import FreeLLMWrapper
from agents.modes import FreeAgentModes
from reasoning.raise_controller import get_raise_controller

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="AGENT LLM API",
    description="Advanced AI Agent with RAISE framework and ReAct processing",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global components
vector_store = None
llm_wrapper = None
agent_modes = None
raise_controller = None

# Request/Response models
class ProcessRequest(BaseModel):
    message: str
    conversationId: str
    userId: Optional[str] = None
    agentMode: str = "smart_assistant"
    context: Dict[str, Any] = {}
    enableReasoning: bool = True
    collectFeedback: bool = True

class ProcessResponse(BaseModel):
    response: str
    agent_mode: str
    confidence: float
    reasoning_trace: List[Dict[str, Any]]
    examples_used: int
    tools_used: List[str]
    suggestions: List[str]
    interaction_id: Optional[str] = None
    model_used: str = "agent-llm"
    processing_time: float

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    components: Dict[str, str]

class AnalyticsResponse(BaseModel):
    total_interactions: int
    average_processing_time: float
    mode_usage: Dict[str, int]
    performance_metrics: Dict[str, Any]

async def initialize_components():
    """Initialize all AGENT components"""
    global vector_store, llm_wrapper, agent_modes, raise_controller
    
    try:
        logger.info("Initializing AGENT LLM components...")
        
        # Initialize vector store
        vector_store = FreeVectorStore()
        logger.info("✅ Vector store initialized")
        
        # Initialize LLM wrapper
        llm_wrapper = FreeLLMWrapper(
            vector_store=vector_store,
            ollama_host=os.getenv('OLLAMA_HOST', 'http://localhost:11434'),
            groq_api_key=os.getenv('GROQ_API_KEY')
        )
        logger.info("✅ LLM wrapper initialized")
        
        # Initialize agent modes
        agent_modes = FreeAgentModes()
        logger.info("✅ Agent modes initialized")
        
        # Initialize RAISE controller
        raise_controller = get_raise_controller(
            vector_store=vector_store,
            llm_wrapper=llm_wrapper,
            agent_modes=agent_modes
        )
        logger.info("✅ RAISE controller initialized")
        
        logger.info("🎉 All AGENT components initialized successfully!")
        
    except Exception as e:
        logger.error(f"Failed to initialize components: {e}")
        raise

@app.on_event("startup")
async def startup_event():
    """Initialize components on startup"""
    await initialize_components()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AGENT LLM API Server",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Check component status
        components = {
            "vector_store": "ready" if vector_store else "not_initialized",
            "llm_wrapper": "ready" if llm_wrapper else "not_initialized", 
            "agent_modes": "ready" if agent_modes else "not_initialized",
            "raise_controller": "ready" if raise_controller else "not_initialized"
        }
        
        # Check if all components are ready
        all_ready = all(status == "ready" for status in components.values())
        status = "healthy" if all_ready else "degraded"
        
        return HealthResponse(
            status=status,
            timestamp=datetime.now().isoformat(),
            components=components
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            timestamp=datetime.now().isoformat(),
            components={"error": str(e)}
        )

@app.post("/process", response_model=ProcessResponse)
async def process_message(request: ProcessRequest):
    """Process user message with AGENT LLM"""
    try:
        if not raise_controller:
            # Fallback response when system not initialized
            logger.warning("AGENT system not initialized, using fallback response")
            return ProcessResponse(
                response=f"I'm currently initializing. I understand you said: '{request.message}'. Please try again in a moment.",
                agent_mode=request.agentMode,
                confidence=0.3,
                reasoning_trace=[{
                    "step": 1,
                    "type": "fallback",
                    "content": "System not initialized, using fallback response",
                    "confidence": 0.3,
                    "timestamp": datetime.now().isoformat()
                }],
                examples_used=0,
                tools_used=[],
                suggestions=[],
                interaction_id=f"fallback_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                model_used="fallback",
                processing_time=0.1
            )
        
        logger.info(f"Processing message for conversation: {request.conversationId}")
        
        # Process with RAISE controller
        result = await raise_controller.process_user_input(
            user_input=request.message,
            conversation_id=request.conversationId,
            user_id=request.userId,
            suggested_mode=request.agentMode,
            context_metadata=request.context
        )
        
        # Format response
        response = ProcessResponse(
            response=result["response"],
            agent_mode=result["agent_mode"],
            confidence=0.85,  # Default confidence
            reasoning_trace=result.get("reasoning_trace", []),
            examples_used=result["metadata"].get("examples_retrieved", 0),
            tools_used=result.get("tool_usage", []),
            suggestions=[],  # TODO: Implement suggestions
            interaction_id=f"interaction_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            model_used="agent-llm",
            processing_time=result["metadata"].get("response_time", 0.0)
        )
        
        logger.info(f"Successfully processed message for conversation: {request.conversationId}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        
        # Return fallback response instead of raising exception
        return ProcessResponse(
            response=f"I apologize, but I encountered an error while processing your request: '{request.message}'. Please try again or rephrase your question.",
            agent_mode=request.agentMode,
            confidence=0.1,
            reasoning_trace=[{
                "step": 1,
                "type": "error",
                "content": f"Error occurred: {str(e)}",
                "confidence": 0.1,
                "timestamp": datetime.now().isoformat()
            }],
            examples_used=0,
            tools_used=[],
            suggestions=[],
            interaction_id=f"error_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            model_used="error-fallback",
            processing_time=0.1
        )

@app.get("/modes")
async def get_agent_modes():
    """Get available agent modes"""
    try:
        if not agent_modes:
            raise HTTPException(status_code=503, detail="Agent modes not initialized")
        
        modes = agent_modes.get_available_modes()
        return {"modes": modes}
        
    except Exception as e:
        logger.error(f"Error getting agent modes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics():
    """Get system analytics"""
    try:
        if not raise_controller:
            raise HTTPException(status_code=503, detail="RAISE controller not initialized")
        
        stats = raise_controller.get_performance_stats()
        
        return AnalyticsResponse(
            total_interactions=stats["controller_stats"]["total_messages"],
            average_processing_time=0.0,  # TODO: Calculate from stats
            mode_usage={mode: metrics["total_interactions"] for mode, metrics in stats["mode_performance"].items()},
            performance_metrics=stats
        )
        
    except Exception as e:
        logger.error(f"Error getting analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_detailed_stats():
    """Get detailed system statistics"""
    try:
        if not raise_controller:
            raise HTTPException(status_code=503, detail="RAISE controller not initialized")
        
        return raise_controller.get_performance_stats()
        
    except Exception as e:
        logger.error(f"Error getting detailed stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reset/{conversation_id}")
async def reset_conversation(conversation_id: str):
    """Reset a conversation"""
    try:
        if not raise_controller:
            raise HTTPException(status_code=503, detail="RAISE controller not initialized")
        
        success = raise_controller.reset_conversation(conversation_id)
        return {"success": success, "conversation_id": conversation_id}
        
    except Exception as e:
        logger.error(f"Error resetting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize")
async def optimize_performance():
    """Optimize system performance"""
    try:
        if not raise_controller:
            raise HTTPException(status_code=503, detail="RAISE controller not initialized")
        
        optimizations = raise_controller.optimize_performance()
        return optimizations
        
    except Exception as e:
        logger.error(f"Error optimizing performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "agent_server:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )