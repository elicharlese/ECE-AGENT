"""
Free Agent Modes - Agent mode management for AGENT LLM system
Defines and manages different agent specializations
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class AgentMode(Enum):
    """Enumeration of available agent modes"""
    SMART_ASSISTANT = "smart_assistant"
    CODE_COMPANION = "code_companion"
    CREATIVE_WRITER = "creative_writer"
    LEGAL_ASSISTANT = "legal_assistant"
    DESIGNER_AGENT = "designer_agent"

@dataclass
class AgentModeConfig:
    """Configuration for an agent mode"""
    name: str
    description: str
    capabilities: List[str]
    keywords: List[str]
    system_prompt: str
    temperature: float = 0.7
    max_tokens: int = 1024
    tools_enabled: bool = True
    examples_enabled: bool = True

class FreeAgentModes:
    """
    Manages agent modes and their configurations
    """
    
    def __init__(self):
        self.modes = self._initialize_modes()
        logger.info(f"Initialized {len(self.modes)} agent modes")
    
    def _initialize_modes(self) -> Dict[str, AgentModeConfig]:
        """Initialize all available agent modes"""
        
        modes = {
            "smart_assistant": AgentModeConfig(
                name="Smart Assistant",
                description="General AI assistance for productivity and task management",
                capabilities=[
                    "Task planning and scheduling",
                    "Information retrieval and research", 
                    "Productivity workflow optimization",
                    "Calendar and time management",
                    "Goal setting and tracking"
                ],
                keywords=[
                    "help", "assist", "task", "schedule", "plan", "organize",
                    "productivity", "workflow", "manage", "track", "goal"
                ],
                system_prompt="""You are a Smart Assistant designed to help with general productivity and task management. 
                You excel at organizing information, planning tasks, and providing helpful guidance for daily activities.
                Always be helpful, clear, and actionable in your responses."""
            ),
            
            "code_companion": AgentModeConfig(
                name="Code Companion", 
                description="Programming assistance and development help",
                capabilities=[
                    "Code generation and completion",
                    "Bug detection and debugging assistance",
                    "Architecture review and suggestions",
                    "Best practices recommendations",
                    "Documentation generation"
                ],
                keywords=[
                    "code", "programming", "python", "javascript", "function", "class",
                    "debug", "error", "bug", "compile", "syntax", "algorithm", "database", "api"
                ],
                system_prompt="""You are a Code Companion specialized in programming and development assistance.
                You can help with code generation, debugging, architecture design, and best practices.
                Always provide clear, well-commented code examples and explain your reasoning."""
            ),
            
            "creative_writer": AgentModeConfig(
                name="Creative Writer",
                description="Writing and content creation assistance", 
                capabilities=[
                    "Story and narrative generation",
                    "Character development",
                    "Technical writing and documentation",
                    "Marketing copy creation",
                    "Style adaptation and editing"
                ],
                keywords=[
                    "write", "story", "character", "plot", "dialogue", "creative",
                    "novel", "poem", "script", "narrative", "fiction", "literature"
                ],
                system_prompt="""You are a Creative Writer focused on helping with all forms of writing and content creation.
                You can assist with storytelling, character development, technical writing, and creative projects.
                Always maintain appropriate tone and style for the requested content type."""
            ),
            
            "legal_assistant": AgentModeConfig(
                name="Legal Assistant",
                description="Legal analysis and compliance guidance",
                capabilities=[
                    "Contract analysis and review",
                    "Legal research assistance", 
                    "Compliance checking",
                    "Risk assessment",
                    "Legal document drafting guidance"
                ],
                keywords=[
                    "contract", "legal", "law", "agreement", "compliance", "regulation",
                    "terms", "policy", "license", "copyright", "liability"
                ],
                system_prompt="""You are a Legal Assistant designed to help with legal analysis and compliance guidance.
                You can assist with contract review, legal research, and compliance checking.
                IMPORTANT: Always include disclaimers that you are not providing legal advice and recommend consulting qualified legal professionals."""
            ),
            
            "designer_agent": AgentModeConfig(
                name="Designer Agent",
                description="UI/UX design and visual guidance",
                capabilities=[
                    "User experience flow design",
                    "Visual hierarchy and layout guidance",
                    "Color theory and typography advice", 
                    "Design system development",
                    "Accessibility compliance checking"
                ],
                keywords=[
                    "design", "ui", "ux", "interface", "user", "experience", "wireframe",
                    "prototype", "visual", "layout", "color", "typography"
                ],
                system_prompt="""You are a Designer Agent specialized in UI/UX design and visual guidance.
                You can help with user experience design, visual hierarchy, color theory, and accessibility.
                Always consider user needs, accessibility standards, and modern design principles."""
            )
        }
        
        return modes
    
    def get_available_modes(self) -> Dict[str, Dict[str, str]]:
        """Get all available agent modes"""
        return {
            mode_id: {
                "name": config.name,
                "description": config.description
            }
            for mode_id, config in self.modes.items()
        }
    
    def get_mode_config(self, mode_id: str) -> Optional[AgentModeConfig]:
        """Get configuration for a specific mode"""
        return self.modes.get(mode_id)
    
    def validate_mode(self, mode_id: str) -> bool:
        """Validate if a mode ID is valid"""
        return mode_id in self.modes
    
    def get_mode_keywords(self, mode_id: str) -> List[str]:
        """Get keywords for a specific mode"""
        config = self.get_mode_config(mode_id)
        return config.keywords if config else []
    
    def get_mode_capabilities(self, mode_id: str) -> List[str]:
        """Get capabilities for a specific mode"""
        config = self.get_mode_config(mode_id)
        return config.capabilities if config else []
    
    def get_system_prompt(self, mode_id: str) -> str:
        """Get system prompt for a specific mode"""
        config = self.get_mode_config(mode_id)
        return config.system_prompt if config else ""
    
    def get_mode_settings(self, mode_id: str) -> Dict[str, Any]:
        """Get generation settings for a specific mode"""
        config = self.get_mode_config(mode_id)
        if not config:
            return {}
        
        return {
            "temperature": config.temperature,
            "max_tokens": config.max_tokens,
            "tools_enabled": config.tools_enabled,
            "examples_enabled": config.examples_enabled
        }
    
    def suggest_mode(self, user_input: str) -> str:
        """Suggest the best agent mode based on user input"""
        input_lower = user_input.lower()
        
        # Score each mode based on keyword matches
        mode_scores = {}
        for mode_id, config in self.modes.items():
            score = sum(1 for keyword in config.keywords if keyword in input_lower)
            mode_scores[mode_id] = score
        
        # Return mode with highest score, default to smart_assistant
        if mode_scores:
            best_mode = max(mode_scores, key=mode_scores.get)
            if mode_scores[best_mode] > 0:
                return best_mode
        
        return "smart_assistant"
    
    def get_mode_statistics(self) -> Dict[str, Any]:
        """Get statistics about available modes"""
        return {
            "total_modes": len(self.modes),
            "modes": list(self.modes.keys()),
            "capabilities_count": sum(len(config.capabilities) for config in self.modes.values()),
            "keywords_count": sum(len(config.keywords) for config in self.modes.values())
        }

# Global instance
agent_modes = FreeAgentModes()