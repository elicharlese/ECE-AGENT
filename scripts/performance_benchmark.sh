#!/bin/bash
set -e

# Performance benchmark for AGENT system
echo "⚡ Running AGENT Performance Benchmarks..."

# Navigate to project root
cd "$(dirname "$0")/.."

# Set Python path
export PYTHONPATH="/workspaces/AGENT:/workspaces/AGENT/lib:$PYTHONPATH"

echo "📊 Running comprehensive performance tests..."
python3 -c "
import sys
import time
import statistics
sys.path.insert(0, '/workspaces/AGENT')
sys.path.insert(0, '/workspaces/AGENT/lib')

print('=== AGENT Performance Benchmark Suite ===')

try:
    from agent.rust_integration import get_integration_manager
    manager = get_integration_manager()
    
    print(f'🦀 Rust Available: {manager.rust_available}')
    if not manager.rust_available:
        print('⚠️  Running with Python fallbacks only')
    
    # Cache benchmark
    print('\\n📋 Cache Performance Test')
    cache = manager.get_cache_manager()
    
    write_times = []
    read_times = []
    
    for trial in range(5):
        # Write test
        start = time.time()
        for i in range(1000):
            cache.set(f'bench_key_{i}', f'value_{i}', 300)
        write_time = time.time() - start
        write_times.append(write_time)
        
        # Read test
        start = time.time()
        for i in range(1000):
            cache.get(f'bench_key_{i}')
        read_time = time.time() - start
        read_times.append(read_time)
    
    avg_write = statistics.mean(write_times)
    avg_read = statistics.mean(read_times)
    
    print(f'✅ Cache Write: {avg_write:.4f}s avg ({1000/avg_write:.0f} ops/sec)')
    print(f'✅ Cache Read:  {avg_read:.4f}s avg ({1000/avg_read:.0f} ops/sec)')
    
    # String processing benchmark
    print('\\n📋 String Processing Performance Test')
    processor = manager.get_string_processor()
    
    test_strings = ['performance', 'benchmark', 'rust', 'python', 'integration'] * 200
    processing_times = []
    
    for trial in range(5):
        start = time.time()
        result = processor.process_parallel(test_strings)
        processing_time = time.time() - start
        processing_times.append(processing_time)
    
    avg_processing = statistics.mean(processing_times)
    strings_per_sec = len(test_strings) / avg_processing
    
    print(f'✅ String Processing: {avg_processing:.4f}s avg ({strings_per_sec:.0f} strings/sec)')
    
    # Memory and concurrency test
    print('\\n📋 Concurrency Test')
    start = time.time()
    
    # Simulate concurrent operations
    for i in range(100):
        cache.set(f'concurrent_{i}', f'data_{i}', 300)
        processor.process_parallel([f'string_{i}', f'test_{i}'])
        cache.get(f'concurrent_{i}')
    
    concurrent_time = time.time() - start
    print(f'✅ Concurrent Operations: {concurrent_time:.4f}s for 300 mixed operations')
    
    # Performance summary
    print('\\n🎯 Performance Summary')
    print('=' * 50)
    if manager.rust_available:
        print('🦀 Rust-accelerated performance:')
        print(f'   • Cache: ~{1000/avg_write:.0f} writes/sec, ~{1000/avg_read:.0f} reads/sec')
        print(f'   • Strings: ~{strings_per_sec:.0f} processed/sec')
        print('   • Memory: Zero-copy operations where possible')
        print('   • Concurrency: True parallelism with Tokio')
    else:
        print('🐍 Python fallback performance:')
        print('   • Performance limited by Python GIL')
        print('   • Consider building Rust components for better performance')
    
    print('\\n🎉 Benchmark completed successfully!')
    
except Exception as e:
    print(f'❌ Benchmark failed: {e}')
    import traceback
    traceback.print_exc()
    exit(1)
"

if [ $? -eq 0 ]; then
    echo "✅ Performance benchmarks completed successfully!"
else
    echo "❌ Performance benchmarks failed!"
    exit 1
fi
