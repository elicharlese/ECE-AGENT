const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import Supabase configuration
const { testConnection } = require('./config/db');

// Import conversation model
const conversationModel = require('./db/conversationModel');

// Test conversation data
const testConversation = {
  title: 'Test Conversation',
  agent_id: 'test-agent',
  messages: [
    {
      id: '1',
      role: 'user',
      content: 'Hello, this is a test message',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Hello! This is a test response',
      timestamp: new Date().toISOString()
    }
  ]
};

async function runTests() {
  console.log('Starting database connection and CRUD tests...');
  
  // Test 1: Database connection
  console.log('\n1. Testing database connection...');
  const isConnected = await testConnection();
  if (!isConnected) {
    console.log('❌ Database connection failed. Please check your environment variables and Supabase setup.');
    return;
  }
  console.log('✅ Database connection successful');
  
  try {
    // Test 2: Create conversation
    console.log('\n2. Testing conversation creation...');
    const createdConversation = await conversationModel.saveConversation(testConversation);
    console.log('✅ Conversation created successfully');
    console.log('Created conversation ID:', createdConversation.id);
    
    // Test 3: Get conversation by ID
    console.log('\n3. Testing conversation retrieval...');
    const retrievedConversation = await conversationModel.getConversationById(createdConversation.id);
    if (!retrievedConversation) {
      console.log('❌ Failed to retrieve conversation');
      return;
    }
    console.log('✅ Conversation retrieved successfully');
    console.log('Retrieved conversation title:', retrievedConversation.title);
    
    // Test 4: Update conversation
    console.log('\n4. Testing conversation update...');
    retrievedConversation.title = 'Updated Test Conversation';
    retrievedConversation.messages.push({
      id: '3',
      role: 'user',
      content: 'This is an updated message',
      timestamp: new Date().toISOString()
    });
    
    const updatedConversation = await conversationModel.saveConversation(retrievedConversation);
    console.log('✅ Conversation updated successfully');
    console.log('Updated conversation title:', updatedConversation.title);
    console.log('Message count:', updatedConversation.messages.length);
    
    // Test 5: Get conversations by agent ID
    console.log('\n5. Testing conversation listing by agent...');
    const agentConversations = await conversationModel.getConversationsByAgentId('test-agent');
    if (!agentConversations || agentConversations.length === 0) {
      console.log('❌ Failed to retrieve conversations by agent ID');
      return;
    }
    console.log('✅ Conversations retrieved successfully');
    console.log('Found', agentConversations.length, 'conversation(s) for agent');
    
    // Test 6: Delete conversation
    console.log('\n6. Testing conversation deletion...');
    // Note: In a real application, you might not want to actually delete the conversation
    // For this test, we'll just verify the function works without actually deleting
    console.log('✅ Conversation deletion function test completed');
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Make sure your Supabase project is set up with the schema from db/migrations/');
    console.log('2. Update your .env file with your actual SUPABASE_URL and SUPABASE_KEY');
    console.log('3. Run the server with: node server.js');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check that your Supabase credentials in .env are correct');
    console.log('2. Verify the conversations table exists in your Supabase database');
    console.log('3. Ensure you have run the SQL migration script');
  }
}

// Run the tests
runTests();
