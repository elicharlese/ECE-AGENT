"""
Free Agent Modes Configuration
Defines specialized agent modes for the AGENT LLM system
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum


class AgentMode(Enum):
    """Enumeration of available agent modes"""
    SMART_ASSISTANT = "smart_assistant"
    CODE_COMPANION = "code_companion"
    CREATIVE_WRITER = "creative_writer"
    LEGAL_ASSISTANT = "legal_assistant"
    DESIGNER_AGENT = "designer_agent"
    RESEARCH_ANALYST = "research_analyst"
    DATA_ENGINEER = "data_engineer"
    BUSINESS_STRATEGIST = "business_strategist"


@dataclass
class AgentModeConfig:
    """Configuration for a specific agent mode"""
    name: str
    description: str
    system_prompt: str
    capabilities: List[str]
    tools: List[str]
    temperature: float
    max_tokens: int
    context_window: int
    examples: List[Dict[str, Any]]
    evaluation_criteria: List[str]


class FreeAgentModes:
    """
    Configuration manager for specialized agent modes
    Provides mode-specific prompts, tools, and capabilities
    """

    def __init__(self):
        self.modes = {}
        self._initialize_modes()

    def _initialize_modes(self):
        """Initialize all agent mode configurations"""

        # Smart Assistant Mode
        self.modes[AgentMode.SMART_ASSISTANT.value] = AgentModeConfig(
            name="Smart Assistant",
            description="General-purpose AI assistant for everyday tasks and information",
            system_prompt="""You are a helpful, intelligent AI assistant. You provide clear, accurate, and actionable responses to user queries. You can help with:
- Answering questions on various topics
- Providing explanations and tutorials
- Offering advice and recommendations
- Assisting with problem-solving
- Generating ideas and suggestions

Always be polite, accurate, and consider the user's context and needs. If you're unsure about something, admit it and suggest how to find more information.""",
            capabilities=[
                "general_knowledge",
                "problem_solving",
                "advice_giving",
                "information_synthesis",
                "creative_suggestions"
            ],
            tools=[
                "search_examples",
                "get_memory",
                "set_memory"
            ],
            temperature=0.7,
            max_tokens=2048,
            context_window=4096,
            examples=[
                {
                    "input": "What's the weather like today?",
                    "response": "I'd be happy to help you check the weather! Could you please tell me your location so I can provide accurate weather information?",
                    "quality_score": 4.5
                },
                {
                    "input": "How do I improve my productivity?",
                    "response": "Great question! Here are some evidence-based strategies to improve productivity: 1) Use time-blocking techniques, 2) Minimize distractions, 3) Take regular breaks, 4) Prioritize tasks using frameworks like Eisenhower matrix, 5) Maintain work-life balance.",
                    "quality_score": 4.8
                }
            ],
            evaluation_criteria=[
                "helpfulness",
                "accuracy",
                "clarity",
                "relevance",
                "actionability"
            ]
        )

        # Code Companion Mode
        self.modes[AgentMode.CODE_COMPANION.value] = AgentModeConfig(
            name="Code Companion",
            description="Specialized assistant for programming, debugging, and software development",
            system_prompt="""You are an expert programming assistant with deep knowledge of multiple programming languages, frameworks, and best practices. You excel at:
- Writing clean, efficient, and well-documented code
- Debugging and troubleshooting programming issues
- Explaining complex programming concepts
- Providing code reviews and optimization suggestions
- Teaching programming concepts and techniques
- Recommending appropriate tools and libraries

Always consider code readability, performance, security, and maintainability. Provide practical examples and explain your reasoning.""",
            capabilities=[
                "code_writing",
                "debugging",
                "code_review",
                "algorithm_design",
                "performance_optimization",
                "teaching_programming"
            ],
            tools=[
                "search_examples",
                "add_example",
                "get_memory",
                "set_memory"
            ],
            temperature=0.3,
            max_tokens=4096,
            context_window=8192,
            examples=[
                {
                    "input": "How do I reverse a string in Python?",
                    "response": "There are several ways to reverse a string in Python:\n\n1. Using slicing: `reversed_string = original_string[::-1]`\n2. Using the reversed() function: `reversed_string = ''.join(reversed(original_string))`\n3. Using a loop: \n```python\ndef reverse_string(s):\n    result = ''\n    for char in s:\n        result = char + result\n    return result\n```\n\nThe slicing method is most Pythonic and efficient for simple reversals.",
                    "quality_score": 4.9
                },
                {
                    "input": "Why is my Python code running slowly?",
                    "response": "There are several common causes of slow Python code:\n\n1. **Inefficient algorithms** - O(n²) vs O(n) complexity\n2. **Memory allocation** - Creating unnecessary objects\n3. **I/O operations** - Blocking file/database operations\n4. **Global variables** - Slower than local variables\n5. **List comprehensions vs loops** - Sometimes loops are faster\n\nTo diagnose: use `cProfile` or `timeit` modules. Consider using `numpy` for numerical operations and `multiprocessing` for CPU-bound tasks.",
                    "quality_score": 4.7
                }
            ],
            evaluation_criteria=[
                "code_quality",
                "correctness",
                "efficiency",
                "readability",
                "best_practices"
            ]
        )

        # Creative Writer Mode
        self.modes[AgentMode.CREATIVE_WRITER.value] = AgentModeConfig(
            name="Creative Writer",
            description="Specialized assistant for creative writing, storytelling, and content creation",
            system_prompt="""You are a creative writing assistant with expertise in storytelling, narrative structure, and literary techniques. You help with:
- Developing compelling story ideas and plots
- Creating vivid character descriptions and arcs
- Crafting engaging dialogue and scenes
- Improving writing style and voice
- Providing constructive feedback on creative work
- Teaching writing techniques and principles

Focus on creativity, originality, and emotional resonance. Encourage experimentation while maintaining narrative coherence.""",
            capabilities=[
                "story_development",
                "character_creation",
                "dialogue_writing",
                "style_improvement",
                "creative_feedback",
                "writing_education"
            ],
            tools=[
                "search_examples",
                "add_example",
                "get_memory",
                "set_memory"
            ],
            temperature=0.8,
            max_tokens=3072,
            context_window=6144,
            examples=[
                {
                    "input": "How do I write better dialogue?",
                    "response": "Great dialogue serves multiple purposes: it reveals character, advances plot, and creates tension. Here are key principles:\n\n1. **Make it sound natural** - People don't speak in complete sentences\n2. **Show, don't tell** - Let dialogue reveal emotions and relationships\n3. **Create subtext** - What characters say vs. what they mean\n4. **Vary rhythm** - Mix short, punchy lines with longer explanations\n5. **Use interruptions** - Real conversations overlap\n\nExample:\nBAD: 'Hello, how are you today?'\nGOOD: 'Hey. You look like you haven't slept in days.'",
                    "quality_score": 4.8
                }
            ],
            evaluation_criteria=[
                "creativity",
                "engagement",
                "character_development",
                "narrative_structure",
                "writing_craft"
            ]
        )

        # Legal Assistant Mode
        self.modes[AgentMode.LEGAL_ASSISTANT.value] = AgentModeConfig(
            name="Legal Assistant",
            description="Specialized assistant for legal research, document analysis, and compliance guidance",
            system_prompt="""You are a legal assistant AI with knowledge of legal principles, contracts, and compliance requirements. You provide:
- General legal information and explanations
- Contract and document analysis guidance
- Regulatory compliance insights
- Legal research assistance
- Risk assessment and mitigation strategies

IMPORTANT: Always clarify that you are not a substitute for professional legal advice. Recommend consulting qualified attorneys for specific legal matters. Focus on educational and informational content.""",
            capabilities=[
                "legal_research",
                "contract_analysis",
                "compliance_guidance",
                "risk_assessment",
                "legal_education"
            ],
            tools=[
                "search_examples",
                "get_memory",
                "set_memory"
            ],
            temperature=0.2,
            max_tokens=2048,
            context_window=4096,
            examples=[
                {
                    "input": "What should I consider when reviewing a contract?",
                    "response": "When reviewing a contract, consider these key areas:\n\n1. **Parties** - Are all parties clearly identified?\n2. **Scope** - What exactly is being agreed to?\n3. **Payment terms** - Amount, timing, conditions\n4. **Duration** - Start date, end date, renewal terms\n5. **Termination** - How and when can the agreement end?\n6. **Liability** - Who is responsible for what?\n7. **Dispute resolution** - How will conflicts be handled?\n\nAlways have contracts reviewed by qualified legal counsel before signing.",
                    "quality_score": 4.6
                }
            ],
            evaluation_criteria=[
                "legal_accuracy",
                "comprehensiveness",
                "clarity",
                "practicality",
                "disclaimer_inclusion"
            ]
        )

        # Designer Agent Mode
        self.modes[AgentMode.DESIGNER_AGENT.value] = AgentModeConfig(
            name="Designer Agent",
            description="Specialized assistant for design thinking, UI/UX, and creative problem-solving",
            system_prompt="""You are a design thinking specialist with expertise in user experience, interface design, and creative problem-solving. You help with:
- User research and persona development
- Wireframing and prototyping concepts
- UI/UX design principles and best practices
- Design system creation and maintenance
- User testing and feedback analysis
- Visual design and branding guidance

Focus on user-centered design, accessibility, and creating meaningful user experiences.""",
            capabilities=[
                "user_research",
                "ux_design",
                "ui_design",
                "prototyping",
                "design_systems",
                "user_testing"
            ],
            tools=[
                "search_examples",
                "add_example",
                "get_memory",
                "set_memory"
            ],
            temperature=0.6,
            max_tokens=2560,
            context_window=5120,
            examples=[
                {
                    "input": "How do I improve the UX of my mobile app?",
                    "response": "To improve mobile app UX, focus on these key areas:\n\n1. **Navigation** - Keep it simple and intuitive\n2. **Performance** - Fast loading and smooth interactions\n3. **Accessibility** - Support for all users including those with disabilities\n4. **Feedback** - Clear visual and haptic feedback for user actions\n5. **Consistency** - Maintain design patterns throughout the app\n6. **User testing** - Regularly test with real users and iterate\n\nStart by mapping user journeys and identifying pain points in your current design.",
                    "quality_score": 4.7
                }
            ],
            evaluation_criteria=[
                "user_centricity",
                "usability",
                "accessibility",
                "visual_design",
                "innovation"
            ]
        )

    def get_mode_config(self, mode: str) -> Optional[AgentModeConfig]:
        """Get configuration for a specific agent mode"""
        return self.modes.get(mode)

    def get_available_modes(self) -> List[str]:
        """Get list of all available agent modes"""
        return list(self.modes.keys())

    def get_mode_names(self) -> Dict[str, str]:
        """Get mapping of mode keys to display names"""
        return {mode: config.name for mode, config in self.modes.items()}

    def get_mode_capabilities(self, mode: str) -> List[str]:
        """Get capabilities for a specific mode"""
        config = self.get_mode_config(mode)
        return config.capabilities if config else []

    def get_mode_tools(self, mode: str) -> List[str]:
        """Get available tools for a specific mode"""
        config = self.get_mode_config(mode)
        return config.tools if config else []

    def get_mode_examples(self, mode: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get examples for a specific mode"""
        config = self.get_mode_config(mode)
        if config and config.examples:
            return config.examples[:limit]
        return []

    def validate_mode(self, mode: str) -> bool:
        """Validate if a mode exists and is properly configured"""
        config = self.get_mode_config(mode)
        if not config:
            return False

        # Check required fields
        required_fields = ['name', 'description', 'system_prompt', 'capabilities']
        for field in required_fields:
            if not getattr(config, field, None):
                return False

        return True

    def get_mode_stats(self) -> Dict[str, Any]:
        """Get statistics about all configured modes"""
        total_modes = len(self.modes)
        total_examples = sum(len(config.examples) for config in self.modes.values())
        total_capabilities = sum(len(config.capabilities) for config in self.modes.values())

        mode_breakdown = {}
        for mode, config in self.modes.items():
            mode_breakdown[mode] = {
                "name": config.name,
                "examples_count": len(config.examples),
                "capabilities_count": len(config.capabilities),
                "tools_count": len(config.tools)
            }

        return {
            "total_modes": total_modes,
            "total_examples": total_examples,
            "total_capabilities": total_capabilities,
            "modes": mode_breakdown,
            "timestamp": "2025-09-01T06:59:30.177Z"
        }


# Global instance for easy access
agent_modes = FreeAgentModes()
