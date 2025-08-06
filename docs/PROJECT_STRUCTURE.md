# AGENT Project Structure Overview

## 🏗️ **Core Architecture**

```
AGENT/
├── 📁 agent/                     # Core AI Agent Implementation
│   ├── core.py                   # Main agent logic
│   ├── enhanced_agent.py         # Enhanced agent capabilities
│   ├── knowledge_base_v2.py      # Knowledge management
│   ├── multi_model_router.py     # Model routing
│   ├── performance_monitor.py    # Performance tracking
│   ├── trainer.py               # Agent training
│   ├── domains/                 # Domain-specific modules
│   ├── mcp_clients/             # MCP client integrations
│   ├── self_training/           # Self-training modules
│   └── video_training/          # Video training capabilities
│
├── 📁 api/                      # API Layer
│   ├── index.py                 # Main API server
│   ├── index_clean.py           # Clean API implementation
│   ├── index_fixed.py           # Fixed API version
│   ├── index_minimal.py         # Minimal API
│   └── index_stable.py          # Stable API version
│
├── 📁 static/                   # Frontend Assets
│   ├── layouts/                 # Dynamic Layout System
│   │   ├── layout-manager.js    # Layout management
│   │   ├── chat-layout.html     # Chat interface
│   │   ├── chat.js              # Chat functionality
│   │   └── designer-layout.html # Spline Designer UI
│   ├── main-layout.html         # Main application UI
│   └── [other assets]
│
├── 📁 tests/                    # Test Suite
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── api/                     # API tests
│
├── 📁 deployment/               # Deployment Configuration
│   ├── scripts/                 # Deployment scripts
│   ├── configs/                 # Config files (Docker, Vercel)
│   └── docs/                    # Deployment documentation
│
├── 📁 demos/                    # Demonstrations
│   ├── patches/                 # Patch demonstrations
│   └── prototypes/              # Prototype implementations
│
├── 📁 scripts/                  # Utility Scripts
│   ├── deployment/              # Deployment utilities
│   ├── maintenance/             # Maintenance scripts
│   └── utilities/               # General utilities
│
├── 📁 docs/                     # Documentation
│   ├── patches/                 # Patch documentation
│   ├── batches/                 # Batch documentation
│   ├── architecture/            # Architecture docs
│   └── plan.md                  # Project plan
│
├── 📁 config/                   # Configuration Files
├── 📁 data/                     # Data Storage
├── 📁 models/                   # AI Models
├── 📁 logs/                     # Log Files
└── 📁 backup/                   # Backup & Archive
```

## 🎯 **Key Components**

### **Layout System**
- **Dynamic Layout Manager**: `/static/layouts/layout-manager.js`
- **Chat Interface**: `/static/layouts/chat-layout.html` + `chat.js`
- **Spline Designer**: `/static/layouts/designer-layout.html`
- **Main UI**: `/static/main-layout.html`

### **AI Agent Core**
- **Main Agent**: `/agent/core.py`
- **Enhanced Agent**: `/agent/enhanced_agent.py`
- **Training System**: `/agent/trainer.py`
- **Knowledge Base**: `/agent/knowledge_base_v2.py`

### **API Layer**
- **Primary Server**: `/arbitrage_server.py`
- **API Implementations**: `/api/index.py` (and variants)
- **Spline Designer API**: `/demos/patches/demo_patch7.py`

### **Testing**
- **Unit Tests**: `/tests/unit/`
- **Integration Tests**: `/tests/integration/`
- **API Tests**: `/tests/api/`

## 🔄 **Development Workflow**

1. **Layout Development**: `/static/layouts/`
2. **Agent Enhancement**: `/agent/`
3. **API Development**: `/api/` + `/arbitrage_server.py`
4. **Testing**: `/tests/`
5. **Documentation**: `/docs/`
6. **Deployment**: `/deployment/`

## 📝 **Current Status**

### ✅ **Completed**
- [x] Dynamic Layout System with modular app switching
- [x] Chat Interface with room management
- [x] Spline Designer integration (Patch 7)
- [x] WebSocket real-time communication
- [x] Comprehensive test suite
- [x] Documentation structure
- [x] Deployment configuration

### 🔄 **In Progress**
- [ ] Layout functionality implementation
- [ ] AI Agent training optimization
- [ ] Chat room real-time messaging
- [ ] Trading interface tools
- [ ] Portfolio management interface
- [ ] Analytics dashboard

### 🎯 **Next Steps**
1. Complete layout functionality for each app mode
2. Implement AI Agent training pipeline
3. Enhanced chat with AI responses
4. Trading tools integration
5. Performance optimization

## 🚀 **Quick Start**

```bash
# Start development server
python arbitrage_server.py

# Run tests
python -m pytest tests/

# Deploy
./deployment/scripts/deploy.sh
```
