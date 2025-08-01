#!/bin/bash
set -e

# Health check for AGENT system
echo "🏥 AGENT System Health Check..."

# Navigate to project root
cd "$(dirname "$0")/.."

# Set Python path
export PYTHONPATH="/workspaces/AGENT:/workspaces/AGENT/lib:$PYTHONPATH"

echo "🔍 Checking system health..."

# Check Python dependencies
echo "📋 Checking Python environment..."
python3 -c "
import sys
print(f'Python version: {sys.version}')

required_modules = ['torch', 'transformers', 'numpy', 'psutil']
missing = []

for module in required_modules:
    try:
        __import__(module)
        print(f'✅ {module}: Available')
    except ImportError:
        print(f'❌ {module}: Missing')
        missing.append(module)

if missing:
    print(f'⚠️  Missing modules: {missing}')
    print('Run: pip install -r requirements.txt')
else:
    print('✅ All Python dependencies satisfied')
"

# Check Rust components
echo -e "\n📋 Checking Rust components..."
if [ -d "lib" ] && ls lib/libagent_*.so >/dev/null 2>&1; then
    echo "✅ Rust libraries found:"
    ls -la lib/libagent_*.so
else
    echo "❌ Rust libraries not found. Run: ./scripts/build_rust.sh"
fi

# Check integration
echo -e "\n📋 Checking Python-Rust integration..."
python3 -c "
import sys
sys.path.insert(0, '/workspaces/AGENT')
sys.path.insert(0, '/workspaces/AGENT/lib')

try:
    from agent.rust_integration import get_integration_manager
    manager = get_integration_manager()
    
    if manager.rust_available:
        print('✅ Rust integration: Working')
        
        # Quick functional test
        cache = manager.get_cache_manager()
        cache.set('health_check', 'ok', 60)
        result = cache.get('health_check')
        
        if result == 'ok':
            print('✅ Cache functionality: Working')
        else:
            print('❌ Cache functionality: Failed')
            
        processor = manager.get_string_processor()
        result = processor.process_parallel(['health', 'check'])
        
        if result and len(result) == 2:
            print('✅ String processing: Working')
        else:
            print('❌ String processing: Failed')
            
    else:
        print('⚠️  Rust integration: Fallback mode (Python only)')
        
except Exception as e:
    print(f'❌ Integration check failed: {e}')
"

# Check disk space
echo -e "\n📋 Checking disk space..."
df -h . | tail -1 | awk '{
    used = $5; 
    gsub(/%/, "", used); 
    if (used > 90) 
        print "❌ Disk space: " $5 " used - Low space warning"
    else if (used > 80)
        print "⚠️  Disk space: " $5 " used - Monitor closely"  
    else
        print "✅ Disk space: " $5 " used - OK"
}'

# Check memory usage
echo -e "\n📋 Checking memory usage..."
python3 -c "
import psutil
mem = psutil.virtual_memory()
used_percent = mem.percent

if used_percent > 90:
    print(f'❌ Memory usage: {used_percent:.1f}% - High usage warning')
elif used_percent > 80:
    print(f'⚠️  Memory usage: {used_percent:.1f}% - Monitor closely')
else:
    print(f'✅ Memory usage: {used_percent:.1f}% - OK')
"

# Final status
echo -e "\n🎯 Health Check Summary"
echo "=" * 40

# Quick integration test
python3 -c "
import sys
sys.path.insert(0, '/workspaces/AGENT')
sys.path.insert(0, '/workspaces/AGENT/lib')

try:
    from agent.rust_integration import get_integration_manager
    manager = get_integration_manager()
    
    if manager.rust_available:
        print('🚀 System Status: HEALTHY (Rust-accelerated)')
        print('   • All components operational')
        print('   • High-performance mode active')
        print('   • Ready for production workloads')
    else:
        print('⚠️  System Status: FUNCTIONAL (Python fallback)')
        print('   • Core functionality available')
        print('   • Performance limited to Python speed')
        print('   • Consider rebuilding Rust components')
        
except Exception as e:
    print('❌ System Status: DEGRADED')  
    print(f'   • Integration issues detected: {e}')
    print('   • Run clean build to resolve')
"

echo -e "\n✅ Health check completed!"
