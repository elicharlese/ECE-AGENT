#!/usr/bin/env python3
"""
AGENT Training System Health Check
"""

import os
import json
import requests
from pathlib import Path
from datetime import datetime, timedelta

def check_system_health():
    """Comprehensive health check of the training system."""
    
    health_status = {
        "timestamp": datetime.now().isoformat(),
        "components": {},
        "overall_status": "healthy"
    }
    
    # Check directories
    required_dirs = [
        "training/data_collection",
        "training/model_versions", 
        "training/monitoring",
        "training/scripts",
        ".github/workflows"
    ]
    
    for dir_path in required_dirs:
        exists = Path(dir_path).exists()
        health_status["components"][f"dir_{dir_path.replace('/', '_')}"] = {
            "status": "healthy" if exists else "missing",
            "exists": exists
        }
        if not exists:
            health_status["overall_status"] = "degraded"
    
    # Check core files
    core_files = [
        "training/model_versions/model_manager.py",
        "training/monitoring/continuous_learning.py",
        "training/data_collection/collect_interactions.py",
        "training/scripts/trigger_github_workflow.py"
    ]
    
    for file_path in core_files:
        exists = Path(file_path).exists()
        health_status["components"][f"file_{Path(file_path).name}"] = {
            "status": "healthy" if exists else "missing",
            "exists": exists
        }
        if not exists:
            health_status["overall_status"] = "degraded"
    
    # Check configuration
    config_files = [
        "training/monitoring/config.json",
        ".env.training"
    ]
    
    for config_file in config_files:
        exists = Path(config_file).exists()
        health_status["components"][f"config_{Path(config_file).name}"] = {
            "status": "healthy" if exists else "warning",
            "exists": exists
        }
    
    # Check GitHub token
    github_token = os.getenv("GITHUB_TOKEN")
    health_status["components"]["github_token"] = {
        "status": "healthy" if github_token else "warning",
        "configured": bool(github_token)
    }
    if not github_token:
        health_status["overall_status"] = "degraded"
    
    return health_status

def print_health_report(health_status):
    """Print formatted health report."""
    
    print("🔍 AGENT Training System Health Check")
    print("=" * 50)
    print(f"📅 Time: {health_status['timestamp']}")
    print(f"📊 Overall Status: {health_status['overall_status'].upper()}")
    print()
    
    for component, status in health_status["components"].items():
        icon = "✅" if status["status"] == "healthy" else "❌" if status["status"] == "missing" else "⚠️"
        print(f"{icon} {component.replace('_', ' ').title()}: {status['status']}")
    
    print()
    print("💡 Recommendations:")
    if health_status["overall_status"] != "healthy":
        missing_components = [k for k, v in health_status["components"].items() if v["status"] == "missing"]
        if missing_components:
            print("  • Re-run setup script to create missing components")
        
        if not os.getenv("GITHUB_TOKEN"):
            print("  • Set GITHUB_TOKEN for automated workflow triggering")
            print("  • Get token from: https://github.com/settings/tokens")
    else:
        print("  • System is ready for automated training!")
        print("  • Run: python training/monitoring/continuous_learning.py")

if __name__ == "__main__":
    health = check_system_health()
    print_health_report(health)
    
    # Save health report
    with open("training/health_report.json", "w") as f:
        json.dump(health, f, indent=2)
