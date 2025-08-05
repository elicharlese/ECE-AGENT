"""
Enhanced Trading Module for AGENT
Integrates Hummingbot-inspired arbitrage strategies with advanced trading capabilities

Features:
- Multi-exchange connectivity
- Real-time arbitrage detection
- Risk management
- Portfolio optimization
- Performance analytics
- WebSocket integration for live updates
"""

import asyncio
import json
import logging
from decimal import Decimal
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from dataclasses import dataclass, asdict
import websockets

from .arbitrage_strategies import (
    ArbitrageManager, ArbitrageType, ArbitrageOpportunity, 
    ArbitrageLeg, OrderSide, MarketInfo, PriceData
)

logger = logging.getLogger(__name__)

@dataclass
class TradingConfig:
    """Trading configuration"""
    enabled: bool = True
    max_total_exposure: Decimal = Decimal("50000")  # $50k max
    max_single_position: Decimal = Decimal("5000")   # $5k per position
    min_profitability: Decimal = Decimal("0.003")   # 0.3%
    risk_management_enabled: bool = True
    stop_loss_pct: Decimal = Decimal("0.02")        # 2% stop loss
    take_profit_pct: Decimal = Decimal("0.05")      # 5% take profit
    max_drawdown_pct: Decimal = Decimal("0.10")     # 10% max drawdown
    
    # Arbitrage specific settings
    cross_exchange_enabled: bool = True
    triangular_enabled: bool = True
    spot_perpetual_enabled: bool = False  # Requires futures access
    amm_arbitrage_enabled: bool = False   # Requires DEX integration
    
    # Exchange settings
    supported_exchanges: List[str] = None
    
    def __post_init__(self):
        if self.supported_exchanges is None:
            self.supported_exchanges = ["binance", "coinbase", "kraken", "kucoin"]

@dataclass
class PortfolioMetrics:
    """Portfolio performance metrics"""
    total_pnl: Decimal = Decimal("0")
    total_trades: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    avg_win: Decimal = Decimal("0")
    avg_loss: Decimal = Decimal("0")
    win_rate: Decimal = Decimal("0")
    sharpe_ratio: Decimal = Decimal("0")
    max_drawdown: Decimal = Decimal("0")
    current_drawdown: Decimal = Decimal("0")
    
    def update_from_trade(self, pnl: Decimal):
        """Update metrics from a completed trade"""
        self.total_pnl += pnl
        self.total_trades += 1
        
        if pnl > 0:
            self.winning_trades += 1
            if self.winning_trades > 0:
                self.avg_win = ((self.avg_win * (self.winning_trades - 1)) + pnl) / self.winning_trades
        else:
            self.losing_trades += 1
            if self.losing_trades > 0:
                self.avg_loss = ((self.avg_loss * (self.losing_trades - 1)) + abs(pnl)) / self.losing_trades
        
        if self.total_trades > 0:
            self.win_rate = Decimal(self.winning_trades) / Decimal(self.total_trades)

class ExchangeConnector:
    """Mock exchange connector for demonstration"""
    
    def __init__(self, name: str):
        self.name = name
        self.is_connected = False
        self.balances = {
            "BTC": Decimal("1.0"),
            "ETH": Decimal("10.0"),
            "USDT": Decimal("50000.0"),
            "USD": Decimal("50000.0")
        }
        self.order_book = {}
        
    async def connect(self):
        """Connect to exchange"""
        await asyncio.sleep(0.1)  # Simulate connection delay
        self.is_connected = True
        logger.info(f"Connected to {self.name}")
        
    async def disconnect(self):
        """Disconnect from exchange"""
        self.is_connected = False
        logger.info(f"Disconnected from {self.name}")
        
    async def get_ticker(self, symbol: str) -> Dict[str, Any]:
        """Get ticker data for symbol"""
        if not self.is_connected:
            raise Exception(f"Not connected to {self.name}")
            
        # Simulate ticker data
        base_prices = {"BTC-USDT": 50000, "ETH-USDT": 3000, "BTC-USD": 50000, "ETH-USD": 3000}
        base_price = base_prices.get(symbol, 1000)
        
        # Add some random variation
        import random
        price = base_price * (1 + (random.random() - 0.5) * 0.01)  # ±0.5% variation
        spread = price * 0.001  # 0.1% spread
        
        return {
            "symbol": symbol,
            "bid": price - spread/2,
            "ask": price + spread/2,
            "last": price,
            "volume": 1000000,
            "timestamp": datetime.now().timestamp()
        }
        
    async def place_order(self, symbol: str, side: str, amount: Decimal, price: Decimal, order_type: str = "limit") -> str:
        """Place an order"""
        if not self.is_connected:
            raise Exception(f"Not connected to {self.name}")
            
        # Simulate order placement
        order_id = f"{self.name}_{int(datetime.now().timestamp() * 1000)}"
        logger.info(f"Placed {side} order on {self.name}: {amount} {symbol} at {price}")
        
        # Simulate order execution after a delay
        asyncio.create_task(self._simulate_order_execution(order_id, symbol, side, amount, price))
        
        return order_id
        
    async def _simulate_order_execution(self, order_id: str, symbol: str, side: str, amount: Decimal, price: Decimal):
        """Simulate order execution"""
        await asyncio.sleep(0.5 + np.random.random())  # Random execution delay
        
        base_asset, quote_asset = symbol.split("-")
        
        if side.lower() == "buy":
            # Deduct quote asset, add base asset
            cost = amount * price
            if self.balances.get(quote_asset, 0) >= cost:
                self.balances[quote_asset] -= cost
                self.balances[base_asset] = self.balances.get(base_asset, 0) + amount
                logger.info(f"Order {order_id} executed: Bought {amount} {base_asset}")
            else:
                logger.error(f"Insufficient balance for order {order_id}")
        else:
            # Deduct base asset, add quote asset
            if self.balances.get(base_asset, 0) >= amount:
                self.balances[base_asset] -= amount
                proceeds = amount * price
                self.balances[quote_asset] = self.balances.get(quote_asset, 0) + proceeds
                logger.info(f"Order {order_id} executed: Sold {amount} {base_asset}")
            else:
                logger.error(f"Insufficient balance for order {order_id}")

class TradingEngine:
    """Main trading engine with arbitrage capabilities"""
    
    def __init__(self, config: TradingConfig = None):
        self.config = config or TradingConfig()
        self.arbitrage_manager = ArbitrageManager()
        self.exchanges: Dict[str, ExchangeConnector] = {}
        self.portfolio_metrics = PortfolioMetrics()
        self.is_running = False
        self.price_feeds: Dict[str, PriceData] = {}
        self.websocket_clients: List[websockets.WebSocketServerProtocol] = []
        
        # Risk management
        self.position_sizes: Dict[str, Decimal] = {}
        self.daily_pnl = Decimal("0")
        self.peak_portfolio_value = Decimal("0")
        
    async def initialize(self):
        """Initialize trading engine"""
        logger.info("Initializing enhanced trading engine...")
        
        # Initialize exchange connections
        for exchange_name in self.config.supported_exchanges:
            connector = ExchangeConnector(exchange_name)
            await connector.connect()
            self.exchanges[exchange_name] = connector
            
        # Initialize arbitrage manager
        arb_config = {
            "min_profitability": self.config.min_profitability,
            "max_position_size": self.config.max_single_position,
            "enabled_strategies": []
        }
        
        if self.config.cross_exchange_enabled:
            arb_config["enabled_strategies"].append(ArbitrageType.CROSS_EXCHANGE)
        if self.config.triangular_enabled:
            arb_config["enabled_strategies"].append(ArbitrageType.TRIANGULAR)
        if self.config.spot_perpetual_enabled:
            arb_config["enabled_strategies"].append(ArbitrageType.SPOT_PERPETUAL)
        if self.config.amm_arbitrage_enabled:
            arb_config["enabled_strategies"].append(ArbitrageType.AMM_ARBITRAGE)
            
        await self.arbitrage_manager.update_config(arb_config)
        
        logger.info("Trading engine initialized successfully")
        
    async def start(self):
        """Start trading engine"""
        if self.is_running:
            return
            
        self.is_running = True
        logger.info("Starting enhanced trading engine...")
        
        # Start arbitrage manager
        await self.arbitrage_manager.start()
        
        # Start price feed updates
        asyncio.create_task(self._price_feed_loop())
        
        # Start risk monitoring
        asyncio.create_task(self._risk_monitoring_loop())
        
        # Start WebSocket server for live updates
        asyncio.create_task(self._start_websocket_server())
        
        logger.info("Enhanced trading engine started successfully")
        
    async def stop(self):
        """Stop trading engine"""
        if not self.is_running:
            return
            
        self.is_running = False
        logger.info("Stopping enhanced trading engine...")
        
        # Stop arbitrage manager
        await self.arbitrage_manager.stop()
        
        # Disconnect exchanges
        for exchange in self.exchanges.values():
            await exchange.disconnect()
            
        logger.info("Enhanced trading engine stopped")
        
    async def _price_feed_loop(self):
        """Update price feeds continuously"""
        symbols = ["BTC-USDT", "ETH-USDT", "BTC-USD", "ETH-USD"]
        
        while self.is_running:
            try:
                for exchange_name, exchange in self.exchanges.items():
                    for symbol in symbols:
                        try:
                            ticker = await exchange.get_ticker(symbol)
                            
                            price_data = PriceData(
                                bid=Decimal(str(ticker["bid"])),
                                ask=Decimal(str(ticker["ask"])),
                                mid=Decimal(str(ticker["last"])),
                                spread=Decimal(str(ticker["ask"])) - Decimal(str(ticker["bid"])),
                                timestamp=ticker["timestamp"]
                            )
                            
                            feed_key = f"{exchange_name}:{symbol}"
                            self.price_feeds[feed_key] = price_data
                            
                        except Exception as e:
                            logger.error(f"Error updating price feed for {exchange_name}:{symbol}: {e}")
                
                # Broadcast updates to WebSocket clients
                await self._broadcast_price_updates()
                
                await asyncio.sleep(1)  # Update every second
                
            except Exception as e:
                logger.error(f"Error in price feed loop: {e}")
                await asyncio.sleep(5)
                
    async def _risk_monitoring_loop(self):
        """Monitor risk metrics continuously"""
        while self.is_running:
            try:
                await self._check_risk_limits()
                await asyncio.sleep(10)  # Check every 10 seconds
            except Exception as e:
                logger.error(f"Error in risk monitoring: {e}")
                await asyncio.sleep(10)
                
    async def _check_risk_limits(self):
        """Check if any risk limits are breached"""
        if not self.config.risk_management_enabled:
            return
            
        # Calculate current portfolio value
        current_value = await self._calculate_portfolio_value()
        
        # Update peak value
        if current_value > self.peak_portfolio_value:
            self.peak_portfolio_value = current_value
            
        # Calculate drawdown
        if self.peak_portfolio_value > 0:
            drawdown = (self.peak_portfolio_value - current_value) / self.peak_portfolio_value
            self.portfolio_metrics.current_drawdown = drawdown
            
            if drawdown > self.portfolio_metrics.max_drawdown:
                self.portfolio_metrics.max_drawdown = drawdown
                
            # Check max drawdown limit
            if drawdown > self.config.max_drawdown_pct:
                logger.warning(f"Max drawdown exceeded: {drawdown:.2%}")
                await self._emergency_stop()
                
    async def _calculate_portfolio_value(self) -> Decimal:
        """Calculate total portfolio value in USD"""
        total_value = Decimal("0")
        
        for exchange in self.exchanges.values():
            # Add USD/USDT balances
            total_value += exchange.balances.get("USD", Decimal("0"))
            total_value += exchange.balances.get("USDT", Decimal("0"))
            
            # Convert crypto balances to USD
            for asset, balance in exchange.balances.items():
                if asset in ["USD", "USDT"] or balance == 0:
                    continue
                    
                try:
                    symbol = f"{asset}-USDT"
                    feed_key = f"{exchange.name}:{symbol}"
                    if feed_key in self.price_feeds:
                        price = self.price_feeds[feed_key].mid
                        total_value += balance * price
                except Exception as e:
                    logger.error(f"Error calculating value for {asset}: {e}")
                    
        return total_value
        
    async def _emergency_stop(self):
        """Emergency stop all trading"""
        logger.critical("EMERGENCY STOP TRIGGERED - Halting all trading")
        self.config.enabled = False
        await self.arbitrage_manager.stop()
        
        # Broadcast emergency alert
        alert = {
            "type": "emergency_stop",
            "message": "Trading halted due to risk limits",
            "timestamp": datetime.now().isoformat()
        }
        await self._broadcast_to_websockets(alert)
        
    async def _start_websocket_server(self):
        """Start WebSocket server for live updates"""
        async def handle_client(websocket, path):
            self.websocket_clients.append(websocket)
            logger.info(f"WebSocket client connected: {websocket.remote_address}")
            
            try:
                # Send initial status
                status = await self.get_comprehensive_status()
                await websocket.send(json.dumps(status))
                
                # Keep connection alive
                async for message in websocket:
                    # Handle incoming messages (commands, config updates, etc.)
                    try:
                        data = json.loads(message)
                        await self._handle_websocket_command(websocket, data)
                    except json.JSONDecodeError:
                        await websocket.send(json.dumps({"error": "Invalid JSON"}))
                        
            except websockets.exceptions.ConnectionClosed:
                pass
            finally:
                if websocket in self.websocket_clients:
                    self.websocket_clients.remove(websocket)
                logger.info(f"WebSocket client disconnected: {websocket.remote_address}")
        
        try:
            server = await websockets.serve(handle_client, "localhost", 8765)
            logger.info("WebSocket server started on ws://localhost:8765")
            await server.wait_closed()
        except Exception as e:
            logger.error(f"WebSocket server error: {e}")
            
    async def _handle_websocket_command(self, websocket, data: Dict[str, Any]):
        """Handle WebSocket commands from clients"""
        command = data.get("command")
        
        if command == "get_status":
            status = await self.get_comprehensive_status()
            await websocket.send(json.dumps(status))
            
        elif command == "update_config":
            config_data = data.get("config", {})
            await self._update_trading_config(config_data)
            response = {"success": True, "message": "Configuration updated"}
            await websocket.send(json.dumps(response))
            
        elif command == "emergency_stop":
            await self._emergency_stop()
            response = {"success": True, "message": "Emergency stop activated"}
            await websocket.send(json.dumps(response))
            
        else:
            error = {"error": f"Unknown command: {command}"}
            await websocket.send(json.dumps(error))
            
    async def _broadcast_price_updates(self):
        """Broadcast price updates to WebSocket clients"""
        if not self.websocket_clients:
            return
            
        update = {
            "type": "price_update",
            "data": {key: asdict(price_data) for key, price_data in self.price_feeds.items()},
            "timestamp": datetime.now().isoformat()
        }
        
        await self._broadcast_to_websockets(update)
        
    async def _broadcast_to_websockets(self, data: Dict[str, Any]):
        """Broadcast data to all WebSocket clients"""
        if not self.websocket_clients:
            return
            
        message = json.dumps(data)
        disconnected_clients = []
        
        for client in self.websocket_clients:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                disconnected_clients.append(client)
            except Exception as e:
                logger.error(f"Error sending to WebSocket client: {e}")
                disconnected_clients.append(client)
                
        # Remove disconnected clients
        for client in disconnected_clients:
            if client in self.websocket_clients:
                self.websocket_clients.remove(client)
                
    async def _update_trading_config(self, config_data: Dict[str, Any]):
        """Update trading configuration"""
        for key, value in config_data.items():
            if hasattr(self.config, key):
                if isinstance(getattr(self.config, key), Decimal):
                    setattr(self.config, key, Decimal(str(value)))
                else:
                    setattr(self.config, key, value)
                    
        logger.info(f"Updated trading config: {config_data}")
        
    async def get_comprehensive_status(self) -> Dict[str, Any]:
        """Get comprehensive trading status"""
        portfolio_value = await self._calculate_portfolio_value()
        arbitrage_status = self.arbitrage_manager.get_status()
        
        exchange_status = {}
        for name, exchange in self.exchanges.items():
            exchange_status[name] = {
                "connected": exchange.is_connected,
                "balances": {k: float(v) for k, v in exchange.balances.items()}
            }
            
        return {
            "timestamp": datetime.now().isoformat(),
            "is_running": self.is_running,
            "config": asdict(self.config),
            "portfolio": {
                "total_value_usd": float(portfolio_value),
                "metrics": asdict(self.portfolio_metrics)
            },
            "exchanges": exchange_status,
            "arbitrage": arbitrage_status,
            "price_feeds": {k: asdict(v) for k, v in self.price_feeds.items()},
            "active_positions": len(self.position_sizes),
            "risk_status": {
                "within_limits": self.portfolio_metrics.current_drawdown <= self.config.max_drawdown_pct,
                "current_drawdown": float(self.portfolio_metrics.current_drawdown),
                "max_drawdown_limit": float(self.config.max_drawdown_pct)
            }
        }
        
    async def execute_manual_trade(self, exchange: str, symbol: str, side: str, amount: Decimal, price: Decimal = None) -> str:
        """Execute a manual trade"""
        if not self.config.enabled:
            raise Exception("Trading is disabled")
            
        if exchange not in self.exchanges:
            raise Exception(f"Exchange {exchange} not connected")
            
        connector = self.exchanges[exchange]
        
        # Use market price if no price specified
        if price is None:
            ticker = await connector.get_ticker(symbol)
            price = Decimal(str(ticker["ask" if side.lower() == "buy" else "bid"]))
            
        # Execute the trade
        order_id = await connector.place_order(symbol, side, amount, price, "market")
        
        logger.info(f"Manual trade executed: {side} {amount} {symbol} on {exchange}")
        return order_id

# Example usage
async def demo_enhanced_trading():
    """Demonstrate enhanced trading capabilities"""
    config = TradingConfig(
        max_total_exposure=Decimal("10000"),
        min_profitability=Decimal("0.002"),  # 0.2%
        cross_exchange_enabled=True,
        triangular_enabled=True
    )
    
    engine = TradingEngine(config)
    
    try:
        await engine.initialize()
        await engine.start()
        
        print("Enhanced trading engine started!")
        print("WebSocket server running on ws://localhost:8765")
        print("Connect with a WebSocket client to see live updates")
        
        # Run for demonstration
        for i in range(60):  # Run for 1 minute
            status = await engine.get_comprehensive_status()
            print(f"\nStatus update {i+1}:")
            print(f"Portfolio Value: ${status['portfolio']['total_value_usd']:,.2f}")
            print(f"Active Arbitrage Positions: {status['arbitrage']['total_active_positions']}")
            print(f"Current Drawdown: {status['risk_status']['current_drawdown']:.2%}")
            
            await asyncio.sleep(1)
            
    finally:
        await engine.stop()

if __name__ == "__main__":
    asyncio.run(demo_enhanced_trading())
