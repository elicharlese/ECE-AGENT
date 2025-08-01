# AGENT - Professional Startup Guide

## Quick Start

Choose your preferred method to run the AGENT platform:

### Method 1: Simple Bash Script (Recommended)
```bash
# Development mode (default)
./start_agent.sh

# Production mode
./start_agent.sh --prod

# Custom port
./start_agent.sh --port 8080

# Quick start (skip system checks)
./start_agent.sh --quick
```

### Method 2: Professional Python Runner
```bash
# Development mode
python run_agent.py --dev

# Production mode
python run_agent.py --prod --port 8080

# Health check only
python run_agent.py --health-check

# Verbose logging
python run_agent.py --verbose
```

### Method 3: Make Commands
```bash
# Setup and run development
make setup
make dev

# Production mode
make prod

# Quick development start
make quick

# Run with Python runner
make run
```

### Method 4: Docker Deployment
```bash
# Single container
make docker-build
make docker-run

# Full stack with monitoring
docker-compose up -d

# View logs
docker-compose logs -f agent
```

## System Requirements

- **Python 3.8+** (Required)
- **Rust/Cargo** (Optional, for performance features)
- **Node.js** (Optional, for frontend tools)
- **Git** (Optional, for version control)

## Installation Options

### Quick Install (Dependencies Only)
```bash
./start_agent.sh --install
# or
make install-deps
```

### Complete Setup (Recommended)
```bash
make setup
# or
make install  # Includes dev tools
```

### Manual Installation
```bash
# Create directories
mkdir -p logs data temp config static/uploads

# Install Python dependencies
pip install -r requirements.txt
pip install gunicorn uvicorn[standard]

# Build Rust components (optional)
cd rust && cargo build --release
```

## Configuration

The system uses `config/agent_config.json` for configuration. Key settings:

```json
{
    "server": {
        "host": "0.0.0.0",
        "port": 8000,
        "workers": 4
    },
    "agent": {
        "default_domain": "developer",
        "enable_web_search": true,
        "enable_file_upload": true
    },
    "security": {
        "cors_origins": ["*"],
        "rate_limit": "100/minute"
    }
}
```

## Available Domains

The system supports 11 specialized domains:

1. **Developer** - Code analysis, debugging, optimization
2. **Trader** - Market analysis, risk assessment
3. **Lawyer** - Contract analysis, legal research
4. **Researcher** - OSINT, threat intelligence
5. **Data Engineer** - Pipeline analysis, data quality
6. **Hacking** - Vulnerability assessment, penetration testing
7. **Network Admin** - Network monitoring, configuration
8. **Network Analyst** - Traffic analysis, performance monitoring
9. **Network Explorer** - Network discovery, research
10. **Incident Logger** - Security incident tracking
11. **Pen Tester** - Penetration testing, security evaluation

## Monitoring & Health

### Health Checks
```bash
# Built-in health check
python run_agent.py --health-check
./start_agent.sh --health-check
make health-check

# System status
make status
```

### Monitoring Services
```bash
# Start monitoring
make monitor

# View logs
make logs
tail -f logs/agent.log

# Performance monitoring
make benchmark
```

## Development Tools

### Code Quality
```bash
# Lint code
make lint

# Format code
make format

# Type checking
make type-check

# Security scan
make security-check
```

### Testing
```bash
# Run all tests
make test

# Unit tests only
make test-unit

# Integration tests
make test-integration
```

### Maintenance
```bash
# Clean build artifacts
make clean

# Clean logs
make clean-logs

# Complete reset
make reset

# Create backup
make backup
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   ./start_agent.sh --port 8080
   ```

2. **Python version too old**
   ```bash
   python3 --version  # Should be 3.8+
   ```

3. **Dependencies missing**
   ```bash
   make install-deps
   ```

4. **Rust build fails**
   ```bash
   ./start_agent.sh --no-build
   ```

### Debug Mode
```bash
# Verbose logging
python run_agent.py --verbose

# Debug in browser
# Open: http://localhost:8000/static/
# Check browser console for errors
```

### Log Locations
- Application logs: `logs/agent.log`
- Access logs: `logs/access.log`
- Error logs: `logs/error.log`

## Production Deployment

### Option 1: Direct Production
```bash
./start_agent.sh --prod --port 80
```

### Option 2: Docker Production
```bash
docker-compose -f docker-compose.yml up -d
```

### Option 3: Cloud Deployment
```bash
# Vercel
make deploy-vercel

# Heroku
make deploy-heroku
```

## Environment Variables

Create `.env` file for custom settings:
```bash
AGENT_ENV=production
AGENT_HOST=0.0.0.0
AGENT_PORT=8000
AGENT_DEBUG=false
SECRET_KEY=your-secret-key
API_KEY_REQUIRED=false
ENABLE_WEB_SEARCH=true
ENABLE_FILE_UPLOAD=true
```

## Support

For issues or questions:
1. Check the logs: `make logs`
2. Run health check: `make health-check`
3. Check system status: `make status`
4. Review configuration: `config/agent_config.json`

## Performance Tuning

### Production Settings
- Use `--prod` flag for optimized settings
- Increase workers for high load: `--workers 8`
- Enable Redis caching in docker-compose
- Use nginx reverse proxy for static files

### Memory Optimization
- Monitor with: `make monitor`
- Clean logs regularly: `make clean-logs`
- Use release build for Rust components

---

**Ready to start?** Run `./start_agent.sh` and visit http://localhost:8000/static/
