#!/bin/bash
set -e

# Clean and rebuild everything for AGENT system
echo "🧹 Clean Build for AGENT System..."

# Navigate to project root
cd "$(dirname "$0")/.."

echo "🗑️  Cleaning temporary files..."
# Clean Python cache
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name "*.pyo" -delete 2>/dev/null || true

# Clean Rust builds
if [ -d "rust" ]; then
    echo "🦀 Cleaning Rust builds..."
    cd rust
    cargo clean
    cd ..
fi

# Clean lib directory
if [ -d "lib" ]; then
    echo "📚 Cleaning lib directory..."
    rm -rf lib/*.so
fi

# Clean any backup files
find . -name "*.backup" -delete 2>/dev/null || true
find . -name "*~" -delete 2>/dev/null || true

echo "✅ Cleanup completed!"

# Rebuild everything
echo "🔨 Rebuilding Rust components..."
./scripts/build_rust.sh

echo "🧪 Running integration tests..."
./scripts/test_integration.sh

echo "⚡ Running performance benchmarks..."
./scripts/performance_benchmark.sh

echo "🎉 Clean build completed successfully!"
echo "🚀 AGENT system is ready for use"
