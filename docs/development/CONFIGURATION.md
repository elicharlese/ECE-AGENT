# AGENT Configuration Documentation

## Overview

This document describes the configuration structure and management of the AGENT system. The project uses a combination of environment variables, JSON/YAML configuration files, and build configuration files to manage its settings.

## Configuration Structure

The AGENT project follows a structured approach to configuration management:

```text
AGENT/
├── .env                 # Environment variables
├── .env.example         # Example environment variables
├── .gitignore           # Files and directories to ignore in git
├── babel.config.json    # Babel configuration for JavaScript/TypeScript transpilation
├── config/              # Centralized configuration files
│   ├── agent_config.json
│   ├── auth_config.json
│   ├── clickup_config.json
│   ├── health_config.json
│   ├── nebius_config.yaml
│   ├── docker/
│   ├── nginx/
│   └── vercel/
├── Makefile             # Build and project management configuration
├── nx.json              # Nx monorepo configuration
├── package.json         # Frontend dependencies and scripts
├── requirements.txt     # Python dependencies
├── requirements-vercel.txt # Python dependencies for Vercel deployment
├── tsconfig.base.json   # Base TypeScript configuration
└── vitest.workspace.ts  # Vitest workspace configuration
```

## Environment Configuration

### .env File

The `.env` file contains environment-specific variables that control the behavior of the application:

```bash
# Application settings
AGENT_ENV=development
AGENT_HOST=0.0.0.0
AGENT_PORT=8000
AGENT_DEBUG=true
AGENT_LOG_LEVEL=INFO

# Security
SECRET_KEY=e1437418be8428c431b25a8787b5184e32136561013ddebe4cde6cef9eb6b6ff
API_KEY_REQUIRED=false

# Features
ENABLE_WEB_SEARCH=true
ENABLE_FILE_UPLOAD=true
ENABLE_RUST_COMPONENTS=true

# Monitoring
ENABLE_METRICS=true
ENABLE_HEALTH_CHECK=true
```

### .env.example File

The `.env.example` file provides a template for the required environment variables:

```bash
# Copy this file to .env and fill in your values
AGENT_ENV=development
AGENT_HOST=0.0.0.0
AGENT_PORT=8000
SECRET_KEY=
```

## Git Configuration

### .gitignore

The `.gitignore` file specifies intentionally untracked files that Git should ignore. This includes:

- Python bytecode and cache files
- Virtual environment directories
- IDE-specific files
- OS-specific files
- Environment variable files
- Log files
- Database files
- AI model cache directories
- Docker files
- Security-related files
- Temporary files
- Node modules
- Coverage reports

## IDE Configuration

### .vscode/extensions.json

VS Code recommended extensions for the project:

```json
{
  "recommendations": ["ms-playwright.playwright", "esbenp.prettier-vscode"]
}
```

This file recommends extensions that enhance the development experience for the AGENT project:

- Playwright Test for VSCode: For end-to-end testing
- Prettier - Code formatter: For consistent code formatting

### .devcontainer/devcontainer.json

Dev container configuration for consistent development environments:

```json
{
  "image": "mcr.microsoft.com/devcontainers/universal:2",
  "features": {}
}
```

This file defines the development container configuration used by VS Code Dev Containers and GitHub Codespaces to provide a consistent development environment.

## CI/CD Configuration

### .github/workflows/ci.yml

GitHub Actions workflow for continuous integration and deployment:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read

jobs:
  build-web:
    name: Build Web App
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: '@npm'

      - name: Install dependencies
        run: npm ci

      - name: Restore Nx cache
        uses: actions/cache@v4
        with:
          path: .nx/cache
          key: nx-${{ runner.os }}-${{ hashFiles('**/package-lock.json', '**/nx.json', '**/tsconfig*.json') }}
          restore-keys: |
            nx-${{ runner.os }}-

      - name: Typecheck
        run: npx nx typecheck web || echo "Typecheck target not defined; skipping"

      - name: Test
        run: npx nx test web || echo "No tests configured; skipping"

      - name: Build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
        run: npx nx build web

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: web-dist
          path: dist/apps/web

  lint:
    name: Lint Repo
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: '@npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint (best effort)
        run: npx nx lint web || echo "Lint target not defined; skipping"

  deploy-web:
    name: Deploy Web to Vercel
    runs-on: ubuntu-latest
    needs: [build-web]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy Preview (PR)
        if: github.event_name == 'pull_request'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: .
          alias-domains: ''
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Production (main)
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: .
          vercel-args: '--prod'
          alias-domains: ''
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

This workflow defines three jobs:

1. **build-web**: Builds the web application with Nx, runs type checking and tests, and uploads the build artifact
2. **lint**: Runs linting on the repository
3. **deploy-web**: Deploys the web application to Vercel, with different behavior for PRs (preview) and main branch pushes (production)

The workflow uses caching for faster builds and requires several secrets to be configured in the repository settings:

- `VERCEL_TOKEN`: Vercel authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `VITE_API_URL`: API URL for the frontend application

## Docker Configuration

### config/docker/Dockerfile

Dockerfile for the AGENT application:

```dockerfile
# AGENT - Advanced AI Multi-Domain Platform
# Production Docker Configuration

FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    AGENT_ENV=production \
    AGENT_PORT=8000

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        git \
        build-essential \
        pkg-config \
        libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Rust (for performance components)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Create non-root user
RUN useradd --create-home --shell /bin/bash agent
USER agent
WORKDIR /home/agent/app

# Copy requirements first for better caching
COPY --chown=agent:agent requirements*.txt ./

# Upgrade pip and install Python dependencies
RUN python -m pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && if [ -f requirements-vercel.txt ]; then pip install --no-cache-dir -r requirements-vercel.txt; fi \
    && pip install --no-cache-dir gunicorn uvicorn[standard]

# Copy project files
COPY --chown=agent:agent . .

# Build Rust components
RUN if [ -d "rust" ]; then \
        cd rust && cargo build --release; \
    fi

# Create necessary directories
RUN mkdir -p logs data temp static/uploads

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start command
CMD ["python", "run_agent.py", "--prod", "--host", "0.0.0.0", "--port", "8000"]
```

This Dockerfile creates a production-ready container for the AGENT application with:

- Python 3.11 slim base image
- Non-root user for security
- System dependencies for building Python packages
- Rust installation for performance components
- Proper caching of requirements
- Health check endpoint
- Volume support for data, logs, and uploads

### config/docker/docker-compose.yml

Docker Compose configuration for the full AGENT stack:

```yaml
version: '3.8'

services:
  # Main AGENT application
  agent:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: agent-app
    ports:
      - "8000:8000"
    environment:
      - AGENT_ENV=production
      - AGENT_HOST=0.0.0.0
      - AGENT_PORT=8000
      - DATABASE_URL=postgresql://agent:agent123@postgres:5432/agent_db
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - agent_data:/home/agent/app/data
      - agent_logs:/home/agent/app/logs
      - agent_uploads:/home/agent/app/static/uploads
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - agent-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  # PostgreSQL database
  postgres:
    image: postgres:15-alpine
    container_name: agent-postgres
    environment:
      - POSTGRES_DB=agent_db
      - POSTGRES_USER=agent
      - POSTGRES_PASSWORD=agent123
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init_db.sql:/docker-entrypoint-initdb.d/init_db.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - agent-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U agent -d agent_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis cache
  redis:
    image: redis:7-alpine
    container_name: agent-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - agent-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: agent-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
      - agent_static:/var/www/static:ro
    depends_on:
      - agent
    restart: unless-stopped
    networks:
      - agent-network

  # Monitoring with Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: agent-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./config/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    networks:
      - agent-network

  # Grafana dashboard
  grafana:
    image: grafana/grafana:latest
    container_name: agent-grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana_data:/var/lib/grafana
      - ./config/grafana:/etc/grafana/provisioning
    depends_on:
      - prometheus
    restart: unless-stopped
    networks:
      - agent-network

  # Log aggregation with Loki
  loki:
    image: grafana/loki:latest
    container_name: agent-loki
    ports:
      - "3100:3100"
    volumes:
      - ./config/loki.yml:/etc/loki/local-config.yaml:ro
      - loki_data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    restart: unless-stopped
    networks:
      - agent-network

  # Log collection with Promtail
  promtail:
    image: grafana/promtail:latest
    container_name: agent-promtail
    volumes:
      - ./config/promtail.yml:/etc/promtail/config.yml:ro
      - agent_logs:/var/log/agent:ro
      - /var/log:/var/log:ro
    command: -config.file=/etc/promtail/config.yml
    depends_on:
      - loki
    restart: unless-stopped
    networks:
      - agent-network

volumes:
  agent_data:
    driver: local
  agent_logs:
    driver: local
  agent_uploads:
    driver: local
  agent_static:
    driver: local
  postgres_data:
    driver: local
  redis_data:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local
  loki_data:
    driver: local

networks:
  agent-network:
    driver: bridge
    ipam:
```

This docker-compose.yml file defines a complete stack for the AGENT application including:

- The main AGENT application service
- PostgreSQL database
- Redis cache
- Nginx reverse proxy
- Prometheus monitoring
- Grafana dashboard
- Loki log aggregation
- Promtail log collection

### .vercelignore

Vercel ignore file for excluding files from deployment:

```gitignore
# Build artifacts and cache
rust/target/
target/
*.d
*.rlib
*.so
*.dylib
*.dll
.cargo/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Local data and logs
logs/
*.log
*.db
*.sqlite
*.sqlite3
agent_knowledge.db
models/
model_archive/
*.pkl
*.model

# Development and testing
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.pytest_cache/
.coverage
htmlcov/
.tox/
.nox/
.cache
nosetests.xml
coverage.xml
*.cover
.hypothesis/

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# Git
.git/
.gitignore

# Documentation source (keep compiled docs)
docs/batches/
docs/patches/

# Large dependencies that can be installed on deploy
node_modules/
.npm/
.yarn/

# Temporary files
tmp/
temp/
*.tmp
*.temp

# System files
.dockerignore
Dockerfile
docker-compose.yml
Makefile
*.sh
test_*.py
*_test.py
benchmark_*.py
performance_*.py

# Rust source (keep only compiled libraries if needed)
rust/*/src/
```

This file specifies which files and directories should be excluded from Vercel deployments.

## Vercel Configuration

### config/vercel/vercel.json

Vercel configuration file:

```json
{
  "version": 2,
  "buildCommand": "npx nx build web",
  "outputDirectory": "dist/apps/web",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "@VITE_API_URL"
  },
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This file configures the Vercel deployment with:

- Version 2 of the Vercel platform
- Build command using Nx to build the web application
- Output directory for the built application
- Vite framework specification
- Environment variable for the API URL
- Rewrite rules for SPA routing

## Additional Configuration Files

### config/agent_config.json

Main configuration file for the AGENT application:

```json
{
    "server": {
        "host": "0.0.0.0",
        "port": 8000,
        "workers": 4,
        "timeout": 120,
        "max_request_size": "100MB",
        "reload": true,
        "debug": true
    },
    "agent": {
        "default_domain": "developer",
        "max_context_length": 4000,
        "temperature": 0.7,
        "enable_web_search": true,
        "enable_memory": true,
        "enable_file_upload": true,
        "max_file_size": "50MB",
        "allowed_file_types": [
            ".txt", ".md", ".py", ".js", ".ts", ".json", ".yaml", ".yml",
            ".csv", ".xml", ".log", ".sql", ".sh", ".bat", ".dockerfile",
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"
        ]
    },
    "domains": {
        "developer": {
            "enabled": true,
            "tools": ["code_analysis", "debugging", "performance_optimization"],
            "language_support": ["python", "javascript", "typescript", "rust", "go", "java", "c++"]
        },
        "trader": {
            "enabled": true,
            "tools": ["market_analysis", "risk_assessment", "portfolio_optimization"],
            "data_sources": ["yahoo_finance", "alpha_vantage", "quandl"]
        },
        "lawyer": {
            "enabled": true,
            "tools": ["contract_analysis", "legal_research", "compliance_check"],
            "specializations": ["corporate", "intellectual_property", "privacy"]
        },
        "researcher": {
            "enabled": true,
            "tools": ["osint", "threat_intelligence", "data_correlation"],
            "search_engines": ["google", "bing", "shodan", "censys"]
        },
        "data_engineer": {
            "enabled": true,
            "tools": ["pipeline_analysis", "data_quality", "query_optimization"],
            "platforms": ["spark", "kafka", "airflow", "dbt"]
        },
        "hacking": {
            "enabled": true,
            "tools": ["vulnerability_assessment", "penetration_testing", "exploit_analysis"],
            "frameworks": ["metasploit", "nmap", "burp_suite", "owasp_zap"]
        },
        "network_admin": {
            "enabled": true,
            "tools": ["network_monitoring", "configuration_management", "troubleshooting"],
            "protocols": ["tcp", "udp", "http", "https", "dns", "dhcp"]
        },
        "network_analyst": {
            "enabled": true,
            "tools": ["traffic_analysis", "performance_monitoring", "security_analysis"],
            "analysis_tools": ["wireshark", "tcpdump", "netstat", "iptables"]
        },
        "clickup": {
            "enabled": true,
            "tools": ["task_management", "project_planning", "team_collaboration"],
            "integrations": ["api_v2"],
            "features": ["create_tasks", "update_tasks", "get_tasks", "manage_lists"]
        }
    },
    "security": {
        "cors_origins": ["*"],
        "rate_limit": "100/minute",
        "api_key_required": false,
        "session_timeout": 3600,
        "max_login_attempts": 5,
        "enable_2fa": false,
        "secure_headers": true,
        "content_security_policy": true
    },
    "monitoring": {
        "enable_metrics": true,
        "enable_health_check": true,
        "enable_performance_tracking": true,
        "log_level": "INFO",
        "log_format": "json",
        "log_rotation": {
            "max_size": "100MB",
            "backup_count": 5
        },
        "metrics_port": 9090,
        "health_check_interval": 30
    },
    "rust": {
        "build_release": true,
        "enable_performance_monitor": true,
        "enable_security_tools": true,
        "enable_container_orchestrator": true,
        "optimization_level": "3"
    },
    "database": {
        "type": "sqlite",
        "url": "sqlite:///data/agent.db",
        "pool_size": 10,
        "max_overflow": 20,
        "pool_timeout": 30,
        "backup_enabled": true,
        "backup_interval": "24h"
    },
    "cache": {
        "type": "memory",
        "max_size": "500MB",
        "ttl": 3600,
        "cleanup_interval": 300
    },
    "features": {
        "experimental": {
            "ai_code_generation": true,
            "voice_commands": false,
            "advanced_analytics": true,
            "multi_agent_collaboration": false
        },
        "integrations": {
            "github": true,
            "slack": false,
            "discord": false,
            "email": false
        }
    },
    "ui": {
        "theme": "dark",
        "sidebar_collapsed": false,
        "auto_save": true,
        "keyboard_shortcuts": true,
        "notifications": {
            "position": "top-right",
            "timeout": 5000,
            "sound": false
        }
    },
    "development": {
        "hot_reload": true,
        "debug_mode": true,
        "profiling": false,
        "test_mode": false,
        "mock_external_apis": false
    },
    "production": {
        "hot_reload": false,
        "debug_mode": false,
        "profiling": true,
        "compression": true,
        "static_file_caching": true,
        "ssl_enabled": false,
        "ssl_cert_path": "",
        "ssl_key_path": ""
    }
}
```

This file contains the main configuration for the AGENT application, including server settings, agent settings, domain configurations, security settings, monitoring settings, database settings, cache settings, feature flags, UI settings, and environment-specific settings.

### config/auth_config.json

Authentication configuration file:

```json
{
  "users": {
    "admin": {
      "password_hash": "3d9cf57702c1ac89e448ff7fa24b4cbac3e861c99cd3006e7892f74ce7c09c9d:0a5f11f109b0f474134d636f34ee18133d8d7843954965afd0b281e2fa92a15e",
      "role": "admin",
      "created_at": "2025-08-01T23:05:44.015215",
      "last_login": null,
      "permissions": [
        "admin_panel",
        "model_training",
        "user_management",
        "system_config",
        "security_tools",
        "container_management"
      ]
    }
  },
  "session_timeout": 3600,
  "last_updated": "2025-08-01T23:05:44.015309"
}
```

This file contains user authentication information and session settings.

### config/clickup_config.json

ClickUp integration configuration file:

```json
{
  "api_base_url": "https://api.clickup.com/api/v2",
  "api_key": "YOUR_CLICKUP_API_KEY_HERE",
  "default_space_id": "",
  "default_folder_id": "",
  "default_list_id": "",
  "timeout": 30,
  "max_retries": 3
}
```

This file contains configuration for integrating with the ClickUp API.

### config/health_config.json

Health monitoring configuration file:

```json
{
  "base_url": "https://agent-ece.vercel.app",
  "check_interval": 60,
  "alert_thresholds": {
    "response_time_ms": 5000,
    "cpu_percent": 80,
    "memory_percent": 85,
    "disk_percent": 90,
    "error_rate_percent": 5,
    "uptime_hours": 24
  },
  "notifications": {
    "email": {
      "enabled": false,
      "smtp_server": "smtp.gmail.com",
      "smtp_port": 587,
      "username": "your-email@gmail.com",
      "password": "your-app-password",
      "recipients": ["admin@yourcompany.com"]
    },
    "webhook": {
      "enabled": false,
      "url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
      "headers": {
        "Content-Type": "application/json"
      }
    },
    "discord": {
      "enabled": false,
      "webhook_url": "https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK"
    }
  },
  "endpoints_to_check": [
    "/health",
    "/agent/status",
    "/",
    "/knowledge/vulnerabilities",
    "/containers/templates",
    "/security/system-stats",
    "/admin/status"
  ],
  "performance_benchmarks": {
    "ai_response_time_ms": 3000,
    "database_query_time_ms": 500,
    "api_response_time_ms": 1000
  },
  "auto_recovery": {
    "enabled": true,
    "max_restart_attempts": 3,
    "restart_cooldown_minutes": 5
  }
}
```

This file contains configuration for health monitoring and alerting.

### config/nebius_config.yaml

Nebius AI Studio integration configuration file:

```yaml
# Nebius Prompt Presets API Configuration
# Configuration for AGENT LLM system integration with Nebius AI Studio

nebius:
  # API Configuration
  api_key: "${NEBIUS_API_KEY}"  # Set via environment variable
  base_url: "https://api.studio.nebius.com"
  public_backend_url: "https://api.studio.nebius.com/v1"
  timeout_seconds: 30
  max_retries: 3
  
  # Model Configuration
  default_model: "deepseek-ai/DeepSeek-V3-0324-fast"
  fallback_model: "meta-llama/Llama-3.3-70B-Instruct"
  
  # Integration Settings
  use_nebius_presets: true
  fallback_to_local: true
  preset_cache_ttl: 3600  # 1 hour
  auto_create_presets: true
  
  # Mode-Specific Model Preferences
  mode_models:
    design: "deepseek-ai/DeepSeek-V3-0324-fast"
    security: "meta-llama/Llama-3.3-70B-Instruct"
    development: "deepseek-ai/DeepSeek-V3-0324-fast"
    analysis: "meta-llama/Llama-3.3-70B-Instruct"
    communication: "deepseek-ai/DeepSeek-V3-0324-fast"
    automation: "meta-llama/Llama-3.3-70B-Instruct"
    research: "meta-llama/Llama-3.3-70B-Instruct"
    reasoning: "meta-llama/Llama-3.3-70B-Instruct"
    creative: "deepseek-ai/DeepSeek-V3-0324-fast"
    educational: "deepseek-ai/DeepSeek-V3-0324-fast"
    diagnostic: "meta-llama/Llama-3.3-70B-Instruct"
    optimization: "meta-llama/Llama-3.3-70B-Instruct"

# Local Backend Configuration
local_backend:
  python:
    enabled: true
    host: "localhost"
    port: 8000
    timeout: 30
    pool_size: 10
    
  rust:
    enabled: true
    host: "localhost"
    port: 8001
    timeout: 15
    workers: 4

# Enhanced LLM Configuration
enhanced_llm:
  # Processing Strategy
  processing_strategy: "hybrid"  # "nebius_first", "local_first", "hybrid"
  
  # Performance Settings
  concurrent_requests: 10
  request_timeout: 60
  retry_attempts: 3
  
  # Caching
  enable_response_cache: true
  cache_ttl: 1800  # 30 minutes
  max_cache_size: 1000
  
  # Monitoring
  enable_metrics: true
  log_level: "INFO"
  performance_tracking: true

# Prompt Preset Templates
preset_templates:
  system_prompt_prefix: |
    You are an expert AI assistant specialized in {mode} tasks. 
    You have access to comprehensive knowledge and training in this domain.
    Always provide accurate, helpful, and detailed responses.
    
  user_prompt_template: |
    {mode_context}
    
    User Request: {user_input}
    
    Please provide a comprehensive response that includes:
    1. Direct answer to the request
    2. Relevant context and background
    3. Practical recommendations
    4. Best practices and considerations
    
    Context: {context}

# Quality Assurance
quality_assurance:
  min_confidence_score: 0.7
  enable_response_validation: true
  max_response_length: 4000
  require_structured_output: false
  
# Security Settings
security:
  api_key_rotation_days: 90
  enable_request_logging: true
  sanitize_logs: true
  rate_limiting:
    requests_per_minute: 60
    burst_limit: 10

# Development Settings
development:
  debug_mode: false
  mock_api_calls: false
  test_mode: false
  verbose_logging: false
```

This file contains configuration for integrating with Nebius AI Studio, including API settings, model preferences, local backend configuration, enhanced LLM configuration, prompt templates, quality assurance settings, security settings, and development settings.

## Environment Variables

### .env

Environment configuration file:

```bash
# AGENT Environment Configuration
AGENT_ENV=development
AGENT_HOST=0.0.0.0
AGENT_PORT=8000
AGENT_DEBUG=true
AGENT_LOG_LEVEL=INFO

# Security
SECRET_KEY=e1437418be8428c431b25a8787b5184e32136561013ddebe4cde6cef9eb6b6ff
API_KEY_REQUIRED=false

# Features
ENABLE_WEB_SEARCH=true
ENABLE_FILE_UPLOAD=true
ENABLE_RUST_COMPONENTS=true

# Monitoring
ENABLE_METRICS=true
ENABLE_HEALTH_CHECK=true
```

This file contains environment variables for configuring the AGENT application, including server settings, security settings, feature flags, and monitoring settings.

## IDE and Development Environment Configuration

### VS Code Extensions (.vscode/extensions.json)

VS Code recommended extensions:

```json
{
  "recommendations": ["ms-playwright.playwright", "esbenp.prettier-vscode"]
}
```

This file contains recommended VS Code extensions for the project.

### Dev Container Configuration (.devcontainer/devcontainer.json)

Dev container configuration:

```json
{
  "image": "mcr.microsoft.com/devcontainers/universal:2",
  "features": {}
}
```

This file contains the dev container configuration for consistent development environments.

## Build and Deployment Configuration

### Makefile

The Makefile provides a comprehensive set of commands for managing the AGENT project:

```makefile
# AGENT - Advanced AI Multi-Domain Platform
# Professional Makefile for project management

# Variables
PYTHON := python3
PIP := $(PYTHON) -m pip
PROJECT_ROOT := $(shell pwd)
VENV_DIR := venv
RUST_DIR := rust

# Colors
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

# Help target
.PHONY: help
help: ## Show this help message
    @echo -e "$(BLUE)AGENT - Advanced AI Multi-Domain Platform$(NC)"
    @echo ""
    @echo "Available targets:"
    @awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Setup targets
.PHONY: setup
setup: ## Initial project setup
    @echo -e "$(BLUE)Setting up AGENT project...$(NC)"
    @$(MAKE) create-dirs
    @$(MAKE) install-deps
    @$(MAKE) build-rust
    @echo -e "$(GREEN)✓ Setup complete!$(NC)"

.PHONY: create-dirs
create-dirs: ## Create necessary directories
    @echo -e "$(YELLOW)Creating directories...$(NC)"
    @mkdir -p logs data temp config static/uploads
    @echo -e "$(GREEN)✓ Directories created$(NC)"

.PHONY: install-deps
install-deps: ## Install Python dependencies
    @echo -e "$(YELLOW)Installing Python dependencies...$(NC)"
    @$(PIP) install --upgrade pip
    @$(PIP) install -r requirements.txt
    @if [ -f requirements-vercel.txt ]; then $(PIP) install -r requirements-vercel.txt; fi
    @$(PIP) install gunicorn uvicorn[standard]
    @echo -e "$(GREEN)✓ Dependencies installed$(NC)"

.PHONY: build-rust
build-rust: ## Build Rust components
    @echo -e "$(YELLOW)Building Rust components...$(NC)"
    @if [ -d "$(RUST_DIR)" ] && command -v cargo >/dev/null 2>&1; then \
        cd $(RUST_DIR) && cargo build --release; \
        echo -e "$(GREEN)✓ Rust components built$(NC)"; \
    else \
        echo -e "$(YELLOW)⚠ Rust not available, skipping$(NC)"; \
	fi

# Development targets
.PHONY: dev
dev: ## Start development server
    @echo -e "$(BLUE)Starting AGENT in development mode...$(NC)"
    @./start_agent.sh --dev

.PHONY: prod
prod: ## Start production server
    @echo -e "$(BLUE)Starting AGENT in production mode...$(NC)"
	@./start_agent.sh --prod

.PHONY: quick
quick: ## Quick start (skip checks)
    @echo -e "$(BLUE)Quick starting AGENT...$(NC)"
	@./start_agent.sh --quick

.PHONY: run
run: ## Run with Python runner
    @echo -e "$(BLUE)Running AGENT with Python runner...$(NC)"
    @$(PYTHON) run_agent.py --dev

# Testing targets
.PHONY: test
test: ## Run all tests
    @echo -e "$(YELLOW)Running tests...$(NC)"
    @if [ -d "tests" ]; then \
        $(PYTHON) -m pytest tests/ -v; \
    else \
        echo -e "$(YELLOW)⚠ No tests directory found$(NC)"; \
	fi

.PHONY: test-unit
test-unit: ## Run unit tests
    @echo -e "$(YELLOW)Running unit tests...$(NC)"
    @$(PYTHON) -m pytest tests/unit/ -v

.PHONY: test-integration
test-integration: ## Run integration tests
    @echo -e "$(YELLOW)Running integration tests...$(NC)"
    @$(PYTHON) -m pytest tests/integration/ -v

.PHONY: health-check
health-check: ## Run health check
    @echo -e "$(YELLOW)Running health check...$(NC)"
    @$(PYTHON) run_agent.py --health-check

# Code quality targets
.PHONY: lint
lint: ## Run linting
    @echo -e "$(YELLOW)Running linting...$(NC)"
    @if command -v flake8 >/dev/null 2>&1; then \
        flake8 agent/ api/ --max-line-length=100; \
    else \
        echo -e "$(YELLOW)⚠ flake8 not available$(NC)"; \
	fi

.PHONY: format
format: ## Format code
    @echo -e "$(YELLOW)Formatting code...$(NC)"
    @if command -v black >/dev/null 2>&1; then \
        black agent/ api/ --line-length=100; \
    else \
        echo -e "$(YELLOW)⚠ black not available$(NC)"; \
	fi

.PHONY: type-check
type-check: ## Run type checking
    @echo -e "$(YELLOW)Running type check...$(NC)"
    @if command -v mypy >/dev/null 2>&1; then \
        mypy agent/ api/; \
    else \
        echo -e "$(YELLOW)⚠ mypy not available$(NC)"; \
	fi

# Maintenance targets
.PHONY: clean
clean: ## Clean build artifacts
    @echo -e "$(YELLOW)Cleaning build artifacts...$(NC)"
    @find . -type f -name "*.pyc" -delete
    @find . -type d -name "__pycache__" -delete
    @rm -rf .pytest_cache/
    @rm -rf *.egg-info/
    @rm -rf build/
    @rm -rf dist/
    @if [ -d "$(RUST_DIR)" ]; then cd $(RUST_DIR) && cargo clean; fi
    @echo -e "$(GREEN)✓ Cleaned$(NC)"

.PHONY: clean-logs
clean-logs: ## Clean log files
    @echo -e "$(YELLOW)Cleaning log files...$(NC)"
    @rm -rf logs/*.log
    @echo -e "$(GREEN)✓ Logs cleaned$(NC)"

.PHONY: reset
reset: clean ## Reset project (clean + remove generated files)
    @echo -e "$(YELLOW)Resetting project...$(NC)"
    @rm -rf data/
    @rm -rf temp/
    @rm -f agent.pid
    @rm -f .env
    @echo -e "$(GREEN)✓ Project reset$(NC)"

# Docker targets
.PHONY: docker-build
docker-build: ## Build Docker image
    @echo -e "$(YELLOW)Building Docker image...$(NC)"
    @docker build -t agent:latest .

.PHONY: docker-run
docker-run: ## Run Docker container
    @echo -e "$(BLUE)Running Docker container...$(NC)"
    @docker run -p 8000:8000 -it agent:latest

# Documentation targets
.PHONY: docs
docs: ## Generate documentation
    @echo -e "$(YELLOW)Generating documentation...$(NC)"
    @if command -v sphinx-build >/dev/null 2>&1; then \
        sphinx-build -b html docs/ docs/_build/; \
    else \
        echo -e "$(YELLOW)⚠ Sphinx not available$(NC)"; \
	fi

# Deployment targets
.PHONY: deploy-vercel
deploy-vercel: ## Deploy to Vercel
    @echo -e "$(BLUE)Deploying to Vercel...$(NC)"
	@vercel --prod

.PHONY: deploy-heroku
deploy-heroku: ## Deploy to Heroku
    @echo -e "$(BLUE)Deploying to Heroku...$(NC)"
	@git push heroku main

# Monitoring targets
.PHONY: monitor
monitor: ## Start monitoring services
    @echo -e "$(BLUE)Starting monitoring...$(NC)"
    @$(PYTHON) scripts/health_monitor.py &
    @$(PYTHON) scripts/performance_monitor.py &

.PHONY: logs
logs: ## Show application logs
    @echo -e "$(YELLOW)Showing logs...$(NC)"
	@tail -f logs/agent.log

.PHONY: status
status: ## Show system status
    @echo -e "$(BLUE)System Status:$(NC)"
	@echo "Python: $(shell $(PYTHON) --version)"
	@echo "Pip: $(shell $(PIP) --version)"
    @if command -v cargo >/dev/null 2>&1; then echo "Rust: $(shell cargo --version)"; fi
    @if command -v node >/dev/null 2>&1; then echo "Node: $(shell node --version)"; fi
    @if command -v git >/dev/null 2>&1; then echo "Git: $(shell git --version)"; fi
	@echo "Project Root: $(PROJECT_ROOT)"

# Backup targets
.PHONY: backup
backup: ## Create project backup
    @echo -e "$(YELLOW)Creating backup...$(NC)"
	@tar -czf "agent-backup-$(shell date +%Y%m%d-%H%M%S).tar.gz" \
		--exclude=venv \
		--exclude=__pycache__ \
		--exclude=.git \
		--exclude=target \
		--exclude=node_modules \
		.
    @echo -e "$(GREEN)✓ Backup created$(NC)"

# Update targets
.PHONY: update
update: ## Update dependencies
    @echo -e "$(YELLOW)Updating dependencies...$(NC)"
    @$(PIP) install --upgrade -r requirements.txt
    @if [ -d "$(RUST_DIR)" ]; then cd $(RUST_DIR) && cargo update; fi
    @echo -e "$(GREEN)✓ Dependencies updated$(NC)"

# Security targets
.PHONY: security-check
security-check: ## Run security checks
    @echo -e "$(YELLOW)Running security checks...$(NC)"
    @if command -v bandit >/dev/null 2>&1; then \
        bandit -r agent/ api/; \
    else \
        echo -e "$(YELLOW)⚠ bandit not available$(NC)"; \
	fi

# Performance targets
.PHONY: benchmark
benchmark: ## Run performance benchmarks
    @echo -e "$(YELLOW)Running benchmarks...$(NC)"
    @$(PYTHON) scripts/performance_benchmark.sh

# Database targets
.PHONY: db-init
db-init: ## Initialize database
    @echo -e "$(YELLOW)Initializing database...$(NC)"
    @$(PYTHON) -c "from agent.core import initialize_db; initialize_db()"
    @echo -e "$(GREEN)✓ Database initialized$(NC)"

.PHONY: db-migrate
db-migrate: ## Run database migrations
    @echo -e "$(YELLOW)Running database migrations...$(NC)"
    @echo -e "$(YELLOW)⚠ Migrations not yet implemented$(NC)"

# Install development tools
.PHONY: install-dev-tools
install-dev-tools: ## Install development tools
    @echo -e "$(YELLOW)Installing development tools...$(NC)"
    @$(PIP) install black flake8 mypy pytest bandit sphinx
    @echo -e "$(GREEN)✓ Development tools installed$(NC)"

# All-in-one targets
.PHONY: install
install: setup install-dev-tools ## Complete installation
    @echo -e "$(GREEN)✓ Complete installation finished!$(NC)"

.PHONY: ci
ci: lint type-check test security-check ## Run CI pipeline
    @echo -e "$(GREEN)✓ CI pipeline completed!$(NC)"
```

The Makefile provides a comprehensive set of commands for managing the AGENT project, including setup, development, testing, code quality, maintenance, deployment, monitoring, and security targets.

## Build and Transpilation Configuration

### babel.config.json

Babel configuration for JavaScript/TypeScript transpilation:

```json
{
  "babelrcRoots": ["*"]
}
```

### tsconfig.base.json

Base TypeScript configuration that defines compiler options and path mappings:

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2015",
    "module": "esnext",
    "lib": ["es2020", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@libs/ui": ["libs/ui/src/index.ts"],
      "@libs/*": ["libs/*", "libs/*/src"],
      "@apps/*": ["apps/*"]
    }
  },
  "exclude": ["node_modules", "tmp"]
}
```

### .prettierrc

Prettier configuration for code formatting:

```json
{
  "singleQuote": true
}
```

## Dependency Management

### requirements.txt

Main Python dependencies for the project:

```text
fastapi==0.104.1
uvicorn==0.24.0
requests==2.31.0
```

### requirements-vercel.txt

Python dependencies specifically for Vercel deployment:

```text
fastapi==0.104.1
uvicorn==0.24.0
strawberry-graphql==0.215.1
aiosqlite==0.19.0
httpx==0.25.2
python-multipart==0.0.6
pydantic>=2.4.0
jinja2>=3.1.0
```

## Centralized Configuration Files

The `config/` directory contains JSON and YAML files that store application-specific settings:

### agent_config.json

Main application configuration including domains, tools, and system settings.

### auth_config.json

Authentication and authorization settings including session management and permissions.

### clickup_config.json

Configuration for ClickUp integration including API keys and team settings.

### health_config.json

Health monitoring configuration including check intervals and alerting settings.

### nebius_config.yaml

Configuration for Nebius AI Cloud services including model endpoints and authentication.

## Build Configuration

### Makefile

The `Makefile` provides commands for project setup, development, testing, and deployment:

```bash
# Setup project
make setup

# Development server
make dev

# Production server
make prod

# Run tests
make test

# Code quality checks
make lint
make format
make type-check
```

### package.json

Frontend dependencies and scripts:

```json
{
  "scripts": {
    "start": "uvicorn api/index:app --host 0.0.0.0 --port 8000",
    "dev": "uvicorn api/index:app --host 0.0.0.0 --port 8000 --reload",
    "build": "tsc && webpack"
  }
}
```

### nx.json

Nx monorepo configuration for managing the frontend applications and libraries.

## Configuration Management Best Practices

1. **Environment Variables**
   - Use `.env` for environment-specific settings
   - Never commit sensitive values to version control
   - Use `.env.example` to document required variables

2. **Configuration Files**
   - Store application settings in the `config/` directory
   - Use JSON for structured data and YAML for hierarchical configurations
   - Keep configuration files well-documented with comments

3. **Build Configuration**
   - Use the `Makefile` for project-level commands
   - Keep `package.json` scripts simple and delegate complexity to build tools
   - Maintain consistent naming conventions across configuration files

4. **Security**
   - Rotate secrets regularly
   - Use different keys for different environments
   - Audit configuration files for sensitive information before committing

## Adding New Configuration

To add new configuration settings:

1. For environment-specific settings, add to `.env` and `.env.example`
2. For application settings, create a new file in the `config/` directory
3. For build settings, modify the `Makefile` or appropriate build configuration file
4. Document the new configuration in this file

## Configuration in Different Environments

### Development

- `AGENT_ENV=development`
- Debug mode enabled
- Development server with hot reloading

### Production

- `AGENT_ENV=production`
- Debug mode disabled
- Optimized build settings
- Production database connections

### Testing

- `AGENT_ENV=testing`
- In-memory databases
- Test-specific configurations
