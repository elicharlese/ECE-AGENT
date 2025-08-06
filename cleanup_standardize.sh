#!/bin/bash
# AGENT Codebase Cleanup and Standardization Script
# Comprehensive reorganization and naming standardization

echo "🧹 Starting AGENT Codebase Cleanup and Standardization..."

# Create organized directory structure
echo "📁 Creating standardized directory structure..."
mkdir -p {tests,deployment,demos,logs,backup,archive/{old_servers,documentation,legacy_api}}

# Phase 1: Move test files to tests directory
echo "📋 Organizing test files..."
mv test_*.py tests/ 2>/dev/null || echo "No test files to move"

# Phase 2: Move deployment files  
echo "🚀 Organizing deployment files..."
mv deploy*.sh deployment/ 2>/dev/null || echo "No deploy scripts to move"
mv final-deploy.sh deployment/ 2>/dev/null || echo "No final-deploy.sh to move"
mv DEPLOYMENT_SUCCESS.md deployment/ 2>/dev/null || echo "No deployment success doc to move"
mv VERCEL_DEPLOYMENT.md deployment/ 2>/dev/null || echo "No vercel deployment doc to move"

# Phase 3: Move demo files
echo "🎭 Organizing demo files..."
mv demo_*.py demos/ 2>/dev/null || echo "No demo files to move"

# Phase 4: Archive completion status files
echo "📚 Archiving completion documentation..."
mv *_COMPLETION*.md archive/documentation/ 2>/dev/null || echo "No completion docs to archive"
mv CLEANUP_STATUS.md archive/documentation/ 2>/dev/null || echo "No cleanup status to archive"

# Phase 5: Move server logs
echo "📝 Organizing logs..."
mv server.log logs/ 2>/dev/null || echo "No server logs to move"
mv *.log logs/ 2>/dev/null || echo "No additional logs to move"

# Phase 6: Archive legacy files
echo "🗄️  Archiving legacy files..."
mv enhanced_server.py archive/old_servers/ 2>/dev/null || echo "No enhanced_server.py to archive"
mv knowledge_server.py archive/old_servers/ 2>/dev/null || echo "No knowledge_server.py to archive"
mv main_legacy_backup.py archive/old_servers/ 2>/dev/null || echo "No main_legacy_backup.py to archive"

# Phase 7: Clean up API directory - keep only main index.py
echo "🔧 Cleaning up API directory..."
cd api/
if [ -f "index.py" ]; then
    echo "Main index.py exists, archiving other versions..."
    mv index_*.py ../archive/legacy_api/ 2>/dev/null || echo "No index variations to archive"
else
    echo "No main index.py found, checking for best version..."
    if [ -f "index_stable.py" ]; then
        echo "Using index_stable.py as main index.py"
        mv index_stable.py index.py
    elif [ -f "index_clean.py" ]; then
        echo "Using index_clean.py as main index.py"
        mv index_clean.py index.py
    fi
    # Archive remaining variations
    mv index_*.py ../archive/legacy_api/ 2>/dev/null || echo "No additional index variations to archive"
fi
cd ..

# Phase 8: Move documentation to proper location
echo "📖 Organizing documentation..."
mv ARBITRAGE_SYSTEM_DOCUMENTATION.md docs/ 2>/dev/null || echo "Arbitrage doc already in docs/"
mv PROJECT_STRUCTURE.md docs/ 2>/dev/null || echo "Project structure doc already in docs/"

# Phase 9: Clean up scripts
echo "🛠️  Organizing scripts..."
mkdir -p scripts/maintenance/
mv cleanup_and_reorganize.sh scripts/maintenance/ 2>/dev/null || echo "No cleanup script to move"
mv standardize_naming.sh scripts/maintenance/ 2>/dev/null || echo "No standardize script to move"

# Phase 10: Organize requirements files
echo "📦 Organizing requirements..."
mkdir -p config/requirements/
mv requirements-*.txt config/requirements/ 2>/dev/null || echo "No specialized requirements to move"

# Phase 11: Clean up __pycache__ directories
echo "🗑️  Removing Python cache files..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || echo "Cache cleanup complete"
find . -type f -name "*.pyc" -delete 2>/dev/null || echo "Pyc cleanup complete"

# Phase 12: Create project structure documentation
echo "📋 Creating updated project structure..."
cat > PROJECT_STRUCTURE_UPDATED.md << 'EOF'
# AGENT Project Structure

## Core Application
```
AGENT/
├── arbitrage_server.py          # Main FastAPI server
├── requirements.txt             # Core dependencies
├── nx.json                      # Nx workspace configuration
├── package.json                 # Node.js dependencies
├── vercel.json                  # Vercel deployment config
└── Makefile                     # Build automation
```

## Application Modules
```
agent/                           # Core AGENT modules
├── __init__.py
├── core.py                      # Core functionality
├── enhanced_agent.py            # Enhanced AI capabilities
├── auth.py                      # Authentication
├── chat_rooms.py               # Chat room management
├── room_websocket.py           # WebSocket handlers
├── arbitrage_strategies.py     # Trading strategies
├── enhanced_trading.py         # Advanced trading features
├── knowledge_base_v2.py        # Knowledge management
├── vector_memory_system.py     # Vector memory
├── performance_monitor.py      # Performance monitoring
├── security_tools.py          # Security utilities
├── trainer.py                  # AI training
├── model_manager.py           # Model management
├── multi_model_router.py      # Multi-model routing
├── script_generator.py        # Script generation
├── video_api.py               # Video processing
├── web_scraper.py             # Web scraping
└── rust_integration.py       # Rust integration
```

## API Layer
```
api/
├── index.py                    # Main API endpoints
└── test.py                     # API tests
```

## Frontend & Layouts
```
static/
└── layouts/
    ├── layout-manager.js       # Layout management
    ├── chat-layout.html       # Chat interface
    ├── chat.js                # Chat functionality
    ├── designer-layout.html   # Spline Designer UI
    └── base.css               # Base styles
```

## Documentation
```
docs/
├── README.md                   # Main documentation
├── plan.md                     # Project roadmap
├── architecture/               # Architecture docs
├── patches/                    # Patch documentation
│   └── patch-7/               # Spline Designer patch
└── batches/                   # Batch documentation
```

## Development & Testing
```
tests/                          # All test files
├── test_api.py
├── test_arbitrage_system.py
├── test_chat_api.py
├── test_enhanced_system.py
├── test_patch7.py
└── test_complete_app.py

deployment/                     # Deployment scripts
├── deploy.sh
├── deploy-check.sh
└── DEPLOYMENT_SUCCESS.md

demos/                          # Demo implementations
├── demo_patch6.py
├── demo_patch7.py
└── patches/                   # Demo patches
```

## Configuration & Data
```
config/                         # Configuration files
├── agent_config.json
├── auth_config.json
├── health_config.json
└── requirements/              # Specialized requirements

data/                          # Data storage
└── chat_rooms.db

containers/                    # Container configurations
logs/                         # Application logs
maintenance/                  # Maintenance scripts
```

## Archive & Backup
```
archive/                       # Archived files
├── old_servers/              # Legacy server files
├── documentation/            # Old documentation
└── legacy_api/              # Old API versions

backup/                       # Backup files
└── legacy/                   # Legacy backups
```

## External Dependencies
```
hummingbot-master/            # Hummingbot integration
rust/                         # Rust modules
models/                       # AI models
model_archive/               # Archived models
```
EOF

echo ""
echo "✅ Cleanup and standardization complete!"
echo ""
echo "📊 Summary of changes:"
echo "   • Organized test files into tests/"
echo "   • Consolidated deployment scripts"
echo "   • Archived legacy server files"
echo "   • Cleaned up API directory"
echo "   • Standardized documentation structure"
echo "   • Removed Python cache files"
echo "   • Created updated project structure"
echo ""
echo "📋 Next steps:"
echo "   1. Review PROJECT_STRUCTURE_UPDATED.md"
echo "   2. Verify all layouts are working correctly"
echo "   3. Test chat functionality and WebSocket connections"
echo "   4. Validate API endpoints"
echo "   5. Run comprehensive test suite"
echo ""
echo "🎯 Ready to focus on layout functionality and AGENT training!"
