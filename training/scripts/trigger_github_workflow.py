#!/usr/bin/env python3
"""
Trigger GitHub Actions workflows for AGENT training automation.
"""

import os
import json
import requests
from datetime import datetime
from typing import Dict, Any
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
