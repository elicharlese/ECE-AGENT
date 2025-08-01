#!/bin/bash
set -e

# Test Python-Rust integration for AGENT system
echo "🐍🦀 Testing AGENT Python-Rust Integration..."

# Navigate to project root
cd "$(dirname "$0")/.."

# Set Python path
export PYTHONPATH="/workspaces/AGENT:/workspaces/AGENT/lib:$PYTHONPATH"

# Test basic integration
echo "📋 Running basic integration tests..."
python3 -c "
import sys
sys.path.insert(0, '/workspaces/AGENT')
sys.path.insert(0, '/workspaces/AGENT/lib')

print('=== AGENT Integration Test Suite ===')

try:
    from agent.rust_integration import get_integration_manager
    manager = get_integration_manager()
    print(f'✅ Integration Manager: Rust Available = {manager.rust_available}')
    
    # Test cache
    cache = manager.get_cache_manager()
    cache.set('test', 'integration_test', 300)
    result = cache.get('test')
    assert result == 'integration_test', f'Cache test failed: {result}'
    print('✅ Cache: Working correctly')
    
    # Test string processor
    processor = manager.get_string_processor()
    result = processor.process_parallel(['test', 'integration'])
    print(f'✅ String Processor: {result}')
    
    # Test components availability
    components = {
        'HTTP Client': manager.get_http_client() is not None,
        'Text Processor': manager.get_text_processor() is not None,
        'Container Orchestrator': manager.get_container_orchestrator() is not None,
        'Security Scanner': manager.get_security_scanner() is not None,
        'Performance Monitor': manager.get_performance_monitor() is not None
    }
    
    for name, available in components.items():
        status = '✅' if available else '❌'
        print(f'{status} {name}: {\"Available\" if available else \"Not Available\"}')
    
    print('\\n🎉 All integration tests passed!')
    
except Exception as e:
    print(f'❌ Integration test failed: {e}')
    import traceback
    traceback.print_exc()
    exit(1)
"

if [ $? -eq 0 ]; then
    echo "✅ Integration tests completed successfully!"
else
    echo "❌ Integration tests failed!"
    exit 1
fi
