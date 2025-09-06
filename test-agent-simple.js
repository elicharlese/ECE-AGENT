#!/usr/bin/env node

/**
 * Simple AGENT LLM Test Script
 * Tests the AGENT system without requiring Python backend
 */

const API_BASE = 'http://localhost:3000/api';

async function testAgentAPI() {
  console.log('🧪 Testing AGENT LLM API...\n');

  try {
    // Test 1: Basic message processing
    console.log('⏳ Testing basic message processing...');
    const response = await fetch(`${API_BASE}/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, test the AGENT system',
        conversationId: 'test-123',
        agentMode: 'smart_assistant',
        enableReasoning: true,
        collectFeedback: true
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Basic message processing successful!');
      console.log('📝 Response:', data.content?.substring(0, 100) + '...');
      console.log('🎯 Agent Mode:', data.agentMode);
      console.log('📊 Confidence:', Math.round((data.confidence || 0) * 100) + '%');
      console.log('⏱️  Processing Time:', data.metadata?.processingTime + 'ms');
      console.log('🔍 Examples Used:', data.examplesRetrieved);
      console.log('🧠 Reasoning Steps:', data.reasoningTrace?.length || 0);
    } else {
      console.log('❌ Basic message processing failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.log('❌ Basic message processing error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  try {
    // Test 2: Different agent modes
    console.log('⏳ Testing different agent modes...');
    const modes = ['smart_assistant', 'code_companion', 'creative_writer', 'legal_assistant', 'designer_agent'];
    
    for (const mode of modes) {
      try {
        const response = await fetch(`${API_BASE}/agents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Test message for ${mode}`,
            conversationId: `test-${mode}`,
            agentMode: mode,
            enableReasoning: true,
            collectFeedback: true
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${mode}: ${data.content?.substring(0, 50)}...`);
        } else {
          console.log(`❌ ${mode}: Failed (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ ${mode}: Error - ${error.message}`);
      }
    }
  } catch (error) {
    console.log('❌ Agent modes test error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  try {
    // Test 3: Health check
    console.log('⏳ Testing health check...');
    const response = await fetch(`${API_BASE}/agents?action=health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health check successful!');
      console.log('🏥 Status:', data.status);
      console.log('📊 Analytics:', data.analytics);
    } else {
      console.log('❌ Health check failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  try {
    // Test 4: Media generation requests
    console.log('⏳ Testing media generation capabilities...');
    
    const mediaTests = [
      {
        type: 'image',
        message: 'Generate an image of a futuristic city skyline at sunset',
        agentMode: 'designer_agent'
      },
      {
        type: 'video',
        message: 'Create a short video concept about AI learning to paint',
        agentMode: 'creative_writer'
      },
      {
        type: 'audio',
        message: 'Generate audio narration for a nature documentary',
        agentMode: 'creative_writer'
      }
    ];

    for (const test of mediaTests) {
      try {
        const response = await fetch(`${API_BASE}/agents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: test.message,
            conversationId: `test-${test.type}`,
            agentMode: test.agentMode,
            enableReasoning: true,
            collectFeedback: true,
            mediaType: test.type
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${test.type.toUpperCase()} generation: ${data.content?.substring(0, 50)}...`);
          
          // Check if response contains media generation info
          if (data.mediaGenerated) {
            console.log(`   🎨 Media generated: ${data.mediaGenerated.type}`);
            console.log(`   📁 Media URL: ${data.mediaGenerated.url}`);
          }
        } else {
          console.log(`❌ ${test.type.toUpperCase()} generation: Failed (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ ${test.type.toUpperCase()} generation: Error - ${error.message}`);
      }
    }
  } catch (error) {
    console.log('❌ Media generation test error:', error.message);
  }

  console.log('\n🎉 AGENT LLM testing completed!');
}

// Run the test
testAgentAPI().catch(console.error);