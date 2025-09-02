"""
FreeRAISEController - RAISE Framework Orchestrator
Implements Retrieval-Augmented Inference Synthesis Engine for AGENT LLM
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from collections import defaultdict

from memory.vector_store import FreeVectorStore
from llm.base_wrapper import FreeLLMWrapper
from agents.modes import FreeAgentModes, AgentMode

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ConversationContext:
    """Represents a conversation context with working memory"""
    conversation_id: str
    user_id: Optional[str] = None
    current_agent_mode: str = "smart_assistant"
    working_memory: Dict[str, Any] = field(default_factory=dict)
    message_history: List[Dict[str, Any]] = field(default_factory=list)
    retrieved_examples: List[Dict[str, Any]] = field(default_factory=list)
    reasoning_traces: List[Dict[str, Any]] = field(default_factory=list)
    performance_metrics: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)
    
    def update_memory(self, key: str, value: Any) -> None:
        """Update working memory with timestamp"""
        self.working_memory[key] = {
            "value": value,
            "timestamp": datetime.now().isoformat(),
            "access_count": self.working_memory.get(key, {}).get("access_count", 0) + 1
        }
        self.last_updated = datetime.now()
    
    def get_memory(self, key: str) -> Any:
        """Retrieve from working memory"""
        memory_item = self.working_memory.get(key)
        if memory_item:
            # Update access count
            memory_item["access_count"] += 1
            memory_item["last_accessed"] = datetime.now().isoformat()
            return memory_item["value"]
        return None
    
    def add_message(self, role: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> None:
        """Add message to conversation history"""
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        self.message_history.append(message)
        self.last_updated = datetime.now()
        
        # Maintain conversation history limit (keep last 50 messages)
        if len(self.message_history) > 50:
            self.message_history = self.message_history[-50:]
    
    def get_recent_context(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent conversation context"""
        return self.message_history[-limit:] if self.message_history else []


@dataclass
class AgentPerformanceMetrics:
    """Tracks performance metrics for agent modes"""
    mode: str
    total_interactions: int = 0
    successful_responses: int = 0
    average_response_time: float = 0.0
    average_quality_score: float = 0.0
    tool_usage_count: int = 0
    example_retrieval_count: int = 0
    error_count: int = 0
    last_updated: datetime = field(default_factory=datetime.now)
    
    def update_metrics(self, response_time: float, quality_score: float, 
                      tools_used: int, examples_retrieved: int, success: bool) -> None:
        """Update performance metrics"""
        self.total_interactions += 1
        if success:
            self.successful_responses += 1
        
        # Update rolling averages
        self.average_response_time = (
            (self.average_response_time * (self.total_interactions - 1)) + response_time
        ) / self.total_interactions
        
        if quality_score > 0:
            self.average_quality_score = (
                (self.average_quality_score * (self.total_interactions - 1)) + quality_score
            ) / self.total_interactions
        
        self.tool_usage_count += tools_used
        self.example_retrieval_count += examples_retrieved
        self.last_updated = datetime.now()
    
    def get_success_rate(self) -> float:
        """Calculate success rate"""
        return self.successful_responses / self.total_interactions if self.total_interactions > 0 else 0.0


class FreeRAISEController:
    """
    RAISE Framework Controller - Orchestrates Retrieval-Augmented Inference Synthesis Engine
    
    Features:
    - Working memory management for conversations
    - Dynamic agent mode switching and orchestration
    - Example retrieval and relevance scoring
    - Performance monitoring and optimization
    - Context-aware response generation
    """

    def __init__(
        self,
        vector_store: FreeVectorStore,
        llm_wrapper: FreeLLMWrapper,
        agent_modes: FreeAgentModes,
        max_conversation_age: int = 3600,  # 1 hour
        max_working_memory_size: int = 100
    ):
        """
        Initialize the RAISE Controller

        Args:
            vector_store: FreeVectorStore instance
            llm_wrapper: FreeLLMWrapper instance
            agent_modes: FreeAgentModes instance
            max_conversation_age: Maximum age of conversations in seconds
            max_working_memory_size: Maximum size of working memory per conversation
        """
        
        self.vector_store = vector_store
        self.llm_wrapper = llm_wrapper
        self.agent_modes = agent_modes
        
        self.max_conversation_age = max_conversation_age
        self.max_working_memory_size = max_working_memory_size
        
        # Conversation management
        self.active_conversations: Dict[str, ConversationContext] = {}
        self.performance_metrics: Dict[str, AgentPerformanceMetrics] = {}
        
        # Initialize performance metrics for all modes
        for mode in self.agent_modes.get_available_modes():
            self.performance_metrics[mode] = AgentPerformanceMetrics(mode=mode)
        
        logger.info("FreeRAISEController initialized successfully")

    async def process_user_input(
        self,
        user_input: str,
        conversation_id: str,
        user_id: Optional[str] = None,
        suggested_mode: Optional[str] = None,
        context_metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process user input using RAISE framework

        Args:
            user_input: User's input text
            conversation_id: Unique conversation identifier
            user_id: Optional user identifier
            suggested_mode: Suggested agent mode override
            context_metadata: Additional context information

        Returns:
            Dictionary containing response and metadata
        """
        
        start_time = datetime.now()
        logger.info(f"Processing user input for conversation: {conversation_id}")
        
        try:
            # Get or create conversation context
            context = self._get_or_create_conversation(conversation_id, user_id)
            
            # Determine appropriate agent mode
            agent_mode = self._determine_agent_mode(user_input, context, suggested_mode)
            
            # Update conversation context
            context.add_message("user", user_input, context_metadata)
            context.current_agent_mode = agent_mode
            
            # Retrieve relevant examples
            examples = await self._retrieve_relevant_examples(user_input, agent_mode, context)
            context.retrieved_examples = examples
            
            # Generate response using ReAct + RAISE
            response_result = await self.llm_wrapper.generate_with_react(
                user_input=user_input,
                agent_mode=agent_mode,
                max_iterations=5,
                use_examples=True
            )
            
            # Update conversation context with response
            context.add_message("assistant", response_result["response"], {
                "agent_mode": agent_mode,
                "reasoning_steps": len(response_result["reasoning_trace"]),
                "tools_used": len(response_result["tool_usage"]),
                "examples_used": response_result["examples_used"]
            })
            
            # Store reasoning trace
            context.reasoning_traces.append({
                "timestamp": datetime.now().isoformat(),
                "trace": response_result["reasoning_trace"],
                "agent_mode": agent_mode
            })
            
            # Update performance metrics
            response_time = (datetime.now() - start_time).total_seconds()
            quality_score = self._estimate_response_quality(response_result)
            
            self.performance_metrics[agent_mode].update_metrics(
                response_time=response_time,
                quality_score=quality_score,
                tools_used=len(response_result["tool_usage"]),
                examples_retrieved=response_result["examples_used"],
                success=True
            )
            
            # Clean up old conversations
            self._cleanup_old_conversations()
            
            # Prepare final response
            final_response = {
                "response": response_result["response"],
                "conversation_id": conversation_id,
                "agent_mode": agent_mode,
                "metadata": {
                    "response_time": response_time,
                    "reasoning_steps": len(response_result["reasoning_trace"]),
                    "tools_used": len(response_result["tool_usage"]),
                    "examples_retrieved": response_result["examples_used"],
                    "working_memory_size": len(context.working_memory),
                    "conversation_length": len(context.message_history)
                },
                "reasoning_trace": response_result["reasoning_trace"],
                "tool_usage": response_result["tool_usage"],
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"Successfully processed user input for conversation: {conversation_id}")
            return final_response
            
        except Exception as e:
            logger.error(f"Error processing user input: {str(e)}")
            
            # Update error metrics
            if suggested_mode and suggested_mode in self.performance_metrics:
                self.performance_metrics[suggested_mode].error_count += 1
            
            return {
                "response": "I apologize, but I encountered an error while processing your request. Please try again.",
                "conversation_id": conversation_id,
                "agent_mode": "error_fallback",
                "metadata": {
                    "error": str(e),
                    "response_time": (datetime.now() - start_time).total_seconds()
                },
                "timestamp": datetime.now().isoformat()
            }

    def _get_or_create_conversation(self, conversation_id: str, user_id: Optional[str]) -> ConversationContext:
        """Get existing conversation or create new one"""
        
        if conversation_id in self.active_conversations:
            context = self.active_conversations[conversation_id]
            context.last_updated = datetime.now()
            return context
        
        # Create new conversation
        context = ConversationContext(
            conversation_id=conversation_id,
            user_id=user_id
        )
        
        self.active_conversations[conversation_id] = context
        logger.info(f"Created new conversation: {conversation_id}")
        
        return context

    def _determine_agent_mode(
        self,
        user_input: str,
        context: ConversationContext,
        suggested_mode: Optional[str]
    ) -> str:
        """
        Determine the most appropriate agent mode based on input and context
        
        Uses a combination of:
        - Explicit mode suggestions
        - Context analysis
        - Performance metrics
        - Keyword/pattern matching
        """
        
        # If mode is explicitly suggested and valid, use it
        if suggested_mode and self.agent_modes.validate_mode(suggested_mode):
            return suggested_mode
        
        # Analyze user input for mode indicators
        input_lower = user_input.lower()
        
        # Code-related keywords
        code_keywords = [
            "code", "programming", "python", "javascript", "function", "class", "debug",
            "error", "bug", "compile", "syntax", "algorithm", "database", "api"
        ]
        
        # Creative writing keywords
        creative_keywords = [
            "write", "story", "character", "plot", "dialogue", "creative", "novel",
            "poem", "script", "narrative", "fiction", "literature"
        ]
        
        # Legal keywords
        legal_keywords = [
            "contract", "legal", "law", "agreement", "compliance", "regulation",
            "terms", "policy", "license", "copyright", "liability"
        ]
        
        # Design keywords
        design_keywords = [
            "design", "ui", "ux", "interface", "user", "experience", "wireframe",
            "prototype", "visual", "layout", "color", "typography"
        ]
        
        # Count keyword matches
        code_score = sum(1 for keyword in code_keywords if keyword in input_lower)
        creative_score = sum(1 for keyword in creative_keywords if keyword in input_lower)
        legal_score = sum(1 for keyword in legal_keywords if keyword in input_lower)
        design_score = sum(1 for keyword in design_keywords if keyword in input_lower)
        
        # Determine mode based on scores
        max_score = max(code_score, creative_score, legal_score, design_score)
        
        if max_score > 0:
            if code_score == max_score:
                return "code_companion"
            elif creative_score == max_score:
                return "creative_writer"
            elif legal_score == max_score:
                return "legal_assistant"
            elif design_score == max_score:
                return "designer_agent"
        
        # Check conversation context for mode continuity
        if context.message_history:
            recent_modes = [
                msg.get("metadata", {}).get("agent_mode")
                for msg in context.message_history[-3:]
                if msg.get("metadata", {}).get("agent_mode")
            ]
            if recent_modes:
                # Prefer continuity with recent mode
                most_recent_mode = recent_modes[-1]
                if self.agent_modes.validate_mode(most_recent_mode):
                    return most_recent_mode
        
        # Default to smart assistant
        return "smart_assistant"

    async def _retrieve_relevant_examples(
        self,
        user_input: str,
        agent_mode: str,
        context: ConversationContext,
        max_examples: int = 5
    ) -> List[Dict[str, Any]]:
        """Retrieve relevant examples from vector store"""
        
        try:
            # Search for examples in the specified mode
            examples = self.vector_store.search_similar(
                query=user_input,
                n_results=max_examples,
                where={"mode": agent_mode} if agent_mode != "smart_assistant" else None
            )
            
            # If we don't have enough mode-specific examples, get general ones
            if len(examples) < 3 and agent_mode != "smart_assistant":
                general_examples = self.vector_store.search_similar(
                    query=user_input,
                    n_results=max_examples - len(examples)
                )
                examples.extend(general_examples)
            
            logger.info(f"Retrieved {len(examples)} relevant examples for mode: {agent_mode}")
            return examples
            
        except Exception as e:
            logger.error(f"Error retrieving examples: {str(e)}")
            return []

    def _estimate_response_quality(self, response_result: Dict[str, Any]) -> float:
        """Estimate the quality of a response based on various factors"""
        
        quality_score = 3.0  # Base score
        
        # Factor in response length (reasonable length is good)
        response_length = len(response_result["response"])
        if 50 <= response_length <= 2000:
            quality_score += 0.5
        elif response_length < 20:
            quality_score -= 0.5
        
        # Factor in tool usage (appropriate tool use is good)
        tools_used = len(response_result["tool_usage"])
        if 0 <= tools_used <= 3:
            quality_score += 0.3
        elif tools_used > 5:
            quality_score -= 0.2
        
        # Factor in reasoning steps (balanced reasoning is good)
        reasoning_steps = len(response_result["reasoning_trace"])
        if 2 <= reasoning_steps <= 6:
            quality_score += 0.4
        elif reasoning_steps > 8:
            quality_score -= 0.3
        
        # Factor in examples used (using examples is generally good)
        examples_used = response_result["examples_used"]
        if examples_used > 0:
            quality_score += 0.2
        
        # Ensure score stays within bounds
        return max(1.0, min(5.0, quality_score))

    def _cleanup_old_conversations(self) -> None:
        """Clean up old conversations to manage memory"""
        
        current_time = datetime.now()
        conversations_to_remove = []
        
        for conv_id, context in self.active_conversations.items():
            age = (current_time - context.created_at).total_seconds()
            if age > self.max_conversation_age:
                conversations_to_remove.append(conv_id)
            
            # Also check if working memory is too large
            if len(context.working_memory) > self.max_working_memory_size:
                # Remove oldest entries
                sorted_memory = sorted(
                    context.working_memory.items(),
                    key=lambda x: x[1].get("timestamp", "2000-01-01")
                )
                items_to_remove = len(context.working_memory) - self.max_working_memory_size
                for key, _ in sorted_memory[:items_to_remove]:
                    del context.working_memory[key]
        
        # Remove old conversations
        for conv_id in conversations_to_remove:
            del self.active_conversations[conv_id]
            logger.info(f"Cleaned up old conversation: {conv_id}")

    def get_conversation_context(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        """Get conversation context for debugging/analysis"""
        
        context = self.active_conversations.get(conversation_id)
        if not context:
            return None
        
        return {
            "conversation_id": context.conversation_id,
            "user_id": context.user_id,
            "current_agent_mode": context.current_agent_mode,
            "working_memory_size": len(context.working_memory),
            "message_history_length": len(context.message_history),
            "reasoning_traces_count": len(context.reasoning_traces),
            "created_at": context.created_at.isoformat(),
            "last_updated": context.last_updated.isoformat()
        }

    def get_performance_stats(self) -> Dict[str, Any]:
        """Get comprehensive performance statistics"""
        
        total_conversations = len(self.active_conversations)
        total_messages = sum(len(ctx.message_history) for ctx in self.active_conversations.values())
        
        mode_stats = {}
        for mode, metrics in self.performance_metrics.items():
            mode_stats[mode] = {
                "total_interactions": metrics.total_interactions,
                "success_rate": metrics.get_success_rate(),
                "average_response_time": round(metrics.average_response_time, 3),
                "average_quality_score": round(metrics.average_quality_score, 2),
                "tool_usage_count": metrics.tool_usage_count,
                "example_retrieval_count": metrics.example_retrieval_count,
                "error_count": metrics.error_count
            }
        
        return {
            "controller_stats": {
                "active_conversations": total_conversations,
                "total_messages": total_messages,
                "max_conversation_age": self.max_conversation_age,
                "max_working_memory_size": self.max_working_memory_size
            },
            "mode_performance": mode_stats,
            "vector_store_stats": self.vector_store.get_collection_stats(),
            "timestamp": datetime.now().isoformat()
        }

    def reset_conversation(self, conversation_id: str) -> bool:
        """Reset a conversation context"""
        
        if conversation_id in self.active_conversations:
            del self.active_conversations[conversation_id]
            logger.info(f"Reset conversation: {conversation_id}")
            return True
        
        return False

    def optimize_performance(self) -> Dict[str, Any]:
        """Perform performance optimizations"""
        
        optimizations = {
            "conversations_cleaned": 0,
            "memory_optimized": 0,
            "vector_store_compacted": False
        }
        
        # Clean up old conversations
        before_cleanup = len(self.active_conversations)
        self._cleanup_old_conversations()
        optimizations["conversations_cleaned"] = before_cleanup - len(self.active_conversations)
        
        # Optimize working memory
        for context in self.active_conversations.values():
            if len(context.working_memory) > self.max_working_memory_size:
                # Remove least recently used items
                sorted_memory = sorted(
                    context.working_memory.items(),
                    key=lambda x: x[1].get("last_accessed", x[1].get("timestamp", "2000-01-01"))
                )
                items_to_remove = len(context.working_memory) - self.max_working_memory_size
                for key, _ in sorted_memory[:items_to_remove]:
                    del context.working_memory[key]
                optimizations["memory_optimized"] += items_to_remove
        
        logger.info(f"Performance optimization completed: {optimizations}")
        return optimizations


# Global instance for easy access
raise_controller = None

def get_raise_controller(
    vector_store: Optional[FreeVectorStore] = None,
    llm_wrapper: Optional[FreeLLMWrapper] = None,
    agent_modes: Optional[FreeAgentModes] = None
) -> FreeRAISEController:
    """Get or create global RAISE controller instance"""
    global raise_controller
    
    if raise_controller is None:
        if not all([vector_store, llm_wrapper, agent_modes]):
            raise ValueError("All components must be provided for initial RAISE controller creation")
        
        raise_controller = FreeRAISEController(
            vector_store=vector_store,
            llm_wrapper=llm_wrapper,
            agent_modes=agent_modes
        )
    
    return raise_controller
