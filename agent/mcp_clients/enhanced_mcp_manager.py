#!/usr/bin/env python3
"""
Enhanced MCP Manager for AGENT
Manages all MCP client connections and provides unified interface
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from pathlib import Path

from .base_mcp_client import MCPClientManager
from .developer_mcp_client import DeveloperMCPClient
from .trading_mcp_client import TradingMCPClient
from .legal_mcp_client import LegalMCPClient

class EnhancedMCPManager(MCPClientManager):
    """Enhanced MCP manager with specialized client types"""
    
    def __init__(self, config_path: str = None):
        super().__init__()
        
        self.config_path = config_path or "/workspaces/AGENT/config/mcp_config.json"
        self.config = self._load_config()
        
        # Client configurations
        self.client_configs = {
            "developer": {
                "server_url": "ws://localhost:8081",
                "timeout": 30,
                "retry_attempts": 3,
                "languages": ["python", "javascript", "typescript", "rust", "go"],
                "code_analysis": True,
                "debug_mode": False
            },
            "trading": {
                "server_url": "ws://localhost:8082", 
                "timeout": 30,
                "retry_attempts": 3,
                "exchanges": ["binance", "coinbase", "kraken"],
                "assets": ["BTC", "ETH", "BNB", "ADA", "SOL"],
                "risk_management": True,
                "paper_trading": True,
                "max_position_size": 0.1
            },
            "legal": {
                "server_url": "ws://localhost:8083",
                "timeout": 30,
                "retry_attempts": 3,
                "jurisdictions": ["US", "EU", "UK", "CA"],
                "compliance_areas": ["securities", "privacy", "aml", "kyc"],
                "databases": ["westlaw", "lexis"],
                "risk_assessment": True
            }
        }
        
        # Performance metrics
        self.metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "client_status": {},
            "last_health_check": None,
            "response_times": []
        }
        
        # Initialize clients
        self._initialize_specialized_clients()
        
    def _load_config(self) -> Dict:
        """Load MCP configuration from file"""
        try:
            if Path(self.config_path).exists():
                with open(self.config_path, 'r') as f:
                    return json.load(f)
            else:
                # Return default config
                return {
                    "enabled": True,
                    "auto_reconnect": True,
                    "health_check_interval": 300,  # 5 minutes
                    "max_concurrent_requests": 10,
                    "logging_level": "INFO"
                }
        except Exception as e:
            self.logger.error(f"Failed to load MCP config: {e}")
            return {}
    
    def _initialize_specialized_clients(self):
        """Initialize all specialized MCP clients"""
        try:
            # Developer client
            if self.config.get("developer", {}).get("enabled", True):
                dev_config = {**self.client_configs["developer"], **self.config.get("developer", {})}
                dev_client = DeveloperMCPClient(dev_config)
                self.add_client(dev_client)
            
            # Trading client
            if self.config.get("trading", {}).get("enabled", True):
                trading_config = {**self.client_configs["trading"], **self.config.get("trading", {})}
                trading_client = TradingMCPClient(trading_config)
                self.add_client(trading_client)
            
            # Legal client
            if self.config.get("legal", {}).get("enabled", True):
                legal_config = {**self.client_configs["legal"], **self.config.get("legal", {})}
                legal_client = LegalMCPClient(legal_config)
                self.add_client(legal_client)
            
            self.logger.info(f"Initialized {len(self.clients)} specialized MCP clients")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize specialized clients: {e}")
    
    async def enhanced_initialize_all(self) -> Dict:
        """Enhanced initialization with detailed reporting"""
        start_time = datetime.now()
        results = await self.initialize_all()
        
        # Update metrics
        initialization_time = (datetime.now() - start_time).total_seconds()
        
        detailed_results = {
            "success": all(results.values()),
            "client_results": results,
            "initialization_time": initialization_time,
            "total_clients": len(self.clients),
            "successful_clients": sum(1 for success in results.values() if success),
            "failed_clients": sum(1 for success in results.values() if not success),
            "timestamp": datetime.now().isoformat()
        }
        
        # Log results
        if detailed_results["success"]:
            self.logger.info("✅ All MCP clients initialized successfully")
        else:
            failed_clients = [name for name, success in results.items() if not success]
            self.logger.warning(f"❌ Failed to initialize clients: {failed_clients}")
        
        return detailed_results
    
    async def execute_developer_task(self, task_type: str, **kwargs) -> Dict:
        """Execute a developer-specific task"""
        try:
            dev_client = self.get_client("developer")
            if not dev_client or not dev_client.is_connected:
                return {"success": False, "error": "Developer client not available"}
            
            self.metrics["total_requests"] += 1
            start_time = datetime.now()
            
            result = None
            if task_type == "analyze_code":
                result = await dev_client.analyze_code(**kwargs)
            elif task_type == "generate_docs":
                result = await dev_client.generate_documentation(**kwargs)
            elif task_type == "run_tests":
                result = await dev_client.run_tests(**kwargs)
            elif task_type == "debug_code":
                result = await dev_client.debug_code(**kwargs)
            elif task_type == "security_scan":
                result = await dev_client.security_scan(**kwargs)
            elif task_type == "deploy_project":
                result = await dev_client.deploy_project(**kwargs)
            else:
                return {"success": False, "error": f"Unknown developer task: {task_type}"}
            
            # Update metrics
            response_time = (datetime.now() - start_time).total_seconds()
            self.metrics["response_times"].append(response_time)
            
            if result.get("success"):
                self.metrics["successful_requests"] += 1
            else:
                self.metrics["failed_requests"] += 1
            
            return result
            
        except Exception as e:
            self.logger.error(f"Developer task execution failed: {e}")
            self.metrics["failed_requests"] += 1
            return {"success": False, "error": str(e)}
    
    async def execute_trading_task(self, task_type: str, **kwargs) -> Dict:
        """Execute a trading-specific task"""
        try:
            trading_client = self.get_client("trading")
            if not trading_client or not trading_client.is_connected:
                return {"success": False, "error": "Trading client not available"}
            
            self.metrics["total_requests"] += 1
            start_time = datetime.now()
            
            result = None
            if task_type == "get_market_data":
                result = await trading_client.get_market_data(**kwargs)
            elif task_type == "technical_analysis":
                result = await trading_client.calculate_technical_indicators(**kwargs)
            elif task_type == "arbitrage_analysis":
                result = await trading_client.analyze_arbitrage_opportunities(**kwargs)
            elif task_type == "execute_trade":
                result = await trading_client.execute_trade(**kwargs)
            elif task_type == "optimize_portfolio":
                result = await trading_client.optimize_portfolio(**kwargs)
            elif task_type == "backtest_strategy":
                result = await trading_client.backtest_strategy(**kwargs)
            elif task_type == "sentiment_analysis":
                result = await trading_client.get_news_sentiment(**kwargs)
            elif task_type == "risk_analysis":
                result = await trading_client.calculate_risk_metrics(**kwargs)
            else:
                return {"success": False, "error": f"Unknown trading task: {task_type}"}
            
            # Update metrics
            response_time = (datetime.now() - start_time).total_seconds()
            self.metrics["response_times"].append(response_time)
            
            if result.get("success"):
                self.metrics["successful_requests"] += 1
            else:
                self.metrics["failed_requests"] += 1
            
            return result
            
        except Exception as e:
            self.logger.error(f"Trading task execution failed: {e}")
            self.metrics["failed_requests"] += 1
            return {"success": False, "error": str(e)}
    
    async def execute_legal_task(self, task_type: str, **kwargs) -> Dict:
        """Execute a legal-specific task"""
        try:
            legal_client = self.get_client("legal")
            if not legal_client or not legal_client.is_connected:
                return {"success": False, "error": "Legal client not available"}
            
            self.metrics["total_requests"] += 1
            start_time = datetime.now()
            
            result = None
            if task_type == "legal_research":
                result = await legal_client.legal_research(**kwargs)
            elif task_type == "compliance_check":
                result = await legal_client.compliance_check(**kwargs)
            elif task_type == "contract_analysis":
                result = await legal_client.analyze_contract(**kwargs)
            elif task_type == "risk_assessment":
                result = await legal_client.assess_legal_risk(**kwargs)
            elif task_type == "regulatory_updates":
                result = await legal_client.get_regulatory_updates(**kwargs)
            elif task_type == "document_review":
                result = await legal_client.review_document(**kwargs)
            elif task_type == "litigation_support":
                result = await legal_client.litigation_support(**kwargs)
            elif task_type == "ip_check":
                result = await legal_client.check_intellectual_property(**kwargs)
            else:
                return {"success": False, "error": f"Unknown legal task: {task_type}"}
            
            # Update metrics
            response_time = (datetime.now() - start_time).total_seconds()
            self.metrics["response_times"].append(response_time)
            
            if result.get("success"):
                self.metrics["successful_requests"] += 1
            else:
                self.metrics["failed_requests"] += 1
            
            return result
            
        except Exception as e:
            self.logger.error(f"Legal task execution failed: {e}")
            self.metrics["failed_requests"] += 1
            return {"success": False, "error": str(e)}
    
    async def enhanced_health_check(self) -> Dict:
        """Enhanced health check with detailed client information"""
        health_results = await self.health_check_all()
        
        detailed_health = {
            "overall_status": "healthy" if all(health_results.values()) else "degraded",
            "client_health": {},
            "timestamp": datetime.now().isoformat(),
            "total_clients": len(self.clients),
            "healthy_clients": sum(1 for status in health_results.values() if status),
            "unhealthy_clients": sum(1 for status in health_results.values() if not status)
        }
        
        # Get detailed status for each client
        for name, client in self.clients.items():
            detailed_health["client_health"][name] = {
                "healthy": health_results.get(name, False),
                "connected": client.is_connected,
                "pending_requests": len(client.pending_requests),
                "capabilities": client.get_capabilities() if hasattr(client, 'get_capabilities') else {},
                "last_activity": client.get_status().get("last_activity")
            }
        
        self.metrics["last_health_check"] = datetime.now().isoformat()
        self.metrics["client_status"] = detailed_health["client_health"]
        
        return detailed_health
    
    async def get_unified_training_data(self) -> Dict:
        """Get unified training data from all clients"""
        training_data = await self.get_all_training_data()
        
        unified_data = {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "domains": list(training_data.keys()),
            "total_tools": 0,
            "domain_data": training_data,
            "cross_domain_patterns": [],
            "integration_opportunities": []
        }
        
        # Analyze cross-domain patterns
        all_tools = []
        for domain, data in training_data.items():
            if isinstance(data, dict) and data.get("success"):
                domain_tools = data.get("data", {}).get("tools_used", [])
                all_tools.extend(domain_tools)
                unified_data["total_tools"] += len(domain_tools)
        
        # Identify integration opportunities
        unified_data["integration_opportunities"] = [
            {
                "type": "developer_legal",
                "description": "Contract code analysis and legal compliance checking",
                "tools": ["code_analyzer", "compliance_checker"]
            },
            {
                "type": "trading_legal",
                "description": "Trading strategy compliance and regulatory checking",
                "tools": ["strategy_backtester", "compliance_checker"]
            },
            {
                "type": "developer_trading",
                "description": "Trading algorithm development and testing",
                "tools": ["code_analyzer", "strategy_backtester"]
            }
        ]
        
        return unified_data
    
    def get_comprehensive_status(self) -> Dict:
        """Get comprehensive status of the MCP system"""
        status = self.get_status()
        
        # Calculate average response time
        avg_response_time = (
            sum(self.metrics["response_times"]) / len(self.metrics["response_times"])
            if self.metrics["response_times"] else 0
        )
        
        # Calculate success rate
        success_rate = (
            self.metrics["successful_requests"] / self.metrics["total_requests"]
            if self.metrics["total_requests"] > 0 else 0
        )
        
        comprehensive_status = {
            **status,
            "performance_metrics": {
                "total_requests": self.metrics["total_requests"],
                "successful_requests": self.metrics["successful_requests"],
                "failed_requests": self.metrics["failed_requests"],
                "success_rate": round(success_rate * 100, 2),
                "average_response_time": round(avg_response_time, 3),
                "last_health_check": self.metrics["last_health_check"]
            },
            "client_capabilities": {
                name: client.get_capabilities() if hasattr(client, 'get_capabilities') else {}
                for name, client in self.clients.items()
            },
            "configuration": {
                "auto_reconnect": self.config.get("auto_reconnect", True),
                "health_check_interval": self.config.get("health_check_interval", 300),
                "max_concurrent_requests": self.config.get("max_concurrent_requests", 10)
            }
        }
        
        return comprehensive_status
    
    async def update_client_config(self, client_name: str, config_updates: Dict) -> Dict:
        """Update configuration for a specific client"""
        try:
            if client_name not in self.client_configs:
                return {"success": False, "error": f"Unknown client: {client_name}"}
            
            # Update configuration
            self.client_configs[client_name].update(config_updates)
            
            # Save to file
            self.config[client_name] = self.client_configs[client_name]
            await self._save_config()
            
            # Restart client with new config if it's running
            client = self.get_client(client_name)
            if client and client.is_connected:
                await client.disconnect()
                # Re-initialize with new config would happen here
                # For now, just log the update
                self.logger.info(f"Configuration updated for {client_name} client")
            
            return {
                "success": True,
                "message": f"Configuration updated for {client_name}",
                "updated_config": self.client_configs[client_name]
            }
            
        except Exception as e:
            self.logger.error(f"Failed to update client config: {e}")
            return {"success": False, "error": str(e)}
    
    async def _save_config(self):
        """Save current configuration to file"""
        try:
            config_dir = Path(self.config_path).parent
            config_dir.mkdir(parents=True, exist_ok=True)
            
            with open(self.config_path, 'w') as f:
                json.dump(self.config, f, indent=2)
            
            self.logger.info("MCP configuration saved successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to save MCP configuration: {e}")
    
    async def start_health_monitoring(self):
        """Start periodic health monitoring"""
        async def health_monitor():
            while True:
                try:
                    interval = self.config.get("health_check_interval", 300)
                    await asyncio.sleep(interval)
                    
                    health_status = await self.enhanced_health_check()
                    
                    if health_status["overall_status"] != "healthy":
                        self.logger.warning("MCP system health check detected issues")
                        
                        # Attempt to reconnect unhealthy clients
                        for name, status in health_status["client_health"].items():
                            if not status["healthy"]:
                                client = self.get_client(name)
                                if client:
                                    self.logger.info(f"Attempting to reconnect {name} client")
                                    try:
                                        await client.initialize()
                                    except Exception as e:
                                        self.logger.error(f"Failed to reconnect {name}: {e}")
                    
                except Exception as e:
                    self.logger.error(f"Health monitoring error: {e}")
        
        if self.config.get("auto_reconnect", True):
            asyncio.create_task(health_monitor())
            self.logger.info("Health monitoring started")

# Global MCP manager instance
mcp_manager = EnhancedMCPManager()
