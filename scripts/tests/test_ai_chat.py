#!/usr/bin/env python3
"""
Test AI chat functionality
"""

import asyncio
import sys
import os
import json

# Add project root to Python path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Try to import the main app and agent components
agent_import_error = None
try:
    from main import app
    print("✓ Successfully imported app")
    
    # Try to access agent_core
    try:
        from main import agent_core
        print("✓ Successfully imported agent_core")
        agent_available = True
    except ImportError as e:
        print(f"✗ Could not import agent_core: {e}")
        agent_import_error = f"Could not import agent_core: {e}"
        agent_available = False
        
except ImportError as e:
    print(f"✗ Failed to import app: {e}")
    agent_import_error = f"Failed to import app: {e}"
    agent_available = False

async def test_ai_query_processing():
    """Test AI query processing for different domains"""
    if not agent_available:
        print("✗ AI query processing test failed - agent not available")
        print(f"  Error: {agent_import_error}")
        return False
    
    test_queries = [
        {
            "query": "What is Python?",
            "domain": "developer",
            "use_internet": False
        },
        {
            "query": "What are the latest stock market trends?",
            "domain": "trader",
            "use_internet": True
        },
        {
            "query": "What are the key elements of a contract?",
            "domain": "lawyer",
            "use_internet": False
        }
    ]
    
    print("Testing AI query processing...")
    
    for i, test_query in enumerate(test_queries, 1):
        try:
            print(f"  Testing query {i}: {test_query['query'][:30]}...")
            
            # Check if agent_core has the process_query method
            if hasattr(agent_core, 'process_query'):
                response = await agent_core.process_query(
                    test_query["query"],
                    test_query["domain"],
                    test_query["use_internet"]
                )
                
                # Extract answer from response dictionary
                answer = response.get("answer", "") if isinstance(response, dict) else response
                
                if answer:
                    print(f"  ✓ Query {i} processed successfully")
                else:
                    print(f"  ✗ Query {i} returned empty response")
                    return False
            else:
                print(f"  ✗ agent_core does not have process_query method")
                return False
                
        except Exception as e:
            print(f"  ✗ Query {i} failed: {e}")
            return False
    
    print("✓ AI query processing test completed successfully")
    return True

async def test_ai_response_quality():
    """Test AI response quality and relevance"""
    if not agent_available:
        print("✗ AI response quality test failed - agent not available")
        print(f"  Error: {agent_import_error}")
        return False
    
    test_query = {
        "query": "Explain the concept of inheritance in object-oriented programming",
        "domain": "developer",
        "use_internet": False
    }
    
    try:
        print("Testing AI response quality...")
        
        # Check if agent_core has the process_query method
        if hasattr(agent_core, 'process_query'):
            response = await agent_core.process_query(
                test_query["query"],
                test_query["domain"],
                test_query["use_internet"]
            )
            
            # Extract answer from response dictionary
            answer = response.get("answer", "") if isinstance(response, dict) else response
            
            # Check if response contains relevant keywords
            if answer and isinstance(answer, str):
                keywords = ["inheritance", "class", "object", "parent", "child"]
                found_keywords = [kw for kw in keywords if kw.lower() in answer.lower()]
                
                if len(found_keywords) >= 2:
                    print(f"✓ AI response contains relevant keywords: {found_keywords}")
                    print("✓ AI response quality test completed successfully")
                    return True
                else:
                    print("✗ AI response lacks relevant content")
                    print(f"  Response: {answer[:100]}...")
                    return False
            else:
                print("✗ AI returned empty or non-string response")
                return False
        else:
            print("✗ agent_core does not have process_query method")
            return False
            
    except Exception as e:
        print(f"✗ AI response quality test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("Starting AI chat tests...")
    
    # Test AI query processing
    query_success = await test_ai_query_processing()
    
    # Test AI response quality
    quality_success = await test_ai_response_quality()
    
    if query_success and quality_success:
        print("\n🎉 All AI chat tests passed!")
        return 0
    else:
        print("\n❌ Some AI chat tests failed!")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
