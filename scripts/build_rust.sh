#!/bin/bash
set -e

# Build all Rust components for AGENT system
echo "🦀 Building AGENT Rust Components..."

# Navigate to rust directory
cd "$(dirname "$0")/../rust"

# Check if Cargo.toml exists
if [ ! -f "Cargo.toml" ]; then
    echo "❌ Error: Cargo.toml not found in rust directory"
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cargo clean

# Build in release mode with optimizations
echo "⚙️ Building Rust components (release mode)..."
cargo build --release --workspace

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Rust build completed successfully!"
    
    # List generated libraries
    echo "📋 Generated libraries:"
    ls -la target/release/libagent_*.so
    
    # Copy to lib directory
    echo "📁 Copying libraries to lib/ directory..."
    cd ..
    mkdir -p lib
    cp rust/target/release/libagent_*.so lib/
    
    # Create symbolic links with proper names
    cd lib
    for lib in libagent_*.so; do
        name=$(echo $lib | sed 's/libagent_/agent_/' | sed 's/\.so$//')
        ln -sf "$lib" "${name}.so"
    done
    
    echo "✅ Build and deployment completed successfully!"
    echo "🚀 Rust components are ready for use"
else
    echo "❌ Build failed!"
    exit 1
fi
