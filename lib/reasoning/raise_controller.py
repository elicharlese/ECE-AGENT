"""
RAISE Controller - Retrieval-Augmented Inference Synthesis Engine
Orchestrates the RAISE framework for AGENT LLM processing
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass

from memory.vector_store import FreeVectorStore
from llm.base_wrapper import FreeLLMWrapper
from agents.modes import FreeAgentModes
from reasoning.react_processor import ReActProcessor

logger = logging.getLogger(__name__)

@dataclass
class RAISEResult:
    """Result from RAISE processing"""
    response: str
    agent_mode: str
    confidence: float
    reasoning_trace: List[Dict[str, Any]]
    examples_used: int
    tools_used: List[str]
    processing_time: float
    metadata: Dict[str, Any]

class RAISEController:
    """
    RAISE (Retrieval-Augmented Inference Synthesis Engine) Controller
    Orchestrates the complete AGENT LLM processing pipeline
    """
    
    def __init__(
        self,
        vector_store: FreeVectorStore,
        llm_wrapper: FreeLLMWrapper,
        agent_modes: FreeAgentModes
    ):
        """
        Initialize the RAISE controller
        
        Args:
            vector_store: Vector store for example retrieval
            llm_wrapper: LLM wrapper for text generation
            agent_modes: Agent mode manager
        """
        self.vector_store = vector_store
        self.llm_wrapper = llm_wrapper
        self.agent_modes = agent_modes
        self.react_processor = ReActProcessor()
        
        # Initialize vector store with default examples
        self.vector_store.initialize_with_default_examples()
        
        logger.info("RAISE Controller initialized")
    
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
            suggested_mode: Suggested agent mode
            context_metadata: Additional context information
            
        Returns:
            Dictionary containing response and metadata
        """
        
        start_time = datetime.now()
        logger.info(f"Processing user input for conversation: {conversation_id}")
        
        try:
            # Step 1: Determine agent mode
            agent_mode = self._determine_agent_mode(user_input, suggested_mode)
            
            # Step 2: Retrieve relevant examples
            examples = self._retrieve_examples(user_input, agent_mode)
            
            # Step 3: Process with ReAct framework
            react_result = await self.react_processor.process_with_react(
                user_input=user_input,
                context={
                    "conversation_id": conversation_id,
                    "user_id": user_id,
                    "agent_mode": agent_mode,
                    "examples": examples,
                    "metadata": context_metadata or {}
                },
                agent_mode=agent_mode
            )
            
            # Step 4: Synthesize final response
            final_response = await self._synthesize_response(
                user_input, react_result, examples, agent_mode
            )
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "response": final_response,
                "agent_mode": agent_mode,
                "metadata": {
                    "response_time": processing_time,
                    "examples_retrieved": len(examples),
                    "reasoning_steps": len(react_result["reasoning_trace"]),
                    "tools_used": len(react_result["actions_taken"]),
                    "conversation_id": conversation_id,
                    "user_id": user_id
                },
                "reasoning_trace": react_result["reasoning_trace"],
                "tool_usage": react_result["actions_taken"],
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing user input: {str(e)}")
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "response": f"I apologize, but I encountered an error while processing your request: '{user_input}'. Please try again.",
                "agent_mode": "error_fallback",
                "metadata": {
                    "error": str(e),
                    "response_time": processing_time,
                    "conversation_id": conversation_id
                },
                "reasoning_trace": [],
                "tool_usage": [],
                "timestamp": datetime.now().isoformat()
            }
    
    def _determine_agent_mode(self, user_input: str, suggested_mode: Optional[str] = None) -> str:
        """Determine the most appropriate agent mode"""
        
        # Use suggested mode if valid
        if suggested_mode and self.agent_modes.validate_mode(suggested_mode):
            return suggested_mode
        
        # Use agent modes to suggest based on content
        return self.agent_modes.suggest_mode(user_input)
    
    def _retrieve_examples(self, user_input: str, agent_mode: str, max_examples: int = 3) -> List[Dict[str, Any]]:
        """Retrieve relevant examples from vector store"""
        
        try:
            # Search for mode-specific examples
            examples = self.vector_store.search_similar(
                query=user_input,
                n_results=max_examples,
                where={"mode": agent_mode} if agent_mode != "smart_assistant" else None
            )
            
            # If not enough mode-specific examples, get general ones
            if len(examples) < 2:
                general_examples = self.vector_store.search_similar(
                    query=user_input,
                    n_results=max_examples - len(examples)
                )
                examples.extend(general_examples)
            
            logger.info(f"Retrieved {len(examples)} examples for mode: {agent_mode}")
            return examples
            
        except Exception as e:
            logger.error(f"Error retrieving examples: {str(e)}")
            return []
    
    async def _synthesize_response(
        self,
        user_input: str,
        react_result: Dict[str, Any],
        examples: List[Dict[str, Any]],
        agent_mode: str
    ) -> str:
        """Synthesize final response from all components"""
        
        # Get base response from ReAct processing
        base_response = react_result["response"]
        
        # Enhance with examples if available
        if examples:
            example_context = "Based on similar cases, "
            for i, example in enumerate(examples[:2], 1):
                example_context += f"example {i}: {example['text'][:100]}... "
            
            # Combine base response with example context
            enhanced_response = f"{base_response}\n\n{example_context}This should help guide your approach."
        else:
            enhanced_response = base_response
        
        return enhanced_response
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        return {
            "controller_stats": {
                "active_conversations": 0,  # TODO: Track active conversations
                "total_messages": 0,  # TODO: Track total messages
                "max_conversation_age": 3600,
                "max_working_memory_size": 100
            },
            "mode_performance": {
                mode: {
                    "total_interactions": 0,
                    "success_rate": 1.0,
                    "average_response_time": 0.5,
                    "average_quality_score": 4.0,
                    "tool_usage_count": 0,
                    "example_retrieval_count": 0,
                    "error_count": 0
                }
                for mode in self.agent_modes.get_available_modes().keys()
            },
            "vector_store_stats": self.vector_store.get_collection_stats(),
            "timestamp": datetime.now().isoformat()
        }
    
    def reset_conversation(self, conversation_id: str) -> bool:
        """Reset a conversation (placeholder)"""
        logger.info(f"Reset conversation: {conversation_id}")
        return True
    
    def optimize_performance(self) -> Dict[str, Any]:
        """Optimize system performance"""
        return {
            "conversations_cleaned": 0,
            "memory_optimized": 0,
            "vector_store_compacted": False
        }

# Global instance
raise_controller = None

def get_raise_controller(
    vector_store: Optional[FreeVectorStore] = None,
    llm_wrapper: Optional[FreeLLMWrapper] = None,
    agent_modes: Optional[FreeAgentModes] = None
) -> RAISEController:
    """Get or create global RAISE controller instance"""
    global raise_controller
    
    if raise_controller is None:
        if not all([vector_store, llm_wrapper, agent_modes]):
            raise ValueError("All components must be provided for initial RAISE controller creation")
        
        raise_controller = RAISEController(
            vector_store=vector_store,
            llm_wrapper=llm_wrapper,
            agent_modes=agent_modes
        )
    
    return raise_controller