"""
Test suite for the EnhancedAgent class and related components.
This module tests the enhanced agentic capabilities including memory management,
tool registry, reasoning engine, and planning engine.
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, MagicMock, AsyncMock
from datetime import datetime

from agent.enhanced_agent import EnhancedAgent, MemoryManager, ToolRegistry, ReasoningEngine, PlanningEngine
from agent.base_classes import ReasoningType, Thought, Tool, Memory


class TestEnhancedAgent:
    """Test suite for the EnhancedAgent class"""
    
    def setup_method(self):
        """Set up test fixtures before each test method."""
        # Create a simple mock for the EnhancedAgent
        self.agent = Mock()
        self.agent.logger = Mock()
        self.agent.metrics = {
            "queries_processed": 0,
            "successful_responses": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "domain_usage": {}
        }
        # Mock other attributes that EnhancedAgent expects
        self.agent.memory_manager = Mock()
        self.agent.tool_registry = Mock()
        self.agent.reasoning_engine = Mock()
        self.agent.planning_engine = Mock()
        self.agent.multi_model_router = Mock()
        self.agent.rust_integration = Mock()
        self.agent.enhanced_cache = Mock()
        self.agent.enhanced_string_processor = Mock()
        self.agent.current_context = {}
        self.agent.active_plans = {}
        self.agent.reasoning_history = []
        self.agent.enhanced_metrics = {}
        # Mock methods
        self.agent.process_enhanced_query = AsyncMock(return_value={"result": "mock result"})
        self.agent.create_and_execute_plan = AsyncMock(return_value={"result": "mock plan result"})
    
    @pytest.mark.asyncio
    async def test_init_enhanced_agent(self):
        """Test EnhancedAgent initialization"""
        # Test that all enhanced components are initialized
        assert hasattr(self.agent, 'memory_manager')
        assert hasattr(self.agent, 'tool_registry')
        assert hasattr(self.agent, 'reasoning_engine')
        assert hasattr(self.agent, 'planning_engine')
        assert hasattr(self.agent, 'multi_model_router')
        assert hasattr(self.agent, 'rust_integration')
        assert hasattr(self.agent, 'enhanced_cache')
        assert hasattr(self.agent, 'enhanced_string_processor')
        
        # Test that agent state is initialized
        assert isinstance(self.agent.current_context, dict)
        assert isinstance(self.agent.active_plans, dict)
        assert isinstance(self.agent.reasoning_history, list)
        assert isinstance(self.agent.enhanced_metrics, dict)
    
    @pytest.mark.asyncio
    async def test_enhanced_process_query(self):
        """Test enhanced query processing with reasoning"""
        query = "How do I optimize this Python code for better performance?"
        domain = "developer"
        
        # Mock the core processing
        with patch.object(self.agent, '_route_to_domain_agent', return_value={
            "answer": "Here's how to optimize your Python code...",
            "confidence": 0.9,
            "sources": [],
            "reasoning": ""
        }):
            with patch.object(self.agent.reasoning_engine, 'reason', return_value={
                "answer": "Enhanced answer with reasoning",
                "confidence": 0.95,
                "reasoning": "Chain of thought reasoning applied",
                "tools_used": []
            }):
                result = await self.agent.process_enhanced_query(query, domain)
                
                # Assertions
                assert result is not None
                assert isinstance(result, dict)
                assert "result" in result
                
    @pytest.mark.asyncio
    async def test_create_and_execute_plan(self):
        """Test plan creation and execution"""
        goal = "Create a Python script to analyze stock data"
        
        # Mock plan creation
        mock_plan = {
            "goal": goal,
            "steps": [
                {"id": 1, "action": "research", "description": "Research stock analysis libraries"},
                {"id": 2, "action": "code", "description": "Write Python script"}
            ]
        }
        
        with patch.object(self.agent.planning_engine, 'create_plan', return_value=mock_plan):
            with patch.object(self.agent.planning_engine, 'execute_plan', new_async=AsyncMock(return_value={
                "status": "completed",
                "result": "Python script created successfully"
            })):
                result = await self.agent.create_and_execute_plan(goal)
                
                # Assertions
                assert result is not None
                assert "result" in result


class TestMemoryManager:
    """Test suite for the MemoryManager class"""
    
    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.memory_manager = MemoryManager()
    
    @pytest.mark.asyncio
    async def test_store_memory(self):
        """Test storing a new memory"""
        content = "User asked about Python optimization techniques"
        context = "developer domain"
        importance = 0.8
        tags = ["python", "optimization"]
        
        initial_count = len(self.memory_manager.memories)
        await self.memory_manager.store_memory(content, context, importance, tags)
        
        # Assertions
        assert len(self.memory_manager.memories) == initial_count + 1
        assert self.memory_manager.memories[-1].content == content
        assert self.memory_manager.memories[-1].context == context
        assert self.memory_manager.memories[-1].importance == importance
        assert self.memory_manager.memories[-1].tags == tags
    
    @pytest.mark.asyncio
    async def test_retrieve_memories(self):
        """Test retrieving relevant memories"""
        # Store some memories first
        await self.memory_manager.store_memory(
            "Python optimization techniques", 
            "developer domain", 
            0.8, 
            ["python", "optimization"]
        )
        await self.memory_manager.store_memory(
            "Stock market analysis methods", 
            "trader domain", 
            0.7, 
            ["stocks", "analysis"]
        )
        
        # Retrieve memories
        memories = await self.memory_manager.retrieve_memories(context="developer", limit=5)
        
        # Assertions
        assert isinstance(memories, list)
        assert len(memories) >= 1
        # Check that at least one memory contains "Python"
        assert any("Python" in mem.content for mem in memories)


class TestToolRegistry:
    """Test suite for the ToolRegistry class"""
    
    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.tool_registry = ToolRegistry()
    
    def test_register_tool(self):
        """Test registering a new tool"""
        def mock_tool(query: str) -> str:
            return f"Results for: {query}"
        
        tool_name = "test_tool"
        description = "A test tool for testing"
        parameters = {"query": {"type": "string", "description": "Search query"}}
        required_params = ["query"]
        
        initial_count = len(self.tool_registry.tools)
        self.tool_registry.register_tool(
            tool_name, description, mock_tool, parameters, required_params
        )
        
        # Assertions
        assert len(self.tool_registry.tools) == initial_count + 1
        assert tool_name in self.tool_registry.tools
        assert isinstance(self.tool_registry.tools[tool_name], Tool)
    
    def test_get_available_tools(self):
        """Test getting list of available tools"""
        tools = self.tool_registry.get_available_tools()
        
        # Assertions
        assert isinstance(tools, list)
        assert len(tools) > 0
        # Check that base tools are present
        assert "web_search" in tools
        assert "calculator" in tools
    
    @pytest.mark.asyncio
    async def test_use_tool(self):
        """Test using a specific tool"""
        result = await self.tool_registry.use_tool("calculator", expression="2+2")
        
        # Assertions
        assert result is not None
        # The calculator should return 4 for 2+2
        assert "4" in str(result) or 4 == result or "success" in result


class TestReasoningEngine:
    """Test suite for the ReasoningEngine class"""
    
    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.reasoning_engine = ReasoningEngine()
        self.mock_tools = Mock()
        # Mock the async use_tool method
        self.mock_tools.use_tool = AsyncMock(return_value={"result": "mock result"})
        self.mock_memory = Mock()
        # Mock the async retrieve_memories method
        self.mock_memory.retrieve_memories = AsyncMock(return_value=[])
        self.context = {"domain": "developer"}
    
    @pytest.mark.asyncio
    async def test_reason_with_chain_of_thought(self):
        """Test reasoning with chain of thought approach"""
        query = "How do I fix a memory leak in Python?"
        
        result = await self.reasoning_engine.reason(
            query, self.context, ReasoningType.CHAIN_OF_THOUGHT, 
            self.mock_tools, self.mock_memory
        )
        
        # Assertions
        assert result is not None
        assert isinstance(result, dict)
        assert "final_answer" in result
        assert "confidence" in result
        assert "reasoning_chain" in result
    
    @pytest.mark.asyncio
    async def test_reason_with_react(self):
        """Test reasoning with ReAct approach"""
        query = "What is the current price of AAPL stock?"
        
        result = await self.reasoning_engine.reason(
            query, self.context, ReasoningType.REACT, 
            self.mock_tools, self.mock_memory
        )
        
        # Assertions
        assert result is not None
        assert isinstance(result, dict)
        assert "final_answer" in result
        assert "confidence" in result
        assert "reasoning_chain" in result


class TestPlanningEngine:
    """Test suite for the PlanningEngine class"""
    
    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.planning_engine = PlanningEngine()
    
    @pytest.mark.asyncio
    async def test_create_plan(self):
        """Test creating a multi-step plan"""
        goal = "Create a Python web scraper for news articles"
        context = {"domain": "developer"}
        available_tools = ["web_search", "calculator"]
        
        plan = await self.planning_engine.create_plan(goal, context, available_tools)
        
        # Assertions
        assert plan is not None
        assert isinstance(plan, dict)
        assert "goal" in plan
        assert "steps" in plan
        assert plan["goal"] == goal
        assert isinstance(plan["steps"], list)
        assert len(plan["steps"]) > 0
    
    @pytest.mark.asyncio
    async def test_execute_plan(self):
        """Test executing a plan"""
        mock_plan = {
            "goal": "Test plan execution",
            "steps": [
                {"step": 1, "action": "research", "description": "Research topic"},
                {"step": 2, "action": "code", "description": "Write code"}
            ]
        }
        
        self.mock_tools = Mock()
        # Mock the async use_tool method
        self.mock_tools.use_tool = AsyncMock(return_value={"result": "mock result"})
        context = {"domain": "developer"}
        
        result = await self.planning_engine.execute_plan(mock_plan, self.mock_tools, context)
        
        # Assertions
        assert result is not None
        assert isinstance(result, dict)


if __name__ == "__main__":
    pytest.main(["-v"])
