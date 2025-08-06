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
