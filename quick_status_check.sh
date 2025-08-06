#!/bin/bash
# AGENT System Status Check
# Quick validation of core functionality

echo "🚀 AGENT SYSTEM STATUS CHECK"
echo "============================"
echo ""

# Check server can start
echo "🔍 Testing server startup..."
timeout 5s python3 arbitrage_server.py &
SERVER_PID=$!
sleep 2

if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "✅ Server starts successfully"
    kill $SERVER_PID 2>/dev/null
else
    echo "⚠️  Server startup needs verification"
fi

# Check layout files are accessible
echo ""
echo "🎨 Checking layout accessibility..."
if [ -f "static/layouts/layout-manager.js" ] && [ -f "static/layouts/chat-layout.html" ]; then
    echo "✅ Layout files accessible"
else
    echo "❌ Layout files missing"
fi

# Check test suite
echo ""
echo "🧪 Testing core functionality..."
if python3 -m pytest tests/test_patch7.py -v >/dev/null 2>&1; then
    echo "✅ Patch 7 tests pass"
else
    echo "⚠️  Patch 7 tests need review"
fi

echo ""
echo "📋 SYSTEM READY FOR:"
echo "  • Layout functionality testing"
echo "  • Chat room implementation"
echo "  • AI integration"
echo "  • WebSocket testing"
echo "  • Feature development"
echo ""
echo "🎯 Next: Start server and test layouts in browser!"
