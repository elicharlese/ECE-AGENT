#!/bin/bash

# AGENT Startup Script
# Professional launcher for the AGENT AI Platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_CMD="python3"
DEFAULT_PORT=8000
DEFAULT_MODE="dev"

# Logo
echo -e "${BLUE}"
cat << "EOF"
   ___   _____ _____ _   _ _____ 
  / _ \ / ____|  ___| \ | |_   _|
 / /_\ \ |  __| |__ |  \| | | |  
 |  _  | | |_ |  __|| . ` | | |  
 | | | | |__| | |___| |\  | | |  
 \_| |_/\_____|____/\_| \_/ \_/  
                                 
 Advanced AI Multi-Domain Platform
EOF
echo -e "${NC}"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    cat << EOF
AGENT Startup Script

Usage: $0 [OPTIONS]

OPTIONS:
    -h, --help          Show this help message
    -d, --dev           Run in development mode (default)
    -p, --prod          Run in production mode
    --port PORT         Specify port (default: 8000)
    --host HOST         Specify host (default: 0.0.0.0)
    --workers N         Number of workers (default: 4)
    --no-build          Skip Rust build
    --health-check      Run health check only
    --install           Install dependencies only
    --verbose           Enable verbose output
    --quick             Quick start (skip checks)

EXAMPLES:
    $0                  # Start in development mode
    $0 --prod           # Start in production mode
    $0 --port 8080      # Start on port 8080
    $0 --health-check   # Run health check
    $0 --install        # Install dependencies only

EOF
}

check_system() {
    log_info "Checking system requirements..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is required but not installed"
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
    log_info "Python version: $PYTHON_VERSION"
    
    # Check if version is at least 3.8
    if python3 -c 'import sys; exit(0 if sys.version_info >= (3, 8) else 1)'; then
        log_info "✓ Python version OK"
    else
        log_error "Python 3.8+ required, found $PYTHON_VERSION"
        exit 1
    fi
    
    # Check Rust (optional)
    if command -v cargo &> /dev/null; then
        CARGO_VERSION=$(cargo --version | cut -d' ' -f2)
        log_info "✓ Rust/Cargo found: $CARGO_VERSION"
    else
        log_warn "Rust/Cargo not found (optional for performance features)"
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        log_info "✓ Git found"
    else
        log_warn "Git not found"
    fi
}

create_directories() {
    log_info "Creating required directories..."
    
    directories=(
        "logs"
        "config"
        "data"
        "temp"
        "static/uploads"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$PROJECT_ROOT/$dir"
        log_info "✓ Created directory: $dir"
    done
}

install_dependencies() {
    log_info "Installing Python dependencies..."
    
    # Upgrade pip
    $PYTHON_CMD -m pip install --upgrade pip
    
    # Install main requirements
    if [ -f "$PROJECT_ROOT/requirements.txt" ]; then
        $PYTHON_CMD -m pip install -r "$PROJECT_ROOT/requirements.txt"
        log_info "✓ Main dependencies installed"
    else
        log_warn "requirements.txt not found"
    fi
    
    # Install Vercel requirements if available
    if [ -f "$PROJECT_ROOT/requirements-vercel.txt" ]; then
        $PYTHON_CMD -m pip install -r "$PROJECT_ROOT/requirements-vercel.txt"
        log_info "✓ Vercel dependencies installed"
    fi
    
    # Try to install Gunicorn for production
    if ! $PYTHON_CMD -c "import gunicorn" 2>/dev/null; then
        log_info "Installing Gunicorn for production server..."
        $PYTHON_CMD -m pip install gunicorn uvicorn[standard]
    fi
}

build_rust() {
    if [ -d "$PROJECT_ROOT/rust" ] && command -v cargo &> /dev/null; then
        log_info "Building Rust components..."
        cd "$PROJECT_ROOT/rust"
        
        if cargo build --release; then
            log_info "✓ Rust components built successfully"
        else
            log_warn "Rust build failed, continuing anyway..."
        fi
        
        cd "$PROJECT_ROOT"
    else
        log_info "Skipping Rust build (not available)"
    fi
}

setup_environment() {
    log_info "Setting up environment..."
    
    # Set Python path
    export PYTHONPATH="$PROJECT_ROOT:$PYTHONPATH"
    
    # Create .env file if it doesn't exist
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        cat > "$PROJECT_ROOT/.env" << EOF
# AGENT Environment Configuration
AGENT_ENV=development
AGENT_HOST=0.0.0.0
AGENT_PORT=8000
AGENT_DEBUG=true
AGENT_LOG_LEVEL=INFO

# Security
SECRET_KEY=$(openssl rand -hex 32)
API_KEY_REQUIRED=false

# Features
ENABLE_WEB_SEARCH=true
ENABLE_FILE_UPLOAD=true
ENABLE_RUST_COMPONENTS=true

# Monitoring
ENABLE_METRICS=true
ENABLE_HEALTH_CHECK=true
EOF
        log_info "✓ Created .env file"
    fi
}

start_agent() {
    local mode="$1"
    local port="$2"
    local host="$3"
    local extra_args=("${@:4}")
    
    log_info "Starting AGENT in $mode mode..."
    log_info "Host: $host, Port: $port"
    
    # Build command
    local cmd=("$PYTHON_CMD" "run_agent.py")
    
    if [ "$mode" = "prod" ]; then
        cmd+=("--prod")
    else
        cmd+=("--dev")
    fi
    
    cmd+=("--host" "$host" "--port" "$port")
    cmd+=("${extra_args[@]}")
    
    # Create PID file
    local pid_file="$PROJECT_ROOT/agent.pid"
    
    # Start the application
    log_info "Executing: ${cmd[*]}"
    exec "${cmd[@]}"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Kill any existing processes
    if [ -f "$PROJECT_ROOT/agent.pid" ]; then
        local pid=$(cat "$PROJECT_ROOT/agent.pid")
        if kill -0 "$pid" 2>/dev/null; then
            log_info "Stopping existing AGENT process (PID: $pid)"
            kill "$pid"
            sleep 2
        fi
        rm -f "$PROJECT_ROOT/agent.pid"
    fi
}

# Main script logic
main() {
    cd "$PROJECT_ROOT"
    
    # Parse arguments
    local mode="$DEFAULT_MODE"
    local port="$DEFAULT_PORT"
    local host="0.0.0.0"
    local extra_args=()
    local skip_checks=false
    local install_only=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -d|--dev)
                mode="dev"
                shift
                ;;
            -p|--prod)
                mode="prod"
                shift
                ;;
            --port)
                port="$2"
                shift 2
                ;;
            --host)
                host="$2"
                shift 2
                ;;
            --quick)
                skip_checks=true
                shift
                ;;
            --install)
                install_only=true
                shift
                ;;
            --no-build|--health-check|--verbose|--workers)
                extra_args+=("$1")
                if [[ "$1" == "--workers" ]]; then
                    extra_args+=("$2")
                    shift
                fi
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Setup cleanup trap
    trap cleanup EXIT
    
    # System checks
    if [ "$skip_checks" = false ]; then
        check_system
    fi
    
    # Create directories
    create_directories
    
    # Setup environment
    setup_environment
    
    # Install dependencies
    install_dependencies
    
    # Install only mode
    if [ "$install_only" = true ]; then
        log_info "Dependencies installed. Exiting."
        exit 0
    fi
    
    # Build Rust components
    if [[ ! " ${extra_args[*]} " =~ " --no-build " ]]; then
        build_rust
    fi
    
    # Start AGENT
    start_agent "$mode" "$port" "$host" "${extra_args[@]}"
}

# Run main function
main "$@"
