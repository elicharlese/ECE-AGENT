#!/bin/bash
# AGENT System Validation Script
# Validates layouts, APIs, chat functionality, and core systems

echo "🔍 AGENT System Validation Starting..."
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  WARN${NC}: $message"
    else
        echo -e "${BLUE}ℹ️  INFO${NC}: $message"
    fi
}

# Function to check file exists
check_file() {
    local file=$1
    local description=$2
    if [ -f "$file" ]; then
        print_status "PASS" "$description exists: $file"
        return 0
    else
        print_status "FAIL" "$description missing: $file"
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    local dir=$1
    local description=$2
    if [ -d "$dir" ]; then
        print_status "PASS" "$description exists: $dir"
        return 0
    else
        print_status "FAIL" "$description missing: $dir"
        return 1
    fi
}

echo ""
echo "📁 DIRECTORY STRUCTURE VALIDATION"
echo "=================================="

# Check core directories
check_dir "agent" "Core agent module"
check_dir "api" "API directory"
check_dir "static/layouts" "Layouts directory"
check_dir "docs" "Documentation directory"
check_dir "tests" "Tests directory"
check_dir "config" "Configuration directory"

echo ""
echo "📄 CORE FILES VALIDATION"
echo "========================"

# Check core application files
check_file "arbitrage_server.py" "Main server"
check_file "requirements.txt" "Dependencies"
check_file "package.json" "Node.js config"
check_file "nx.json" "Nx workspace config"
check_file "vercel.json" "Vercel deployment config"

# Check API files
check_file "api/index.py" "Main API endpoints"

# Check core agent modules
check_file "agent/__init__.py" "Agent module init"
check_file "agent/core.py" "Core functionality"
check_file "agent/enhanced_agent.py" "Enhanced agent"
check_file "agent/chat_rooms.py" "Chat rooms"
check_file "agent/room_websocket.py" "WebSocket handler"

echo ""
echo "🎨 LAYOUT SYSTEM VALIDATION"
echo "==========================="

# Check layout files
check_file "static/layouts/layout-manager.js" "Layout manager"
check_file "static/layouts/chat-layout.html" "Chat layout"
check_file "static/layouts/chat.js" "Chat functionality"
check_file "static/layouts/designer-layout.html" "Designer layout"

# Check layout directory structure
check_dir "static/layouts" "Static layouts directory"

echo ""
echo "📚 DOCUMENTATION VALIDATION"
echo "==========================="

# Check documentation files
check_file "docs/README.md" "Main documentation"
check_file "docs/plan.md" "Project plan"
check_file "PROJECT_STRUCTURE_UPDATED.md" "Updated structure"

# Check patches and batches
check_dir "docs/patches" "Patches directory"
check_dir "docs/batches" "Batches directory"
check_dir "docs/patches/patch-7" "Patch 7 documentation"

if [ -d "docs/patches/patch-7" ]; then
    check_file "docs/patches/patch-7/PATCH7_SUMMARY.md" "Patch 7 summary"
    check_file "docs/patches/patch-7/PATCH7_CHECKLIST.md" "Patch 7 checklist"
fi

echo ""
echo "🧪 TEST SYSTEM VALIDATION"
echo "========================="

# Check test files
check_file "tests/test_patch7.py" "Patch 7 tests"
check_file "tests/test_api.py" "API tests"
check_file "tests/test_chat_api.py" "Chat API tests"
check_file "tests/test_arbitrage_system.py" "Arbitrage tests"

echo ""
echo "🔧 CONFIGURATION VALIDATION"
echo "==========================="

# Check configuration files
check_file "config/agent_config.json" "Agent configuration"
check_file "config/auth_config.json" "Auth configuration"

echo ""
echo "🚀 DEMO & PATCH VALIDATION"
echo "=========================="

# Check demo files exist in demos directory
if [ -d "demos" ]; then
    if [ -f "demos/demo_patch7.py" ]; then
        print_status "PASS" "Patch 7 demo exists"
    else
        print_status "FAIL" "Patch 7 demo missing"
    fi
fi

echo ""
echo "🔍 PYTHON SYNTAX VALIDATION"
echo "==========================="

# Check Python syntax for core files
python_files=(
    "arbitrage_server.py"
    "agent/core.py" 
    "agent/enhanced_agent.py"
    "agent/chat_rooms.py"
    "agent/room_websocket.py"
    "api/index.py"
)

for file in "${python_files[@]}"; do
    if [ -f "$file" ]; then
        if python3 -m py_compile "$file" 2>/dev/null; then
            print_status "PASS" "Python syntax valid: $file"
        else
            print_status "FAIL" "Python syntax error: $file"
        fi
    fi
done

echo ""
echo "📋 LAYOUT CONFIGURATION CHECK"
echo "============================="

# Check layout manager configuration
if [ -f "static/layouts/layout-manager.js" ]; then
    if grep -q "layoutConfigs" "static/layouts/layout-manager.js"; then
        print_status "PASS" "Layout manager has configuration"
    else
        print_status "FAIL" "Layout manager missing configuration"
    fi
    
    # Check for each app layout config
    apps=("chat" "trading" "portfolio" "analytics" "training" "designer" "settings")
    for app in "${apps[@]}"; do
        if grep -q "\"$app\":" "static/layouts/layout-manager.js"; then
            print_status "PASS" "Layout config exists for: $app"
        else
            print_status "WARN" "Layout config missing for: $app"
        fi
    done
fi

echo ""
echo "🌐 API ENDPOINT VALIDATION"
echo "=========================="

# Check if main API endpoints are defined
if [ -f "api/index.py" ]; then
    api_endpoints=(
        "/api/health"
        "/api/rooms"
        "/api/auth/login"
        "/api/spline"
    )
    
    for endpoint in "${api_endpoints[@]}"; do
        if grep -q "$endpoint" "api/index.py" || grep -q "$endpoint" "arbitrage_server.py"; then
            print_status "PASS" "API endpoint defined: $endpoint"
        else
            print_status "WARN" "API endpoint not found: $endpoint"
        fi
    done
fi

echo ""
echo "=================================================="
echo "🎯 VALIDATION SUMMARY"
echo "=================================================="

# Count results
total_checks=$(grep -c "PASS\|FAIL\|WARN" /tmp/validation.log 2>/dev/null || echo "0")
print_status "INFO" "Validation complete - Review results above"
print_status "INFO" "Ready to proceed with layout functionality testing"

echo ""
echo "📋 RECOMMENDED NEXT STEPS:"
echo "1. Test layout switching in browser"
echo "2. Verify chat room creation and messaging"
echo "3. Test WebSocket connections"
echo "4. Validate API endpoints with Postman/curl"
echo "5. Run comprehensive test suite"
echo "6. Begin implementing layout-specific tools"
echo ""
