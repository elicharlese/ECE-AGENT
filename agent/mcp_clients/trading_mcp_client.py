#!/usr/bin/env python3
"""
Trading MCP Client for AGENT
Provides advanced trading tools, market analysis, and risk management
"""

import asyncio
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from .base_mcp_client import BaseMCPClient

class TradingMCPClient(BaseMCPClient):
    """MCP client for trading and financial analysis tools"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__("trading", config)
        
        # Trading-specific configuration
        self.supported_exchanges = config.get("exchanges", [
            "binance", "coinbase", "kraken", "ftx", "bybit", "okx"
        ])
        self.supported_assets = config.get("assets", [
            "BTC", "ETH", "BNB", "ADA", "SOL", "MATIC", "DOT", "LINK"
        ])
        self.risk_management = config.get("risk_management", True)
        self.paper_trading = config.get("paper_trading", True)
        self.max_position_size = config.get("max_position_size", 0.1)  # 10% of portfolio
        
        # Tool categories
        self.available_tools = {
            "market_analysis": [],
            "technical_indicators": [],
            "risk_management": [],
            "portfolio_optimization": [],
            "order_execution": [],
            "backtesting": [],
            "news_sentiment": []
        }
        
        # Market data cache
        self.market_cache = {}
        self.cache_expiry = timedelta(minutes=1)
        
    async def register_tools(self):
        """Register trading-specific tools"""
        try:
            # Get available tools from the server
            tools = await self.get_tools()
            
            # Categorize tools
            for tool in tools:
                tool_name = tool.get("name", "").lower()
                
                if any(term in tool_name for term in ["market", "price", "volume", "depth"]):
                    self.available_tools["market_analysis"].append(tool)
                elif any(term in tool_name for term in ["rsi", "macd", "bollinger", "ema", "sma"]):
                    self.available_tools["technical_indicators"].append(tool)
                elif any(term in tool_name for term in ["risk", "var", "sharpe", "drawdown"]):
                    self.available_tools["risk_management"].append(tool)
                elif any(term in tool_name for term in ["portfolio", "allocation", "optimize"]):
                    self.available_tools["portfolio_optimization"].append(tool)
                elif any(term in tool_name for term in ["order", "trade", "execute", "fill"]):
                    self.available_tools["order_execution"].append(tool)
                elif any(term in tool_name for term in ["backtest", "strategy", "performance"]):
                    self.available_tools["backtesting"].append(tool)
                elif any(term in tool_name for term in ["news", "sentiment", "social"]):
                    self.available_tools["news_sentiment"].append(tool)
            
            self.logger.info(f"Registered {len(tools)} trading tools")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to register trading tools: {e}")
            return False
    
    async def get_market_data(self, symbol: str, exchange: str = "binance", timeframe: str = "1h") -> Dict:
        """Get real-time market data"""
        try:
            cache_key = f"{exchange}_{symbol}_{timeframe}"
            
            # Check cache first
            if cache_key in self.market_cache:
                cached_data, timestamp = self.market_cache[cache_key]
                if datetime.now() - timestamp < self.cache_expiry:
                    return cached_data
            
            result = await self.call_tool("market_data", {
                "symbol": symbol,
                "exchange": exchange,
                "timeframe": timeframe,
                "include_indicators": True,
                "depth": 50
            })
            
            # Cache the result
            self.market_cache[cache_key] = (result, datetime.now())
            
            return {
                "success": True,
                "data": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get market data for {symbol}: {e}")
            return {"success": False, "error": str(e)}
    
    async def calculate_technical_indicators(self, symbol: str, indicators: List[str], period: int = 14) -> Dict:
        """Calculate technical indicators for a symbol"""
        try:
            result = await self.call_tool("technical_analysis", {
                "symbol": symbol,
                "indicators": indicators,
                "period": period,
                "include_signals": True,
                "timeframe": "1h"
            })
            
            return {
                "success": True,
                "indicators": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Failed to calculate indicators for {symbol}: {e}")
            return {"success": False, "error": str(e)}
    
    async def analyze_arbitrage_opportunities(self, symbol: str, exchanges: List[str] = None) -> Dict:
        """Analyze arbitrage opportunities across exchanges"""
        try:
            if exchanges is None:
                exchanges = self.supported_exchanges[:3]  # Use top 3 exchanges
            
            result = await self.call_tool("arbitrage_scanner", {
                "symbol": symbol,
                "exchanges": exchanges,
                "min_profit_threshold": 0.005,  # 0.5% minimum profit
                "include_fees": True,
                "max_execution_time": 30
            })
            
            return {
                "success": True,
                "opportunities": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Failed to analyze arbitrage for {symbol}: {e}")
            return {"success": False, "error": str(e)}
    
    async def execute_trade(self, symbol: str, side: str, amount: float, order_type: str = "market", 
                          exchange: str = "binance", test_mode: bool = None) -> Dict:
        """Execute a trade order"""
        try:
            # Use paper trading if enabled or explicitly requested
            is_test = test_mode if test_mode is not None else self.paper_trading
            
            # Risk management check
            if not await self._risk_check(symbol, side, amount):
                return {"success": False, "error": "Trade rejected by risk management"}
            
            result = await self.call_tool("order_executor", {
                "symbol": symbol,
                "side": side.lower(),
                "amount": amount,
                "order_type": order_type,
                "exchange": exchange,
                "test_mode": is_test,
                "risk_management": True
            })
            
            return {
                "success": True,
                "order_info": result,
                "test_mode": is_test,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Failed to execute trade: {e}")
            return {"success": False, "error": str(e)}
    
    async def optimize_portfolio(self, assets: List[str], target_risk: float = 0.15, 
                               optimization_method: str = "sharpe") -> Dict:
        """Optimize portfolio allocation"""
        try:
            result = await self.call_tool("portfolio_optimizer", {
                "assets": assets,
                "target_risk": target_risk,
                "optimization_method": optimization_method,
                "rebalance_threshold": 0.05,
                "include_backtesting": True
            })
            
            return {
                "success": True,
                "allocation": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Portfolio optimization failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def backtest_strategy(self, strategy_config: Dict, start_date: str, end_date: str) -> Dict:
        """Backtest a trading strategy"""
        try:
            result = await self.call_tool("strategy_backtester", {
                "strategy": strategy_config,
                "start_date": start_date,
                "end_date": end_date,
                "initial_capital": 10000,
                "include_analytics": True,
                "benchmark": "BTC"
            })
            
            return {
                "success": True,
                "backtest_results": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Backtesting failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_news_sentiment(self, symbol: str, timeframe: str = "24h") -> Dict:
        """Get news sentiment analysis for a symbol"""
        try:
            result = await self.call_tool("sentiment_analyzer", {
                "symbol": symbol,
                "timeframe": timeframe,
                "sources": ["twitter", "reddit", "news"],
                "include_score": True,
                "aggregate": True
            })
            
            return {
                "success": True,
                "sentiment": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Sentiment analysis failed for {symbol}: {e}")
            return {"success": False, "error": str(e)}
    
    async def calculate_risk_metrics(self, portfolio: Dict) -> Dict:
        """Calculate risk metrics for a portfolio"""
        try:
            result = await self.call_tool("risk_calculator", {
                "portfolio": portfolio,
                "timeframe": "1y",
                "confidence_level": 0.95,
                "include_var": True,
                "include_stress_test": True
            })
            
            return {
                "success": True,
                "risk_metrics": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Risk calculation failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def _risk_check(self, symbol: str, side: str, amount: float) -> bool:
        """Internal risk management check"""
        try:
            if not self.risk_management:
                return True
            
            # Check position size limit
            if amount > self.max_position_size:
                self.logger.warning(f"Trade amount {amount} exceeds max position size {self.max_position_size}")
                return False
            
            # Additional risk checks could be added here
            # e.g., correlation limits, sector exposure, etc.
            
            return True
            
        except Exception as e:
            self.logger.error(f"Risk check failed: {e}")
            return False
    
    async def get_training_data(self) -> Dict:
        """Get training data for AGENT learning"""
        try:
            training_data = {
                "domain": "trading",
                "tools_used": [],
                "successful_trades": [],
                "market_patterns": [],
                "risk_scenarios": [],
                "strategies": []
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
            
            # Add trading strategies
            training_data["strategies"].extend([
                {
                    "name": "Mean Reversion",
                    "description": "Buy when price is below moving average, sell when above",
                    "risk_level": "medium",
                    "timeframe": "1h-4h"
                },
                {
                    "name": "Momentum Trading",
                    "description": "Follow strong price movements with proper risk management",
                    "risk_level": "high",
                    "timeframe": "15m-1h"
                },
                {
                    "name": "Arbitrage",
                    "description": "Exploit price differences across exchanges",
                    "risk_level": "low",
                    "timeframe": "real-time"
                }
            ])
            
            return {
                "success": True,
                "data": training_data,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get training data: {e}")
            return {"success": False, "error": str(e)}
    
    def get_capabilities(self) -> Dict:
        """Get trading client capabilities"""
        return {
            "client_type": "trading",
            "supported_exchanges": self.supported_exchanges,
            "supported_assets": self.supported_assets,
            "capabilities": [
                "Real-time market data",
                "Technical analysis",
                "Arbitrage detection",
                "Order execution",
                "Portfolio optimization",
                "Risk management",
                "Strategy backtesting",
                "Sentiment analysis"
            ],
            "tool_categories": list(self.available_tools.keys()),
            "features": {
                "paper_trading": self.paper_trading,
                "risk_management": self.risk_management,
                "real_time_data": True,
                "multi_exchange": True,
                "advanced_analytics": True
            }
        }
    
    async def health_check(self) -> bool:
        """Perform trading client health check"""
        try:
            # Basic connection check
            if not await super().health_check():
                return False
            
            # Test market data access
            test_result = await self.get_market_data("BTC/USDT", "binance")
            
            return test_result.get("success", False)
            
        except Exception as e:
            self.logger.error(f"Trading client health check failed: {e}")
            return False
