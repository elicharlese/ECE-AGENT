# Domain-specific agents
from .developer import DeveloperAgent
from .trader import TraderAgent
from .lawyer import LawyerAgent
from .researcher import ResearcherAgent
from .data_engineer import DataEngineerAgent
from .spline_3d_developer import Spline3DDeveloper

# Domain registry for easy access
DOMAIN_AGENTS = {
    'developer': DeveloperAgent,
    'trader': TraderAgent,
    'lawyer': LawyerAgent,
    'researcher': ResearcherAgent,
    'data-engineer': DataEngineerAgent,
    'data_engineer': DataEngineerAgent,  # Alternative naming
    'spline-3d': Spline3DDeveloper,  # Spline 3D development
    'spline_3d': Spline3DDeveloper,  # Alternative naming
    'spline': Spline3DDeveloper,  # Short form
    '3d-developer': Spline3DDeveloper,  # 3D development
    '3d_developer': Spline3DDeveloper,  # Alternative naming
    'hacker': ResearcherAgent,  # Use researcher for ethical hacking
    'network-admin': ResearcherAgent,  # Network admin uses research capabilities
    'network-analyst': ResearcherAgent,  # Network analyst uses research capabilities
    'pentester': ResearcherAgent,  # Penetration tester uses research capabilities
    'incident-response': ResearcherAgent,  # Incident response uses research capabilities
    'general': DeveloperAgent,  # Default to developer for general queries
}

def get_domain_agent(domain_name: str):
    """Get the appropriate agent class for a domain"""
    return DOMAIN_AGENTS.get(domain_name.lower(), DeveloperAgent)

def list_available_domains():
    """List all available domain agents"""
    return list(DOMAIN_AGENTS.keys())

__all__ = [
    'DeveloperAgent',
    'TraderAgent', 
    'LawyerAgent',
    'ResearcherAgent',
    'DataEngineerAgent',
    'Spline3DDeveloper',
    'DOMAIN_AGENTS',
    'get_domain_agent',
    'list_available_domains'
]
