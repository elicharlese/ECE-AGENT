"""
Base classes for the AGENT system to avoid circular imports
"""
import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum

class ReasoningType(Enum):
    CHAIN_OF_THOUGHT = "chain_of_thought"
    REACT = "react"
    REFLECTION = "reflection"
    PLANNING = "planning"

@dataclass
class Thought:
    """Represents a single thought in the reasoning process"""
    id: str
    content: str
    type: ReasoningType
    confidence: float
    timestamp: datetime
    metadata: Dict[str, Any] = None

@dataclass
class Tool:
    """Represents a tool that can be used by the agent"""
    name: str
    description: str
    function: Callable
    parameters: Dict[str, Any]
    required_params: List[str]

@dataclass
class Memory:
    """Represents a memory item"""
    id: str
    content: str
    context: str
    importance: float
    timestamp: datetime
    tags: List[str]

class EnhancedAgentBase(ABC):
    """Enhanced base class for all AGENT domain agents with advanced agentic capabilities"""
    
    def __init__(self, domain: str):
        self.domain = domain
        self.logger = logging.getLogger(f"{self.__class__.__name__}")
        
        # Import here to avoid circular imports
        from .enhanced_agent import MemoryManager, ToolRegistry, ReasoningEngine, PlanningEngine
        
        # Core agentic components
        self.memory_manager = MemoryManager()
        self.tool_registry = ToolRegistry()
        self.reasoning_engine = ReasoningEngine()
        self.planning_engine = PlanningEngine()
        
        # Agent state
        self.current_context = {}
        self.active_plan = None
        self.reasoning_history = []
        
        # Initialize domain-specific tools and knowledge
        self.setup_domain_tools()
        self.setup_domain_knowledge()
    
    @abstractmethod
    def setup_domain_tools(self):
        """Setup domain-specific tools"""
        pass
    
    @abstractmethod
    def setup_domain_knowledge(self):
        """Setup domain-specific knowledge base"""
        pass
    
    async def process_enhanced(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Enhanced processing with full agentic capabilities"""
        try:
            # Update context
            self.current_context.update(context or {})
            
            # Step 1: Analyze the query and determine approach
            analysis = await self.analyze_query(query)
            
            # Step 2: Create or update plan if needed
            if analysis.get("requires_planning", False):
                self.active_plan = await self.planning_engine.create_plan(
                    goal=query,
                    context=self.current_context,
                    available_tools=self.tool_registry.get_available_tools()
                )
            
            # Step 3: Execute reasoning process
            reasoning_result = await self.reasoning_engine.reason(
                query=query,
                context=self.current_context,
                reasoning_type=analysis.get("reasoning_type", ReasoningType.CHAIN_OF_THOUGHT),
                tools=self.tool_registry,
                memory=self.memory_manager
            )
            
            # Step 4: Execute plan if exists
            if self.active_plan:
                execution_result = await self.planning_engine.execute_plan(
                    plan=self.active_plan,
                    tools=self.tool_registry,
                    context=self.current_context
                )
                reasoning_result.update(execution_result)
            
            # Step 5: Store important information in memory
            await self.store_interaction_memory(query, reasoning_result)
            
            # Step 6: Self-reflection and improvement
            reflection = await self.self_reflect(query, reasoning_result)
            
            return {
                "answer": reasoning_result.get("final_answer", "I need more information to provide a complete response."),
                "reasoning_chain": reasoning_result.get("reasoning_chain", []),
                "tools_used": reasoning_result.get("tools_used", []),
                "confidence": reasoning_result.get("confidence", 0.7),
                "plan_executed": self.active_plan is not None,
                "reflection": reflection,
                "proactive_suggestions": await self.generate_proactive_suggestions(query, reasoning_result),
                "domain": self.domain,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error in enhanced processing: {e}")
            return {
                "answer": f"I encountered an error while processing your {self.domain} query. Let me try a different approach.",
                "error": str(e),
                "confidence": 0.0
            }
    
    async def analyze_query(self, query: str) -> Dict[str, Any]:
        """Analyze query to determine processing approach"""
        query_lower = query.lower()
        
        # Determine if planning is needed
        planning_keywords = ["plan", "strategy", "approach", "steps", "how to", "process"]
        requires_planning = any(keyword in query_lower for keyword in planning_keywords)
        
        # Determine reasoning type
        if any(word in query_lower for word in ["analyze", "compare", "evaluate"]):
            reasoning_type = ReasoningType.CHAIN_OF_THOUGHT
        elif any(word in query_lower for word in ["research", "find", "search", "investigate"]):
            reasoning_type = ReasoningType.REACT
        elif any(word in query_lower for word in ["review", "check", "assess"]):
            reasoning_type = ReasoningType.REFLECTION
        else:
            reasoning_type = ReasoningType.CHAIN_OF_THOUGHT
        
        # Determine complexity
        complexity = "simple"
        if len(query.split()) > 20 or "?" in query.count("?") > 1:
            complexity = "complex"
        elif any(word in query_lower for word in ["comprehensive", "detailed", "thorough"]):
            complexity = "detailed"
        
        return {
            "requires_planning": requires_planning,
            "reasoning_type": reasoning_type,
            "complexity": complexity,
            "estimated_steps": 3 if complexity == "simple" else 5 if complexity == "detailed" else 7
        }
    
    async def store_interaction_memory(self, query: str, result: Dict[str, Any]):
        """Store important information from the interaction"""
        memory_content = {
            "query": query,
            "domain": self.domain,
            "tools_used": result.get("tools_used", []),
            "confidence": result.get("confidence", 0.0),
            "success": result.get("confidence", 0.0) > 0.5
        }
        
        await self.memory_manager.store_memory(
            content=json.dumps(memory_content),
            context=f"{self.domain}_interaction",
            importance=result.get("confidence", 0.5),
            tags=[self.domain, "interaction", "query_response"]
        )
    
    async def self_reflect(self, query: str, result: Dict[str, Any]) -> Dict[str, Any]:
        """Perform self-reflection on the response quality"""
        confidence = result.get("confidence", 0.0)
        tools_used = result.get("tools_used", [])
        
        reflection = {
            "quality_assessment": "good" if confidence > 0.7 else "needs_improvement" if confidence > 0.4 else "poor",
            "improvement_suggestions": [],
            "learning_opportunities": []
        }
        
        # Identify improvement opportunities
        if confidence < 0.7:
            reflection["improvement_suggestions"].append("Consider using additional tools or data sources")
        
        if not tools_used:
            reflection["improvement_suggestions"].append("Explore using domain-specific tools for better results")
        
        # Identify learning opportunities
        if "new" in query.lower() or "latest" in query.lower():
            reflection["learning_opportunities"].append("Update knowledge base with recent information")
        
        return reflection
    
    async def generate_proactive_suggestions(self, query: str, result: Dict[str, Any]) -> List[str]:
        """Generate proactive suggestions for the user"""
        suggestions = []
        
        # Domain-specific suggestions will be implemented in subclasses
        base_suggestions = [
            "Would you like me to provide more detailed analysis?",
            "I can help you with related questions in this domain.",
            "Consider exploring complementary topics for a broader perspective."
        ]
        
        return base_suggestions[:2]  # Return top 2 suggestions
