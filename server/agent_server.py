#!/usr/bin/env python3
"""
AGENT LLM FastAPI Server
Provides HTTP API endpoints for the AGENT LLM system
"""

import asyncio
import os
import sys
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

# Add lib directory to path
sys.path.append(str(Path(__file__).parent.parent))

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Import AGENT LLM components
try:
    from lib.llm.base_wrapper import FreeLLMWrapper
    from lib.memory.vector_store import FreeVectorStore
    from lib.agents.modes import AgentModes
    from lib.reasoning.raise_controller import RAISEController
except ImportError as e:
    print(f"Warning: Could not import AGENT components: {e}")
    print("Running in mock mode...")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models for API
class AgentRequest(BaseModel):
    message: str = Field(..., description="User message")
    conversationId: str = Field(..., description="Conversation ID")
    userId: Optional[str] = Field(None, description="User ID")
    agentMode: str = Field("smart_assistant", description="Agent mode")
    context: Dict[str, Any] = Field(default_factory=dict, description="Context data")
    enableReasoning: bool = Field(True, description="Enable ReAct reasoning")
    collectFeedback: bool = Field(True, description="Collect interaction data")

class AgentResponse(BaseModel):
    content: str
    agentMode: str
    confidence: float
    reasoningTrace: List[Dict[str, Any]]
    examplesRetrieved: int
    toolsUsed: List[str]
    suggestions: List[str]
    metadata: Dict[str, Any]
    interactionId: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    components: Dict[str, str]

class AnalyticsResponse(BaseModel):
    total_interactions: int
    average_processing_time: float
    mode_usage: Dict[str, int]
    vector_store_stats: Dict[str, Any]

# Global AGENT system components
agent_system = None
data_collector = []  # Simple in-memory storage for demo

class AGENTSystem:
    """Main AGENT system coordinator"""
    
    def __init__(self):
        self.vector_store = None
        self.llm_wrapper = None
        self.agent_modes = None
        self.raise_controller = None
        self.initialized = False
        
    async def initialize(self):
        """Initialize all AGENT components"""
        try:
            logger.info("Initializing AGENT LLM System...")
            
            # Initialize vector store
            persist_dir = os.getenv('VECTOR_STORE_PATH', './data/vector_store')
            os.makedirs(persist_dir, exist_ok=True)
            
            self.vector_store = FreeVectorStore(
                collection_name="agent_examples",
                persist_directory=persist_dir
            )
            
            # Initialize LLM wrapper with vector store
            self.llm_wrapper = FreeLLMWrapper(
                vector_store=self.vector_store,
                ollama_host=os.getenv('OLLAMA_HOST', 'http://localhost:11434'),
                groq_api_key=os.getenv('GROQ_API_KEY')
            )
            
            # Initialize agent modes (if available)
            try:
                from lib.agents.modes import AgentModes
                self.agent_modes = AgentModes()
            except ImportError:
                logger.warning("AgentModes not available, using basic modes")
                self.agent_modes = self._create_basic_modes()
            
            # Initialize RAISE controller (if available)
            try:
                from lib.reasoning.raise_controller import RAISEController
                self.raise_controller = RAISEController(self.llm_wrapper, self.vector_store)
            except ImportError:
                logger.warning("RAISEController not available, using basic reasoning")
                self.raise_controller = None
            
            # Seed with some initial examples
            await self._seed_examples()
            
            self.initialized = True
            logger.info("✅ AGENT LLM System initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize AGENT system: {e}")
            self.initialized = False
            raise
    
    def _create_basic_modes(self):
        """Create basic agent modes if AgentModes class not available"""
        class BasicAgentModes:
            def get_available_modes(self):
                return {
                    "smart_assistant": {"name": "Smart Assistant", "description": "General AI assistance"},
                    "code_companion": {"name": "Code Companion", "description": "Programming and development help"},
                    "creative_writer": {"name": "Creative Writer", "description": "Writing and content creation"},
                    "legal_assistant": {"name": "Legal Assistant", "description": "Legal analysis and compliance"},
                    "designer_agent": {"name": "Designer Agent", "description": "Visual design and UX"}
                }
        return BasicAgentModes()
    
    async def _seed_examples(self):
        """Seed the vector store with initial examples"""
        examples = [
            {
                "text": "How do I create a React component? Here's a simple example: function MyComponent() { return <div>Hello World</div>; }",
                "metadata": {"mode": "code_companion", "quality_score": 4.5, "source": "seed"}
            },
            {
                "text": "To write compelling content, start with a strong hook, develop your main points clearly, and end with a call to action.",
                "metadata": {"mode": "creative_writer", "quality_score": 4.2, "source": "seed"}
            },
            {
                "text": "When analyzing contracts, pay attention to termination clauses, liability limitations, and intellectual property rights.",
                "metadata": {"mode": "legal_assistant", "quality_score": 4.0, "source": "seed"}
            },
            {
                "text": "Good UI design follows principles of contrast, repetition, alignment, and proximity to create visual hierarchy.",
                "metadata": {"mode": "designer_agent", "quality_score": 4.3, "source": "seed"}
            },
            {
                "text": "To manage tasks effectively, use the Getting Things Done method: capture, clarify, organize, reflect, and engage.",
                "metadata": {"mode": "smart_assistant", "quality_score": 4.1, "source": "seed"}
            }
        ]
        
        # Check if examples already exist
        stats = self.vector_store.get_collection_stats()
        if stats.get("total_examples", 0) == 0:
            logger.info("Seeding vector store with initial examples...")
            for example in examples:
                self.vector_store.add_example(example["text"], example["metadata"])
            logger.info(f"✅ Added {len(examples)} seed examples")
    
    async def process_message(self, request: AgentRequest) -> AgentResponse:
        """Process a message through the AGENT system"""
        if not self.initialized:
            raise HTTPException(status_code=503, detail="AGENT system not initialized")
        
        start_time = datetime.now()
        
        try:
            # Use ReAct reasoning if available
            if self.llm_wrapper and hasattr(self.llm_wrapper, 'generate_with_react'):
                result = await self.llm_wrapper.generate_with_react(
                    user_input=request.message,
                    agent_mode=request.agentMode,
                    max_iterations=5,
                    use_examples=True
                )
                
                processing_time = (datetime.now() - start_time).total_seconds()
                
                # Log interaction
                if request.collectFeedback:
                    interaction = {
                        "id": f"interaction_{len(data_collector)}",
                        "conversation_id": request.conversationId,
                        "user_input": request.message,
                        "agent_response": result["response"],
                        "agent_mode": request.agentMode,
                        "processing_time": processing_time,
                        "timestamp": start_time.isoformat(),
                        "reasoning_steps": len(result.get("reasoning_trace", [])),
                        "examples_used": result.get("examples_used", 0)
                    }
                    data_collector.append(interaction)
                
                return AgentResponse(
                    content=result["response"],
                    agentMode=request.agentMode,
                    confidence=0.85,  # TODO: Calculate actual confidence
                    reasoningTrace=result.get("reasoning_trace", []),
                    examplesRetrieved=result.get("examples_used", 0),
                    toolsUsed=result.get("tool_usage", []),
                    suggestions=[],  # TODO: Generate suggestions
                    metadata={
                        "processingTime": processing_time,
                        "timestamp": start_time.isoformat(),
                        "agentVersion": "1.0.0",
                        "modelUsed": "ollama+groq"
                    },
                    interactionId=f"interaction_{len(data_collector) - 1}" if request.collectFeedback else None
                )
            
            else:
                # Fallback to basic response
                raise HTTPException(status_code=503, detail="LLM wrapper not available")
                
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    
    def get_health(self) -> HealthResponse:
        """Get system health status"""
        components = {
            "llm_wrapper": "ready" if self.llm_wrapper else "not_available",
            "vector_store": "ready" if self.vector_store else "not_available",
            "agent_modes": "ready" if self.agent_modes else "not_available",
            "raise_controller": "ready" if self.raise_controller else "not_available"
        }
        
        overall_status = "healthy" if self.initialized else "degraded"
        
        return HealthResponse(
            status=overall_status,
            timestamp=datetime.now().isoformat(),
            components=components
        )
    
    def get_analytics(self) -> AnalyticsResponse:
        """Get system analytics"""
        total = len(data_collector)
        avg_time = sum(i.get("processing_time", 0) for i in data_collector) / max(total, 1)
        
        mode_usage = {}
        for interaction in data_collector:
            mode = interaction.get("agent_mode", "unknown")
            mode_usage[mode] = mode_usage.get(mode, 0) + 1
        
        vector_stats = self.vector_store.get_collection_stats() if self.vector_store else {}
        
        return AnalyticsResponse(
            total_interactions=total,
            average_processing_time=avg_time,
            mode_usage=mode_usage,
            vector_store_stats=vector_stats
        )

# Initialize FastAPI app
app = FastAPI(
    title="AGENT LLM API",
    description="Advanced AI Agent system with ReAct reasoning and RAISE framework",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize AGENT system on startup"""
    global agent_system
    agent_system = AGENTSystem()
    await agent_system.initialize()

@app.post("/api/agents", response_model=AgentResponse)
async def process_agent_message(request: AgentRequest, background_tasks: BackgroundTasks):
    """Process a message through the AGENT system"""
    if not agent_system or not agent_system.initialized:
        raise HTTPException(status_code=503, detail="AGENT system not ready")
    
    return await agent_system.process_message(request)

@app.get("/api/agents/health", response_model=HealthResponse)
async def get_health():
    """Get system health status"""
    if not agent_system:
        raise HTTPException(status_code=503, detail="AGENT system not initialized")
    
    return agent_system.get_health()

@app.get("/api/agents/analytics", response_model=AnalyticsResponse)
async def get_analytics():
    """Get system analytics"""
    if not agent_system:
        raise HTTPException(status_code=503, detail="AGENT system not initialized")
    
    return agent_system.get_analytics()

@app.get("/api/agents/modes")
async def get_agent_modes():
    """Get available agent modes"""
    if not agent_system or not agent_system.agent_modes:
        raise HTTPException(status_code=503, detail="Agent modes not available")
    
    modes = agent_system.agent_modes.get_available_modes()
    return {"modes": modes}

@app.get("/api/agents")
async def get_agent_info():
    """Get general API information"""
    return {
        "message": "AGENT LLM API (Full Implementation)",
        "version": "1.0.0",
        "status": "ready" if agent_system and agent_system.initialized else "initializing",
        "endpoints": {
            "POST /api/agents": "Process message with AGENT LLM",
            "GET /api/agents/health": "Get system health status",
            "GET /api/agents/analytics": "Get interaction analytics",
            "GET /api/agents/modes": "Get available agent modes"
        },
        "features": [
            "ReAct reasoning framework",
            "RAISE synthesis engine",
            "Vector-based example retrieval",
            "Multi-modal agent support",
            "Continuous learning pipeline"
        ]
    }

if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Configure server
    host = os.getenv("AGENT_HOST", "0.0.0.0")
    port = int(os.getenv("AGENT_PORT", "8000"))
    
    print(f"🚀 Starting AGENT LLM Server on {host}:{port}")
    print("📋 Available endpoints:")
    print("  • POST /api/agents - Process messages")
    print("  • GET /api/agents/health - Health check")
    print("  • GET /api/agents/analytics - Analytics")
    print("  • GET /api/agents/modes - Agent modes")
    
    uvicorn.run(
        "agent_server:app",
        host=host,
        port=port,
        reload=os.getenv("AGENT_DEBUG", "false").lower() == "true",
        log_level="info"
    )