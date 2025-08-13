const WebSocket = require('ws');

// Connect to the WebSocket server
const ws = new WebSocket('ws://localhost:3001');

ws.on('open', function open() {
  console.log('Connected to WebSocket server');
  
  // Send authentication message (this would normally contain a real JWT token)
  ws.send(JSON.stringify({
    type: 'authenticate',
    token: 'test-token'
  }));
});

ws.on('message', function incoming(data) {
  const message = JSON.parse(data);
  console.log('Received:', message);
  
  // Handle different message types
  switch (message.type) {
    case 'authenticated':
      console.log('Authentication successful');
      
      // Join a conversation (this would normally use a real conversation ID)
      ws.send(JSON.stringify({
        type: 'join_conversation',
        conversationId: 'test-conversation-id'
      }));
      break;
      
    case 'conversation_joined':
      console.log('Joined conversation:', message.conversationId);
      
      // Send a test message
      ws.send(JSON.stringify({
        type: 'send_message',
        content: 'Hello, WebSocket!'
      }));
      break;
      
    case 'message':
      console.log('New message received:', message.message);
      break;
      
    case 'error':
      console.error('WebSocket error:', message.message);
      break;
      
    default:
      console.log('Unknown message type:', message.type);
  }
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('Disconnected from WebSocket server');
});
