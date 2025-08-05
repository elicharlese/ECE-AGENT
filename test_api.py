#!/usr/bin/env python3
"""
Test script for the AGENT Arbitrage Trading API
"""

import requests
import json
import time

def test_api():
    base_url = "http://localhost:8000"
    
    print("🧪 Testing AGENT Arbitrage Trading API")
    print("=" * 40)
    
    # Test status endpoint
    try:
        print("📊 Testing /api/trading/status...")
        response = requests.get(f"{base_url}/api/trading/status")
        if response.status_code == 200:
            data = response.json()
            print("✅ Status endpoint working!")
            print(f"   Portfolio Value: ${data['portfolio']['total_value_usd']:,.2f}")
            print(f"   Is Running: {data['is_running']}")
            print(f"   Active Exchanges: {len([ex for ex, info in data['exchanges'].items() if info['connected']])}")
        else:
            print(f"❌ Status endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing status: {e}")
    
    # Test opportunities endpoint
    try:
        print("\n🔍 Testing /api/trading/opportunities...")
        response = requests.get(f"{base_url}/api/trading/opportunities")
        if response.status_code == 200:
            data = response.json()
            print("✅ Opportunities endpoint working!")
            print(f"   Found {len(data['opportunities'])} opportunities")
            for opp in data['opportunities']:
                print(f"   - {opp['type']}: {opp['profit_pct']:.2f}% profit")
        else:
            print(f"❌ Opportunities endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing opportunities: {e}")
    
    # Test start trading
    try:
        print("\n▶️  Testing /api/trading/start...")
        response = requests.post(f"{base_url}/api/trading/start")
        if response.status_code == 200:
            data = response.json()
            print("✅ Start trading endpoint working!")
            print(f"   Message: {data['message']}")
        else:
            print(f"❌ Start trading failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing start: {e}")
    
    # Test stop trading
    try:
        print("\n⏹️  Testing /api/trading/stop...")
        response = requests.post(f"{base_url}/api/trading/stop")
        if response.status_code == 200:
            data = response.json()
            print("✅ Stop trading endpoint working!")
            print(f"   Message: {data['message']}")
        else:
            print(f"❌ Stop trading failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing stop: {e}")
    
    print("\n🎉 API testing completed!")

if __name__ == "__main__":
    test_api()
