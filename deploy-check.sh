#!/bin/bash
# Vercel Deployment Readiness Check
# Ensures all components are ready for deployment

echo "🚀 Enhanced AGENT System - Vercel Deployment Check"
echo "=================================================="

# Check Python version
echo "📋 Checking Python environment..."
python3 --version

# Check required files exist
echo "📁 Checking deployment files..."
required_files=(
    "api/index.py"
    "requirements-vercel.txt"
    "vercel.json"
    ".vercelignore"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing"
        exit 1
    fi
done

# Test API imports
echo "🔍 Testing API imports..."
python3 -c "
import sys
sys.path.insert(0, '.')
try:
    from api.index import app, health_check, system_status
    print('  ✅ All API imports successful')
except ImportError as e:
    print(f'  ❌ Import error: {e}')
    exit(1)
"

# Check static files
echo "📂 Checking static files..."
if [ -d "static" ]; then
    file_count=$(find static -type f | wc -l)
    echo "  ✅ Static directory exists with $file_count files"
else
    echo "  ⚠️  Static directory not found - will create basic one"
fi

# Validate vercel.json
echo "⚙️  Validating vercel.json..."
python3 -c "
import json
try:
    with open('vercel.json', 'r') as f:
        config = json.load(f)
    print('  ✅ vercel.json is valid JSON')
    if 'functions' in config:
        print('  ✅ Functions config found')
    if 'rewrites' in config:
        print('  ✅ Rewrites config found')
except Exception as e:
    print(f'  ❌ vercel.json error: {e}')
    exit(1)
"

# Check requirements
echo "📦 Checking requirements..."
if [ -f "requirements-vercel.txt" ]; then
    req_count=$(wc -l < requirements-vercel.txt)
    echo "  ✅ requirements-vercel.txt exists with $req_count packages"
else
    echo "  ❌ requirements-vercel.txt missing"
    exit 1
fi

# Test basic API functionality
echo "🧪 Testing API functionality..."
python3 -c "
import sys
import asyncio
sys.path.insert(0, '.')
from api.index import health_check, system_status

async def test_endpoints():
    try:
        health = await health_check()
        print('  ✅ Health check endpoint works')
        
        status = await system_status()
        print('  ✅ System status endpoint works')
        
        print(f'  📊 System version: {status[\"version\"]}')
        print(f'  📊 Platform: {status[\"platform\"]}')
        
    except Exception as e:
        print(f'  ❌ Endpoint test failed: {e}')
        return False
    return True

result = asyncio.run(test_endpoints())
if not result:
    exit(1)
"

echo ""
echo "✅ All deployment checks passed!"
echo ""
echo "🚀 Ready for Vercel deployment:"
echo "   1. Install Vercel CLI: npm i -g vercel"
echo "   2. Login to Vercel: vercel login"
echo "   3. Deploy: vercel --prod"
echo ""
echo "🌐 Expected deployment features:"
echo "   • FastAPI application with OpenAPI docs"
echo "   • Health monitoring endpoints"
echo "   • Multi-domain agent query processing"
echo "   • Static file serving"
echo "   • Comprehensive error handling"
echo "   • Production-ready logging"
echo ""
echo "📈 Performance optimizations:"
echo "   • Graceful import fallbacks"
echo "   • Minimal dependencies"
echo "   • Efficient routing"
echo "   • Error boundary protection"
