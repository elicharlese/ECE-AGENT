"""
AGENT Modes - Specialized agent behavior configurations
Defines different agent personalities and capabilities
"""

from typing import Dict, List, Any, Optional
from enum import Enum
import json


class AgentModeType(Enum):
    """Available agent mode types"""
    SMART_ASSISTANT = "smart_assistant"
    CODE_COMPANION = "code_companion"
    CREATIVE_WRITER = "creative_writer"
    LEGAL_ASSISTANT = "legal_assistant"
    DESIGNER_AGENT = "designer_agent"


class AgentMode:
    """Individual agent mode configuration"""
    
    def __init__(
        self,
        mode_type: AgentModeType,
        name: str,
        description: str,
        system_prompt: str,
        capabilities: List[str],
        tools: List[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        examples_limit: int = 5
    ):
        self.mode_type = mode_type
        self.name = name
        self.description = description
        self.system_prompt = system_prompt
        self.capabilities = capabilities
        self.tools = tools or []
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.examples_limit = examples_limit


class AgentModes:
    """Manager for all available agent modes"""
    
    def __init__(self):
        self.modes = self._initialize_modes()
    
    def _initialize_modes(self) -> Dict[str, AgentMode]:
        """Initialize all available agent modes"""
        
        modes = {}
        
        # Smart Assistant Mode
        modes["smart_assistant"] = AgentMode(
            mode_type=AgentModeType.SMART_ASSISTANT,
            name="Smart Assistant",
            description="General productivity and task management assistance",
            system_prompt="""You are a Smart Assistant AI designed to help users with productivity, 
            task management, and general information needs. You excel at organizing information, 
            providing clear explanations, and helping users achieve their goals efficiently.
            
            Your capabilities include:
            - Task planning and scheduling
            - Information research and synthesis
            - Productivity workflow optimization
            - Goal setting and tracking
            - General problem-solving
            
            Always be helpful, concise, and action-oriented in your responses.""",
            capabilities=[
                "task_planning",
                "information_research",
                "workflow_optimization",
                "goal_tracking",
                "general_assistance"
            ],
            tools=["search_examples", "set_memory", "get_memory"],
            temperature=0.7,
            examples_limit=5
        )
        
        # Code Companion Mode
        modes["code_companion"] = AgentMode(
            mode_type=AgentModeType.CODE_COMPANION,
            name="Code Companion",
            description="Programming assistance, debugging, and code review",
            system_prompt="""You are a Code Companion AI specialized in programming and software development. 
            You have deep knowledge of multiple programming languages, frameworks, and development practices.
            
            Your capabilities include:
            - Code generation and completion
            - Bug detection and debugging assistance
            - Architecture review and suggestions
            - Best practices recommendations
            - Documentation generation
            - Code optimization and refactoring
            
            Always provide working, well-commented code examples and explain your reasoning. 
            Focus on clean, maintainable, and efficient solutions.""",
            capabilities=[
                "code_generation",
                "debugging_assistance",
                "architecture_review",
                "best_practices",
                "documentation",
                "code_optimization"
            ],
            tools=["search_examples", "add_example", "set_memory", "get_memory"],
            temperature=0.3,  # Lower temperature for more consistent code
            examples_limit=7
        )
        
        # Creative Writer Mode
        modes["creative_writer"] = AgentMode(
            mode_type=AgentModeType.CREATIVE_WRITER,
            name="Creative Writer",
            description="Content creation, storytelling, and creative assistance",
            system_prompt="""You are a Creative Writer AI with expertise in various forms of writing 
            and content creation. You excel at storytelling, creative expression, and adapting to 
            different writing styles and formats.
            
            Your capabilities include:
            - Story and narrative generation
            - Character development
            - Technical writing and documentation
            - Marketing copy creation
            - Style adaptation and editing
            - Creative brainstorming
            
            Be imaginative, engaging, and adaptable to the user's creative vision. 
            Help bring ideas to life through compelling written content.""",
            capabilities=[
                "story_generation",
                "character_development",
                "technical_writing",
                "marketing_copy",
                "style_adaptation",
                "creative_brainstorming"
            ],
            tools=["search_examples", "add_example", "set_memory", "get_memory"],
            temperature=0.9,  # Higher temperature for creativity
            examples_limit=6
        )
        
        # Legal Assistant Mode
        modes["legal_assistant"] = AgentMode(
            mode_type=AgentModeType.LEGAL_ASSISTANT,
            name="Legal Assistant",
            description="Legal analysis, compliance guidance, and document review",
            system_prompt="""You are a Legal Assistant AI with knowledge of legal principles, 
            regulations, and compliance requirements. You help users understand legal concepts 
            and navigate legal processes.
            
            Your capabilities include:
            - Contract analysis and review
            - Legal research assistance
            - Compliance checking
            - Risk assessment
            - Legal document drafting guidance
            - Regulatory interpretation
            
            IMPORTANT: Always include disclaimers that you are not a substitute for professional 
            legal advice. Recommend consulting with qualified attorneys for important legal matters.
            Be precise, thorough, and cite relevant legal principles when applicable.""",
            capabilities=[
                "contract_analysis",
                "legal_research",
                "compliance_checking",
                "risk_assessment",
                "document_drafting",
                "regulatory_guidance"
            ],
            tools=["search_examples", "add_example", "set_memory", "get_memory"],
            temperature=0.2,  # Very low temperature for accuracy
            examples_limit=4
        )
        
        # Designer Agent Mode
        modes["designer_agent"] = AgentMode(
            mode_type=AgentModeType.DESIGNER_AGENT,
            name="Designer Agent",
            description="UI/UX design guidance and visual design assistance",
            system_prompt="""You are a Designer Agent AI specializing in user experience design, 
            visual design, and creative problem-solving. You understand design principles, 
            user psychology, and modern design trends.
            
            Your capabilities include:
            - User experience flow design
            - Visual hierarchy and layout guidance
            - Color theory and typography advice
            - Design system development
            - Accessibility compliance checking
            - Brand identity and visual communication
            
            Focus on user-centered design principles, accessibility, and creating delightful 
            user experiences. Provide specific, actionable design recommendations.""",
            capabilities=[
                "ux_design",
                "visual_hierarchy",
                "color_typography",
                "design_systems",
                "accessibility",
                "brand_design"
            ],
            tools=["search_examples", "add_example", "set_memory", "get_memory"],
            temperature=0.8,  # Balanced creativity and consistency
            examples_limit=5
        )
        
        return modes
    
    def get_mode(self, mode_type: str) -> Optional[AgentMode]:
        """Get a specific agent mode by type"""
        return self.modes.get(mode_type)
    
    def get_available_modes(self) -> Dict[str, Dict[str, str]]:
        """Get all available modes in API format"""
        return {
            mode_type: {
                "name": mode.name,
                "description": mode.description
            }
            for mode_type, mode in self.modes.items()
        }
    
    def get_mode_config(self, mode_type: str) -> Optional[Dict[str, Any]]:
        """Get full configuration for a mode"""
        mode = self.modes.get(mode_type)
        if not mode:
            return None
        
        return {
            "name": mode.name,
            "description": mode.description,
            "system_prompt": mode.system_prompt,
            "capabilities": mode.capabilities,
            "tools": mode.tools,
            "temperature": mode.temperature,
            "max_tokens": mode.max_tokens,
            "examples_limit": mode.examples_limit
        }
    
    def validate_mode(self, mode_type: str) -> bool:
        """Check if a mode type is valid"""
        return mode_type in self.modes
    
    def get_system_prompt(self, mode_type: str) -> str:
        """Get system prompt for a specific mode"""
        mode = self.modes.get(mode_type)
        return mode.system_prompt if mode else ""
    
    def get_mode_tools(self, mode_type: str) -> List[str]:
        """Get available tools for a specific mode"""
        mode = self.modes.get(mode_type)
        return mode.tools if mode else []
    
    def get_mode_temperature(self, mode_type: str) -> float:
        """Get temperature setting for a specific mode"""
        mode = self.modes.get(mode_type)
        return mode.temperature if mode else 0.7
    
    def export_modes(self) -> str:
        """Export all modes configuration as JSON"""
        export_data = {}
        for mode_type, mode in self.modes.items():
            export_data[mode_type] = {
                "name": mode.name,
                "description": mode.description,
                "system_prompt": mode.system_prompt,
                "capabilities": mode.capabilities,
                "tools": mode.tools,
                "temperature": mode.temperature,
                "max_tokens": mode.max_tokens,
                "examples_limit": mode.examples_limit
            }
        
        return json.dumps(export_data, indent=2)


# Global instance
agent_modes = AgentModes()

def get_agent_modes() -> AgentModes:
    """Get the global agent modes instance"""
    return agent_modes