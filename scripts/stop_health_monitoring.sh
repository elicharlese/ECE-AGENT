#!/bin/bash

# AGENT Health Monitoring Stop Script
# This script stops all health monitoring services

echo "🛑 Stopping AGENT Health Monitoring System..."

# Function to stop service by PID file
stop_service() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Stopping $service_name (PID: $pid)..."
            kill "$pid"
            rm "$pid_file"
            echo "✅ $service_name stopped"
        else
            echo "⚠️  $service_name was not running"
            rm "$pid_file"
        fi
    else
        echo "⚠️  No PID file found for $service_name"
    fi
}

# Stop all services
stop_service "uptime_monitor"
stop_service "performance_monitor" 
stop_service "health_monitor"
stop_service "health_dashboard"

# Also kill any remaining Python processes running our scripts
echo "🧹 Cleaning up any remaining processes..."
pkill -f "uptime_monitor.py" 2>/dev/null
pkill -f "performance_monitor.py" 2>/dev/null
pkill -f "health_monitor.py" 2>/dev/null
pkill -f "health_dashboard.py" 2>/dev/null

echo "✅ All health monitoring services stopped!"
echo "📝 Logs preserved in ./logs/ directory"
echo "📈 Reports preserved in ./reports/ directory"
