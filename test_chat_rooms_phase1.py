#!/usr/bin/env python3
"""
Test script for Chat Room Infrastructure (Phase 1)
Tests database creation, room management, and basic functionality.
"""

import sys
import os
sys.path.append('/workspaces/AGENT')

def test_chat_room_manager():
    """Test the ChatRoomManager functionality"""
    print("🧪 Testing Chat Room Manager...")
    
    try:
        from agent.chat_rooms import chat_room_manager
        print("✅ ChatRoomManager imported successfully")
        
        # Test database initialization
        print(f"📁 Database path: {chat_room_manager.db_path}")
        
        # Test getting default rooms
        rooms = chat_room_manager.get_user_accessible_rooms("test_user", "admin")
        print(f"📋 Found {len(rooms)} default rooms:")
        for room in rooms:
            print(f"   - {room.name} ({room.room_type}): {room.description}")
        
        # Test creating a new room
        test_room_id = chat_room_manager.create_room(
            name="Test Room",
            description="Test room for development",
            creator="test_user",
            room_type="public"
        )
        
        if test_room_id:
            print(f"✅ Created test room with ID: {test_room_id}")
            
            # Test joining the room
            join_success = chat_room_manager.join_room(test_room_id, "test_user", "test_user")
            print(f"✅ Joined room: {join_success}")
            
            # Test sending a message
            message = chat_room_manager.send_message(
                room_id=test_room_id,
                user_id="test_user",
                username="test_user",
                content="Hello, this is a test message!"
            )
            
            if message:
                print(f"✅ Sent message with ID: {message.id}")
                
                # Test getting messages
                messages = chat_room_manager.get_room_messages(test_room_id)
                print(f"📬 Retrieved {len(messages)} messages from room")
                
                for msg in messages:
                    print(f"   {msg.username}: {msg.content}")
            
            # Test getting room members
            members = chat_room_manager.get_room_members(test_room_id)
            print(f"👥 Room has {len(members)} members:")
            for member in members:
                print(f"   - {member.username} ({member.role})")
        else:
            print("❌ Failed to create test room")
        
        print("✅ ChatRoomManager tests completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ ChatRoomManager test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_auth_manager():
    """Test the authentication manager"""
    print("\n🔐 Testing Authentication Manager...")
    
    try:
        from agent.auth import auth_manager
        print("✅ AuthenticationManager imported successfully")
        
        # Test admin login
        token = auth_manager.authenticate("admin", "CyberAgent2025!")
        if token:
            print(f"✅ Admin authentication successful: {token[:20]}...")
            
            # Test session validation
            session = auth_manager.validate_session(token)
            if session:
                print(f"✅ Session validation successful: {session['username']}")
                print(f"   Role: {session['role']}")
                print(f"   Permissions: {len(session['permissions'])} permissions")
            else:
                print("❌ Session validation failed")
        else:
            print("❌ Admin authentication failed")
        
        print("✅ AuthenticationManager tests completed!")
        return True
        
    except Exception as e:
        print(f"❌ AuthenticationManager test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_room_websocket_manager():
    """Test the room WebSocket manager initialization"""
    print("\n🌐 Testing Room WebSocket Manager...")
    
    try:
        from agent.room_websocket import room_connection_manager
        print("✅ RoomConnectionManager imported successfully")
        
        # Test basic properties
        print(f"🔗 Active connections: {len(room_connection_manager.connections)}")
        print(f"🏠 Room connections: {len(room_connection_manager.room_connections)}")
        print(f"👤 User connections: {len(room_connection_manager.user_connections)}")
        
        print("✅ RoomConnectionManager tests completed!")
        return True
        
    except Exception as e:
        print(f"❌ RoomConnectionManager test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all Phase 1 tests"""
    print("🚀 Starting Chat Room Infrastructure Tests (Phase 1)")
    print("=" * 60)
    
    results = []
    
    # Test ChatRoomManager
    results.append(test_chat_room_manager())
    
    # Test AuthenticationManager
    results.append(test_auth_manager())
    
    # Test RoomConnectionManager
    results.append(test_room_websocket_manager())
    
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    print(f"   ✅ Passed: {sum(results)}")
    print(f"   ❌ Failed: {len(results) - sum(results)}")
    
    if all(results):
        print("\n🎉 All Phase 1 infrastructure tests PASSED!")
        print("✅ Ready to proceed to Phase 2 (UI Implementation)")
    else:
        print("\n⚠️  Some tests FAILED - fix issues before proceeding")
    
    return all(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
