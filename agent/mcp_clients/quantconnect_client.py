#!/usr/bin/env python3
"""
QuantConnect MCP Client for AGENT
Integrates with https://github.com/QuantConnect/mcp-server
"""

import asyncio
import json
import websockets
from typing import Dict, List, Optional, Any
from datetime import datetime
from .base_mcp_client import BaseMCPClient

class QuantConnectClient(BaseMCPClient):
    """Client for QuantConnect MCP Server integration"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__("quantconnect", config)
        self.api_key = config.get("api_key", "")
        self.project_id = config.get("project_id", "")
        self.environment = config.get("environment", "paper")  # paper, live
        
    async def initialize(self):
        """Initialize QuantConnect connection"""
        try:
            await super().initialize()
            
            # Initialize QuantConnect-specific tools
            await self.register_tools()
            
            self.logger.info("✅ QuantConnect MCP client initialized")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to initialize QuantConnect client: {e}")
            return False
    
    async def register_tools(self):
        """Register QuantConnect-specific tools"""
        tools = [
            "list_projects",
            "get_project_data", 
            "run_backtest",
            "get_backtest_results",
            "deploy_algorithm",
            "get_live_performance",
            "get_market_data",
            "create_research_notebook"
        ]
        
        for tool in tools:
            await self.call_tool(tool, {"action": "register"})
    
    async def get_market_data(self, symbol: str, resolution: str = "Daily", 
                             start_date: str = None, end_date: str = None) -> Dict:
        """Get market data for a symbol"""
        try:
            params = {
                "symbol": symbol,
                "resolution": resolution,
                "start_date": start_date or "2024-01-01",
                "end_date": end_date or datetime.now().strftime("%Y-%m-%d")
            }
            
            result = await self.call_tool("get_market_data", params)
            
            return {
                "success": True,
                "data": result,
                "symbol": symbol,
                "resolution": resolution
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get market data for {symbol}: {e}")
            return {"success": False, "error": str(e)}
    
    async def run_backtest(self, algorithm_code: str, start_date: str, 
                          end_date: str, capital: float = 100000) -> Dict:
        """Run a backtest with given algorithm"""
        try:
            params = {
                "algorithm": algorithm_code,
                "start_date": start_date,
                "end_date": end_date,
                "capital": capital,
                "environment": self.environment
            }
            
            result = await self.call_tool("run_backtest", params)
            
            return {
                "success": True,
                "backtest_id": result.get("id"),
                "results": result,
                "performance": self._extract_performance_metrics(result)
            }
            
        except Exception as e:
            self.logger.error(f"Failed to run backtest: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_algorithm_performance(self, algorithm_id: str) -> Dict:
        """Get live algorithm performance"""
        try:
            params = {"algorithm_id": algorithm_id}
            result = await self.call_tool("get_live_performance", params)
            
            return {
                "success": True,
                "performance": result,
                "metrics": self._extract_performance_metrics(result)
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get algorithm performance: {e}")
            return {"success": False, "error": str(e)}
    
    async def create_arbitrage_algorithm(self, strategy_config: Dict) -> Dict:
        """Create an arbitrage algorithm based on AGENT's strategies"""
        try:
            # Generate QuantConnect algorithm code from AGENT strategy
            algorithm_code = self._generate_algorithm_code(strategy_config)
            
            params = {
                "name": f"AGENT_Arbitrage_{strategy_config.get('type', 'cross_exchange')}",
                "language": "Python",
                "code": algorithm_code
            }
            
            result = await self.call_tool("create_algorithm", params)
            
            return {
                "success": True,
                "algorithm_id": result.get("id"),
                "strategy_type": strategy_config.get("type"),
                "code": algorithm_code
            }
            
        except Exception as e:
            self.logger.error(f"Failed to create arbitrage algorithm: {e}")
            return {"success": False, "error": str(e)}
    
    def _generate_algorithm_code(self, strategy_config: Dict) -> str:
        """Generate QuantConnect algorithm code from AGENT strategy"""
        strategy_type = strategy_config.get("type", "cross_exchange")
        
        if strategy_type == "cross_exchange":
            return self._generate_cross_exchange_code(strategy_config)
        elif strategy_type == "triangular":
            return self._generate_triangular_code(strategy_config)
        elif strategy_type == "statistical":
            return self._generate_statistical_code(strategy_config)
        else:
            return self._generate_basic_arbitrage_code(strategy_config)
    
    def _generate_cross_exchange_code(self, config: Dict) -> str:
        """Generate cross-exchange arbitrage algorithm"""
        return f'''
from AlgorithmImports import *

class AGENTCrossExchangeArbitrage(QCAlgorithm):
    
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetCash({config.get("capital", 100000)})
        
        # Add securities for arbitrage
        self.btc = self.AddCrypto("BTCUSD", Resolution.Minute)
        self.eth = self.AddCrypto("ETHUSD", Resolution.Minute)
        
        # Arbitrage parameters from AGENT
        self.min_profit_threshold = {config.get("min_profitability", 0.003)}
        self.max_position_size = {config.get("max_position_size", 5000)}
        
        # Schedule arbitrage scanning
        self.Schedule.On(
            self.DateRules.EveryDay(),
            self.TimeRules.Every(TimeSpan.FromMinutes(1)),
            self.ScanArbitrageOpportunities
        )
    
    def ScanArbitrageOpportunities(self):
        """Scan for cross-exchange arbitrage opportunities"""
        try:
            btc_price = self.Securities["BTCUSD"].Price
            eth_price = self.Securities["ETHUSD"].Price
            
            # AGENT-inspired arbitrage logic
            spread = self.CalculateSpread(btc_price, eth_price)
            
            if spread > self.min_profit_threshold:
                self.ExecuteArbitrage(spread)
                
        except Exception as e:
            self.Log(f"Arbitrage scan error: {{e}}")
    
    def CalculateSpread(self, price1, price2):
        """Calculate arbitrage spread (simplified)"""
        return abs(price1 - price2) / min(price1, price2)
    
    def ExecuteArbitrage(self, spread):
        """Execute arbitrage trade"""
        position_size = min(self.max_position_size, self.Portfolio.Cash * 0.1)
        
        if spread > 0:
            self.SetHoldings("BTCUSD", 0.5)
            self.SetHoldings("ETHUSD", -0.5)
            self.Log(f"Arbitrage executed with spread: {{spread:.4f}}")
'''
    
    def _generate_triangular_code(self, config: Dict) -> str:
        """Generate triangular arbitrage algorithm"""
        return f'''
from AlgorithmImports import *

class AGENTTriangularArbitrage(QCAlgorithm):
    
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetCash({config.get("capital", 100000)})
        
        # Currency triangle: USD -> BTC -> ETH -> USD
        self.AddCrypto("BTCUSD", Resolution.Minute)
        self.AddCrypto("ETHUSD", Resolution.Minute) 
        self.AddCrypto("ETHBTC", Resolution.Minute)
        
        self.min_profit_threshold = {config.get("min_profitability", 0.005)}
        
        self.Schedule.On(
            self.DateRules.EveryDay(),
            self.TimeRules.Every(TimeSpan.FromMinutes(1)),
            self.ScanTriangularArbitrage
        )
    
    def ScanTriangularArbitrage(self):
        """Scan for triangular arbitrage opportunities"""
        try:
            btc_usd = self.Securities["BTCUSD"].Price
            eth_usd = self.Securities["ETHUSD"].Price
            eth_btc = self.Securities["ETHBTC"].Price
            
            # Calculate implied vs actual rates
            implied_eth_btc = eth_usd / btc_usd
            actual_eth_btc = eth_btc
            
            spread = abs(implied_eth_btc - actual_eth_btc) / actual_eth_btc
            
            if spread > self.min_profit_threshold:
                self.ExecuteTriangularArbitrage(spread, implied_eth_btc > actual_eth_btc)
                
        except Exception as e:
            self.Log(f"Triangular arbitrage error: {{e}}")
    
    def ExecuteTriangularArbitrage(self, spread, direction):
        """Execute triangular arbitrage"""
        if direction:
            # USD -> BTC -> ETH -> USD
            self.SetHoldings("BTCUSD", 0.33)
            self.SetHoldings("ETHBTC", 0.33)
            self.SetHoldings("ETHUSD", -0.33)
        else:
            # USD -> ETH -> BTC -> USD  
            self.SetHoldings("ETHUSD", 0.33)
            self.SetHoldings("ETHBTC", -0.33)
            self.SetHoldings("BTCUSD", -0.33)
            
        self.Log(f"Triangular arbitrage executed: {{spread:.4f}}")
'''
    
    def _generate_statistical_code(self, config: Dict) -> str:
        """Generate statistical arbitrage algorithm"""
        return f'''
from AlgorithmImports import *
import numpy as np

class AGENTStatisticalArbitrage(QCAlgorithm):
    
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetCash({config.get("capital", 100000)})
        
        # Correlated pairs for statistical arbitrage
        self.asset1 = self.AddEquity("SPY", Resolution.Minute)
        self.asset2 = self.AddEquity("QQQ", Resolution.Minute)
        
        # Rolling windows for statistical analysis
        self.price_window1 = RollingWindow[float](60)
        self.price_window2 = RollingWindow[float](60)
        
        self.z_score_threshold = {config.get("z_score_threshold", 2.0)}
        
        self.Schedule.On(
            self.DateRules.EveryDay(),
            self.TimeRules.Every(TimeSpan.FromMinutes(5)),
            self.CheckStatisticalArbitrage
        )
    
    def OnData(self, data):
        """Update price windows"""
        if data.ContainsKey("SPY"):
            self.price_window1.Add(data["SPY"].Price)
        if data.ContainsKey("QQQ"):
            self.price_window2.Add(data["QQQ"].Price)
    
    def CheckStatisticalArbitrage(self):
        """Check for statistical arbitrage opportunities"""
        if not (self.price_window1.IsReady and self.price_window2.IsReady):
            return
            
        try:
            prices1 = [x for x in self.price_window1]
            prices2 = [x for x in self.price_window2]
            
            # Calculate spread and z-score
            spread = np.array(prices1) - np.array(prices2)
            z_score = (spread[-1] - np.mean(spread)) / np.std(spread)
            
            if abs(z_score) > self.z_score_threshold:
                self.ExecuteStatisticalArbitrage(z_score)
                
        except Exception as e:
            self.Log(f"Statistical arbitrage error: {{e}}")
    
    def ExecuteStatisticalArbitrage(self, z_score):
        """Execute statistical arbitrage based on z-score"""
        if z_score > self.z_score_threshold:
            # Spread too high, short asset1, long asset2
            self.SetHoldings("SPY", -0.5)
            self.SetHoldings("QQQ", 0.5)
        elif z_score < -self.z_score_threshold:
            # Spread too low, long asset1, short asset2
            self.SetHoldings("SPY", 0.5)
            self.SetHoldings("QQQ", -0.5)
            
        self.Log(f"Statistical arbitrage executed: Z-score = {{z_score:.2f}}")
'''
    
    def _generate_basic_arbitrage_code(self, config: Dict) -> str:
        """Generate basic arbitrage algorithm template"""
        return f'''
from AlgorithmImports import *

class AGENTBasicArbitrage(QCAlgorithm):
    
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetCash({config.get("capital", 100000)})
        
        # Add securities for arbitrage
        self.AddEquity("SPY", Resolution.Minute)
        self.AddEquity("IVV", Resolution.Minute)  # Similar ETF for spread trading
        
        self.min_spread = {config.get("min_profitability", 0.002)}
        
    def OnData(self, data):
        """Basic arbitrage logic"""
        if not (data.ContainsKey("SPY") and data.ContainsKey("IVV")):
            return
            
        spy_price = data["SPY"].Price
        ivv_price = data["IVV"].Price
        
        spread = abs(spy_price - ivv_price) / min(spy_price, ivv_price)
        
        if spread > self.min_spread:
            if spy_price > ivv_price:
                self.SetHoldings("SPY", -0.5)
                self.SetHoldings("IVV", 0.5)
            else:
                self.SetHoldings("SPY", 0.5)
                self.SetHoldings("IVV", -0.5)
                
            self.Log(f"Arbitrage executed: Spread = {{spread:.4f}}")
'''
    
    def _extract_performance_metrics(self, result: Dict) -> Dict:
        """Extract key performance metrics from QuantConnect results"""
        try:
            return {
                "total_return": result.get("TotalPerformance", {}).get("PortfolioValue", 0),
                "sharpe_ratio": result.get("Statistics", {}).get("SharpeRatio", 0),
                "max_drawdown": result.get("Statistics", {}).get("Drawdown", 0),
                "total_trades": result.get("Statistics", {}).get("TotalOrders", 0),
                "win_rate": result.get("Statistics", {}).get("WinRate", 0),
                "profit_loss_ratio": result.get("Statistics", {}).get("ProfitLossRatio", 0)
            }
        except Exception as e:
            self.logger.error(f"Failed to extract performance metrics: {e}")
            return {}
    
    async def get_training_data(self) -> Dict:
        """Get training data for AGENT learning"""
        try:
            # Get recent backtests for learning
            backtests = await self.call_tool("list_backtests", {"limit": 50})
            
            training_data = []
            for backtest in backtests.get("results", []):
                metrics = self._extract_performance_metrics(backtest)
                training_data.append({
                    "strategy_type": backtest.get("name", "").split("_")[1] if "_" in backtest.get("name", "") else "unknown",
                    "parameters": backtest.get("parameters", {}),
                    "performance": metrics,
                    "market_conditions": backtest.get("market_data", {}),
                    "execution_time": backtest.get("runtime", 0)
                })
            
            return {
                "success": True,
                "training_data": training_data,
                "total_samples": len(training_data)
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get training data: {e}")
            return {"success": False, "error": str(e)}
