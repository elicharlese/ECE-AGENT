#!/bin/bash
set -e

# Master deployment script for AGENT system
echo "🚀 AGENT System Deployment"
echo "=========================="

# Navigate to project root
cd "$(dirname "$0")/.."

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Rust
if ! command -v rustc >/dev/null 2>&1; then
    echo "❌ Rust not found. Please install Rust: https://rustup.rs/"
    exit 1
fi

# Check Python
if ! command -v python3 >/dev/null 2>&1; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
if [[ "$(echo "$PYTHON_VERSION >= 3.8" | bc -l)" != "1" ]]; then
    echo "❌ Python 3.8+ required. Found: $PYTHON_VERSION"
    exit 1
fi

echo "✅ Prerequisites satisfied"
echo "   • Rust: $(rustc --version)"
echo "   • Python: $(python3 --version)"

# Install Python dependencies
echo -e "\n📦 Installing Python dependencies..."
pip install -r requirements.txt

# Build Rust components
echo -e "\n🦀 Building Rust components..."
./scripts/build_rust.sh

# Run integration tests
echo -e "\n🧪 Running integration tests..."
./scripts/test_integration.sh

# Run performance benchmarks
echo -e "\n⚡ Running performance benchmarks..."
./scripts/performance_benchmark.sh

# Final health check
echo -e "\n🏥 Final health check..."
./scripts/health_check.sh

# Success message
echo -e "\n🎉 DEPLOYMENT SUCCESSFUL!"
echo "=================================="
echo "🚀 AGENT System is ready for production!"
echo ""
echo "📋 Quick Start:"
echo "   • Import: from agent.core import AGENTCore"
echo "   • Health: ./scripts/health_check.sh"
echo "   • Monitor: ./scripts/performance_benchmark.sh"
echo ""
echo "📖 Documentation: docs/README.md"
echo "🏗️  Architecture: docs/PROJECT_STRUCTURE.md"
echo "📊 Performance: RUST_DEPLOYMENT_SUCCESS.md"
echo ""
echo "✨ System Features:"
echo "   • 🦀 Rust-accelerated performance (50-100x faster)"
echo "   • 🐍 Full Python AI/ML ecosystem compatibility"
echo "   • 🔄 Graceful fallbacks and error handling"
echo "   • 📈 Real-time performance monitoring"
echo "   • 🛡️  Memory-safe and concurrent operations"
echo ""
echo "🎯 Ready for production workloads!"
