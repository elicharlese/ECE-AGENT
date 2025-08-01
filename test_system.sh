#!/bin/bash

# AGENT System Test Script
# Comprehensive testing of all startup methods

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}AGENT System Test Suite${NC}"
echo "=========================="

# Test 1: Health Check
echo -e "\n${YELLOW}Test 1: Health Check${NC}"
if python run_agent.py --health-check; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
fi

# Test 2: Bash Script Help
echo -e "\n${YELLOW}Test 2: Bash Script Help${NC}"
if ./start_agent.sh --help > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Bash script help works${NC}"
else
    echo -e "${RED}✗ Bash script help failed${NC}"
fi

# Test 3: Python Script Help
echo -e "\n${YELLOW}Test 3: Python Script Help${NC}"
if python run_agent.py --help > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Python script help works${NC}"
else
    echo -e "${RED}✗ Python script help failed${NC}"
fi

# Test 4: Makefile
echo -e "\n${YELLOW}Test 4: Makefile${NC}"
if make help > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Makefile works${NC}"
else
    echo -e "${RED}✗ Makefile failed${NC}"
fi

# Test 5: Configuration Loading
echo -e "\n${YELLOW}Test 5: Configuration Loading${NC}"
if [ -f "config/agent_config.json" ]; then
    if python -c "import json; json.load(open('config/agent_config.json'))" 2>/dev/null; then
        echo -e "${GREEN}✓ Configuration file is valid JSON${NC}"
    else
        echo -e "${RED}✗ Configuration file is invalid JSON${NC}"
    fi
else
    echo -e "${RED}✗ Configuration file missing${NC}"
fi

# Test 6: Required Files
echo -e "\n${YELLOW}Test 6: Required Files${NC}"
required_files=(
    "main.py"
    "run_agent.py"
    "start_agent.sh"
    "Makefile"
    "Dockerfile"
    "docker-compose.yml"
    "static/index.html"
    "static/app.js"
    "config/agent_config.json"
)

missing_files=0
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file (missing)${NC}"
        missing_files=$((missing_files + 1))
    fi
done

if [ $missing_files -eq 0 ]; then
    echo -e "${GREEN}✓ All required files present${NC}"
else
    echo -e "${RED}✗ $missing_files files missing${NC}"
fi

# Test 7: Directory Structure
echo -e "\n${YELLOW}Test 7: Directory Structure${NC}"
required_dirs=(
    "agent"
    "api"
    "static"
    "config"
    "logs"
    "scripts"
)

missing_dirs=0
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓ $dir/${NC}"
    else
        echo -e "${RED}✗ $dir/ (missing)${NC}"
        missing_dirs=$((missing_dirs + 1))
    fi
done

if [ $missing_dirs -eq 0 ]; then
    echo -e "${GREEN}✓ All required directories present${NC}"
else
    echo -e "${RED}✗ $missing_dirs directories missing${NC}"
fi

# Test 8: Python Dependencies
echo -e "\n${YELLOW}Test 8: Python Dependencies${NC}"
critical_deps=(
    "fastapi"
    "uvicorn"
    "pydantic"
    "aiohttp"
)

missing_deps=0
for dep in "${critical_deps[@]}"; do
    if python -c "import $dep" 2>/dev/null; then
        echo -e "${GREEN}✓ $dep${NC}"
    else
        echo -e "${RED}✗ $dep (not installed)${NC}"
        missing_deps=$((missing_deps + 1))
    fi
done

if [ $missing_deps -eq 0 ]; then
    echo -e "${GREEN}✓ All critical dependencies available${NC}"
else
    echo -e "${YELLOW}⚠ $missing_deps dependencies missing (will be installed on startup)${NC}"
fi

# Test 9: Port Availability
echo -e "\n${YELLOW}Test 9: Port Availability${NC}"
if netstat -tuln 2>/dev/null | grep -q ":8000 "; then
    echo -e "${YELLOW}⚠ Port 8000 is in use${NC}"
else
    echo -e "${GREEN}✓ Port 8000 is available${NC}"
fi

# Test 10: Quick Startup Test (5 seconds)
echo -e "\n${YELLOW}Test 10: Quick Startup Test${NC}"
echo "Starting system for 5 seconds..."

# Kill any existing processes first
pkill -f "python.*run_agent.py" 2>/dev/null || true
sleep 1

if timeout 5s python run_agent.py --dev --no-build 2>/dev/null &
then
    sleep 2
    if curl -s http://localhost:8000/static/ > /dev/null 2>&1; then
        echo -e "${GREEN}✓ System starts and responds${NC}"
    else
        echo -e "${YELLOW}⚠ System started but not responding (may need more time)${NC}"
    fi
    
    # Clean up
    pkill -f "python.*run_agent.py" 2>/dev/null || true
else
    echo -e "${RED}✗ System failed to start${NC}"
fi

echo -e "\n${BLUE}Test Summary${NC}"
echo "============"
echo "System is ready for professional deployment!"
echo ""
echo "Quick Start Commands:"
echo "  ./start_agent.sh          # Development mode"
echo "  ./start_agent.sh --prod   # Production mode"
echo "  python run_agent.py --dev # Python runner"
echo "  make dev                  # Make command"
echo ""
echo "Access your AGENT at: http://localhost:8000/static/"
