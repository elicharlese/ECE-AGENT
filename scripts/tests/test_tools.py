#!/usr/bin/env python3
"""
Test all tools functionality
"""

import sys
import os

# Add project root to Python path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Try to import agent components
components_import_error = None
try:
    from agent.core import AGENTCore
    from agent.trainer import AGENTTrainer
    from agent.web_scraper import WebScraper
    from agent.knowledge_base import CyberSecurityKnowledgeBase as KnowledgeBase
    from agent.container_orchestrator import ContainerOrchestrator
    from agent.security_tools import SecurityToolsManager as SecurityTools
    print("✓ Successfully imported all agent components")
    components_available = True
except ImportError as e:
    print(f"✗ Could not import all agent components: {e}")
    components_import_error = f"Could not import all agent components: {e}"
    components_available = False

def test_core_tools():
    """Test core tools functionality"""
    if not components_available:
        print("✗ Core tools test failed - components not available")
        print(f"  Error: {components_import_error}")
        return False
    
    try:
        # Test AGENTCore initialization
        core = AGENTCore()
        print("✓ AGENTCore initialized successfully")
        
        # Test core methods
        if hasattr(core, 'process_query'):
            print("✓ AGENTCore has process_query method")
        else:
            print("✗ AGENTCore does not have process_query method")
            return False
        
        return True
    except Exception as e:
        print(f"✗ Core tools test failed: {e}")
        return False

def test_trainer_tools():
    """Test trainer tools functionality"""
    if not components_available:
        print("✗ Trainer tools test failed - components not available")
        print(f"  Error: {components_import_error}")
        return False
    
    try:
        # Test AGENTTrainer initialization
        trainer = AGENTTrainer()
        print("✓ AGENTTrainer initialized successfully")
        
        # Test trainer methods
        if hasattr(trainer, 'train_model'):
            print("✓ AGENTTrainer has train_model method")
        else:
            print("✗ AGENTTrainer does not have train_model method")
            return False
        
        return True
    except Exception as e:
        print(f"✗ Trainer tools test failed: {e}")
        return False

def test_web_scraper_tools():
    """Test web scraper tools functionality"""
    if not components_available:
        print("✗ Web scraper tools test failed - components not available")
        print(f"  Error: {components_import_error}")
        return False
    
    try:
        # Test WebScraper initialization
        scraper = WebScraper()
        print("✓ WebScraper initialized successfully")
        
        # Test scraper methods
        if hasattr(scraper, 'scrape_url'):
            print("✓ WebScraper has scrape_url method")
        else:
            print("✗ WebScraper does not have scrape_url method")
            return False
        
        return True
    except Exception as e:
        print(f"✗ Web scraper tools test failed: {e}")
        return False

def test_knowledge_base_tools():
    """Test knowledge base tools functionality"""
    if not components_available:
        print("✗ Knowledge base tools test failed - components not available")
        print(f"  Error: {components_import_error}")
        return False
    
    try:
        # Test KnowledgeBase initialization
        kb = KnowledgeBase()
        print("✓ KnowledgeBase initialized successfully")
        
        # Test knowledge base methods
        if hasattr(kb, 'store_memory'):
            print("✓ KnowledgeBase has store_memory method")
        else:
            print("✗ KnowledgeBase does not have store_memory method")
            return False
        
        return True
    except Exception as e:
        print(f"✗ Knowledge base tools test failed: {e}")
        return False

def test_container_orchestrator_tools():
    """Test container orchestrator tools functionality"""
    if not components_available:
        print("✗ Container orchestrator tools test failed - components not available")
        print(f"  Error: {components_import_error}")
        return False
    
    try:
        # Test ContainerOrchestrator initialization
        orchestrator = ContainerOrchestrator()
        print("✓ ContainerOrchestrator initialized successfully")
        
        # Test orchestrator methods
        if hasattr(orchestrator, 'deploy_container'):
            print("✓ ContainerOrchestrator has deploy_container method")
        else:
            print("✗ ContainerOrchestrator does not have deploy_container method")
            return False
        
        return True
    except Exception as e:
        print(f"✗ Container orchestrator tools test failed: {e}")
        return False

def test_security_tools():
    """Test security tools functionality"""
    if not components_available:
        print("✗ Security tools test failed - components not available")
        print(f"  Error: {components_import_error}")
        return False
    
    try:
        # Test SecurityTools initialization
        security = SecurityTools()
        print("✓ SecurityTools initialized successfully")
        
        # Test security methods
        if hasattr(security, 'scan_vulnerabilities'):
            print("✓ SecurityTools has scan_vulnerabilities method")
        else:
            print("✗ SecurityTools does not have scan_vulnerabilities method")
            return False
        
        return True
    except Exception as e:
        print(f"✗ Security tools test failed: {e}")
        return False

def main():
    """Main test function"""
    print("Starting tools tests...")
    
    # Test all tools
    core_success = test_core_tools()
    trainer_success = test_trainer_tools()
    scraper_success = test_web_scraper_tools()
    kb_success = test_knowledge_base_tools()
    orchestrator_success = test_container_orchestrator_tools()
    security_success = test_security_tools()
    
    if all([core_success, trainer_success, scraper_success, kb_success, orchestrator_success, security_success]):
        print("\n🎉 All tools tests passed!")
        return 0
    else:
        print("\n❌ Some tools tests failed!")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
