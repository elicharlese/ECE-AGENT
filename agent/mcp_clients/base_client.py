"""
MCP (Model Context Protocol) Client Base
Handles connections to external MCP servers for training and data integration
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Callable
from dataclasses import dataclass
from enum import Enum

try:
    import websockets
except ImportError:
    # Fallback for environments without websockets
    websockets = None


class MCPMessageType(Enum):
    """MCP message types"""
    INITIALIZE = "initialize"
    CALL = "call" 
    RESULT = "result"
    ERROR = "error"
    NOTIFICATION = "notification"


@dataclass
class MCPMessage:
    """MCP message structure"""
    type: MCPMessageType
    id: Optional[str] = None
    method: Optional[str] = None
    params: Optional[Dict[str, Any]] = None
    result: Optional[Any] = None
    error: Optional[Dict[str, Any]] = None


class MCPClient:
    """Base MCP client for connecting to external servers"""
    
    def __init__(self, server_url: str, server_name: str):
        self.server_url = server_url
        self.server_name = server_name
        self.websocket = None
        self.is_connected = False
        self.message_id = 0
        self.pending_requests = {}
        self.event_handlers = {}
        self.logger = logging.getLogger(f"mcp_client_{server_name}")
        
    async def connect(self) -> bool:
        """Connect to the MCP server"""
        try:
            self.logger.info(f"Connecting to {self.server_name} at {self.server_url}")
            
            self.websocket = await websockets.connect(self.server_url)
            self.is_connected = True
            
            # Start message handler task
            asyncio.create_task(self._handle_messages())
            
            # Send initialize message
            await self._initialize()
            
            self.logger.info(f"Successfully connected to {self.server_name}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to connect to {self.server_name}: {e}")
            self.is_connected = False
            return False
    
    async def disconnect(self):
        """Disconnect from the MCP server"""
        if self.websocket:
            await self.websocket.close()
            self.is_connected = False
            self.logger.info(f"Disconnected from {self.server_name}")
    
    async def _initialize(self):
        """Send initialization message"""
        init_message = MCPMessage(
            type=MCPMessageType.INITIALIZE,
            id=str(self._get_next_id()),
            method="initialize",
            params={
                "client_info": {
                    "name": "AGENT Trading Bot",
                    "version": "1.0.0"
                },
                "capabilities": {
                    "experimental": {},
                    "sampling": {}
                }
            }
        )
        
        await self._send_message(init_message)
    
    async def _handle_messages(self):
        """Handle incoming messages from the server"""
        try:
            async for message in self.websocket:
                data = json.loads(message)
                await self._process_message(data)
                
        except websockets.exceptions.ConnectionClosed:
            self.logger.info(f"Connection to {self.server_name} closed")
            self.is_connected = False
        except Exception as e:
            self.logger.error(f"Error handling messages from {self.server_name}: {e}")
            self.is_connected = False
    
    async def _process_message(self, data: Dict[str, Any]):
        """Process incoming message"""
        message_id = data.get("id")
        
        if message_id and message_id in self.pending_requests:
            # This is a response to a request
            future = self.pending_requests.pop(message_id)
            
            if "error" in data:
                future.set_exception(Exception(data["error"]["message"]))
            else:
                future.set_result(data.get("result"))
                
        elif data.get("method"):
            # This is a notification or call from server
            method = data["method"]
            params = data.get("params", {})
            
            if method in self.event_handlers:
                await self.event_handlers[method](params)
    
    async def _send_message(self, message: MCPMessage):
        """Send message to server"""
        if not self.is_connected or not self.websocket:
            raise Exception(f"Not connected to {self.server_name}")
        
        message_dict = {
            "jsonrpc": "2.0",
            "type": message.type.value
        }
        
        if message.id:
            message_dict["id"] = message.id
        if message.method:
            message_dict["method"] = message.method
        if message.params:
            message_dict["params"] = message.params
        if message.result is not None:
            message_dict["result"] = message.result
        if message.error:
            message_dict["error"] = message.error
        
        await self.websocket.send(json.dumps(message_dict))
    
    async def call_method(self, method: str, params: Dict[str, Any] = None) -> Any:
        """Call a method on the server and wait for response"""
        message_id = str(self._get_next_id())
        
        message = MCPMessage(
            type=MCPMessageType.CALL,
            id=message_id,
            method=method,
            params=params or {}
        )
        
        # Create future for response
        future = asyncio.Future()
        self.pending_requests[message_id] = future
        
        await self._send_message(message)
        
        # Wait for response with timeout
        try:
            result = await asyncio.wait_for(future, timeout=30.0)
            return result
        except asyncio.TimeoutError:
            self.pending_requests.pop(message_id, None)
            raise Exception(f"Timeout waiting for response from {self.server_name}")
    
    def on(self, event: str, handler: Callable):
        """Register event handler"""
        self.event_handlers[event] = handler
    
    def _get_next_id(self) -> int:
        """Get next message ID"""
        self.message_id += 1
        return self.message_id


class QuantConnectMCPClient(MCPClient):
    """MCP client for QuantConnect integration"""
    
    def __init__(self, api_url: str = "wss://api.quantconnect.com/mcp"):
        super().__init__(api_url, "QuantConnect")
        
    async def get_market_data(self, symbols: List[str], 
                            timeframe: str = "1D",
                            start_date: str = None,
                            end_date: str = None) -> Dict[str, Any]:
        """Get market data for symbols"""
        return await self.call_method("market_data.get", {
            "symbols": symbols,
            "timeframe": timeframe,
            "start_date": start_date,
            "end_date": end_date
        })
    
    async def backtest_strategy(self, strategy_code: str,
                              start_date: str,
                              end_date: str,
                              initial_capital: float = 100000) -> Dict[str, Any]:
        """Run backtest for strategy"""
        return await self.call_method("backtest.run", {
            "strategy_code": strategy_code,
            "start_date": start_date,
            "end_date": end_date,
            "initial_capital": initial_capital
        })
    
    async def get_universe_data(self, universe_type: str = "equity") -> List[str]:
        """Get trading universe symbols"""
        return await self.call_method("universe.get", {
            "type": universe_type
        })
    
    async def get_fundamental_data(self, symbol: str) -> Dict[str, Any]:
        """Get fundamental data for symbol"""
        return await self.call_method("fundamental.get", {
            "symbol": symbol
        })


class ComposerTradeMCPClient(MCPClient):
    """MCP client for Composer Trade integration"""
    
    def __init__(self, api_url: str = "wss://api.composer.trade/mcp"):
        super().__init__(api_url, "ComposerTrade")
    
    async def get_portfolio_data(self, portfolio_id: str = None) -> Dict[str, Any]:
        """Get portfolio information"""
        return await self.call_method("portfolio.get", {
            "portfolio_id": portfolio_id
        })
    
    async def place_order(self, symbol: str, quantity: float,
                         order_type: str = "market",
                         side: str = "buy") -> Dict[str, Any]:
        """Place trading order"""
        return await self.call_method("orders.place", {
            "symbol": symbol,
            "quantity": quantity,
            "type": order_type,
            "side": side
        })
    
    async def get_risk_metrics(self, portfolio_id: str = None) -> Dict[str, Any]:
        """Get risk analysis for portfolio"""
        return await self.call_method("risk.analyze", {
            "portfolio_id": portfolio_id
        })
    
    async def optimize_portfolio(self, constraints: Dict[str, Any]) -> Dict[str, Any]:
        """Run portfolio optimization"""
        return await self.call_method("optimization.run", {
            "constraints": constraints
        })
    
    async def get_performance_attribution(self, 
                                        portfolio_id: str = None,
                                        start_date: str = None,
                                        end_date: str = None) -> Dict[str, Any]:
        """Get performance attribution analysis"""
        return await self.call_method("performance.attribution", {
            "portfolio_id": portfolio_id,
            "start_date": start_date,
            "end_date": end_date
        })


class MCPManager:
    """Manages connections to multiple MCP servers"""
    
    def __init__(self):
        self.clients = {}
        self.logger = logging.getLogger("mcp_manager")
    
    async def add_client(self, name: str, client: MCPClient) -> bool:
        """Add and connect MCP client"""
        try:
            success = await client.connect()
            if success:
                self.clients[name] = client
                self.logger.info(f"Added MCP client: {name}")
                return True
            else:
                self.logger.error(f"Failed to connect MCP client: {name}")
                return False
        except Exception as e:
            self.logger.error(f"Error adding MCP client {name}: {e}")
            return False
    
    async def remove_client(self, name: str):
        """Remove MCP client"""
        if name in self.clients:
            await self.clients[name].disconnect()
            del self.clients[name]
            self.logger.info(f"Removed MCP client: {name}")
    
    def get_client(self, name: str) -> Optional[MCPClient]:
        """Get MCP client by name"""
        return self.clients.get(name)
    
    async def disconnect_all(self):
        """Disconnect all MCP clients"""
        for name, client in list(self.clients.items()):
            await self.remove_client(name)
    
    def get_status(self) -> Dict[str, bool]:
        """Get connection status of all clients"""
        return {name: client.is_connected for name, client in self.clients.items()}


# Global MCP manager instance
mcp_manager = MCPManager()


async def initialize_mcp_clients():
    """Initialize MCP clients for trading integration"""
    logger = logging.getLogger("mcp_init")
    
    try:
        # Initialize QuantConnect client
        qc_client = QuantConnectMCPClient()
        await mcp_manager.add_client("quantconnect", qc_client)
        
        # Initialize Composer Trade client  
        ct_client = ComposerTradeMCPClient()
        await mcp_manager.add_client("composer_trade", ct_client)
        
        logger.info("MCP clients initialized successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to initialize MCP clients: {e}")
        return False


# Training data aggregation
class MCPTrainingDataAggregator:
    """Aggregates training data from multiple MCP sources"""
    
    def __init__(self, mcp_manager: MCPManager):
        self.mcp_manager = mcp_manager
        self.logger = logging.getLogger("mcp_training")
    
    async def collect_market_data(self, symbols: List[str], 
                                timeframe: str = "1D",
                                days_back: int = 365) -> Dict[str, Any]:
        """Collect market data from QuantConnect"""
        qc_client = self.mcp_manager.get_client("quantconnect")
        if not qc_client or not qc_client.is_connected:
            raise Exception("QuantConnect MCP client not available")
        
        # Calculate date range
        from datetime import datetime, timedelta
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        return await qc_client.get_market_data(
            symbols=symbols,
            timeframe=timeframe,
            start_date=start_date.isoformat(),
            end_date=end_date.isoformat()
        )
    
    async def collect_portfolio_data(self) -> Dict[str, Any]:
        """Collect portfolio data from Composer Trade"""
        ct_client = self.mcp_manager.get_client("composer_trade")
        if not ct_client or not ct_client.is_connected:
            raise Exception("Composer Trade MCP client not available")
        
        return await ct_client.get_portfolio_data()
    
    async def collect_risk_data(self) -> Dict[str, Any]:
        """Collect risk metrics from Composer Trade"""
        ct_client = self.mcp_manager.get_client("composer_trade")
        if not ct_client or not ct_client.is_connected:
            raise Exception("Composer Trade MCP client not available")
        
        return await ct_client.get_risk_metrics()
    
    async def generate_training_dataset(self, 
                                      symbols: List[str],
                                      include_portfolio: bool = True,
                                      include_risk: bool = True) -> Dict[str, Any]:
        """Generate comprehensive training dataset"""
        dataset = {}
        
        try:
            # Collect market data
            self.logger.info("Collecting market data...")
            dataset["market_data"] = await self.collect_market_data(symbols)
            
            if include_portfolio:
                self.logger.info("Collecting portfolio data...")
                dataset["portfolio_data"] = await self.collect_portfolio_data()
            
            if include_risk:
                self.logger.info("Collecting risk data...")
                dataset["risk_data"] = await self.collect_risk_data()
            
            dataset["timestamp"] = datetime.now().isoformat()
            dataset["symbols"] = symbols
            
            self.logger.info("Training dataset generated successfully")
            return dataset
            
        except Exception as e:
            self.logger.error(f"Error generating training dataset: {e}")
            raise


# Export main components
__all__ = [
    "MCPClient",
    "QuantConnectMCPClient", 
    "ComposerTradeMCPClient",
    "MCPManager",
    "mcp_manager",
    "initialize_mcp_clients",
    "MCPTrainingDataAggregator"
]
