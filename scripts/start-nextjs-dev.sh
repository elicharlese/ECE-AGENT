#!/bin/bash
# Next.js Development Server Startup Script with AGENT Integration

echo "🚀 Starting Next.js Development Server with AGENT Integration..."
echo "=============================================================="

# Set environment variables for AGENT integration
export AGENT_SERVER_URL=${AGENT_SERVER_URL:-http://localhost:8000}
export NEXT_PUBLIC_AGENT_ENABLED=true

echo "🔧 Configuration:"
echo "  • AGENT Server: ${AGENT_SERVER_URL}"
echo "  • Next.js Port: ${PORT:-3000}"
echo "  • Environment: ${NODE_ENV:-development}"

# Check if AGENT server is running
echo ""
echo "🔍 Checking AGENT server connection..."
if curl -s "${AGENT_SERVER_URL}/api/agents/health" > /dev/null 2>&1; then
    echo "✅ AGENT server is running and healthy"
else
    echo "⚠️  AGENT server not responding at ${AGENT_SERVER_URL}"
    echo "💡 The system will use intelligent fallback mode"
    echo "   Start AGENT server with: ./scripts/start-agent-server.sh"
fi

echo ""
echo "🚀 Starting Next.js development server..."
echo "📍 Application will be available at: http://localhost:${PORT:-3000}"
echo "🤖 AGENT features will be available in the chat interface"
echo ""

# Start Next.js development server
npm run dev