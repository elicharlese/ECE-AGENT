#!/usr/bin/env python3
"""
Developer MCP Client for AGENT
Provides development tools, code analysis, and programming assistance
"""

import asyncio
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from .base_mcp_client import BaseMCPClient

class DeveloperMCPClient(BaseMCPClient):
    """MCP client for developer tools and code assistance"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__("developer", config)
        
        # Developer-specific configuration
        self.supported_languages = config.get("languages", [
            "python", "javascript", "typescript", "rust", "go", "java", "cpp"
        ])
        self.code_analysis_enabled = config.get("code_analysis", True)
        self.debug_mode = config.get("debug_mode", False)
        
        # Tool categories
        self.available_tools = {
            "code_analysis": [],
            "documentation": [],
            "testing": [],
            "debugging": [],
            "deployment": [],
            "security": []
        }
        
    async def register_tools(self):
        """Register developer-specific tools"""
        try:
            # Get available tools from the server
            tools = await self.get_tools()
            
            # Categorize tools
            for tool in tools:
                tool_name = tool.get("name", "")
                
                if "analyze" in tool_name or "lint" in tool_name or "review" in tool_name:
                    self.available_tools["code_analysis"].append(tool)
                elif "doc" in tool_name or "comment" in tool_name:
                    self.available_tools["documentation"].append(tool)
                elif "test" in tool_name or "unit" in tool_name:
                    self.available_tools["testing"].append(tool)
                elif "debug" in tool_name or "trace" in tool_name:
                    self.available_tools["debugging"].append(tool)
                elif "deploy" in tool_name or "build" in tool_name:
                    self.available_tools["deployment"].append(tool)
                elif "security" in tool_name or "scan" in tool_name:
                    self.available_tools["security"].append(tool)
            
            self.logger.info(f"Registered {len(tools)} developer tools")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to register developer tools: {e}")
            return False
    
    async def analyze_code(self, code: str, language: str, analysis_type: str = "comprehensive") -> Dict:
        """Analyze code using MCP tools"""
        try:
            result = await self.call_tool("code_analyzer", {
                "code": code,
                "language": language,
                "analysis_type": analysis_type,
                "include_suggestions": True,
                "check_security": True
            })
            
            return {
                "success": True,
                "analysis": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Code analysis failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def generate_documentation(self, code: str, language: str, doc_type: str = "auto") -> Dict:
        """Generate documentation for code"""
        try:
            result = await self.call_tool("doc_generator", {
                "code": code,
                "language": language,
                "documentation_type": doc_type,
                "include_examples": True,
                "format": "markdown"
            })
            
            return {
                "success": True,
                "documentation": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Documentation generation failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def run_tests(self, project_path: str, test_type: str = "unit") -> Dict:
        """Run tests using MCP tools"""
        try:
            result = await self.call_tool("test_runner", {
                "project_path": project_path,
                "test_type": test_type,
                "generate_coverage": True,
                "output_format": "json"
            })
            
            return {
                "success": True,
                "test_results": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Test execution failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def debug_code(self, code: str, language: str, error_info: Dict = None) -> Dict:
        """Debug code using MCP tools"""
        try:
            result = await self.call_tool("debugger", {
                "code": code,
                "language": language,
                "error_info": error_info,
                "suggest_fixes": True,
                "include_explanation": True
            })
            
            return {
                "success": True,
                "debug_info": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Code debugging failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def security_scan(self, code: str, language: str) -> Dict:
        """Perform security scan on code"""
        try:
            result = await self.call_tool("security_scanner", {
                "code": code,
                "language": language,
                "scan_type": "comprehensive",
                "include_cwe": True,
                "suggest_remediation": True
            })
            
            return {
                "success": True,
                "security_report": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Security scan failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def deploy_project(self, project_path: str, target_environment: str) -> Dict:
        """Deploy project using MCP tools"""
        try:
            result = await self.call_tool("deployer", {
                "project_path": project_path,
                "target_environment": target_environment,
                "include_health_check": True,
                "rollback_on_failure": True
            })
            
            return {
                "success": True,
                "deployment_info": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Deployment failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_training_data(self) -> Dict:
        """Get training data for AGENT learning"""
        try:
            training_data = {
                "domain": "developer",
                "tools_used": [],
                "successful_operations": [],
                "error_patterns": [],
                "best_practices": [],
                "code_examples": []
            }
            
            # Collect data from recent operations
            for category, tools in self.available_tools.items():
                training_data["tools_used"].extend([
                    {
                        "category": category,
                        "tool_name": tool.get("name"),
                        "description": tool.get("description"),
                        "usage_count": 0  # Would track actual usage
                    }
                    for tool in tools
                ])
            
            # Add best practices for different languages
            for lang in self.supported_languages:
                training_data["best_practices"].append({
                    "language": lang,
                    "practices": [
                        "Write clean, readable code",
                        "Use meaningful variable names",
                        "Add comprehensive comments",
                        "Follow language conventions",
                        "Write unit tests"
                    ]
                })
            
            return {
                "success": True,
                "data": training_data,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get training data: {e}")
            return {"success": False, "error": str(e)}
    
    def get_capabilities(self) -> Dict:
        """Get developer client capabilities"""
        return {
            "client_type": "developer",
            "supported_languages": self.supported_languages,
            "capabilities": [
                "Code analysis and review",
                "Documentation generation",
                "Test execution and coverage",
                "Debugging assistance",
                "Security scanning",
                "Project deployment"
            ],
            "tool_categories": list(self.available_tools.keys()),
            "features": {
                "code_analysis": self.code_analysis_enabled,
                "debug_mode": self.debug_mode,
                "multi_language": True,
                "security_integrated": True
            }
        }
    
    async def health_check(self) -> bool:
        """Perform developer client health check"""
        try:
            # Basic connection check
            if not await super().health_check():
                return False
            
            # Test a simple tool call
            test_result = await self.call_tool("ping", {})
            
            return test_result.get("status") == "ok"
            
        except Exception as e:
            self.logger.error(f"Developer client health check failed: {e}")
            return False
