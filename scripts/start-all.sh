#!/bin/bash

echo "🚀 Starting all AGENT applications..."

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "🔄 Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
        sleep 2
    else
        echo "✅ Port $port is free"
    fi
}

# Clear ports
echo "🧹 Clearing ports..."
kill_port 3000
kill_port 19000

# Start web application (Next.js)
echo "🌐 Starting web application on port 3000..."
npm run dev &
WEB_PID=$!
echo "Web app started with PID: $WEB_PID"

# Start mobile application (Expo)
echo "📱 Starting mobile application on port 19000..."
nx run mobile:start &
MOBILE_PID=$!
echo "Mobile app started with PID: $MOBILE_PID"

# Wait a moment for apps to start
sleep 5

# Start desktop application (Electron)
echo "💻 Starting desktop application..."
nx run desktop:serve &
DESKTOP_PID=$!
echo "Desktop app started with PID: $DESKTOP_PID"

echo ""
echo "🎉 All applications started!"
echo "📊 Web: http://localhost:3000"
echo "📱 Mobile: http://localhost:19000"
echo "💻 Desktop: Electron window should open"
echo ""
echo "Press Ctrl+C to stop all applications"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all applications..."
    kill $WEB_PID 2>/dev/null || true
    kill $MOBILE_PID 2>/dev/null || true
    kill $DESKTOP_PID 2>/dev/null || true
    echo "✅ All applications stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Wait for all processes
wait
