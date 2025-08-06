#!/bin/bash
# AGENT Codebase Cleanup and Reorganization Script
# This script organizes the codebase into a clean, standardized structure

echo "🧹 Starting AGENT Codebase Cleanup..."

# Create organized directory structure
echo "📁 Creating organized directory structure..."
mkdir -p tests/{unit,integration,api}
mkdir -p deployment/{scripts,configs,docs}
mkdir -p demos/{patches,prototypes}
mkdir -p logs/{server,deployment,training}
mkdir -p backup/{legacy,archive}
mkdir -p scripts/{deployment,maintenance,utilities}

# Move test files to organized test structure
echo "📋 Organizing test files..."
[ -f "test_api_endpoints.py" ] && mv test_api_endpoints.py tests/api/
[ -f "test_api.py" ] && mv test_api.py tests/api/
[ -f "test_arbitrage_system.py" ] && mv test_arbitrage_system.py tests/unit/
[ -f "test_chat_api.py" ] && mv test_chat_api.py tests/api/
[ -f "test_chat_rooms_phase1.py" ] && mv test_chat_rooms_phase1.py tests/integration/
[ -f "test_complete_app.py" ] && mv test_complete_app.py tests/integration/
[ -f "test_enhanced_system.py" ] && mv test_enhanced_system.py tests/unit/
[ -f "test_patch7.py" ] && mv test_patch7.py tests/unit/
[ -f "test_system.sh" ] && mv test_system.sh tests/integration/

# Move deployment files
echo "🚀 Organizing deployment files..."
[ -f "deploy-check.sh" ] && mv deploy-check.sh deployment/scripts/
[ -f "deploy.sh" ] && mv deploy.sh deployment/scripts/
[ -f "final-deploy.sh" ] && mv final-deploy.sh deployment/scripts/
[ -f "start_agent.sh" ] && mv start_agent.sh deployment/scripts/
[ -f "DEPLOYMENT_SUCCESS.md" ] && mv DEPLOYMENT_SUCCESS.md deployment/docs/
[ -f "VERCEL_DEPLOYMENT.md" ] && mv VERCEL_DEPLOYMENT.md deployment/docs/
[ -f "vercel.json" ] && mv vercel.json deployment/configs/
[ -f "docker-compose.yml" ] && mv docker-compose.yml deployment/configs/
[ -f "Dockerfile" ] && mv Dockerfile deployment/configs/

# Move demo and patch files
echo "🎭 Organizing demo and patch files..."
[ -f "demo_patch6.py" ] && mv demo_patch6.py demos/patches/
[ -f "demo_patch7.py" ] && mv demo_patch7.py demos/patches/
[ -f "final_status_check.py" ] && mv final_status_check.py scripts/maintenance/

# Move completion status files to archive
echo "📚 Archiving completion documentation..."
[ -f "BATCH2_PATCH4_COMPLETION.md" ] && mv BATCH2_PATCH4_COMPLETION.md backup/archive/
[ -f "PATCH2_3_COMPLETION_STATUS.md" ] && mv PATCH2_3_COMPLETION_STATUS.md backup/archive/
[ -f "CLEANUP_STATUS.md" ] && mv CLEANUP_STATUS.md backup/archive/

# Move server logs
echo "📝 Organizing logs..."
[ -f "server.log" ] && mv server.log logs/server/

# Move legacy files to backup
echo "🗄️ Archiving legacy files..."
[ -f "enhanced_server.py" ] && mv enhanced_server.py backup/legacy/
[ -f "knowledge_server.py" ] && mv knowledge_server.py backup/legacy/
[ -f "main_legacy_backup.py" ] && mv main_legacy_backup.py backup/legacy/

# Move main documentation to docs
echo "📖 Organizing documentation..."
[ -f "ARBITRAGE_SYSTEM_DOCUMENTATION.md" ] && mv ARBITRAGE_SYSTEM_DOCUMENTATION.md docs/

# Move utility scripts
echo "🔧 Organizing utility scripts..."
[ -f "run_agent.py" ] && mv run_agent.py scripts/utilities/

# Create index files for organized directories
echo "📝 Creating directory index files..."

cat > tests/README.md << 'EOF'
# Tests Directory

## Structure
- `unit/` - Unit tests for individual components
- `integration/` - Integration tests for system functionality  
- `api/` - API endpoint tests

## Running Tests
```bash
# Run all tests
python -m pytest tests/

# Run specific test category
python -m pytest tests/unit/
python -m pytest tests/integration/
python -m pytest tests/api/
```
EOF

cat > deployment/README.md << 'EOF'
# Deployment Directory

## Structure
- `scripts/` - Deployment and startup scripts
- `configs/` - Configuration files (Docker, Vercel, etc.)
- `docs/` - Deployment documentation

## Quick Start
```bash
# Deploy locally
./scripts/deploy.sh

# Check deployment status
./scripts/deploy-check.sh

# Start AGENT
./scripts/start_agent.sh
```
EOF

cat > demos/README.md << 'EOF'
# Demos Directory

## Structure
- `patches/` - Patch demonstration files
- `prototypes/` - Prototype implementations

## Patch Demos
- `demo_patch6.py` - Patch 6 implementation demo
- `demo_patch7.py` - Patch 7 Spline Designer demo
EOF

cat > scripts/README.md << 'EOF'
# Scripts Directory

## Structure
- `deployment/` - Deployment-related scripts
- `maintenance/` - System maintenance scripts
- `utilities/` - General utility scripts

## Usage
All scripts should be run from the project root directory.
EOF

echo "✅ Codebase cleanup and reorganization complete!"
echo ""
echo "📊 New Directory Structure:"
echo "├── tests/{unit,integration,api}/"
echo "├── deployment/{scripts,configs,docs}/"  
echo "├── demos/{patches,prototypes}/"
echo "├── logs/{server,deployment,training}/"
echo "├── backup/{legacy,archive}/"
echo "├── scripts/{deployment,maintenance,utilities}/"
echo "├── docs/ (documentation)"
echo "├── agent/ (core agent code)"
echo "├── api/ (API implementations)"
echo "└── static/ (frontend assets)"
echo ""
echo "🎯 Ready for development!"
