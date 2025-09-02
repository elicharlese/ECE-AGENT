#!/usr/bin/env python3
"""
Test script for FreeLLMWrapper integration with Ollama
"""

import asyncio
import sys
import os

# Add lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'lib'))

from lib.llm.base_wrapper import FreeLLMWrapper, create_llm_wrapper


async def test_llm_wrapper():
    """Test the LLM wrapper with Ollama"""
    
    print("🚀 Testing FreeLLMWrapper with Ollama...")
    print("=" * 50)
    
    # Create wrapper instance
    wrapper = FreeLLMWrapper(
        ollama_host="http://localhost:11434",
        default_provider="ollama",
        fallback_enabled=True
    )
    
    print(f"📊 Wrapper initialized: {wrapper}")
    print()
    
    # Check provider availability
    print("🔍 Checking provider availability...")
    available_providers = wrapper.get_available_providers()
    print(f"✅ Available providers: {available_providers}")
    
    ollama_available = wrapper.is_provider_available("ollama")
    print(f"✅ Ollama available: {ollama_available}")
    
    groq_available = wrapper.is_provider_available("groq")
    print(f"✅ Groq available: {groq_available}")
    print()
    
    # Test basic generation
    if ollama_available:
        print("🧪 Testing basic text generation...")
        try:
            result = await wrapper.generate(
                prompt="Hello! Can you tell me about artificial intelligence in one sentence?",
                max_tokens=50,
                temperature=0.7
            )
            
            print("✅ Generation successful!")
            print(f"📝 Response: {result['response'][:100]}...")
            print(f"🏷️  Provider: {result['provider']}")
            print(f"🤖 Model: {result['model']}")
            print(".2f"            print(f"📊 Token usage: {result['usage']}")
            
        except Exception as e:
            print(f"❌ Generation failed: {e}")
            return False
    else:
        print("⚠️  Ollama not available, skipping generation test")
        return False
    
    print()
    
    # Test statistics
    print("📈 Testing statistics...")
    stats = wrapper.get_statistics()
    print(f"📊 Total requests: {stats['total_requests']}")
    print(f"✅ Successful requests: {stats['successful_requests']}")
    print(".1%"    print(f"🏃 Average response time: {stats['average_response_time']:.2f}s")
    print()
    
    # Test health check
    print("🏥 Running health check...")
    health = await wrapper.health_check()
    print(f"📊 Health check results: {health}")
    print()
    
    print("🎉 All tests completed successfully!")
    return True


async def test_raise_integration():
    """Test integration with RAISE framework components"""
    
    print("🔗 Testing RAISE framework integration...")
    print("=" * 50)
    
    try:
        # Import RAISE components
        from lib.reasoning.react_processor import FreeReActProcessor
        from lib.reasoning.raise_controller import FreeRAISEController
        from lib.agents.modes import FreeAgentModes
        
        # Create components
        llm_wrapper = FreeLLMWrapper()
        react_processor = FreeReActProcessor(llm_wrapper)
        agent_modes = FreeAgentModes()
        raise_controller = FreeRAISEController(llm_wrapper, None, react_processor, agent_modes)
        
        print("✅ All RAISE components initialized successfully!")
        print(f"🤖 LLM Wrapper: {llm_wrapper}")
        print(f"🧠 ReAct Processor: {react_processor}")
        print(f"🎭 Agent Modes: {len(agent_modes.list_modes())} modes available")
        print(f"🎛️  RAISE Controller: {raise_controller}")
        
        return True
        
    except Exception as e:
        print(f"❌ RAISE integration test failed: {e}")
        return False


async def main():
    """Main test function"""
    
    print("🧪 Starting LLM Wrapper Integration Tests")
    print("=" * 60)
    print()
    
    # Test LLM wrapper
    llm_success = await test_llm_wrapper()
    print()
    
    # Test RAISE integration
    raise_success = await test_raise_integration()
    print()
    
    # Summary
    print("📋 Test Summary:")
    print("=" * 60)
    print(f"LLM Wrapper Test: {'✅ PASSED' if llm_success else '❌ FAILED'}")
    print(f"RAISE Integration Test: {'✅ PASSED' if raise_success else '❌ FAILED'}")
    print()
    
    if llm_success and raise_success:
        print("🎉 All tests passed! The RAISE framework is ready for use.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
