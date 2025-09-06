#!/usr/bin/env node

/**
 * AGENT LLM Benchmark Test Suite
 * Comprehensive performance testing for all AGENT capabilities
 */

const API_BASE = 'http://localhost:3000/api';

// Test configurations
const BENCHMARK_CONFIG = {
  iterations: 10,
  timeout: 30000,
  concurrent: 3
};

// Test cases
const TEST_CASES = {
  basic_responses: [
    { message: "Hello, how are you?", mode: "smart_assistant" },
    { message: "What's the weather like?", mode: "smart_assistant" },
    { message: "Help me with a problem", mode: "smart_assistant" }
  ],
  
  agent_modes: [
    { message: "Write a Python function to sort a list", mode: "code_companion" },
    { message: "Create a creative story about space exploration", mode: "creative_writer" },
    { message: "Analyze this legal contract clause", mode: "legal_assistant" },
    { message: "Design a modern website layout", mode: "designer_agent" },
    { message: "Help me organize my daily tasks", mode: "smart_assistant" }
  ],
  
  media_generation: [
    { message: "Generate an image of a mountain landscape", mode: "designer_agent", mediaType: "image" },
    { message: "Create a video of ocean waves", mode: "creative_writer", mediaType: "video" },
    { message: "Generate audio of birds singing", mode: "creative_writer", mediaType: "audio" },
    { message: "Generate a picture of a futuristic city", mode: "designer_agent", mediaType: "image" },
    { message: "Create a video animation of a robot dancing", mode: "creative_writer", mediaType: "video" }
  ],
  
  complex_requests: [
    { message: "Generate an image of a sunset over mountains, then create a video showing the same scene with moving clouds", mode: "designer_agent", mediaType: "image" },
    { message: "Write a Python function to analyze data, then generate a visual representation of the results", mode: "code_companion" },
    { message: "Create a comprehensive legal document template and generate an audio explanation", mode: "legal_assistant" }
  ]
};

// Performance metrics
class BenchmarkMetrics {
  constructor() {
    this.results = {
      total_tests: 0,
      passed: 0,
      failed: 0,
      total_time: 0,
      average_response_time: 0,
      min_response_time: Infinity,
      max_response_time: 0,
      success_rate: 0,
      agent_mode_performance: {},
      media_generation_performance: {},
      error_details: []
    };
  }

  addResult(testName, success, responseTime, details = {}) {
    this.results.total_tests++;
    if (success) {
      this.results.passed++;
    } else {
      this.results.failed++;
      this.results.error_details.push({ test: testName, details });
    }

    this.results.total_time += responseTime;
    this.results.min_response_time = Math.min(this.results.min_response_time, responseTime);
    this.results.max_response_time = Math.max(this.results.max_response_time, responseTime);
  }

  calculateFinalMetrics() {
    this.results.average_response_time = this.results.total_time / this.results.total_tests;
    this.results.success_rate = (this.results.passed / this.results.total_tests) * 100;
  }

  printReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 AGENT LLM BENCHMARK RESULTS');
    console.log('='.repeat(80));
    
    console.log(`\n📊 Overall Performance:`);
    console.log(`   Total Tests: ${this.results.total_tests}`);
    console.log(`   ✅ Passed: ${this.results.passed}`);
    console.log(`   ❌ Failed: ${this.results.failed}`);
    console.log(`   📈 Success Rate: ${this.results.success_rate.toFixed(2)}%`);
    
    console.log(`\n⏱️  Response Time Metrics:`);
    console.log(`   Average: ${this.results.average_response_time.toFixed(2)}ms`);
    console.log(`   Minimum: ${this.results.min_response_time}ms`);
    console.log(`   Maximum: ${this.results.max_response_time}ms`);
    console.log(`   Total Time: ${(this.results.total_time / 1000).toFixed(2)}s`);
    
    if (this.results.error_details.length > 0) {
      console.log(`\n❌ Error Details:`);
      this.results.error_details.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.test}: ${JSON.stringify(error.details)}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
  }
}

// Test runner
class BenchmarkRunner {
  constructor() {
    this.metrics = new BenchmarkMetrics();
  }

  async runSingleTest(testCase, testName) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_BASE}/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testCase.message,
          conversationId: `benchmark-${Date.now()}`,
          agentMode: testCase.mode,
          enableReasoning: true,
          collectFeedback: true,
          mediaType: testCase.mediaType
        })
      });

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        
        // Validate response structure
        const isValid = this.validateResponse(data, testCase);
        
        this.metrics.addResult(testName, isValid, responseTime, {
          status: response.status,
          response: data,
          expected: testCase
        });
        
        return { success: isValid, data, responseTime };
      } else {
        this.metrics.addResult(testName, false, responseTime, {
          status: response.status,
          error: 'HTTP Error'
        });
        return { success: false, error: `HTTP ${response.status}`, responseTime };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.metrics.addResult(testName, false, responseTime, {
        error: error.message
      });
      return { success: false, error: error.message, responseTime };
    }
  }

  validateResponse(data, testCase) {
    // Basic structure validation
    if (!data.content || !data.agentMode || !data.confidence) {
      return false;
    }

    // Agent mode validation
    if (data.agentMode !== testCase.mode) {
      return false;
    }

    // Media generation validation
    if (testCase.mediaType && !data.mediaGenerated) {
      return false;
    }

    if (testCase.mediaType && data.mediaGenerated) {
      if (data.mediaGenerated.type !== testCase.mediaType) {
        return false;
      }
      if (!data.mediaGenerated.url) {
        return false;
      }
    }

    // Confidence validation
    if (data.confidence < 0 || data.confidence > 1) {
      return false;
    }

    return true;
  }

  async runTestSuite(testSuite, suiteName) {
    console.log(`\n🧪 Running ${suiteName}...`);
    
    for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
      console.log(`   Iteration ${i + 1}/${BENCHMARK_CONFIG.iterations}`);
      
      for (const [index, testCase] of testSuite.entries()) {
        const testName = `${suiteName}_${index + 1}_iter_${i + 1}`;
        const result = await this.runSingleTest(testCase, testName);
        
        if (result.success) {
          console.log(`     ✅ ${testCase.message.substring(0, 50)}... (${result.responseTime}ms)`);
        } else {
          console.log(`     ❌ ${testCase.message.substring(0, 50)}... (${result.responseTime}ms) - ${result.error}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  async runConcurrentTest(testSuite, suiteName) {
    console.log(`\n🚀 Running ${suiteName} (Concurrent)...`);
    
    for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
      console.log(`   Concurrent batch ${i + 1}/${BENCHMARK_CONFIG.iterations}`);
      
      const promises = testSuite.slice(0, BENCHMARK_CONFIG.concurrent).map(async (testCase, index) => {
        const testName = `${suiteName}_concurrent_${index + 1}_iter_${i + 1}`;
        return await this.runSingleTest(testCase, testName);
      });
      
      const results = await Promise.all(promises);
      
      results.forEach((result, index) => {
        const testCase = testSuite[index];
        if (result.success) {
          console.log(`     ✅ ${testCase.message.substring(0, 50)}... (${result.responseTime}ms)`);
        } else {
          console.log(`     ❌ ${testCase.message.substring(0, 50)}... (${result.responseTime}ms) - ${result.error}`);
        }
      });
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  async runAllBenchmarks() {
    console.log('🎯 Starting AGENT LLM Benchmark Suite...');
    console.log(`📋 Configuration: ${BENCHMARK_CONFIG.iterations} iterations, ${BENCHMARK_CONFIG.concurrent} concurrent, ${BENCHMARK_CONFIG.timeout}ms timeout`);
    
    const startTime = Date.now();
    
    try {
      // Test basic responses
      await this.runTestSuite(TEST_CASES.basic_responses, 'Basic Responses');
      
      // Test agent modes
      await this.runTestSuite(TEST_CASES.agent_modes, 'Agent Modes');
      
      // Test media generation
      await this.runTestSuite(TEST_CASES.media_generation, 'Media Generation');
      
      // Test complex requests
      await this.runTestSuite(TEST_CASES.complex_requests, 'Complex Requests');
      
      // Test concurrent performance
      await this.runConcurrentTest(TEST_CASES.basic_responses, 'Concurrent Basic');
      await this.runConcurrentTest(TEST_CASES.media_generation, 'Concurrent Media');
      
    } catch (error) {
      console.error('❌ Benchmark suite failed:', error);
    }
    
    const totalTime = Date.now() - startTime;
    this.metrics.calculateFinalMetrics();
    
    console.log(`\n⏱️  Total benchmark time: ${(totalTime / 1000).toFixed(2)}s`);
    this.metrics.printReport();
    
    // Performance recommendations
    this.printRecommendations();
  }

  printRecommendations() {
    console.log('\n💡 Performance Recommendations:');
    
    if (this.metrics.results.average_response_time > 5000) {
      console.log('   ⚠️  High response times detected. Consider optimizing the backend.');
    }
    
    if (this.metrics.results.success_rate < 95) {
      console.log('   ⚠️  Low success rate. Check error logs and improve error handling.');
    }
    
    if (this.metrics.results.max_response_time > 10000) {
      console.log('   ⚠️  Some requests are very slow. Consider implementing timeouts.');
    }
    
    if (this.metrics.results.success_rate >= 95 && this.metrics.results.average_response_time < 2000) {
      console.log('   ✅ Excellent performance! System is running optimally.');
    }
    
    console.log('\n🎉 Benchmark completed!');
  }
}

// Run the benchmark
async function main() {
  const runner = new BenchmarkRunner();
  await runner.runAllBenchmarks();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Benchmark interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Start the benchmark
main().catch(console.error);