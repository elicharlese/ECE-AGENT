#!/usr/bin/env python3
"""
Simple test script for FreeLLMWrapper with Ollama
"""

import asyncio
import sys
import os

# Add lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'lib'))

from lib.llm.base_wrapper import FreeLLMWrapper


async def test_basic_llm():
    """Test basic LLM functionality"""
    
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
            print(f"⚡ Response time: {result['response_time']:.2f}s")
            print(f"📊 Token usage: {result['usage']}")
            
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
    print(f"🏃 Average response time: {stats['average_response_time']:.2f}s")
    print()
    
    print("🎉 LLM wrapper test completed successfully!")
    return True


async def main():
    """Main test function"""
    
    print("🧪 Starting Simple LLM Wrapper Test")
    print("=" * 60)
    print()
    
    # Test LLM wrapper
    success = await test_basic_llm()
    print()
    
    # Summary
    print("📋 Test Summary:")
    print("=" * 60)
    print(f"LLM Wrapper Test: {'✅ PASSED' if success else '❌ FAILED'}")
    print()
    
    if success:
        print("🎉 Test passed! The FreeLLMWrapper is working correctly.")
        return 0
    else:
        print("⚠️  Test failed. Please check the implementation.")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
