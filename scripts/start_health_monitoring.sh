#!/bin/bash

# AGENT Health Monitoring Startup Script
# This script starts all health monitoring services

echo "🤖 Starting AGENT Health Monitoring System..."

# Create necessary directories
mkdir -p logs reports config

# Set permissions
chmod +x scripts/*.py

# Check if Python dependencies are installed
echo "📦 Checking Python dependencies..."
python3 -c "import aiohttp, psutil, fastapi" 2>/dev/null || {
    echo "❌ Missing dependencies. Installing..."
    pip3 install aiohttp psutil fastapi uvicorn
}

# Start health monitoring services
echo "🔍 Starting health monitors..."

# Start uptime monitor in background
echo "Starting uptime monitor..."
python3 scripts/uptime_monitor.py https://agent-ece.vercel.app > logs/uptime_monitor.log 2>&1 &
UPTIME_PID=$!
echo "Uptime monitor started (PID: $UPTIME_PID)"

# Start performance monitor in background
echo "Starting performance monitor..."
python3 scripts/performance_monitor.py https://agent-ece.vercel.app --continuous > logs/performance_monitor.log 2>&1 &
PERF_PID=$!
echo "Performance monitor started (PID: $PERF_PID)"

# Start comprehensive health monitor in background
echo "Starting health monitor..."
python3 scripts/health_monitor.py > logs/health_monitor.log 2>&1 &
HEALTH_PID=$!
echo "Health monitor started (PID: $HEALTH_PID)"

# Start health dashboard
echo "Starting health dashboard..."
python3 scripts/health_dashboard.py > logs/health_dashboard.log 2>&1 &
DASHBOARD_PID=$!
echo "Health dashboard started (PID: $DASHBOARD_PID)"

# Save PIDs for cleanup
echo "$UPTIME_PID" > logs/uptime_monitor.pid
echo "$PERF_PID" > logs/performance_monitor.pid
echo "$HEALTH_PID" > logs/health_monitor.pid
echo "$DASHBOARD_PID" > logs/health_dashboard.pid

echo "✅ All health monitoring services started!"
echo ""
echo "📊 Health Dashboard: http://localhost:8001"
echo "📝 Logs directory: ./logs/"
echo "📈 Reports directory: ./reports/"
echo ""
echo "To stop all services, run: ./scripts/stop_health_monitoring.sh"
echo "To view logs, run: tail -f logs/*.log"

# Keep script running to monitor services
echo "🔄 Monitoring services... (Press Ctrl+C to stop)"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping health monitoring services..."
    
    if [ -f logs/uptime_monitor.pid ]; then
        kill $(cat logs/uptime_monitor.pid) 2>/dev/null
        rm logs/uptime_monitor.pid
    fi
    
    if [ -f logs/performance_monitor.pid ]; then
        kill $(cat logs/performance_monitor.pid) 2>/dev/null
        rm logs/performance_monitor.pid
    fi
    
    if [ -f logs/health_monitor.pid ]; then
        kill $(cat logs/health_monitor.pid) 2>/dev/null
        rm logs/health_monitor.pid
    fi
    
    if [ -f logs/health_dashboard.pid ]; then
        kill $(cat logs/health_dashboard.pid) 2>/dev/null
        rm logs/health_dashboard.pid
    fi
    
    echo "✅ All services stopped."
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Wait for services
wait
