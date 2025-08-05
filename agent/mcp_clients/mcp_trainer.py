#!/usr/bin/env python3
"""
Initialize MCP clients for AGENT training
"""

import asyncio
import logging
from .base_mcp_client import MCPClientManager
from .quantconnect_client import QuantConnectClient
from .composer_trade_client import ComposerTradeClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AGENT.MCP")

class AGENTMCPTrainer:
    """AGENT MCP Training System"""
    
    def __init__(self):
        self.manager = MCPClientManager()
        self.training_active = False
        
    async def initialize_mcp_clients(self):
        """Initialize all MCP clients for training"""
        try:
            # QuantConnect client configuration
            quantconnect_config = {
                "server_url": "ws://localhost:8081",  # QuantConnect MCP server
                "api_key": "demo_key",  # Replace with actual API key
                "project_id": "agent_arbitrage",
                "environment": "paper",
                "timeout": 60,
                "retry_attempts": 3
            }
            
            # Composer Trade client configuration
            composer_config = {
                "server_url": "ws://localhost:8082",  # Composer Trade MCP server
                "api_key": "demo_key",  # Replace with actual API key
                "account_id": "agent_account",
                "environment": "paper",
                "timeout": 60,
                "retry_attempts": 3
            }
            
            # Create and add clients
            quantconnect_client = QuantConnectClient(quantconnect_config)
            composer_client = ComposerTradeClient(composer_config)
            
            self.manager.add_client(quantconnect_client)
            self.manager.add_client(composer_client)
            
            # Initialize all clients
            results = await self.manager.initialize_all()
            
            logger.info("MCP Client Initialization Results:")
            for client_name, success in results.items():
                status = "✅ Success" if success else "❌ Failed"
                logger.info(f"  {client_name}: {status}")
            
            return all(results.values())
            
        except Exception as e:
            logger.error(f"Failed to initialize MCP clients: {e}")
            return False
    
    async def start_training_loop(self):
        """Start the continuous training loop"""
        try:
            self.training_active = True
            logger.info("🚀 Starting AGENT training loop with MCP integration")
            
            while self.training_active:
                # Get training data from all clients
                training_data = await self.manager.get_all_training_data()
                
                # Process training data
                processed_data = await self._process_training_data(training_data)
                
                # Update AGENT models
                await self._update_agent_models(processed_data)
                
                # Health check
                health_status = await self.manager.health_check_all()
                self._log_health_status(health_status)
                
                # Wait before next training cycle
                await asyncio.sleep(300)  # 5 minutes
                
        except Exception as e:
            logger.error(f"Training loop error: {e}")
        finally:
            self.training_active = False
    
    async def _process_training_data(self, training_data: dict) -> dict:
        """Process training data from MCP clients"""
        processed = {
            "timestamp": asyncio.get_event_loop().time(),
            "sources": {},
            "aggregated_metrics": {},
            "learning_insights": []
        }
        
        for source, data in training_data.items():
            if data.get("success", False):
                processed["sources"][source] = {
                    "sample_count": data.get("total_samples", 0),
                    "performance_data": data.get("training_data", []),
                    "quality_score": self._calculate_data_quality(data)
                }
                
                # Extract insights
                insights = self._extract_learning_insights(source, data)
                processed["learning_insights"].extend(insights)
        
        # Calculate aggregated metrics
        processed["aggregated_metrics"] = self._calculate_aggregated_metrics(processed["sources"])
        
        logger.info(f"Processed training data from {len(processed['sources'])} sources")
        return processed
    
    def _calculate_data_quality(self, data: dict) -> float:
        """Calculate quality score for training data"""
        try:
            sample_count = data.get("total_samples", 0)
            has_performance = bool(data.get("training_data"))
            
            # Simple quality scoring
            quality = 0.0
            
            if sample_count > 0:
                quality += min(sample_count / 100, 0.5)  # Up to 0.5 for sample count
            
            if has_performance:
                quality += 0.3  # 0.3 for having performance data
            
            if data.get("performance_analytics"):
                quality += 0.2  # 0.2 for analytics
            
            return min(quality, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating data quality: {e}")
            return 0.0
    
    def _extract_learning_insights(self, source: str, data: dict) -> list:
        """Extract learning insights from training data"""
        insights = []
        
        try:
            training_samples = data.get("training_data", [])
            
            if training_samples:
                # Analyze strategy performance patterns
                strategy_performance = {}
                for sample in training_samples:
                    strategy_type = sample.get("strategy_type", "unknown")
                    performance = sample.get("performance", {})
                    
                    if strategy_type not in strategy_performance:
                        strategy_performance[strategy_type] = []
                    
                    strategy_performance[strategy_type].append(performance)
                
                # Generate insights
                for strategy, performances in strategy_performance.items():
                    if len(performances) > 5:  # Need reasonable sample size
                        avg_return = sum(p.get("total_return", 0) for p in performances) / len(performances)
                        avg_sharpe = sum(p.get("sharpe_ratio", 0) for p in performances) / len(performances)
                        
                        insight = {
                            "source": source,
                            "type": "strategy_performance",
                            "strategy": strategy,
                            "sample_count": len(performances),
                            "avg_return": avg_return,
                            "avg_sharpe": avg_sharpe,
                            "recommendation": self._generate_strategy_recommendation(strategy, avg_return, avg_sharpe)
                        }
                        insights.append(insight)
            
        except Exception as e:
            logger.error(f"Error extracting insights from {source}: {e}")
        
        return insights
    
    def _generate_strategy_recommendation(self, strategy: str, avg_return: float, avg_sharpe: float) -> str:
        """Generate strategy recommendation based on performance"""
        if avg_return > 0.1 and avg_sharpe > 1.0:
            return f"STRONG_BUY: {strategy} shows excellent performance"
        elif avg_return > 0.05 and avg_sharpe > 0.5:
            return f"BUY: {strategy} shows good performance"
        elif avg_return > 0 and avg_sharpe > 0:
            return f"HOLD: {strategy} shows modest performance"
        else:
            return f"AVOID: {strategy} shows poor performance"
    
    def _calculate_aggregated_metrics(self, sources: dict) -> dict:
        """Calculate aggregated metrics across all sources"""
        total_samples = sum(source.get("sample_count", 0) for source in sources.values())
        avg_quality = sum(source.get("quality_score", 0) for source in sources.values()) / max(len(sources), 1)
        
        return {
            "total_samples": total_samples,
            "average_quality": avg_quality,
            "active_sources": len(sources),
            "last_updated": asyncio.get_event_loop().time()
        }
    
    async def _update_agent_models(self, processed_data: dict):
        """Update AGENT models with processed training data"""
        try:
            # Here we would integrate with AGENT's learning system
            # For now, just log the updates
            
            insights = processed_data.get("learning_insights", [])
            metrics = processed_data.get("aggregated_metrics", {})
            
            logger.info("🧠 AGENT Model Updates:")
            logger.info(f"  Total insights: {len(insights)}")
            logger.info(f"  Total samples: {metrics.get('total_samples', 0)}")
            logger.info(f"  Data quality: {metrics.get('average_quality', 0):.2f}")
            
            # Log key insights
            for insight in insights[:3]:  # Show top 3 insights
                logger.info(f"  💡 {insight.get('recommendation', 'No recommendation')}")
                
        except Exception as e:
            logger.error(f"Error updating AGENT models: {e}")
    
    def _log_health_status(self, health_status: dict):
        """Log health status of MCP clients"""
        healthy_count = sum(1 for status in health_status.values() if status)
        total_count = len(health_status)
        
        logger.info(f"🏥 MCP Health Check: {healthy_count}/{total_count} clients healthy")
        
        for client_name, is_healthy in health_status.items():
            status_icon = "✅" if is_healthy else "❌"
            logger.info(f"  {status_icon} {client_name}")
    
    async def stop_training(self):
        """Stop the training loop"""
        self.training_active = False
        await self.manager.disconnect_all()
        logger.info("🛑 AGENT training stopped")
    
    def get_training_status(self) -> dict:
        """Get current training status"""
        return {
            "training_active": self.training_active,
            "mcp_clients": self.manager.get_status(),
            "last_update": asyncio.get_event_loop().time()
        }

# Global trainer instance
agent_trainer = AGENTMCPTrainer()

async def initialize_training():
    """Initialize AGENT training with MCP integration"""
    success = await agent_trainer.initialize_mcp_clients()
    if success:
        # Start training loop in background
        asyncio.create_task(agent_trainer.start_training_loop())
        logger.info("🎓 AGENT MCP training system started")
    else:
        logger.error("❌ Failed to start AGENT MCP training system")
    
    return success

async def get_training_status():
    """Get training status"""
    return agent_trainer.get_training_status()

async def stop_training():
    """Stop training"""
    await agent_trainer.stop_training()
