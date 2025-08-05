#!/usr/bin/env python3
"""
Test script for Chat Room API functionality
"""

import sys
sys.path.append('.')

from agent.chat_rooms import ChatRoomManager

def test_chat_functionality():
    """Test basic chat room functionality"""
    print("Testing Chat Room API functionality...")
    
    # Initialize chat manager
    chat_manager = ChatRoomManager()
    
    # Test getting rooms for a regular user
    print("\n1. Testing get_user_accessible_rooms for regular user:")
    rooms = chat_manager.get_user_accessible_rooms("test_user", "member")
    print(f"   Found {len(rooms)} accessible rooms:")
    for room in rooms:
        print(f"   - {room.name} ({room.room_type}) - {room.description}")
    
    # Test getting rooms for admin
    print("\n2. Testing get_user_accessible_rooms for admin:")
    admin_rooms = chat_manager.get_user_accessible_rooms("admin", "admin")
    print(f"   Admin can access {len(admin_rooms)} rooms:")
    for room in admin_rooms:
        print(f"   - {room.name} ({room.room_type}) - {room.description}")
    
    # Test getting a specific room
    print("\n3. Testing get_room_by_name:")
    general_room = chat_manager.get_room_by_name("General")
    if general_room:
        print(f"   Found General room: {general_room.name} - {general_room.description}")
    else:
        print("   General room not found")
    
    # Test creating a new room (should fail if exists)
    print("\n4. Testing create_room:")
    room_id = chat_manager.create_room("Test API Room", "A room for testing API", "public", "test_user")
    if room_id:
        print(f"   Created new room with ID: {room_id}")
    else:
        print("   Room creation failed (may already exist)")
    
    # Test joining a room
    print("\n5. Testing join_room:")
    success = chat_manager.join_room(1, "test_user", "TestUser")  # Join General room
    if success:
        print("   Successfully joined General room")
    else:
        print("   Failed to join General room (may already be member)")
    
    # Test getting room messages
    print("\n6. Testing get_room_messages:")
    messages = chat_manager.get_room_messages(1, limit=5)  # Get recent messages from General
    print(f"   Found {len(messages)} recent messages in General room")
    
    print("\n✅ Chat Room API functionality test completed!")

if __name__ == "__main__":
    test_chat_functionality()
