#!/usr/bin/env python3
"""
Test script for Enhanced AGENT with Self-Training Features
Demonstrates the new self-learning capabilities implemented in PATCH 2
"""

import asyncio
import aiohttp
import json
import time

async def test_enhanced_agent():
    """Test the enhanced AGENT system with self-training features"""
    base_url = "http://localhost:8000"
    
    async with aiohttp.ClientSession() as session:
        
        print("🤖 Testing Enhanced AGENT System with Self-Training")
        print("=" * 60)
        
        # Test 1: Basic query
        print("\n1. Testing basic query...")
        query_data = {
            "query": "What is machine learning?",
            "domain": "general",
            "app": "general"
        }
        
        async with session.post(f"{base_url}/query", json=query_data) as resp:
            if resp.status == 200:
                result = await resp.json()
                print("✅ Query successful")
                print(f"📝 Response preview: {result['result']['answer'][:100]}...")
            else:
                print(f"❌ Query failed: {resp.status}")
                return
        
        # Test 2: Submit feedback for self-training
        print("\n2. Testing feedback submission...")
        feedback_data = {
            "query": query_data["query"],
            "response": result["result"]["answer"],
            "feedback": {
                "rating": "helpful",
                "text": "Great explanation, very clear and informative",
                "timestamp": "2024-01-01T12:00:00Z",
                "app": "general"
            }
        }
        
        async with session.post(f"{base_url}/api/feedback", json=feedback_data) as resp:
            if resp.status == 200:
                result = await resp.json()
                print("✅ Feedback submitted successfully")
                print(f"📊 Processed: {result.get('feedback_processed', False)}")
            else:
                print(f"❌ Feedback submission failed: {resp.status}")
        
        # Test 3: Analyze patterns
        print("\n3. Testing pattern analysis...")
        async with session.get(f"{base_url}/api/self-training/patterns") as resp:
            if resp.status == 200:
                patterns = await resp.json()
                print("✅ Pattern analysis successful")
                print(f"📈 Patterns detected: {len(patterns.get('patterns', []))}")
                if 'bias_analysis' in patterns:
                    print(f"🔍 Bias analysis available: {len(patterns['bias_analysis'])} metrics")
            else:
                print(f"❌ Pattern analysis failed: {resp.status}")
        
        # Test 4: Generate bias report
        print("\n4. Testing bias report generation...")
        async with session.get(f"{base_url}/api/self-training/bias-report") as resp:
            if resp.status == 200:
                bias_report = await resp.json()
                print("✅ Bias report generated successfully")
                if 'bias_metrics' in bias_report:
                    print(f"📊 Bias metrics: {len(bias_report['bias_metrics'])} categories")
                if 'recommendations' in bias_report:
                    print(f"💡 Recommendations: {len(bias_report['recommendations'])}")
            else:
                print(f"❌ Bias report generation failed: {resp.status}")
        
        # Test 5: Trigger self-improvement
        print("\n5. Testing self-improvement trigger...")
        improvement_data = {"force_improvement": False}
        async with session.post(f"{base_url}/api/self-training/improve", json=improvement_data) as resp:
            if resp.status == 200:
                improvement = await resp.json()
                print("✅ Self-improvement triggered successfully")
                print(f"🚀 Improvement status: {improvement.get('improvement_triggered', False)}")
                if 'adaptations' in improvement:
                    print(f"🔧 Adaptations made: {len(improvement['adaptations'])}")
            else:
                print(f"❌ Self-improvement failed: {resp.status}")
        
        # Test 6: Test different app modes
        print("\n6. Testing different app modes...")
        modes = ["developer", "trader", "researcher", "lawyer"]
        for mode in modes:
            mode_query = {
                "query": f"How can you help with {mode} tasks?",
                "domain": mode,
                "app": mode
            }
            
            async with session.post(f"{base_url}/query", json=mode_query) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    print(f"✅ {mode.capitalize()} mode working")
                else:
                    print(f"❌ {mode.capitalize()} mode failed")
        
        print("\n" + "=" * 60)
        print("🎉 Enhanced AGENT Testing Complete!")
        print("\n📋 Summary of implemented features:")
        print("   • Self-training system with bias detection")
        print("   • Feedback processing and pattern analysis")
        print("   • Multiple app modes (10 specialized domains)")
        print("   • Enhanced iMessage-style UI with animations")
        print("   • Real-time status indicators")
        print("   • Bias reporting and self-improvement")
        print("\n🔗 Open http://localhost:8000 to interact with the interface!")

if __name__ == "__main__":
    asyncio.run(test_enhanced_agent())
