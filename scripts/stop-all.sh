#!/bin/bash
# Stop all AGENT system services

echo "🛑 Stopping AGENT System Services..."
echo "===================================="

# Function to stop a service
stop_service() {
    local name=$1
    local pidfile="logs/${name,,}.pid"
    
    if [ -f "$pidfile" ]; then
        local pid=$(cat "$pidfile")
        if kill -0 $pid > /dev/null 2>&1; then
            echo "🛑 Stopping $name (PID: $pid)..."
            kill $pid
            sleep 2
            
            # Force kill if still running
            if kill -0 $pid > /dev/null 2>&1; then
                echo "💀 Force stopping $name..."
                kill -9 $pid
            fi
            
            echo "✅ $name stopped"
        else
            echo "⚠️  $name was not running"
        fi
        rm -f "$pidfile"
    else
        echo "⚠️  No PID file found for $name"
    fi
}

# Stop services
stop_service "NextJS-Dev"
stop_service "AGENT-Server"

# Kill any remaining processes on our ports
echo ""
echo "🔍 Checking for remaining processes..."

# Check port 3000 (Next.js)
if lsof -i :3000 > /dev/null 2>&1; then
    echo "🛑 Killing remaining processes on port 3000..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null
fi

# Check port 8000 (AGENT server)
if lsof -i :8000 > /dev/null 2>&1; then
    echo "🛑 Killing remaining processes on port 8000..."
    lsof -ti :8000 | xargs kill -9 2>/dev/null
fi

echo ""
echo "✅ All AGENT system services stopped"
echo ""
echo "📊 Port Status:"
echo "  • Port 3000: $(lsof -i :3000 > /dev/null 2>&1 && echo "Still in use" || echo "Free")"
echo "  • Port 8000: $(lsof -i :8000 > /dev/null 2>&1 && echo "Still in use" || echo "Free")"