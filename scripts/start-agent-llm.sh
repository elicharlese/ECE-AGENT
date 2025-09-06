#!/bin/bash

# AGENT LLM Startup Script
# Initializes and starts the complete AGENT LLM system

set -e

echo "🚀 Starting AGENT LLM System..."

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install Python dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration"
fi

# Check if Ollama is running (optional)
if command -v ollama &> /dev/null; then
    if ! curl -s http://localhost:11434/api/tags > /dev/null; then
        echo "⚠️  Ollama is not running. Starting Ollama..."
        ollama serve &
        sleep 5
    else
        echo "✅ Ollama is running"
    fi
else
    echo "⚠️  Ollama not found. AGENT LLM will use fallback responses"
fi

# Start the Python backend server
echo "🐍 Starting Python backend server..."
cd lib
python3 agent_server.py &
PYTHON_PID=$!
cd ..

# Wait for Python server to start
echo "⏳ Waiting for Python server to initialize..."
sleep 3

# Check if Python server is running
if ! curl -s http://localhost:8001/health > /dev/null; then
    echo "❌ Python server failed to start"
    kill $PYTHON_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Python backend server started (PID: $PYTHON_PID)"

# Start the Next.js development server
echo "⚛️  Starting Next.js development server..."
npm run dev &
NEXTJS_PID=$!

# Wait for Next.js server to start
echo "⏳ Waiting for Next.js server to initialize..."
sleep 5

# Check if Next.js server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Next.js server failed to start"
    kill $PYTHON_PID $NEXTJS_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Next.js development server started (PID: $NEXTJS_PID)"

echo ""
echo "🎉 AGENT LLM System is now running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🐍 Backend API: http://localhost:8001"
echo "📊 Health Check: http://localhost:8001/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down AGENT LLM System..."
    kill $PYTHON_PID $NEXTJS_PID 2>/dev/null || true
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait