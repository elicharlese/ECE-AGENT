#!/usr/bin/env node

/**
 * AGENT LLM Test Script
 * Tests the end-to-end functionality of the AGENT LLM system
 */

// Using built-in fetch (Node.js 18+);

const API_BASE = 'http://localhost:3000/api';
const PYTHON_BASE = 'http://localhost:8001';

async function testAgentLLM() {
  console.log('🧪 Testing AGENT LLM System...\n');
  
  const tests = [
    testPythonBackend,
    testNextJSAPI,
    testAgentModes,
    testHealthCheck,
    testMessageProcessing
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`⏳ Running ${test.name}...`);
      await test();
      console.log(`✅ ${test.name} passed\n`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name} failed: ${error.message}\n`);
      failed++;
    }
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! AGENT LLM system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

async function testPythonBackend() {
  const response = await fetch(`${PYTHON_BASE}/health`);
  if (!response.ok) {
    throw new Error(`Python backend not responding: ${response.status}`);
  }
  
  const health = await response.json();
  if (health.status !== 'healthy' && health.status !== 'degraded') {
    throw new Error(`Python backend unhealthy: ${health.status}`);
  }
}

async function testNextJSAPI() {
  const response = await fetch(`${API_BASE}/agents?action=health`);
  if (!response.ok) {
    throw new Error(`Next.js API not responding: ${response.status}`);
  }
  
  const health = await response.json();
  if (!health.components) {
    throw new Error('Next.js API health check missing components');
  }
}

async function testAgentModes() {
  const response = await fetch(`${API_BASE}/agents?action=modes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch agent modes: ${response.status}`);
  }
  
  const data = await response.json();
  if (!data.modes || Object.keys(data.modes).length === 0) {
    throw new Error('No agent modes returned');
  }
  
  const expectedModes = ['smart_assistant', 'code_companion', 'creative_writer', 'legal_assistant', 'designer_agent'];
  for (const mode of expectedModes) {
    if (!data.modes[mode]) {
      throw new Error(`Missing agent mode: ${mode}`);
    }
  }
}

async function testHealthCheck() {
  const response = await fetch(`${API_BASE}/agents?action=health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  
  const health = await response.json();
  if (!health.timestamp || !health.components) {
    throw new Error('Health check response incomplete');
  }
}

async function testMessageProcessing() {
  const testMessage = {
    message: "Hello, can you help me with a coding question?",
    conversationId: `test_${Date.now()}`,
    agentMode: "code_companion"
  };
  
  const response = await fetch(`${API_BASE}/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testMessage)
  });
  
  if (!response.ok) {
    throw new Error(`Message processing failed: ${response.status}`);
  }
  
  const result = await response.json();
  if (!result.content || !result.agentMode) {
    throw new Error('Message processing response incomplete');
  }
  
  if (result.agentMode !== 'code_companion') {
    throw new Error(`Wrong agent mode: expected code_companion, got ${result.agentMode}`);
  }
  
  console.log(`   📝 Test message: "${testMessage.message}"`);
  console.log(`   🤖 Agent response: "${result.content.substring(0, 100)}..."`);
  console.log(`   🎯 Agent mode: ${result.agentMode}`);
  console.log(`   ⏱️  Processing time: ${result.metadata?.processingTime || 'N/A'}ms`);
}

async function testAnalytics() {
  const response = await fetch(`${API_BASE}/agents?action=analytics`);
  if (!response.ok) {
    throw new Error(`Analytics failed: ${response.status}`);
  }
  
  const analytics = await response.json();
  if (typeof analytics.total_interactions !== 'number') {
    throw new Error('Analytics response incomplete');
  }
}

// Run tests
if (require.main === module) {
  testAgentLLM().catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { testAgentLLM };