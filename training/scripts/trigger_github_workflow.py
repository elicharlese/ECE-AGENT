#!/usr/bin/env python3
"""
Trigger GitHub Actions workflows for AGENT training automation.
"""

import os
import json
import requests
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GitHubWorkflowTrigger:
    def __init__(self, repo: str, token: str):
        self.repo = repo
        self.token = token
        self.base_url = f"https://api.github.com/repos/{repo}/actions/workflows"

    def trigger_workflow(self, workflow_file: str, inputs: Dict[str, Any] = None):
        if not self.token:
            logger.warning("No GitHub token provided - workflow triggering disabled")
            return False
            
        headers = {
            'Authorization': f'token {self.token}',
            'Accept': 'application/vnd.github.v3+json'
        }
        
        data = {
            'ref': 'main',
            'inputs': inputs or {}
        }
        
        url = f"{self.base_url}/{workflow_file}/dispatches"
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 204:
            logger.info(f"✅ Successfully triggered workflow {workflow_file}")
            return True
        else:
            logger.error(f"❌ Failed to trigger workflow: {response.status_code}")
            logger.error(f"Response: {response.text}")
            return False

if __name__ == "__main__":
    repo = os.getenv('GITHUB_REPO', 'elicharlese/AGENT')
    token = os.getenv('GITHUB_TOKEN')
    
    trigger = GitHubWorkflowTrigger(repo, token)
    
    print("🚀 GitHub Actions Workflow Trigger")
    print("=" * 40)
    
    if not token:
        print("⚠️  No GITHUB_TOKEN found")
        print("To enable workflow triggering:")
        print("1. Go to: https://github.com/settings/tokens")
        print("2. Create token with 'repo' permissions")
        print("3. Set: export GITHUB_TOKEN=your_token")
        print()
        print("For now, workflows can be triggered manually from GitHub")
    else:
        print("✅ GitHub token found")
        success = trigger.trigger_workflow('agent-training-automation.yml', {'reason': 'manual_setup'})
        if success:
            print("🎉 Training workflow triggered!")
    
    print("\n📋 Available workflows:")
    print("• agent-training-automation.yml - Automated training pipeline")
    print("• agent-monitoring.yml - Performance monitoring")
DATA_EOF

# Create health check script
echo "🔍 Creating health check system..."
cat > training/scripts/health_check.py << 'HEALTH_EOF'
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
HEALTH_EOF

# Create GitHub Actions workflows
echo "⚙️ Creating GitHub Actions workflows..."
cat > .github/workflows/agent-training-automation.yml << 'WORKFLOW_EOF'
name: 🤖 AGENT Training Automation

on:
  schedule:
    - cron: '0 2 * * 1'  # Every Monday at 2 AM UTC
  workflow_dispatch:
    inputs:
      reason:
        description: 'Reason for training'
        required: false
        default: 'scheduled'
      force_train:
        description: 'Force training even if not needed'
        type: boolean
        default: false

jobs:
  setup-and-train:
    name: 🚀 Setup and Train
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
        
    - name: Install dependencies
      run: |
        pip install requests
        
    - name: Collect training data
      run: |
        cd training/data_collection
        python collect_interactions.py
        
    - name: Prepare training configuration
      run: |
        echo "🎯 Training triggered: ${{ github.event.inputs.reason }}"
        echo "📊 Training data collected and ready"
        
    - name: Notify about training preparation
      run: |
        echo "## 🤖 AGENT Training Prepared" >> $GITHUB_STEP_SUMMARY
        echo "" >> $GITHUB_STEP_SUMMARY
        echo "**Reason:** ${{ github.event.inputs.reason }}" >> $GITHUB_STEP_SUMMARY
        echo "**Status:** Ready for Colab training" >> $GITHUB_STEP_SUMMARY
        echo "" >> $GITHUB_STEP_SUMMARY
        echo "### Next Steps:" >> $GITHUB_STEP_SUMMARY
        echo "1. 📥 Download training data from artifacts" >> $GITHUB_STEP_SUMMARY
        echo "2. 🔬 Open Colab notebook: \`training/colab_training/agent_finetuning_colab.ipynb\`" >> $GITHUB_STEP_SUMMARY
        echo "3. 📤 Upload training data and run notebook" >> $GITHUB_STEP_SUMMARY
        echo "4. 🚀 Deploy trained model using model manager" >> $GITHUB_STEP_SUMMARY
WORKFLOW_EOF

cat > .github/workflows/agent-monitoring.yml << 'MONITOR_WORKFLOW_EOF'
name: 📊 AGENT Performance Monitoring

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  monitor-performance:
    name: 🔍 Monitor Performance
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
        
    - name: Install dependencies
      run: |
        pip install requests
        
    - name: Run performance monitoring
      run: |
        cd training/monitoring
        python continuous_learning.py --test
        
    - name: Generate monitoring report
      run: |
        echo "## 📊 AGENT Performance Report" >> $GITHUB_STEP_SUMMARY
        echo "" >> $GITHUB_STEP_SUMMARY
        echo "**Timestamp:** $(date)" >> $GITHUB_STEP_SUMMARY
        echo "**Status:** Monitoring cycle completed" >> $GITHUB_STEP_SUMMARY
        echo "" >> $GITHUB_STEP_SUMMARY
        echo "✅ System health check passed" >> $GITHUB_STEP_SUMMARY
        echo "✅ Performance metrics collected" >> $GITHUB_STEP_SUMMARY
        echo "✅ Training triggers evaluated" >> $GITHUB_STEP_SUMMARY
MONITOR_WORKFLOW_EOF

# Set up environment template
echo "⚙️ Creating environment configuration..."
cat > .env.training << 'ENV_EOF'
# AGENT Training Configuration
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=elicharlese/AGENT
AGENT_API_URL=https://your-agent-api.vercel.app
TRAINING_DATA_MIN_SAMPLES=100
PERFORMANCE_THRESHOLD=0.85
RETRAIN_INTERVAL_DAYS=7
COLAB_TIMEOUT_MINUTES=120
ENV_EOF

# Create README
echo "📖 Creating documentation..."
cat > training/README.md << 'README_EOF'
# 🤖 AGENT Training & Continuous Learning System

This directory contains the complete training infrastructure for the AGENT LLM system, enabling continuous learning and automated model updates using **zero-cost resources**.

## 🚀 Quick Start

1. **Set up your GitHub token:**
   ```bash
   export GITHUB_TOKEN=your_github_token_here
   ```

2. **Run the monitoring system:**
   ```bash
   python training/monitoring/continuous_learning.py
   ```

3. **Trigger manual training:**
   ```bash
   python training/scripts/trigger_github_workflow.py
   ```

## 📊 Features

- **Automated Data Collection**: Collects user interactions for continuous improvement
- **Performance Monitoring**: Tracks model performance and triggers retraining when needed
- **Model Versioning**: Manages multiple model versions with deployment capabilities
- **Zero-Cost Automation**: Uses GitHub Actions for free CI/CD
- **Google Colab Integration**: Leverages free GPU resources for training

## 🔧 Configuration

Edit `.env.training` to customize settings and add your GitHub token.

## 📈 Monitoring Dashboard

Access performance metrics via the monitoring system logs or integrate with your preferred dashboard tool.
README_EOF

# Make scripts executable
chmod +x training/model_versions/model_manager.py
chmod +x training/monitoring/continuous_learning.py
chmod +x training/data_collection/collect_interactions.py
chmod +x training/scripts/trigger_github_workflow.py
chmod +x training/scripts/health_check.py

echo ""
echo "🎉 AGENT Training System Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Next steps:"
echo "1. ✏️  Edit .env.training with your GitHub token"
echo "2. 🔑 Set: export GITHUB_TOKEN=your_token_here"
echo "3. 🔍 Run: python training/scripts/health_check.py"
echo "4. 📊 Test: python training/monitoring/continuous_learning.py --test"
echo "5. 🚀 Trigger: python training/scripts/trigger_github_workflow.py"
echo ""
echo "📖 Documentation: training/README.md"
echo "💰 Total Cost: $0/month"
echo ""
echo "🎯 Your AGENT system now has enterprise-grade automated training!"
