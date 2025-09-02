"""
Free ReAct Processor - Implements the ReAct (Reasoning + Acting) framework
Provides observation → reasoning → action cycles with scratchpad functionality
"""

import asyncio
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import json

from lib.llm.base_wrapper import FreeLLMWrapper


class FreeReActProcessor:
    """
    ReAct framework implementation with scratchpad reasoning
    Handles observation-reasoning-action cycles for agent decision making
    """

    def __init__(self, llm_wrapper: FreeLLMWrapper, max_scratchpad_size: int = 100):
        self.llm = llm_wrapper
        self.max_scratchpad_size = max_scratchpad_size
        self.scratchpad: List[Dict[str, Any]] = []
        self.cycle_count = 0

    async def process_cycle(
        self,
        observation: str,
        agent_mode: str = "smart_assistant",
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute a complete ReAct cycle: Observation → Reasoning → Action

        Args:
            observation: Current observation or user input
            agent_mode: Specialized agent mode (smart_assistant, code_companion, etc.)
            context: Additional context information

        Returns:
            Dict containing reasoning, action, and cycle metadata
        """

        self.cycle_count += 1
        cycle_start = datetime.now()

        # Step 1: Observation Phase
        observation_entry = self._create_observation_entry(observation, context)
        self._add_to_scratchpad(observation_entry)

        # Step 2: Reasoning Phase
        reasoning_prompt = self._build_reasoning_prompt(agent_mode)
        reasoning_result = await self.llm.generate(
            prompt=reasoning_prompt,
            model=self._get_model_for_mode(agent_mode),
            temperature=0.3,  # Lower temperature for reasoning
            max_tokens=1000
        )

        reasoning_entry = self._create_reasoning_entry(reasoning_result["response"])
        self._add_to_scratchpad(reasoning_entry)

        # Step 3: Action Phase
        action_result = await self._determine_action(
            reasoning_result["response"],
            agent_mode,
            context
        )

        action_entry = self._create_action_entry(action_result)
        self._add_to_scratchpad(action_entry)

        # Step 4: Cycle Summary
        cycle_summary = {
            "cycle_id": self.cycle_count,
            "observation": observation,
            "reasoning": reasoning_result["response"],
            "action": action_result,
            "agent_mode": agent_mode,
            "timestamp": cycle_start.isoformat(),
            "duration_seconds": (datetime.now() - cycle_start).total_seconds(),
            "scratchpad_size": len(self.scratchpad),
            "provider": reasoning_result.get("provider", "unknown"),
            "model": reasoning_result.get("model", "unknown")
        }

        return cycle_summary

    def _create_observation_entry(
        self,
        observation: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a standardized observation entry for the scratchpad"""

        return {
            "type": "observation",
            "cycle": self.cycle_count,
            "timestamp": datetime.now().isoformat(),
            "content": observation,
            "context": context or {},
            "metadata": {
                "source": "user_input",
                "length": len(observation)
            }
        }

    def _create_reasoning_entry(self, reasoning: str) -> Dict[str, Any]:
        """Create a standardized reasoning entry for the scratchpad"""

        return {
            "type": "reasoning",
            "cycle": self.cycle_count,
            "timestamp": datetime.now().isoformat(),
            "content": reasoning,
            "metadata": {
                "length": len(reasoning),
                "confidence_score": self._estimate_confidence(reasoning)
            }
        }

    def _create_action_entry(self, action_result: Dict[str, Any]) -> Dict[str, Any]:
        """Create a standardized action entry for the scratchpad"""

        return {
            "type": "action",
            "cycle": self.cycle_count,
            "timestamp": datetime.now().isoformat(),
            "content": action_result,
            "metadata": {
                "action_type": action_result.get("type", "unknown"),
                "confidence": action_result.get("confidence", 0.0)
            }
        }

    def _build_reasoning_prompt(self, agent_mode: str) -> str:
        """Build a reasoning prompt based on agent mode and scratchpad history"""

        system_prompts = {
            "smart_assistant": """You are a helpful AI assistant. Analyze the current observation and previous context to provide reasoned assistance.
Think step-by-step about what the user needs and how to best help them.""",

            "code_companion": """You are an expert programming assistant. Analyze code-related observations and provide technical reasoning.
Consider best practices, potential issues, and optimal solutions.""",

            "creative_writer": """You are a creative writing assistant. Analyze writing-related observations and provide creative reasoning.
Consider narrative structure, style, audience, and creative techniques.""",

            "legal_assistant": """You are a legal analysis assistant. Analyze legal observations and provide reasoned legal insights.
Consider compliance, risks, and appropriate legal frameworks.""",

            "designer_agent": """You are a design thinking assistant. Analyze design observations and provide creative reasoning.
Consider user experience, visual principles, and design methodologies."""
        }

        base_prompt = system_prompts.get(agent_mode, system_prompts["smart_assistant"])

        # Add recent scratchpad context
        recent_history = self._get_recent_scratchpad(5)  # Last 5 entries

        context_str = "\n".join([
            f"{entry['type'].upper()}: {entry['content'][:200]}..."
            for entry in recent_history
        ])
        if context_str:
            base_prompt += f"\n\nRECENT CONTEXT:\n{context_str}"

        base_prompt += f"\n\nCURRENT OBSERVATION: {observation}"
        base_prompt += "\n\nREASONING: Provide a step-by-step analysis of the current situation. Consider:\n1. What is the core problem or request?\n2. What context is relevant from previous interactions?\n3. What are the best approaches to address this?\n4. What potential challenges or considerations exist?\n5. What is the most appropriate action to take?\n\nBe thorough but concise. End with a clear recommendation for the next action."


        return base_prompt

    async def _determine_action(
        self,
        reasoning: str,
        agent_mode: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Determine the appropriate action based on reasoning"""

        # Extract action recommendations from reasoning
        action_prompt = f"""Based on this reasoning, determine the most appropriate action:

REASONING: {reasoning}

Determine the best action by considering:
- What specific action should be taken?
- What tools or methods should be used?
- What is the expected outcome?
- How confident are you in this action?

Respond with a JSON object containing:
- "type": The action type (respond, search, analyze, create, etc.)
- "description": Brief description of the action
- "confidence": Confidence score (0.0 to 1.0)
- "parameters": Any parameters needed for the action
- "justification": Why this action is appropriate"""

        action_result = await self.llm.generate(
            prompt=action_prompt,
            model=self._get_model_for_mode(agent_mode),
            temperature=0.2,  # Very low temperature for action determination
            max_tokens=500
        )

        try:
            # Try to parse JSON response
            action_data = json.loads(action_result["response"])
            return action_data
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "type": "respond",
                "description": "Provide a direct response based on reasoning",
                "confidence": 0.7,
                "parameters": {"response": action_result["response"]},
                "justification": "Fallback action due to parsing issues"
            }

    def _get_model_for_mode(self, agent_mode: str) -> str:
        """Get the appropriate model for a given agent mode"""

        model_mapping = {
            "smart_assistant": "llama3.1:8b",
            "code_companion": "codellama:7b",
            "creative_writer": "mistral:7b",
            "legal_assistant": "llama3.1:8b",
            "designer_agent": "llama3.1:8b"
        }

        return model_mapping.get(agent_mode, "llama3.1:8b")

    def _estimate_confidence(self, reasoning: str) -> float:
        """Estimate confidence score from reasoning text"""

        # Simple heuristic-based confidence estimation
        confidence_indicators = [
            "certain", "confident", "clear", "obvious", "definitely",
            "likely", "probably", "seems", "appears", "suggests"
        ]

        reasoning_lower = reasoning.lower()
        indicator_count = sum(1 for indicator in confidence_indicators
                            if indicator in reasoning_lower)

        # Base confidence on indicator density
        base_confidence = min(0.9, 0.5 + (indicator_count * 0.1))

        # Reduce confidence for uncertain language
        uncertain_indicators = ["unclear", "uncertain", "unsure", "maybe", "perhaps"]
        uncertain_count = sum(1 for indicator in uncertain_indicators
                            if indicator in reasoning_lower)

        final_confidence = max(0.1, base_confidence - (uncertain_count * 0.2))

        return round(final_confidence, 2)

    def _get_recent_scratchpad(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get the most recent scratchpad entries"""

        return self.scratchpad[-limit:] if len(self.scratchpad) > limit else self.scratchpad

    def _add_to_scratchpad(self, entry: Dict[str, Any]):
        """Add an entry to the scratchpad with size management"""

        self.scratchpad.append(entry)

        # Maintain maximum scratchpad size
        if len(self.scratchpad) > self.max_scratchpad_size:
            # Remove oldest entries but keep at least one of each type
            self._prune_scratchpad()

    def _prune_scratchpad(self):
        """Prune scratchpad to maintain size limits while preserving diversity"""

        if len(self.scratchpad) <= self.max_scratchpad_size:
            return

        # Keep the most recent entries
        target_size = self.max_scratchpad_size
        self.scratchpad = self.scratchpad[-target_size:]

    def get_scratchpad_summary(self) -> Dict[str, Any]:
        """Get a summary of the current scratchpad state"""

        entry_types = {}
        for entry in self.scratchpad:
            entry_type = entry.get("type", "unknown")
            entry_types[entry_type] = entry_types.get(entry_type, 0) + 1

        return {
            "total_entries": len(self.scratchpad),
            "max_size": self.max_scratchpad_size,
            "entry_types": entry_types,
            "cycles_completed": self.cycle_count,
            "last_activity": self.scratchpad[-1]["timestamp"] if self.scratchpad else None
        }

    def clear_scratchpad(self):
        """Clear the scratchpad (useful for starting fresh conversations)"""

        self.scratchpad = []
        self.cycle_count = 0

    def export_scratchpad(self, format: str = "json") -> str:
        """Export the scratchpad in the specified format"""

        if format.lower() == "json":
            return json.dumps(self.scratchpad, indent=2, default=str)
        elif format.lower() == "text":
            lines = []
            for entry in self.scratchpad:
                lines.append(f"[{entry['timestamp']}] {entry['type'].upper()}: {entry['content']}")
            return "\n".join(lines)
        else:
            raise ValueError(f"Unsupported export format: {format}")
