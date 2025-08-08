"""
Test script for ClickUp API integration
"""

import sys
import os
from pathlib import Path

# Add the project root directory to the path
project_root = str(Path(__file__).parent.parent)
sys.path.insert(0, project_root)

def test_clickup_import():
    """Test that ClickUp agent can be imported"""
    try:
        from agent.domains.clickup import ClickUpAgent
        print("✓ ClickUpAgent imported successfully")
        return True
    except Exception as e:
        print(f"✗ Failed to import ClickUpAgent: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_clickup_config():
    """Test that ClickUp config file exists and can be loaded"""
    try:
        config_path = Path(__file__).parent.parent / "config" / "clickup_config.json"
        if config_path.exists():
            print("✓ ClickUp config file exists")
            # Try to load it
            import json
            with open(config_path, 'r') as f:
                config = json.load(f)
            print("✓ ClickUp config file loaded successfully")
            return True
        else:
            print("✗ ClickUp config file not found")
            return False
    except Exception as e:
        print(f"✗ Failed to load ClickUp config: {e}")
        return False

def test_clickup_registration():
    """Test that ClickUp agent is registered in the domain registry"""
    try:
        # Add agent path to sys.path
        agent_path = str(Path(__file__).parent.parent / "agent")
        if agent_path not in sys.path:
            sys.path.insert(0, agent_path)
        
        from agent.domains import get_domain_agent, list_available_domains
        
        # Check if clickup is in the available domains
        domains = list_available_domains()
        if 'clickup' in domains:
            print("✓ ClickUp agent is registered in domain registry")
            
            # Try to get the agent
            agent_class = get_domain_agent('clickup')
            if agent_class:
                print("✓ ClickUp agent can be retrieved from registry")
                return True
            else:
                print("✗ ClickUp agent could not be retrieved from registry")
                return False
        else:
            print("✗ ClickUp agent is not registered in domain registry")
            return False
    except Exception as e:
        print(f"✗ Failed to test ClickUp registration: {e}")
        return False

def main():
    """Run all ClickUp integration tests"""
    print("Testing ClickUp API integration...")
    print()
    
    tests = [
        test_clickup_import,
        test_clickup_config,
        test_clickup_registration
    ]
    
    results = []
    for test in tests:
        results.append(test())
        print()
    
    passed = sum(results)
    total = len(results)
    
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All ClickUp integration tests passed!")
        return 0
    else:
        print("❌ Some ClickUp integration tests failed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
