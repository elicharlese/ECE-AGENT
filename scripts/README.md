#!/bin/bash
# AGENT Project Development Scripts

## Available Scripts

### 🔧 Development
- `build_rust.sh` - Build all Rust components
- `test_integration.sh` - Test Python-Rust integration
- `performance_benchmark.sh` - Run performance benchmarks
- `clean_build.sh` - Clean and rebuild everything

### 🚀 Deployment
- `deploy_local.sh` - Deploy for local development
- `deploy_production.sh` - Deploy for production
- `health_check.sh` - System health verification

### 📊 Monitoring
- `start_monitoring.sh` - Start performance monitoring
- `stop_monitoring.sh` - Stop performance monitoring
- `collect_metrics.sh` - Collect and display metrics

### 🔧 Maintenance
- `cleanup.sh` - Clean temporary files and caches
- `backup.sh` - Backup important files
- `restore.sh` - Restore from backup

## Usage
All scripts are executable and include help information:
```bash
./scripts/{script_name}.sh --help
```

## Requirements
- Rust 1.75+
- Python 3.8+
- Docker (for container operations)
- PyO3 dependencies
