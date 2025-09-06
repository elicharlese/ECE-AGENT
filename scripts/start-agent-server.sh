#!/bin/bash
# AGENT LLM Server Startup Script

echo "🚀 Starting AGENT LLM System..."
echo "================================"

# Load environment variables
if [ -f .env.agent ]; then
    export $(cat .env.agent | xargs)
    echo "✅ Environment variables loaded"
else
    echo "⚠️  .env.agent not found, using defaults"
fi

# Check if virtual environment exists
if [ ! -d "agent_env" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv agent_env || {
        echo "❌ Failed to create virtual environment"
        echo "💡 Install python3-venv: sudo apt install python3-venv"
        echo "🔄 Continuing without virtual environment..."
    }
fi

# Activate virtual environment if it exists
if [ -d "agent_env" ]; then
    source agent_env/bin/activate
    echo "✅ Virtual environment activated"
    
    # Install dependencies if requirements.txt exists
    if [ -f "requirements.txt" ]; then
        echo "📦 Installing Python dependencies..."
        pip install -r requirements.txt || {
            echo "⚠️  Some dependencies failed to install"
        }
    fi
fi

# Create data directories
mkdir -p data/vector_store
mkdir -p logs

echo "📊 System Status:"
echo "  • Vector Store: ./data/vector_store"
echo "  • Logs: ./logs"
echo "  • Config: .env.agent"

# Check if Ollama is running (optional)
if command -v ollama &> /dev/null; then
    if pgrep -x "ollama" > /dev/null; then
        echo "  • Ollama: ✅ Running"
    else
        echo "  • Ollama: ⚠️  Not running (optional)"
        echo "    Start with: ollama serve"
    fi
else
    echo "  • Ollama: ⚠️  Not installed (optional)"
    echo "    Install from: https://ollama.ai"
fi

# Start the Python server
echo ""
echo "🚀 Starting AGENT LLM Server..."
echo "📍 Server will be available at: http://localhost:${AGENT_PORT:-8000}"
echo "🔗 Health check: http://localhost:${AGENT_PORT:-8000}/api/agents/health"
echo ""

# Run the server
python server/agent_server.py || {
    echo "❌ Failed to start AGENT server"
    echo "💡 Check the logs above for error details"
    exit 1
}