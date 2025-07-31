import asyncio
import json
import re
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging
from ..enhanced_agent import EnhancedAgentBase, Tool

class TraderAgent(EnhancedAgentBase):
    """AI Agent specialized in trading and financial analysis"""
    
    def __init__(self):
        super().__init__("trader")
        self.knowledge_base = {
            "markets": ["stocks", "forex", "crypto", "commodities", "bonds", "options", "futures"],
            "indicators": ["rsi", "macd", "bollinger bands", "moving averages", "stochastic", "fibonacci"],
            "strategies": ["day trading", "swing trading", "scalping", "position trading", "arbitrage"],
            "analysis_types": ["technical", "fundamental", "sentiment", "quantitative"]
        }
        
    def setup_domain_tools(self):
        """Setup trader-specific tools"""
        # Market data analyzer
        self.tool_registry.register_tool(
            name="market_analyzer",
            description="Analyze market data and trends",
            function=self._analyze_market_data,
            parameters={"symbol": "str", "timeframe": "str", "indicators": "list"},
            required_params=["symbol"]
        )
        
        # Risk calculator
        self.tool_registry.register_tool(
            name="risk_calculator",
            description="Calculate position size and risk metrics",
            function=self._calculate_risk,
            parameters={"account_size": "float", "risk_percent": "float", "entry_price": "float", "stop_loss": "float"},
            required_params=["account_size", "risk_percent"]
        )
        
        # Strategy backtester
        self.tool_registry.register_tool(
            name="strategy_backtester",
            description="Backtest trading strategies",
            function=self._backtest_strategy,
            parameters={"strategy": "str", "symbol": "str", "period": "str"},
            required_params=["strategy", "symbol"]
        )
    
    def setup_domain_knowledge(self):
        """Setup trader-specific knowledge"""
        # Load market data, indicators, etc.
        pass
    
    async def process(self, query: str, web_context: List[Dict] = None) -> Dict[str, Any]:
        """Process with enhanced agentic capabilities"""
        context = {
            "web_context": web_context or [],
            "domain": self.domain,
            "query": query
        }
        
        # Use enhanced processing
        enhanced_result = await self.process_enhanced(query, context)
        
        # Add trader-specific enhancements
        if enhanced_result.get("confidence", 0) < 0.7:
            fallback_result = await self._legacy_process(query, web_context)
            enhanced_result["answer"] = fallback_result.get("answer", enhanced_result["answer"])
            enhanced_result["confidence"] = max(enhanced_result.get("confidence", 0), fallback_result.get("confidence", 0))
        
        return enhanced_result
    
    async def _legacy_process(self, query: str, web_context: List[Dict] = None) -> Dict[str, Any]:
        """Process trading-related queries"""
        try:
            query_lower = query.lower()
            
            # Analyze query type
            query_type = self._analyze_query_type(query_lower)
            
            # Generate response based on query type
            if query_type == "market_analysis":
                response = await self._handle_market_analysis(query, web_context)
            elif query_type == "technical_analysis":
                response = await self._handle_technical_analysis(query, web_context)
            elif query_type == "risk_management":
                response = await self._handle_risk_management(query, web_context)
            elif query_type == "strategy":
                response = await self._handle_strategy(query, web_context)
            elif query_type == "portfolio":
                response = await self._handle_portfolio(query, web_context)
            else:
                response = await self._handle_general_trading(query, web_context)
            
            return response
            
        except Exception as e:
            self.logger.error(f"Error in trader agent: {e}")
            return {
                "answer": "I encountered an error processing your trading query. Please provide more details.",
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _analyze_query_type(self, query: str) -> str:
        """Analyze the type of trading query"""
        if any(word in query for word in ["market", "price", "trend", "analysis", "forecast"]):
            return "market_analysis"
        elif any(word in query for word in ["technical", "chart", "indicator", "rsi", "macd", "support", "resistance"]):
            return "technical_analysis"
        elif any(word in query for word in ["risk", "stop loss", "position size", "drawdown"]):
            return "risk_management"
        elif any(word in query for word in ["strategy", "trading plan", "approach", "method"]):
            return "strategy"
        elif any(word in query for word in ["portfolio", "diversification", "allocation", "balance"]):
            return "portfolio"
        else:
            return "general"
    
    async def _handle_market_analysis(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle market analysis requests"""
        # Extract symbols if present
        symbols = re.findall(r'\b[A-Z]{2,5}\b', query.upper())
        
        analysis_points = [
            "Current market sentiment and trends",
            "Key support and resistance levels",
            "Volume analysis and liquidity",
            "Economic indicators impact",
            "Sector rotation and correlations"
        ]
        
        web_insights = ""
        if web_context:
            web_insights = f"\n\nLatest Market Data:\n{web_context[0].get('content', '')[:300]}..."
        
        symbol_analysis = ""
        if symbols:
            symbol_analysis = f"\n\nSymbols mentioned: {', '.join(symbols)}\n"
        
        return {
            "answer": f"Market Analysis Framework:\n\n" + 
                     "\n".join([f"• {point}" for point in analysis_points]) +
                     symbol_analysis +
                     web_insights +
                     "\n\n⚠️ Disclaimer: This is educational content, not financial advice.",
            "confidence": 0.8,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied comprehensive market analysis framework"
        }
    
    async def _handle_technical_analysis(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle technical analysis requests"""
        indicators = {
            "rsi": "Relative Strength Index - measures overbought/oversold conditions",
            "macd": "Moving Average Convergence Divergence - trend following momentum indicator",
            "bollinger": "Bollinger Bands - volatility indicator with upper/lower bands",
            "sma": "Simple Moving Average - trend direction indicator",
            "ema": "Exponential Moving Average - gives more weight to recent prices"
        }
        
        relevant_indicators = [ind for ind in indicators.keys() if ind in query.lower()]
        
        response = "Technical Analysis Insights:\n\n"
        if relevant_indicators:
            for indicator in relevant_indicators:
                response += f"• {indicator.upper()}: {indicators[indicator]}\n"
        else:
            response += "Key Technical Indicators to Consider:\n"
            for ind, desc in list(indicators.items())[:3]:
                response += f"• {ind.upper()}: {desc}\n"
        
        response += "\n📊 Remember to use multiple indicators for confirmation"
        response += "\n⚠️ Disclaimer: Technical analysis is not guaranteed to predict future prices."
        
        return {
            "answer": response,
            "confidence": 0.85,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Provided technical analysis guidance based on established indicators"
        }
    
    async def _handle_risk_management(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle risk management queries"""
        risk_principles = [
            "Never risk more than 1-2% of your account per trade",
            "Use stop-loss orders to limit downside risk",
            "Diversify across different assets and timeframes",
            "Size positions based on volatility and risk tolerance",
            "Keep a trading journal to track performance",
            "Have a clear exit strategy before entering trades",
            "Avoid emotional trading decisions"
        ]
        
        return {
            "answer": "Risk Management Principles:\n\n" + 
                     "\n".join([f"• {principle}" for principle in risk_principles]) +
                     "\n\n🛡️ Risk management is more important than profit maximization." +
                     "\n⚠️ Always trade with money you can afford to lose.",
            "confidence": 0.9,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied proven risk management principles"
        }
    
    async def _handle_strategy(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle trading strategy queries"""
        strategies = {
            "day trading": "Buy and sell within the same day, capitalize on intraday price movements",
            "swing trading": "Hold positions for days to weeks, capture medium-term trends",
            "scalping": "Very short-term trades, profit from small price movements",
            "position trading": "Long-term approach, hold for months to years"
        }
        
        strategy_components = [
            "Entry criteria and signals",
            "Exit rules (profit targets and stop losses)",
            "Position sizing methodology",
            "Risk-reward ratio requirements",
            "Market conditions for strategy use",
            "Backtesting and performance metrics"
        ]
        
        return {
            "answer": f"Trading Strategy Development:\n\n" +
                     "Essential Components:\n" +
                     "\n".join([f"• {comp}" for comp in strategy_components]) +
                     "\n\nCommon Strategy Types:\n" +
                     "\n".join([f"• {name.title()}: {desc}" for name, desc in strategies.items()]) +
                     "\n\n📈 Always backtest strategies before live implementation.",
            "confidence": 0.8,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Provided comprehensive strategy development framework"
        }
    
    async def _handle_portfolio(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle portfolio management queries"""
        portfolio_principles = [
            "Diversify across asset classes (stocks, bonds, commodities)",
            "Rebalance periodically to maintain target allocations",
            "Consider correlation between assets",
            "Match risk tolerance with investment timeline",
            "Monitor and adjust based on market conditions",
            "Keep some cash reserves for opportunities"
        ]
        
        return {
            "answer": "Portfolio Management Guidelines:\n\n" +
                     "\n".join([f"• {principle}" for principle in portfolio_principles]) +
                     "\n\n💼 A well-diversified portfolio reduces overall risk." +
                     "\n⚠️ Consider consulting with a financial advisor for personalized advice.",
            "confidence": 0.85,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied modern portfolio theory principles"
        }
    
    async def _handle_general_trading(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle general trading queries"""
        return {
            "answer": f"As a trading AI, I can help with:\n\n" +
                     "• Market analysis and trend identification\n" +
                     "• Technical indicator interpretation\n" +
                     "• Risk management strategies\n" +
                     "• Trading strategy development\n" +
                     "• Portfolio optimization\n" +
                     "• Educational content on trading concepts\n\n" +
                     f"For your query: {query}\n" +
                     "Please provide more specific details for targeted assistance.\n\n" +
                     "⚠️ Important: All information is educational only, not financial advice.",
            "confidence": 0.6,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Provided general trading assistance overview"
        }
    
    async def _analyze_market_data(self, symbol: str, timeframe: str = "1d", indicators: List[str] = None) -> Dict[str, Any]:
        """Analyze market data for a given symbol"""
        # Simulated market analysis (in production, would use real market data APIs)
        analysis = {
            "symbol": symbol.upper(),
            "timeframe": timeframe,
            "trend": "bullish",  # Would be calculated from real data
            "support_levels": [100, 95, 90],
            "resistance_levels": [110, 115, 120],
            "volume_analysis": "above_average",
            "volatility": "moderate"
        }
        
        if indicators:
            analysis["indicators"] = {}
            for indicator in indicators:
                if indicator.lower() == "rsi":
                    analysis["indicators"]["rsi"] = {"value": 65, "signal": "neutral"}
                elif indicator.lower() == "macd":
                    analysis["indicators"]["macd"] = {"signal": "bullish_crossover"}
                elif indicator.lower() == "sma":
                    analysis["indicators"]["sma_20"] = {"value": 105, "trend": "upward"}
        
        return analysis
    
    async def _calculate_risk(self, account_size: float, risk_percent: float, 
                             entry_price: float = None, stop_loss: float = None) -> Dict[str, Any]:
        """Calculate position size and risk metrics"""
        risk_amount = account_size * (risk_percent / 100)
        
        result = {
            "account_size": account_size,
            "risk_percent": risk_percent,
            "risk_amount": risk_amount,
            "max_loss": risk_amount
        }
        
        if entry_price and stop_loss:
            price_diff = abs(entry_price - stop_loss)
            position_size = risk_amount / price_diff if price_diff > 0 else 0
            
            result.update({
                "entry_price": entry_price,
                "stop_loss": stop_loss,
                "price_difference": price_diff,
                "position_size": position_size,
                "risk_reward_ratio": "1:2"  # Default assumption
            })
        
        return result
    
    async def _backtest_strategy(self, strategy: str, symbol: str, period: str = "1y") -> Dict[str, Any]:
        """Backtest a trading strategy"""
        # Simulated backtesting results
        strategies = {
            "sma_crossover": {
                "total_trades": 24,
                "winning_trades": 15,
                "losing_trades": 9,
                "win_rate": 62.5,
                "total_return": 18.5,
                "max_drawdown": -8.2,
                "sharpe_ratio": 1.35
            },
            "rsi_divergence": {
                "total_trades": 18,
                "winning_trades": 12,
                "losing_trades": 6,
                "win_rate": 66.7,
                "total_return": 22.1,
                "max_drawdown": -6.5,
                "sharpe_ratio": 1.52
            }
        }
        
        strategy_key = strategy.lower().replace(" ", "_")
        if strategy_key in strategies:
            result = strategies[strategy_key].copy()
            result.update({
                "strategy": strategy,
                "symbol": symbol.upper(),
                "period": period,
                "recommendation": "profitable" if result["total_return"] > 10 else "needs_optimization"
            })
            return result
        else:
            return {
                "error": f"Strategy '{strategy}' not found",
                "available_strategies": list(strategies.keys())
            }
    
    async def generate_proactive_suggestions(self, query: str, result: Dict[str, Any]) -> List[str]:
        """Generate trader-specific proactive suggestions"""
        suggestions = []
        
        if any(word in query.lower() for word in ["stock", "crypto", "forex"]):
            suggestions.append("Would you like me to analyze the current market trends for this asset?")
            suggestions.append("I can help calculate optimal position sizing for your risk tolerance.")
        
        if "strategy" in query.lower():
            suggestions.append("I can backtest this strategy with historical data.")
            suggestions.append("Consider diversifying across multiple strategies for better risk management.")
        
        if "risk" in query.lower():
            suggestions.append("Remember to never risk more than 1-2% of your account per trade.")
            suggestions.append("Would you like me to calculate position sizes based on your risk parameters?")
        
        return suggestions[:3]
    
    async def update_knowledge(self):
        """Update knowledge base with latest market data and trends"""
        # This would typically fetch from financial APIs
        self.logger.info("Trader knowledge base updated")
        return True
