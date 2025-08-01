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
