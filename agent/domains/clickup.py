"""
ClickUp Domain Agent

This module provides integration with ClickUp API for task management.
"""

import json
import requests
from typing import Dict, List, Optional, Any
from pathlib import Path
from ..base_classes import EnhancedAgentBase


class ClickUpAgent(EnhancedAgentBase):
    """Domain agent for ClickUp task management integration."""
    
    def __init__(self):
        """Initialize ClickUp agent with configuration."""
        super().__init__("clickup")
        
        # Load configuration
        config_path = Path(__file__).parent.parent.parent / "config" / "clickup_config.json"
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        self.api_key = self.config.get('api_key')
        self.base_url = self.config.get('api_base_url')
        self.headers = {
            'Authorization': self.api_key,
            'Content-Type': 'application/json'
        }
    
    def setup_domain_tools(self):
        """Setup ClickUp-specific tools"""
        self.tool_registry.register_tool(
            name="clickup_task_manager",
            description="Manage tasks in ClickUp",
            function=self._manage_tasks,
            parameters={"action": "str", "task_data": "dict"},
            required_params=["action"]
        )
    
    def setup_domain_knowledge(self):
        """Setup ClickUp domain knowledge"""
        self.knowledge_base = {
            "task_management": ["create", "update", "delete", "list", "get"],
            "entities": ["tasks", "lists", "folders", "spaces", "goals"],
            "api_endpoints": ["/task", "/list", "/folder", "/space"]
        }
    
    def _manage_tasks(self, action: str, task_data: Dict = None) -> Dict:
        """Internal method to manage tasks based on action"""
        task_data = task_data or {}
        
        if action == "create":
            return self.create_task(
                task_data.get("list_id", ""),
                task_data.get("name", "Untitled Task"),
                task_data.get("description", ""),
                task_data.get("assignees", []),
                task_data.get("tags", [])
            )
        elif action == "get":
            return {"tasks": self.get_tasks(task_data.get("list_id", ""))}

