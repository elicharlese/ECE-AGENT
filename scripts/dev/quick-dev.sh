#!/bin/bash

# Quick Development Setup Script
# Handles common dependency issues automatically

set -e

echo "🚀 ECE-Agent Quick Development Setup"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to clean caches
clean_caches() {
    echo "🧹 Cleaning caches..."
    rm -rf node_modules package-lock.json yarn.lock
    npm cache clean --force 2>/dev/null || true
    yarn cache clean 2>/dev/null || true
}

# Function to check disk space
check_disk_space() {
    available=$(df -h . | tail -1 | awk '{print $4}' | sed 's/G//')
    if [ "${available%.*}" -lt 5 ]; then
        echo "⚠️  Low disk space detected. Cleaning development caches..."
        rm -rf ~/Library/Caches/Yarn 2>/dev/null || true
        rm -rf ~/Library/Caches/npm 2>/dev/null || true
        rm -rf ~/.npm/_cacache 2>/dev/null || true
    fi
}

# Function to install with fallbacks
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    # Try yarn first (fastest and most reliable)
    if command_exists yarn; then
        echo "Using Yarn..."
        yarn install --ignore-engines --network-timeout 300000
        return 0
    fi
    
    # Try pnpm
    if command_exists pnpm; then
        echo "Using pnpm..."
        pnpm install --ignore-scripts
        return 0
    fi
    
    # Fallback to npm with optimizations
    echo "Using npm with optimizations..."
    npm install --legacy-peer-deps --no-optional --prefer-offline --no-audit
}

# Function to start development server
start_dev_server() {
    echo "🏃 Starting development server..."
    
    # Try different methods to start the server
    if [ -f "package.json" ] && grep -q "\"dev\":" package.json; then
        npm run dev
    elif command_exists next; then
        npx next dev
    else
        echo "❌ Unable to start development server"
        exit 1
    fi
}

# Main execution
main() {
    check_disk_space
    
    # Use minimal package.json if full one fails
    if [ -f "package.minimal.json" ]; then
        echo "🔄 Using minimal package configuration..."
        cp package.minimal.json package.json
    fi
    
    clean_caches
    
    # Try installation with retries
    for i in {1..3}; do
        echo "📦 Installation attempt $i/3..."
        if install_dependencies; then
            echo "✅ Dependencies installed successfully!"
            break
        else
            echo "❌ Installation attempt $i failed"
            if [ $i -eq 3 ]; then
                echo "💡 Try running: docker run -it --rm -v \$(pwd):/app -w /app -p 3000:3000 node:18-alpine sh"
                exit 1
            fi
            clean_caches
            sleep 2
        fi
    done
    
    start_dev_server
}

# Run main function
main "$@"
