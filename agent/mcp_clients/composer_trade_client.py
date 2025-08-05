#!/usr/bin/env python3
"""
Composer Trade MCP Client for AGENT
Integrates with https://github.com/invest-composer/composer-trade-mcp
"""

import asyncio
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from .base_mcp_client import BaseMCPClient

class ComposerTradeClient(BaseMCPClient):
    """Client for Composer Trade MCP Server integration"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__("composer_trade", config)
        self.api_key = config.get("api_key", "")
        self.account_id = config.get("account_id", "")
        self.environment = config.get("environment", "paper")  # paper, live
        
    async def initialize(self):
        """Initialize Composer Trade connection"""
        try:
            await super().initialize()
            
            # Initialize Composer-specific tools
            await self.register_tools()
            
            self.logger.info("✅ Composer Trade MCP client initialized")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to initialize Composer Trade client: {e}")
            return False
    
    async def register_tools(self):
        """Register Composer Trade-specific tools"""
        tools = [
            "get_portfolio",
            "get_positions", 
            "place_order",
            "cancel_order",
            "get_market_data",
            "get_account_info",
            "create_symphony",
            "backtest_symphony",
            "get_performance_analytics"
        ]
        
        for tool in tools:
            await self.call_tool(tool, {"action": "register"})
    
    async def get_portfolio_data(self) -> Dict:
        """Get current portfolio information"""
        try:
            result = await self.call_tool("get_portfolio", {"account_id": self.account_id})
            
            return {
                "success": True,
                "portfolio": result,
                "total_value": result.get("total_value", 0),
                "available_cash": result.get("available_cash", 0),
                "positions": result.get("positions", [])
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get portfolio data: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_positions(self) -> Dict:
        """Get current positions"""
        try:
            result = await self.call_tool("get_positions", {"account_id": self.account_id})
            
            return {
                "success": True,
                "positions": result,
                "total_positions": len(result.get("positions", []))
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get positions: {e}")
            return {"success": False, "error": str(e)}
    
    async def place_arbitrage_order(self, order_details: Dict) -> Dict:
        """Place an arbitrage order through Composer Trade"""
        try:
            # Enhance order with AGENT arbitrage metadata
            enhanced_order = {
                **order_details,
                "account_id": self.account_id,
                "order_type": "market",  # For quick arbitrage execution
                "time_in_force": "IOC",  # Immediate or Cancel for arbitrage
                "metadata": {
                    "strategy": "AGENT_arbitrage",
                    "arbitrage_type": order_details.get("arbitrage_type", "cross_exchange"),
                    "expected_profit": order_details.get("expected_profit", 0),
                    "risk_level": order_details.get("risk_level", "medium")
                }
            }
            
            result = await self.call_tool("place_order", enhanced_order)
            
            return {
                "success": True,
                "order_id": result.get("order_id"),
                "status": result.get("status"),
                "details": result
            }
            
        except Exception as e:
            self.logger.error(f"Failed to place arbitrage order: {e}")
            return {"success": False, "error": str(e)}
    
    async def create_arbitrage_symphony(self, strategy_config: Dict) -> Dict:
        """Create a Composer Symphony for arbitrage trading"""
        try:
            # Generate symphony configuration from AGENT strategy
            symphony_config = self._generate_symphony_config(strategy_config)
            
            params = {
                "name": f"AGENT_Arbitrage_{strategy_config.get('type', 'cross_exchange')}",
                "description": f"Automated arbitrage strategy created by AGENT",
                "configuration": symphony_config,
                "risk_profile": strategy_config.get("risk_profile", "moderate"),
                "auto_rebalance": True,
                "rebalance_frequency": "daily"
            }
            
            result = await self.call_tool("create_symphony", params)
            
            return {
                "success": True,
                "symphony_id": result.get("id"),
                "strategy_type": strategy_config.get("type"),
                "configuration": symphony_config
            }
            
        except Exception as e:
            self.logger.error(f"Failed to create arbitrage symphony: {e}")
            return {"success": False, "error": str(e)}
    
    async def backtest_arbitrage_strategy(self, strategy_config: Dict, 
                                        start_date: str = None, end_date: str = None) -> Dict:
        """Backtest an arbitrage strategy using Composer"""
        try:
            # Set default date range if not provided
            if not start_date:
                start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
            if not end_date:
                end_date = datetime.now().strftime("%Y-%m-%d")
            
            symphony_config = self._generate_symphony_config(strategy_config)
            
            params = {
                "configuration": symphony_config,
                "start_date": start_date,
                "end_date": end_date,
                "initial_capital": strategy_config.get("capital", 100000),
                "benchmark": strategy_config.get("benchmark", "SPY")
            }
            
            result = await self.call_tool("backtest_symphony", params)
            
            return {
                "success": True,
                "backtest_id": result.get("id"),
                "performance": self._extract_performance_metrics(result),
                "results": result
            }
            
        except Exception as e:
            self.logger.error(f"Failed to backtest arbitrage strategy: {e}")
            return {"success": False, "error": str(e)}
    
    def _generate_symphony_config(self, strategy_config: Dict) -> Dict:
        """Generate Composer Symphony configuration from AGENT strategy"""
        strategy_type = strategy_config.get("type", "cross_exchange")
        
        if strategy_type == "cross_exchange":
            return self._generate_cross_exchange_symphony(strategy_config)
        elif strategy_type == "triangular":
            return self._generate_triangular_symphony(strategy_config)
        elif strategy_type == "statistical":
            return self._generate_statistical_symphony(strategy_config)
        else:
            return self._generate_basic_arbitrage_symphony(strategy_config)
    
    def _generate_cross_exchange_symphony(self, config: Dict) -> Dict:
        """Generate cross-exchange arbitrage symphony configuration"""
        return {
            "type": "algorithmic",
            "algorithm": "cross_exchange_arbitrage",
            "parameters": {
                "min_profit_threshold": config.get("min_profitability", 0.003),
                "max_position_size": config.get("max_position_size", 0.1),
                "rebalance_frequency": "intraday",
                "risk_management": {
                    "stop_loss": config.get("stop_loss_pct", 0.02),
                    "take_profit": config.get("take_profit_pct", 0.05),
                    "max_drawdown": config.get("max_drawdown_pct", 0.10)
                }
            },
            "assets": [
                {"symbol": "BTC-USD", "weight": 0.5, "type": "crypto"},
                {"symbol": "ETH-USD", "weight": 0.5, "type": "crypto"}
            ],
            "conditions": [
                {
                    "type": "spread_threshold",
                    "threshold": config.get("min_profitability", 0.003),
                    "action": "rebalance"
                }
            ]
        }
    
    def _generate_triangular_symphony(self, config: Dict) -> Dict:
        """Generate triangular arbitrage symphony configuration"""
        return {
            "type": "algorithmic",
            "algorithm": "triangular_arbitrage",
            "parameters": {
                "min_profit_threshold": config.get("min_profitability", 0.005),
                "execution_speed": "fast",
                "currency_triangle": ["USD", "BTC", "ETH"]
            },
            "assets": [
                {"symbol": "BTC-USD", "weight": 0.33, "type": "crypto"},
                {"symbol": "ETH-USD", "weight": 0.33, "type": "crypto"},
                {"symbol": "ETH-BTC", "weight": 0.34, "type": "crypto"}
            ],
            "conditions": [
                {
                    "type": "triangular_imbalance",
                    "threshold": config.get("min_profitability", 0.005),
                    "action": "execute_arbitrage"
                }
            ]
        }
    
    def _generate_statistical_symphony(self, config: Dict) -> Dict:
        """Generate statistical arbitrage symphony configuration"""
        return {
            "type": "algorithmic",
            "algorithm": "pairs_trading",
            "parameters": {
                "z_score_threshold": config.get("z_score_threshold", 2.0),
                "lookback_period": config.get("lookback_period", 60),
                "mean_reversion_speed": config.get("mean_reversion_speed", 0.1)
            },
            "assets": [
                {"symbol": "SPY", "weight": 0.5, "type": "etf"},
                {"symbol": "QQQ", "weight": 0.5, "type": "etf"}
            ],
            "conditions": [
                {
                    "type": "z_score_divergence",
                    "threshold": config.get("z_score_threshold", 2.0),
                    "action": "pairs_trade"
                }
            ]
        }
    
    def _generate_basic_arbitrage_symphony(self, config: Dict) -> Dict:
        """Generate basic arbitrage symphony configuration"""
        return {
            "type": "algorithmic",
            "algorithm": "spread_trading",
            "parameters": {
                "spread_threshold": config.get("min_profitability", 0.002),
                "position_sizing": "equal_weight"
            },
            "assets": [
                {"symbol": "SPY", "weight": 0.5, "type": "etf"},
                {"symbol": "IVV", "weight": 0.5, "type": "etf"}
            ]
        }
    
    async def get_real_time_data(self, symbols: List[str]) -> Dict:
        """Get real-time market data for symbols"""
        try:
            params = {"symbols": symbols, "data_type": "real_time"}
            result = await self.call_tool("get_market_data", params)
            
            return {
                "success": True,
                "data": result,
                "timestamp": datetime.now().isoformat(),
                "symbols": symbols
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get real-time data: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_performance_analytics(self, symphony_id: str = None) -> Dict:
        """Get performance analytics for portfolio or specific symphony"""
        try:
            params = {"account_id": self.account_id}
            if symphony_id:
                params["symphony_id"] = symphony_id
                
            result = await self.call_tool("get_performance_analytics", params)
            
            return {
                "success": True,
                "analytics": result,
                "metrics": self._extract_performance_metrics(result)
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get performance analytics: {e}")
            return {"success": False, "error": str(e)}
    
    def _extract_performance_metrics(self, result: Dict) -> Dict:
        """Extract key performance metrics from Composer results"""
        try:
            return {
                "total_return": result.get("total_return", 0),
                "annualized_return": result.get("annualized_return", 0),
                "sharpe_ratio": result.get("sharpe_ratio", 0),
                "max_drawdown": result.get("max_drawdown", 0),
                "volatility": result.get("volatility", 0),
                "win_rate": result.get("win_rate", 0),
                "profit_factor": result.get("profit_factor", 0),
                "sortino_ratio": result.get("sortino_ratio", 0),
                "calmar_ratio": result.get("calmar_ratio", 0)
            }
        except Exception as e:
            self.logger.error(f"Failed to extract performance metrics: {e}")
            return {}
    
    async def execute_arbitrage_trade(self, opportunity: Dict) -> Dict:
        """Execute an arbitrage trade based on identified opportunity"""
        try:
            # Prepare orders for the arbitrage opportunity
            orders = []
            
            if opportunity.get("type") == "cross_exchange":
                orders = self._prepare_cross_exchange_orders(opportunity)
            elif opportunity.get("type") == "triangular":
                orders = self._prepare_triangular_orders(opportunity)
            elif opportunity.get("type") == "statistical":
                orders = self._prepare_statistical_orders(opportunity)
            
            # Execute all orders
            executed_orders = []
            for order in orders:
                result = await self.place_arbitrage_order(order)
                executed_orders.append(result)
            
            return {
                "success": True,
                "opportunity": opportunity,
                "executed_orders": executed_orders,
                "expected_profit": opportunity.get("expected_profit", 0)
            }
            
        except Exception as e:
            self.logger.error(f"Failed to execute arbitrage trade: {e}")
            return {"success": False, "error": str(e)}
    
    def _prepare_cross_exchange_orders(self, opportunity: Dict) -> List[Dict]:
        """Prepare orders for cross-exchange arbitrage"""
        return [
            {
                "symbol": opportunity["asset1"]["symbol"],
                "side": "buy" if opportunity["asset1"]["action"] == "long" else "sell",
                "quantity": opportunity["position_size"] / 2,
                "arbitrage_type": "cross_exchange",
                "expected_profit": opportunity["expected_profit"]
            },
            {
                "symbol": opportunity["asset2"]["symbol"],
                "side": "sell" if opportunity["asset2"]["action"] == "short" else "buy",
                "quantity": opportunity["position_size"] / 2,
                "arbitrage_type": "cross_exchange",
                "expected_profit": opportunity["expected_profit"]
            }
        ]
    
    def _prepare_triangular_orders(self, opportunity: Dict) -> List[Dict]:
        """Prepare orders for triangular arbitrage"""
        return [
            {
                "symbol": opportunity["leg1"]["symbol"],
                "side": opportunity["leg1"]["side"],
                "quantity": opportunity["position_size"] / 3,
                "arbitrage_type": "triangular"
            },
            {
                "symbol": opportunity["leg2"]["symbol"],
                "side": opportunity["leg2"]["side"],
                "quantity": opportunity["position_size"] / 3,
                "arbitrage_type": "triangular"
            },
            {
                "symbol": opportunity["leg3"]["symbol"],
                "side": opportunity["leg3"]["side"],
                "quantity": opportunity["position_size"] / 3,
                "arbitrage_type": "triangular"
            }
        ]
    
    def _prepare_statistical_orders(self, opportunity: Dict) -> List[Dict]:
        """Prepare orders for statistical arbitrage"""
        return [
            {
                "symbol": opportunity["asset1"]["symbol"],
                "side": opportunity["asset1"]["side"],
                "quantity": opportunity["position_size"] / 2,
                "arbitrage_type": "statistical",
                "z_score": opportunity.get("z_score", 0)
            },
            {
                "symbol": opportunity["asset2"]["symbol"],
                "side": opportunity["asset2"]["side"],
                "quantity": opportunity["position_size"] / 2,
                "arbitrage_type": "statistical",
                "z_score": opportunity.get("z_score", 0)
            }
        ]
    
    async def get_training_data(self) -> Dict:
        """Get training data for AGENT learning from Composer Trade"""
        try:
            # Get historical performance data
            analytics = await self.get_performance_analytics()
            
            # Get recent trades
            trades = await self.call_tool("get_trade_history", {
                "account_id": self.account_id,
                "limit": 100
            })
            
            training_data = []
            for trade in trades.get("trades", []):
                training_data.append({
                    "strategy_type": trade.get("metadata", {}).get("strategy", "unknown"),
                    "symbol": trade.get("symbol"),
                    "side": trade.get("side"),
                    "quantity": trade.get("quantity"),
                    "price": trade.get("execution_price"),
                    "profit_loss": trade.get("profit_loss", 0),
                    "execution_time": trade.get("execution_time"),
                    "market_conditions": trade.get("market_data", {}),
                    "performance_metrics": self._extract_performance_metrics(trade)
                })
            
            return {
                "success": True,
                "training_data": training_data,
                "total_samples": len(training_data),
                "performance_analytics": analytics.get("analytics", {})
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get training data: {e}")
            return {"success": False, "error": str(e)}
