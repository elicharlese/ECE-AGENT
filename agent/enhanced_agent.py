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

class MemoryManager:
    """Manages agent memory for context retention and learning"""
    
    def __init__(self):
        self.memories: List[Memory] = []
        self.max_memories = 1000
        
    async def store_memory(self, content: str, context: str, importance: float, tags: List[str]) -> str:
        """Store a new memory"""
        memory_id = str(uuid.uuid4())
        memory = Memory(
            id=memory_id,
            content=content,
            context=context,
            importance=importance,
            timestamp=datetime.now(),
            tags=tags
        )
        
        self.memories.append(memory)
        
        # Cleanup old memories if needed
        if len(self.memories) > self.max_memories:
            self.memories.sort(key=lambda m: m.importance, reverse=True)
            self.memories = self.memories[:self.max_memories]
        
        return memory_id
    
    async def retrieve_memories(self, context: str = None, tags: List[str] = None, limit: int = 10) -> List[Memory]:
        """Retrieve relevant memories"""
        relevant_memories = self.memories
        
        if context:
            relevant_memories = [m for m in relevant_memories if context in m.context]
        
        if tags:
            relevant_memories = [m for m in relevant_memories if any(tag in m.tags for tag in tags)]
        
        # Sort by importance and recency
        relevant_memories.sort(key=lambda m: (m.importance, m.timestamp), reverse=True)
        
        return relevant_memories[:limit]

class ToolRegistry:
    """Registry for managing available tools"""
    
    def __init__(self):
        self.tools: Dict[str, Tool] = {}
        self.setup_base_tools()
    
    def setup_base_tools(self):
        """Setup base tools available to all agents"""
        # Web search tool
        self.register_tool(
            name="web_search",
            description="Search the internet for current information",
            function=self._web_search,
            parameters={"query": "str", "max_results": "int"},
            required_params=["query"]
        )
        
        # Calculator tool
        self.register_tool(
            name="calculator",
            description="Perform mathematical calculations",
            function=self._calculate,
            parameters={"expression": "str"},
            required_params=["expression"]
        )
    
    def register_tool(self, name: str, description: str, function: Callable, 
                     parameters: Dict[str, Any], required_params: List[str]):
        """Register a new tool"""
        tool = Tool(
            name=name,
            description=description,
            function=function,
            parameters=parameters,
            required_params=required_params
        )
        self.tools[name] = tool
    
    def get_available_tools(self) -> List[str]:
        """Get list of available tool names"""
        return list(self.tools.keys())
    
    async def use_tool(self, tool_name: str, **kwargs) -> Dict[str, Any]:
        """Use a specific tool"""
        if tool_name not in self.tools:
            return {"error": f"Tool {tool_name} not found"}
        
        tool = self.tools[tool_name]
        
        # Validate required parameters
        for param in tool.required_params:
            if param not in kwargs:
                return {"error": f"Required parameter {param} missing"}
        
        try:
            result = await tool.function(**kwargs)
            return {"success": True, "result": result}
        except Exception as e:
            return {"error": str(e)}
    
    async def _web_search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Web search implementation"""
        # Placeholder implementation
        return [{"title": f"Search result for {query}", "url": "https://example.com", "snippet": "Sample content"}]
    
    async def _calculate(self, expression: str) -> float:
        """Calculator implementation"""
        try:
            # Safe evaluation of mathematical expressions
            allowed_chars = set('0123456789+-*/.() ')
            if all(c in allowed_chars for c in expression):
                return eval(expression)
            else:
                raise ValueError("Invalid characters in expression")
        except Exception as e:
            raise ValueError(f"Calculation error: {e}")

class ReasoningEngine:
    """Handles different types of reasoning processes"""
    
    async def reason(self, query: str, context: Dict[str, Any], reasoning_type: ReasoningType,
                    tools: ToolRegistry, memory: MemoryManager) -> Dict[str, Any]:
        """Execute reasoning process based on type"""
        
        if reasoning_type == ReasoningType.CHAIN_OF_THOUGHT:
            return await self._chain_of_thought_reasoning(query, context, tools, memory)
        elif reasoning_type == ReasoningType.REACT:
            return await self._react_reasoning(query, context, tools, memory)
        elif reasoning_type == ReasoningType.REFLECTION:
            return await self._reflection_reasoning(query, context, tools, memory)
        else:
            return await self._chain_of_thought_reasoning(query, context, tools, memory)
    
    async def _chain_of_thought_reasoning(self, query: str, context: Dict[str, Any],
                                        tools: ToolRegistry, memory: MemoryManager) -> Dict[str, Any]:
        """Chain of Thought reasoning implementation"""
        reasoning_chain = []
        
        # Step 1: Break down the problem
        reasoning_chain.append({
            "step": 1,
            "thought": f"Breaking down the query: {query}",
            "action": "analysis"
        })
        
        # Step 2: Identify relevant information
        relevant_memories = await memory.retrieve_memories(tags=[context.get("domain", "general")])
        reasoning_chain.append({
            "step": 2,
            "thought": f"Found {len(relevant_memories)} relevant memories",
            "action": "memory_retrieval"
        })
        
        # Step 3: Apply domain knowledge
        reasoning_chain.append({
            "step": 3,
            "thought": "Applying domain-specific knowledge and reasoning",
            "action": "knowledge_application"
        })
        
        # Step 4: Generate response
        final_answer = f"Based on my analysis of '{query}', here's my response using chain of thought reasoning."
        reasoning_chain.append({
            "step": 4,
            "thought": "Synthesizing final response",
            "action": "response_generation"
        })
        
        return {
            "reasoning_chain": reasoning_chain,
            "final_answer": final_answer,
            "confidence": 0.8,
            "tools_used": []
        }
    
    async def _react_reasoning(self, query: str, context: Dict[str, Any],
                              tools: ToolRegistry, memory: MemoryManager) -> Dict[str, Any]:
        """ReAct (Reasoning + Acting) implementation"""
        reasoning_chain = []
        tools_used = []
        
        # Thought: What do I need to find out?
        reasoning_chain.append({
            "type": "thought",
            "content": f"I need to research information about: {query}"
        })
        
        # Act: Use web search tool
        search_result = await tools.use_tool("web_search", query=query, max_results=3)
        tools_used.append("web_search")
        
        reasoning_chain.append({
            "type": "action",
            "content": f"Searched for information: {search_result}"
        })
        
        # Observation: What did I find?
        reasoning_chain.append({
            "type": "observation",
            "content": "Found relevant information from search results"
        })
        
        # Thought: How should I respond?
        reasoning_chain.append({
            "type": "thought",
            "content": "Now I can provide a comprehensive response based on the research"
        })
        
        final_answer = f"Based on my research about '{query}', here's what I found using ReAct reasoning."
        
        return {
            "reasoning_chain": reasoning_chain,
            "final_answer": final_answer,
            "confidence": 0.85,
            "tools_used": tools_used
        }
    
    async def _reflection_reasoning(self, query: str, context: Dict[str, Any],
                                   tools: ToolRegistry, memory: MemoryManager) -> Dict[str, Any]:
        """Reflection-based reasoning implementation"""
        reasoning_chain = []
        
        # Initial response
        initial_response = f"Initial thoughts on '{query}'"
        reasoning_chain.append({
            "phase": "initial",
            "content": initial_response
        })
        
        # Reflection
        reasoning_chain.append({
            "phase": "reflection",
            "content": "Let me reflect on this response and consider if it's complete and accurate"
        })
        
        # Refinement
        reasoning_chain.append({
            "phase": "refinement",
            "content": "After reflection, I can provide a more refined response"
        })
        
        final_answer = f"After careful reflection on '{query}', here's my considered response."
        
        return {
            "reasoning_chain": reasoning_chain,
            "final_answer": final_answer,
            "confidence": 0.9,
            "tools_used": []
        }

class PlanningEngine:
    """Handles multi-step planning and execution"""
    
    async def create_plan(self, goal: str, context: Dict[str, Any], available_tools: List[str]) -> Dict[str, Any]:
        """Create a multi-step plan to achieve the goal"""
        plan = {
            "id": str(uuid.uuid4()),
            "goal": goal,
            "steps": [],
            "estimated_duration": "5-10 minutes",
            "required_tools": []
        }
        
        # Generate plan steps based on goal
        if "research" in goal.lower():
            plan["steps"] = [
                {"step": 1, "action": "identify_research_questions", "tool": None},
                {"step": 2, "action": "search_information", "tool": "web_search"},
                {"step": 3, "action": "analyze_findings", "tool": None},
                {"step": 4, "action": "synthesize_response", "tool": None}
            ]
        elif "analyze" in goal.lower():
            plan["steps"] = [
                {"step": 1, "action": "break_down_problem", "tool": None},
                {"step": 2, "action": "gather_data", "tool": "web_search"},
                {"step": 3, "action": "apply_analysis_framework", "tool": None},
                {"step": 4, "action": "draw_conclusions", "tool": None}
            ]
        else:
            plan["steps"] = [
                {"step": 1, "action": "understand_requirements", "tool": None},
                {"step": 2, "action": "gather_information", "tool": "web_search"},
                {"step": 3, "action": "process_information", "tool": None},
                {"step": 4, "action": "generate_response", "tool": None}
            ]
        
        return plan
    
    async def execute_plan(self, plan: Dict[str, Any], tools: ToolRegistry, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the created plan"""
        execution_results = []
        
        for step in plan["steps"]:
            step_result = await self._execute_step(step, tools, context)
            execution_results.append(step_result)
        
        return {
            "plan_executed": True,
            "execution_results": execution_results,
            "plan_success": all(result.get("success", False) for result in execution_results)
        }
    
    async def _execute_step(self, step: Dict[str, Any], tools: ToolRegistry, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single plan step"""
        try:
            if step.get("tool"):
                # Use the specified tool
                tool_result = await tools.use_tool(step["tool"], query=context.get("query", ""))
                return {"step": step["step"], "success": True, "result": tool_result}
            else:
                # Execute action without tool
                return {"step": step["step"], "success": True, "result": f"Completed {step['action']}"}
        except Exception as e:
            return {"step": step["step"], "success": False, "error": str(e)}
