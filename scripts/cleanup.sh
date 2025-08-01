#!/bin/bash
set -e

# Cleanup script for AGENT project
echo "🧹 Cleaning up AGENT codebase..."

# Navigate to project root
cd "$(dirname "$0")/.."

echo "🗑️  Removing temporary files..."

# Remove Python cache files
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name "*.pyo" -delete 2>/dev/null || true

# Remove backup files
find . -name "*.backup" -delete 2>/dev/null || true
find . -name "*~" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Remove editor temporary files
find . -name "*.swp" -delete 2>/dev/null || true
find . -name "*.swo" -delete 2>/dev/null || true
find . -name ".vscode/settings.json.backup" -delete 2>/dev/null || true

# Clean Rust build artifacts (but keep release builds)
if [ -d "rust/target" ]; then
    echo "🦀 Cleaning Rust debug builds (keeping release)..."
    cd rust
    cargo clean --doc
    find target -name "*.rlib" -not -path "*/release/*" -delete 2>/dev/null || true
    find target -name "*.rmeta" -not -path "*/release/*" -delete 2>/dev/null || true
    cd ..
fi

# Clean empty directories
find . -type d -empty -delete 2>/dev/null || true

# Remove old log files
find . -name "*.log" -mtime +7 -delete 2>/dev/null || true

echo "✅ Cleanup completed!"

# Optional: Check for potential issues
echo "🔍 Running code quality checks..."

# Check for syntax errors
echo "📋 Checking Python syntax..."
python3 -m py_compile agent/*.py agent/domains/*.py 2>/dev/null && echo "✅ Python syntax: OK" || echo "❌ Python syntax: Issues found"

# Check imports
echo "📋 Checking for import issues..."
python3 -c "
import sys
sys.path.insert(0, '/workspaces/AGENT')

try:
    import agent.core
    import agent.rust_integration
    print('✅ Core imports: OK')
except Exception as e:
    print(f'❌ Import issues: {e}')
"

echo "🎉 Codebase cleanup completed!"
