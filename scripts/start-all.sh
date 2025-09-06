#!/bin/bash
# Complete AGENT System Startup Script

echo "🚀 Starting Complete AGENT System..."
echo "====================================="

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to start a service in the background
start_service() {
    local name=$1
    local script=$2
    local port=$3
    
    echo "🚀 Starting $name..."
    
    if [ -n "$port" ] && check_port $port; then
        echo "⚠️  Port $port is already in use, skipping $name"
        return
    fi
    
    # Start the service in the background
    bash "$script" > "logs/${name,,}.log" 2>&1 &
    local pid=$!
    echo $pid > "logs/${name,,}.pid"
    
    echo "✅ $name started (PID: $pid, Log: logs/${name,,}.log)"
    
    # Give the service time to start
    sleep 2
}

# Create logs directory
mkdir -p logs

echo "📋 Starting services in the following order:"
echo "  1. AGENT LLM Server (Python backend)"
echo "  2. Next.js Development Server"
echo ""

# Start AGENT server first
start_service "AGENT-Server" "scripts/start-agent-server.sh" "8000"

# Wait a moment for AGENT server to initialize
echo "⏳ Waiting for AGENT server to initialize..."
sleep 5

# Check AGENT server health
if curl -s http://localhost:8000/api/agents/health > /dev/null 2>&1; then
    echo "✅ AGENT server is healthy"
else
    echo "⚠️  AGENT server may still be starting..."
fi

# Start Next.js development server
start_service "NextJS-Dev" "scripts/start-nextjs-dev.sh" "3000"

echo ""
echo "🎉 AGENT System Startup Complete!"
echo "=================================="
echo ""
echo "📍 Access Points:"
echo "  • Web Application: http://localhost:3000"
echo "  • AGENT API: http://localhost:8000/api/agents"
echo "  • Health Check: http://localhost:8000/api/agents/health"
echo ""
echo "📊 System Status:"
echo "  • AGENT Server: $([ -f logs/agent-server.pid ] && echo "Running (PID: $(cat logs/agent-server.pid))" || echo "Not started")"
echo "  • Next.js Dev: $([ -f logs/nextjs-dev.pid ] && echo "Running (PID: $(cat logs/nextjs-dev.pid))" || echo "Not started")"
echo ""
echo "📋 Management Commands:"
echo "  • Stop all: ./scripts/stop-all.sh"
echo "  • View logs: tail -f logs/*.log"
echo "  • Health check: curl http://localhost:8000/api/agents/health"
echo ""
echo "🎯 Ready to use AGENT LLM system with 5 specialized modes!"

# Keep the script running to show logs
echo ""
echo "📜 Live logs (Ctrl+C to exit):"
echo "================================"
tail -f logs/*.log 2>/dev/null || echo "No logs available yet..."