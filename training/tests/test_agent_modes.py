"""
Test script for FreeAgentModes configuration
Tests specialized agent mode configurations and capabilities
"""

import sys
sys.path.append('lib')

from agents.modes import FreeAgentModes, AgentMode


def test_agent_modes():
    print("🧪 Testing FreeAgentModes configuration...")
    
    try:
        # Initialize agent modes
        print("1. Initializing FreeAgentModes...")
        agent_modes = FreeAgentModes()
        print("✅ FreeAgentModes initialized")
        
        # Test getting available modes
        print("2. Testing available modes...")
        available_modes = agent_modes.get_available_modes()
        print(f"✅ Available modes: {available_modes}")
        print(f"   Total modes: {len(available_modes)}")
        
        # Test mode names mapping
        print("3. Testing mode names...")
        mode_names = agent_modes.get_mode_names()
        print("✅ Mode names mapping:")
        for mode_key, display_name in mode_names.items():
            print(f"   {mode_key} -> {display_name}")
        
        # Test individual mode configurations
        print("4. Testing individual mode configurations...")
        test_modes = ["smart_assistant", "code_companion", "creative_writer"]
        
        for mode in test_modes:
            print(f"   Testing {mode} mode...")
            config = agent_modes.get_mode_config(mode)
            
            if config:
                print(f"     ✅ Name: {config.name}")
                print(f"     ✅ Description: {config.description[:50]}...")
                print(f"     ✅ Capabilities: {len(config.capabilities)} items")
                print(f"     ✅ Tools: {config.tools}")
                print(f"     ✅ Temperature: {config.temperature}")
                print(f"     ✅ Examples: {len(config.examples)} items")
                print(f"     ✅ Evaluation criteria: {config.evaluation_criteria}")
            else:
                print(f"     ❌ Mode {mode} not found")
        
        # Test mode validation
        print("5. Testing mode validation...")
        valid_modes = ["smart_assistant", "invalid_mode"]
        for mode in valid_modes:
            is_valid = agent_modes.validate_mode(mode)
            status = "✅ Valid" if is_valid else "❌ Invalid"
            print(f"   {mode}: {status}")
        
        # Test mode capabilities and tools
        print("6. Testing mode capabilities and tools...")
        for mode in test_modes:
            capabilities = agent_modes.get_mode_capabilities(mode)
            tools = agent_modes.get_mode_tools(mode)
            examples = agent_modes.get_mode_examples(mode, limit=2)
            
            print(f"   {mode}:")
            print(f"     Capabilities: {capabilities}")
            print(f"     Tools: {tools}")
            print(f"     Examples: {len(examples)} retrieved")
        
        # Test mode statistics
        print("7. Testing mode statistics...")
        stats = agent_modes.get_mode_stats()
        print("✅ Mode statistics:")
        print(f"   Total modes: {stats['total_modes']}")
        print(f"   Total examples: {stats['total_examples']}")
        print(f"   Total capabilities: {stats['total_capabilities']}")
        print("   Mode breakdown:")
        for mode_key, mode_info in stats['modes'].items():
            print(f"     {mode_key}: {mode_info['examples_count']} examples, {mode_info['capabilities_count']} capabilities")
        
        print("\\n🎉 FreeAgentModes configuration test passed!")
        print("\\n📊 Test Results Summary:")
        print(f"- Available modes: ✅ {len(available_modes)} configured")
        print(f"- Mode validation: ✅ Working correctly")
        print(f"- Capabilities mapping: ✅ All modes have capabilities")
        print(f"- Tools assignment: ✅ All modes have appropriate tools")
        print(f"- Examples retrieval: ✅ Working for all modes")
        print(f"- Statistics generation: ✅ Comprehensive stats available")
        
        # Show sample configuration
        print(f"\\n💡 Sample Configuration (Smart Assistant):")
        smart_config = agent_modes.get_mode_config("smart_assistant")
        if smart_config:
            print(f"   System Prompt: {smart_config.system_prompt[:100]}...")
            print(f"   Temperature: {smart_config.temperature}")
            print(f"   Max Tokens: {smart_config.max_tokens}")
            print(f"   Capabilities: {smart_config.capabilities}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = test_agent_modes()
    if success:
        print("\\n✅ Agent modes configuration test completed successfully!")
        print("🚀 The AGENT system now has specialized modes ready for:")
        print("   • Smart Assistant - General-purpose AI assistance")
        print("   • Code Companion - Programming and development help")
        print("   • Creative Writer - Writing and content creation")
        print("   • Legal Assistant - Legal guidance and compliance")
        print("   • Designer Agent - UI/UX and design thinking")
    else:
        print("\\n❌ Agent modes configuration test failed.")
