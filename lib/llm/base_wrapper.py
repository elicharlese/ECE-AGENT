"""
Base LLM Wrapper - Ollama + Groq Integration for AGENT LLM System
Provides ReAct and RAISE framework implementation with vector store integration
"""

import asyncio
import os
import json
import logging
from typing import Dict, List, Any, Optional, Tuple, Callable
from datetime import datetime
import ollama
from groq import Groq
from memory.vector_store import FreeVectorStore

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FreeLLMWrapper:
    """
    LLM Wrapper that integrates Ollama (primary) and Groq (fallback) with FreeVectorStore
    Implements ReAct reasoning loops and RAISE synthesis framework
    """

    def __init__(
        self,
        vector_store: FreeVectorStore,
        ollama_host: str = "http://localhost:11434",
        groq_api_key: Optional[str] = None,
        max_retries: int = 3,
        retry_delay: float = 1.0
    ):
        """
        Initialize the LLM wrapper

        Args:
            vector_store: FreeVectorStore instance for example retrieval
            ollama_host: Ollama server host URL
            groq_api_key: Groq API key (from environment if None)
            max_retries: Maximum retry attempts for failed requests
            retry_delay: Delay between retries in seconds
        """

        self.vector_store = vector_store
        self.max_retries = max_retries
        self.retry_delay = retry_delay

        # Initialize Ollama client
        self.ollama_client = ollama.Client(host=ollama_host)

        # Initialize Groq client
        if groq_api_key is None:
            groq_api_key = os.getenv('GROQ_API_KEY')
        if groq_api_key:
            self.groq_client = Groq(api_key=groq_api_key)
        else:
            logger.warning("No Groq API key provided - fallback will not be available")
            self.groq_client = None

        # Available models configuration
        self.models = {
            "ollama": {
                "general": "llama3.1:8b",
                "code": "codellama:7b",
                "creative": "mistral:7b"
            },
            "groq": {
                "general": "llama3-8b-8192",
                "code": "llama3-8b-8192",  # Groq has good code capabilities
                "creative": "llama3-8b-8192"
            }
        }

        # Tool registry for ReAct framework
        self.tools = {}
        self.register_default_tools()

        # Working memory for RAISE framework
        self.working_memory = {}

        logger.info("FreeLLMWrapper initialized successfully")

    def register_default_tools(self):
        """Register default tools for ReAct framework"""
        self.tools = {
            "search_examples": {
                "description": "Search for relevant examples in the vector store",
                "function": self._tool_search_examples,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Search query"},
                        "mode": {"type": "string", "description": "Agent mode filter"},
                        "limit": {"type": "integer", "description": "Maximum results"}
                    },
                    "required": ["query"]
                }
            },
            "add_example": {
                "description": "Add a new example to the vector store",
                "function": self._tool_add_example,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "text": {"type": "string", "description": "Example text"},
                        "mode": {"type": "string", "description": "Agent mode"},
                        "quality_score": {"type": "number", "description": "Quality score 0-5"}
                    },
                    "required": ["text", "mode"]
                }
            },
            "get_memory": {
                "description": "Retrieve information from working memory",
                "function": self._tool_get_memory,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "key": {"type": "string", "description": "Memory key"}
                    },
                    "required": ["key"]
                }
            },
            "set_memory": {
                "description": "Store information in working memory",
                "function": self._tool_set_memory,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "key": {"type": "string", "description": "Memory key"},
                        "value": {"type": "string", "description": "Value to store"}
                    },
                    "required": ["key", "value"]
                }
            }
        }

    async def generate_with_react(
        self,
        user_input: str,
        agent_mode: str = "smart_assistant",
        max_iterations: int = 5,
        use_examples: bool = True
    ) -> Dict[str, Any]:
        """
        Generate response using ReAct framework with reasoning and tool use

        Args:
            user_input: User's input text
            agent_mode: Agent specialization mode
            max_iterations: Maximum reasoning iterations
            use_examples: Whether to retrieve examples from vector store

        Returns:
            Dictionary containing response, reasoning trace, and tool usage
        """

        logger.info(f"Starting ReAct reasoning for mode: {agent_mode}")

        # Initialize reasoning trace
        reasoning_trace = []
        tool_usage = []

        # Retrieve relevant examples if enabled
        examples = []
        if use_examples:
            examples = self.vector_store.search_similar(
                user_input,
                n_results=3,
                where={"mode": agent_mode} if agent_mode != "smart_assistant" else None
            )
            logger.info(f"Retrieved {len(examples)} relevant examples")

        # Update working memory
        self.working_memory.update({
            "current_input": user_input,
            "agent_mode": agent_mode,
            "retrieved_examples": examples,
            "reasoning_step": 0
        })

        # Build initial context
        context = self._build_react_context(user_input, examples, agent_mode)

        # ReAct reasoning loop
        for iteration in range(max_iterations):
            logger.info(f"ReAct iteration {iteration + 1}/{max_iterations}")

            # Reasoning phase
            reasoning_prompt = self._build_reasoning_prompt(context, iteration)
            reasoning_response = await self._generate_with_fallback(reasoning_prompt, agent_mode)

            reasoning_trace.append({
                "step": iteration + 1,
                "phase": "reasoning",
                "input": reasoning_prompt,
                "output": reasoning_response,
                "timestamp": datetime.now().isoformat()
            })

            # Parse reasoning for tool usage
            tool_call = self._parse_tool_call(reasoning_response)

            if tool_call:
                # Action phase - execute tool
                tool_result = await self._execute_tool(tool_call)

                tool_usage.append({
                    "iteration": iteration + 1,
                    "tool": tool_call["tool"],
                    "parameters": tool_call["parameters"],
                    "result": tool_result,
                    "timestamp": datetime.now().isoformat()
                })

                # Update context with tool result
                context += f"\n\nTool Result ({tool_call['tool']}): {tool_result}"

                reasoning_trace.append({
                    "step": iteration + 1,
                    "phase": "action",
                    "tool_call": tool_call,
                    "tool_result": tool_result,
                    "timestamp": datetime.now().isoformat()
                })

                # Check if we should continue reasoning
                if self._should_continue_reasoning(tool_result, iteration, max_iterations):
                    continue
                else:
                    break
            else:
                # No tool call - generate final response
                break

        # Generate final response using RAISE synthesis
        final_response = await self._generate_raise_response(
            user_input, reasoning_trace, examples, agent_mode
        )

        return {
            "response": final_response,
            "reasoning_trace": reasoning_trace,
            "tool_usage": tool_usage,
            "examples_used": len(examples),
            "iterations": len(reasoning_trace),
            "agent_mode": agent_mode,
            "timestamp": datetime.now().isoformat()
        }

    async def _generate_with_fallback(
        self,
        prompt: str,
        agent_mode: str = "smart_assistant",
        temperature: float = 0.7
    ) -> str:
        """
        Generate text with automatic fallback from Ollama to Groq

        Args:
            prompt: Input prompt
            agent_mode: Agent mode for model selection
            temperature: Generation temperature

        Returns:
            Generated text response
        """

        # Try Ollama first
        for attempt in range(self.max_retries):
            try:
                model = self.models["ollama"].get(agent_mode, self.models["ollama"]["general"])

                response = self.ollama_client.generate(
                    model=model,
                    prompt=prompt,
                    options={
                        "temperature": temperature,
                        "num_predict": 1024,
                        "top_p": 0.9
                    }
                )

                return response["response"]

            except Exception as e:
                logger.warning(f"Ollama attempt {attempt + 1} failed: {str(e)}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay)

        # Fallback to Groq if available
        if self.groq_client:
            try:
                model = self.models["groq"].get(agent_mode, self.models["groq"]["general"])

                response = self.groq_client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=temperature,
                    max_tokens=1024,
                    top_p=0.9
                )

                return response.choices[0].message.content

            except Exception as e:
                logger.error(f"Groq fallback also failed: {str(e)}")

        # If both fail, return error message
        return "I apologize, but I'm currently unable to generate a response due to technical issues with both local and cloud LLM services."

    def _build_react_context(
        self,
        user_input: str,
        examples: List[Dict[str, Any]],
        agent_mode: str
    ) -> str:
        """Build context for ReAct reasoning"""

        context_parts = [
            f"User Input: {user_input}",
            f"Agent Mode: {agent_mode}",
            f"Current Date/Time: {datetime.now().isoformat()}"
        ]

        if examples:
            context_parts.append("Relevant Examples:")
            for i, example in enumerate(examples[:3], 1):
                context_parts.append(f"{i}. {example['text'][:200]}...")

        if self.working_memory:
            context_parts.append("Working Memory:")
            for key, value in list(self.working_memory.items())[:5]:
                if isinstance(value, (str, int, float)):
                    context_parts.append(f"- {key}: {str(value)[:100]}")

        return "\n".join(context_parts)

    def _build_reasoning_prompt(self, context: str, iteration: int) -> str:
        """Build reasoning prompt for ReAct"""

        available_tools = "\n".join([
            f"- {name}: {tool['description']}"
            for name, tool in self.tools.items()
        ])

        return f"""You are an AI assistant using the ReAct (Reasoning + Acting) framework.

CONTEXT:
{context}

AVAILABLE TOOLS:
{available_tools}

INSTRUCTION:
Think step-by-step about how to best respond to the user's input. You can use tools to gather information or perform actions.

If you need to use a tool, respond with:
TOOL: <tool_name>
PARAMETERS: <json_parameters>

If you're ready to provide a final answer, just respond with your answer.

Reasoning step {iteration + 1}:"""

    def _parse_tool_call(self, response: str) -> Optional[Dict[str, Any]]:
        """Parse tool call from LLM response"""

        lines = response.strip().split('\n')
        tool_name = None
        parameters = None

        for line in lines:
            if line.startswith('TOOL:'):
                tool_name = line.replace('TOOL:', '').strip()
            elif line.startswith('PARAMETERS:'):
                try:
                    param_str = line.replace('PARAMETERS:', '').strip()
                    parameters = json.loads(param_str)
                except json.JSONDecodeError:
                    continue

        if tool_name and parameters:
            return {
                "tool": tool_name,
                "parameters": parameters
            }

        return None

    async def _execute_tool(self, tool_call: Dict[str, Any]) -> Any:
        """Execute a tool call"""

        tool_name = tool_call["tool"]
        parameters = tool_call["parameters"]

        if tool_name in self.tools:
            try:
                tool_func = self.tools[tool_name]["function"]
                if asyncio.iscoroutinefunction(tool_func):
                    return await tool_func(**parameters)
                else:
                    return tool_func(**parameters)
            except Exception as e:
                logger.error(f"Tool execution failed: {str(e)}")
                return f"Error executing tool {tool_name}: {str(e)}"
        else:
            return f"Unknown tool: {tool_name}"

    def _should_continue_reasoning(
        self,
        tool_result: Any,
        iteration: int,
        max_iterations: int
    ) -> bool:
        """Determine if reasoning should continue"""

        # Continue if we have more iterations and tool provided useful information
        if iteration < max_iterations - 1:
            if isinstance(tool_result, str) and len(tool_result) > 10:
                return True
            elif isinstance(tool_result, (list, dict)) and len(tool_result) > 0:
                return True

        return False

    async def _generate_raise_response(
        self,
        user_input: str,
        reasoning_trace: List[Dict[str, Any]],
        examples: List[Dict[str, Any]],
        agent_mode: str
    ) -> str:
        """Generate final response using RAISE synthesis"""

        # Build RAISE context
        raise_context = f"""
User Input: {user_input}
Agent Mode: {agent_mode}

Reasoning Summary:
{self._summarize_reasoning_trace(reasoning_trace)}

Relevant Examples:
{self._format_examples_for_raise(examples)}

Working Memory:
{json.dumps(self.working_memory, indent=2, default=str)}
"""

        raise_prompt = f"""You are an expert AI assistant using the RAISE (Retrieval-Augmented Inference Synthesis Engine) framework.

{raise_context}

INSTRUCTION:
Synthesize a comprehensive, helpful response by combining:
1. The user's original request
2. Insights from relevant examples
3. Results from any tool usage
4. Information from working memory

Provide a clear, actionable response that addresses the user's needs:"""

        return await self._generate_with_fallback(raise_prompt, agent_mode, temperature=0.3)

    def _summarize_reasoning_trace(self, trace: List[Dict[str, Any]]) -> str:
        """Summarize reasoning trace for RAISE context"""

        if not trace:
            return "No reasoning steps performed."

        summary_parts = []
        for step in trace:
            if step["phase"] == "reasoning":
                summary_parts.append(f"Step {step['step']}: {step['output'][:100]}...")
            elif step["phase"] == "action":
                summary_parts.append(f"Action {step['step']}: Used {step['tool_call']['tool']}")

        return " | ".join(summary_parts)

    def _format_examples_for_raise(self, examples: List[Dict[str, Any]]) -> str:
        """Format examples for RAISE context"""

        if not examples:
            return "No relevant examples found."

        formatted = []
        for i, example in enumerate(examples[:3], 1):
            formatted.append(f"{i}. {example['text'][:150]}... (Score: {example.get('similarity_score', 'N/A'):.3f})")

        return "\n".join(formatted)

    # Tool implementations
    async def _tool_search_examples(self, query: str, mode: str = None, limit: int = 5) -> str:
        """Search examples tool"""
        where = {"mode": mode} if mode else None
        results = self.vector_store.search_similar(query, n_results=limit, where=where)

        if not results:
            return "No relevant examples found."

        formatted_results = []
        for result in results:
            formatted_results.append(f"- {result['text'][:100]}... (Score: {result.get('similarity_score', 0):.3f})")

        return "\n".join(formatted_results)

    async def _tool_add_example(self, text: str, mode: str, quality_score: float = 3.0) -> str:
        """Add example tool"""
        example_id = self.vector_store.add_example(
            text=text,
            metadata={
                "mode": mode,
                "quality_score": quality_score,
                "source": "tool_generated"
            }
        )
        return f"Example added successfully with ID: {example_id}"

    async def _tool_get_memory(self, key: str) -> str:
        """Get memory tool"""
        value = self.working_memory.get(key, "Key not found in working memory")
        return str(value)

    async def _tool_set_memory(self, key: str, value: str) -> str:
        """Set memory tool"""
        self.working_memory[key] = value
        return f"Stored '{value}' in working memory under key '{key}'"

    def get_system_stats(self) -> Dict[str, Any]:
        """Get system statistics"""

        vector_stats = self.vector_store.get_collection_stats()

        return {
            "llm_wrapper": {
                "ollama_available": True,  # Assume available if initialized
                "groq_available": self.groq_client is not None,
                "max_retries": self.max_retries,
                "retry_delay": self.retry_delay,
                "available_tools": len(self.tools),
                "working_memory_keys": len(self.working_memory)
            },
            "vector_store": vector_stats,
            "timestamp": datetime.now().isoformat()
        }
