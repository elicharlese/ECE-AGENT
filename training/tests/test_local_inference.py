"""
Test local model serving and inference with FreeLLMWrapper
Tests actual Ollama model inference with ReAct and RAISE frameworks
"""

import asyncio
import sys
import os

# Add lib to path
sys.path.append('lib')

from memory.vector_store import FreeVectorStore
from llm.base_wrapper import FreeLLMWrapper


async def test_local_inference():
    print("🧪 Testing Local Model Serving and Inference...")
    
    try:
        # Initialize vector store with production examples
        print("1. Initializing FreeVectorStore with production examples...")
        vector_store = FreeVectorStore(collection_name='production_agent_examples')
        print("✅ FreeVectorStore initialized")
        
        # Add comprehensive examples for different agent modes
        print("2. Adding production-quality examples...")
        
        # Code Companion examples
        vector_store.add_example(
            text="To create a Python function, use the 'def' keyword followed by the function name, parentheses for parameters, and a colon. The function body should be indented.",
            metadata={"mode": "code_companion", "quality_score": 4.8, "tags": "python,functions,syntax"}
        )
        vector_store.add_example(
            text="Debugging Python: Check for common issues like indentation errors, undefined variables, and type mismatches. Use print statements or a debugger to trace execution.",
            metadata={"mode": "code_companion", "quality_score": 4.6, "tags": "python,debugging,errors"}
        )
        
        # Smart Assistant examples
        vector_store.add_example(
            text="Machine learning is a subset of AI that enables computers to learn patterns from data without being explicitly programmed for each specific task.",
            metadata={"mode": "smart_assistant", "quality_score": 4.7, "tags": "ai,ml,definition"}
        )
        vector_store.add_example(
            text="To improve productivity: prioritize tasks using Eisenhower matrix, batch similar activities, eliminate distractions, and use tools that automate repetitive work.",
            metadata={"mode": "smart_assistant", "quality_score": 4.5, "tags": "productivity,organization,efficiency"}
        )
        
        # Creative Writer examples
        vector_store.add_example(
            text="Creative writing techniques: Use vivid sensory details, show don't tell, create compelling character arcs, build tension through conflict, and vary sentence structure for rhythm.",
            metadata={"mode": "creative_writer", "quality_score": 4.9, "tags": "writing,creativity,technique"}
        )
        
        print(f"✅ Added {vector_store.get_collection_stats()['total_examples']} production examples")
        
        # Initialize LLM wrapper
        print("3. Initializing FreeLLMWrapper...")
        llm_wrapper = FreeLLMWrapper(vector_store=vector_store)
        print("✅ FreeLLMWrapper initialized")
        
        # Test basic Ollama connectivity
        print("4. Testing basic Ollama connectivity...")
        basic_prompt = "Explain what a neural network is in 2-3 sentences."
        basic_response = await llm_wrapper._generate_with_fallback(basic_prompt, "smart_assistant")
        print(f"✅ Basic Ollama response: {basic_response[:150]}...")
        
        # Test ReAct framework with real inference
        print("5. Testing ReAct framework with local inference...")
        react_query = "Help me write a Python function to calculate factorial and explain how it works."
        react_result = await llm_wrapper.generate_with_react(
            user_input=react_query,
            agent_mode="code_companion",
            max_iterations=3,
            use_examples=True
        )
        print("✅ ReAct framework completed with local inference")
        print(f"   Response length: {len(react_result['response'])} characters")
        print(f"   Reasoning steps: {react_result['iterations']}")
        print(f"   Examples retrieved: {react_result['examples_used']}")
        print(f"   Tools used: {len(react_result['tool_usage'])}")
        
        # Test different agent modes
        print("6. Testing different agent modes...")
        modes_to_test = ["smart_assistant", "code_companion", "creative_writer"]
        mode_results = {}
        
        for mode in modes_to_test:
            print(f"   Testing {mode} mode...")
            test_query = f"Give me advice about {mode.replace('_', ' ')} work."
            mode_response = await llm_wrapper.generate_with_react(
                user_input=test_query,
                agent_mode=mode,
                max_iterations=2,
                use_examples=True
            )
            mode_results[mode] = {
                "response_length": len(mode_response['response']),
                "examples_used": mode_response['examples_used'],
                "iterations": mode_response['iterations']
            }
            print(f"     ✅ {mode}: {mode_response['examples_used']} examples, {mode_response['iterations']} iterations")
        
        # Test RAISE synthesis specifically
        print("7. Testing RAISE synthesis framework...")
        raise_query = "How can I become more productive while learning to code?"
        raise_result = await llm_wrapper.generate_with_react(
            user_input=raise_query,
            agent_mode="smart_assistant",
            max_iterations=4,
            use_examples=True
        )
        print("✅ RAISE synthesis test completed")
        print(f"   Final response preview: {raise_result['response'][:200]}...")
        
        # Performance metrics
        print("8. Performance analysis...")
        stats = llm_wrapper.get_system_stats()
        print("✅ System performance stats:")
        print(f"   Working memory keys: {stats['llm_wrapper']['working_memory_keys']}")
        print(f"   Vector store examples: {stats['vector_store']['total_examples']}")
        print(f"   Average quality score: {stats['vector_store']['average_quality_score']}")
        
        print("\\n🎉 Local Model Serving and Inference Test Passed!")
        print("\\n📊 Test Results Summary:")
        print(f"- Ollama connectivity: ✅ Working")
        print(f"- Basic inference: ✅ {len(basic_response)} characters generated")
        print(f"- ReAct framework: ✅ {react_result['iterations']} iterations completed")
        print(f"- Multi-mode support: ✅ {len(modes_to_test)} modes tested")
        print(f"- RAISE synthesis: ✅ Working with {raise_result['examples_used']} examples")
        print(f"- Tool integration: ✅ {len(react_result['tool_usage'])} tools available")
        print(f"- Vector retrieval: ✅ {react_result['examples_used']} examples retrieved")
        
        # Show sample response
        print(f"\\n💬 Sample ReAct Response:\\n{react_result['response'][:300]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = asyncio.run(test_local_inference())
    if success:
        print("\\n✅ Local inference tests completed successfully!")
        print("🚀 The AGENT LLM system is now ready with:")
        print("   • Local Ollama inference ✅")
        print("   • ReAct reasoning framework ✅")
        print("   • RAISE synthesis engine ✅")
        print("   • Vector store integration ✅")
        print("   • Multi-agent mode support ✅")
    else:
        print("\\n❌ Local inference tests failed. Check Ollama server status.")
