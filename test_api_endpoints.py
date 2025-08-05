#!/usr/bin/env python3
"""
Test script for Chat Room API endpoints
"""

import requests
import json

def test_api_endpoints():
    """Test the chat room API endpoints"""
    base_url = "http://localhost:8000"
    
    print("Testing Chat Room API endpoints...")
    
    # Test 1: Get rooms
    print("\n1. Testing GET /api/rooms:")
    try:
        response = requests.get(f"{base_url}/api/rooms")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            rooms = response.json()
            print(f"   Found {len(rooms)} rooms:")
            for room in rooms[:3]:  # Show first 3 rooms
                print(f"   - {room['name']} ({room['room_type']}) - {room['description']}")
        else:
            print(f"   Error: {response.text}")
    except requests.exceptions.ConnectionError:
        print("   Error: Could not connect to server")
        return False
    except Exception as e:
        print(f"   Error: {e}")
        return False
    
    # Test 2: Get room messages
    print("\n2. Testing GET /api/rooms/1/messages:")
    try:
        response = requests.get(f"{base_url}/api/rooms/1/messages?limit=5")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            messages = response.json()
            print(f"   Found {len(messages)} messages")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Health check
    print("\n3. Testing GET /health:")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            health = response.json()
            print(f"   Service: {health.get('service', 'Unknown')}")
            print(f"   Status: {health.get('status', 'Unknown')}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n✅ API endpoint testing completed!")
    return True

if __name__ == "__main__":
    test_api_endpoints()
