#!/usr/bin/env python3
"""
Test WebSocket chat functionality
"""

import asyncio
import websockets
import json
import sys
import os

def get_project_root():
    """Get the project root directory"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up two levels to reach project root
    return os.path.dirname(os.path.dirname(current_dir))

# Add project root to Python path
project_root = get_project_root()
if project_root not in sys.path:
    sys.path.insert(0, project_root)

async def test_websocket_connection():
    """Test WebSocket connection to the server"""
    print("Testing WebSocket connection...")
    
    try:
        # Connect to WebSocket server
        uri = "ws://localhost:8000/ws/chat"
        async with websockets.connect(uri) as websocket:
            print("✓ WebSocket connection established successfully")
            
            # Test sending a message
            test_message = {
                "type": "public",
                "content": "Hello, AGENT!",
                "sender": "TestUser"
            }
            
            await websocket.send(json.dumps(test_message))
            print("✓ Public message sent successfully")
            
            # Wait for response
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                if response:
                    print("✓ Response received from server")
                else:
                    print("✗ Empty response received from server")
                    return False
            except asyncio.TimeoutError:
                print("✗ No response received within timeout period")
                return False
            
            # Test private message with AI query
            ai_query = {
                "type": "private",
                "content": "What is the capital of France?",
                "domain": "general",
                "use_internet": False
            }
            
            await websocket.send(json.dumps(ai_query))
            print("✓ Private AI query sent successfully")
            
            # Wait for AI response
            try:
                ai_response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                if ai_response:
                    print("✓ AI response received from server")
                else:
                    print("✗ Empty AI response received from server")
                    return False
            except asyncio.TimeoutError:
                print("✗ No AI response received within timeout period")
                return False
            
            return True
            
    except Exception as e:
        print(f"✗ WebSocket connection failed: {e}")
        print("Note: This test requires the AGENT server to be running on port 8000")
        return False

async def main():
    """Main test function"""
    print("Starting WebSocket chat tests...")
    print("Note: This test requires the AGENT server to be running on port 8000")
    
    # Test WebSocket connection
    connection_success = await test_websocket_connection()
    
    if connection_success:
        print("\n🎉 All WebSocket chat tests passed!")
        return 0
    else:
        print("\n❌ WebSocket chat tests failed!")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
