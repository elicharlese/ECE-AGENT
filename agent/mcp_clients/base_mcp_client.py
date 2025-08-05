#!/usr/bin/env python3
"""
Base MCP Client for AGENT
Provides common functionality for all MCP server integrations
"""

import asyncio
import json
import logging
import websockets
from typing import Dict, List, Optional, Any
from datetime import datetime
from abc import ABC, abstractmethod

class BaseMCPClient(ABC):
    """Base class for all MCP client integrations"""
    
    def __init__(self, client_name: str, config: Dict[str, Any]):
        self.client_name = client_name
        self.config = config
        self.connection = None
        self.is_connected = False
        self.logger = logging.getLogger(f"AGENT.{client_name}")
        
        # Connection settings
        self.server_url = config.get("server_url", "ws://localhost:8080")
        self.timeout = config.get("timeout", 30)
        self.retry_attempts = config.get("retry_attempts", 3)
        self.retry_delay = config.get("retry_delay", 5)
        
        # Message handling
        self.message_id = 0
        self.pending_requests = {}
        
    async def initialize(self):
        """Initialize the MCP client connection"""
        try:
            await self.connect()
            await self.authenticate()
            
            self.logger.info(f"✅ {self.client_name} MCP client initialized successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to initialize {self.client_name} client: {e}")
            return False
    
    async def connect(self):
        """Establish WebSocket connection to MCP server"""
        for attempt in range(self.retry_attempts):
            try:
                self.connection = await websockets.connect(
                    self.server_url,
                    timeout=self.timeout
                )
                self.is_connected = True
                
                # Start message handler
                asyncio.create_task(self._message_handler())
                
                self.logger.info(f"✅ Connected to {self.client_name} MCP server")
                return
                
            except Exception as e:
                self.logger.warning(f"Connection attempt {attempt + 1} failed: {e}")
                if attempt < self.retry_attempts - 1:
                    await asyncio.sleep(self.retry_delay)
                else:
                    raise Exception(f"Failed to connect after {self.retry_attempts} attempts")
    
    async def authenticate(self):
        """Authenticate with the MCP server"""
        auth_data = {
            "jsonrpc": "2.0",
            "id": self._get_message_id(),
            "method": "initialize",
            "params": {
                "client_name": f"AGENT_{self.client_name}",
                "client_version": "1.0.0",
                "capabilities": {
                    "supports_tools": True,
                    "supports_resources": True,
                    "supports_prompts": True
                }
            }
        }
        
        response = await self._send_request(auth_data)
        
        if response.get("error"):
            raise Exception(f"Authentication failed: {response['error']}")
        
        self.logger.info(f"✅ Authenticated with {self.client_name} MCP server")
    
    async def disconnect(self):
        """Disconnect from MCP server"""
        try:
            if self.connection and self.is_connected:
                await self.connection.close()
                self.is_connected = False
                self.logger.info(f"✅ Disconnected from {self.client_name} MCP server")
                
        except Exception as e:
            self.logger.error(f"Error disconnecting from {self.client_name}: {e}")
    
    async def call_tool(self, tool_name: str, parameters: Dict = None) -> Dict:
        """Call a tool on the MCP server"""
        try:
            if not self.is_connected:
                await self.connect()
            
            request = {
                "jsonrpc": "2.0",
                "id": self._get_message_id(),
                "method": "tools/call",
                "params": {
                    "name": tool_name,
                    "arguments": parameters or {}
                }
            }
            
            response = await self._send_request(request)
            
            if response.get("error"):
                raise Exception(f"Tool call failed: {response['error']}")
            
            return response.get("result", {})
            
        except Exception as e:
            self.logger.error(f"Failed to call tool {tool_name}: {e}")
            raise
    
    async def get_resources(self) -> List[Dict]:
        """Get available resources from MCP server"""
        try:
            request = {
                "jsonrpc": "2.0",
                "id": self._get_message_id(),
                "method": "resources/list"
            }
            
            response = await self._send_request(request)
            return response.get("result", {}).get("resources", [])
            
        except Exception as e:
            self.logger.error(f"Failed to get resources: {e}")
            return []
    
    async def get_tools(self) -> List[Dict]:
        """Get available tools from MCP server"""
        try:
            request = {
                "jsonrpc": "2.0",
                "id": self._get_message_id(),
                "method": "tools/list"
            }
            
            response = await self._send_request(request)
            return response.get("result", {}).get("tools", [])
            
        except Exception as e:
            self.logger.error(f"Failed to get tools: {e}")
            return []
    
    async def _send_request(self, request: Dict) -> Dict:
        """Send a request and wait for response"""
        try:
            if not self.is_connected:
                raise Exception("Not connected to MCP server")
            
            message_id = request["id"]
            
            # Create future for response
            future = asyncio.Future()
            self.pending_requests[message_id] = future
            
            # Send request
            await self.connection.send(json.dumps(request))
            
            # Wait for response with timeout
            try:
                response = await asyncio.wait_for(future, timeout=self.timeout)
                return response
            finally:
                # Clean up pending request
                self.pending_requests.pop(message_id, None)
                
        except Exception as e:
            self.logger.error(f"Failed to send request: {e}")
            raise
    
    async def _message_handler(self):
        """Handle incoming messages from MCP server"""
        try:
            async for message in self.connection:
                try:
                    data = json.loads(message)
                    
                    # Handle response to pending request
                    if "id" in data and data["id"] in self.pending_requests:
                        future = self.pending_requests[data["id"]]
                        if not future.done():
                            future.set_result(data)
                    
                    # Handle notifications
                    elif "method" in data:
                        await self._handle_notification(data)
                        
                except json.JSONDecodeError as e:
                    self.logger.error(f"Failed to parse message: {e}")
                except Exception as e:
                    self.logger.error(f"Error handling message: {e}")
                    
        except websockets.exceptions.ConnectionClosed:
            self.is_connected = False
            self.logger.warning(f"Connection to {self.client_name} MCP server closed")
        except Exception as e:
            self.logger.error(f"Message handler error: {e}")
            self.is_connected = False
    
    async def _handle_notification(self, notification: Dict):
        """Handle notifications from MCP server"""
        method = notification.get("method")
        params = notification.get("params", {})
        
        if method == "notifications/resources/updated":
            self.logger.info("Resources updated on MCP server")
        elif method == "notifications/tools/updated":
            self.logger.info("Tools updated on MCP server")
        else:
            self.logger.debug(f"Received notification: {method}")
    
    def _get_message_id(self) -> int:
        """Get next message ID"""
        self.message_id += 1
        return self.message_id
    
    @abstractmethod
    async def register_tools(self):
        """Register client-specific tools - must be implemented by subclasses"""
        pass
    
    @abstractmethod
    async def get_training_data(self) -> Dict:
        """Get training data for AGENT learning - must be implemented by subclasses"""
        pass
    
    def get_status(self) -> Dict:
        """Get client status"""
        return {
            "client_name": self.client_name,
            "is_connected": self.is_connected,
            "server_url": self.server_url,
            "pending_requests": len(self.pending_requests),
            "last_activity": datetime.now().isoformat()
        }
    
    async def health_check(self) -> bool:
        """Perform health check"""
        try:
            if not self.is_connected:
                await self.connect()
            
            # Try to get tools as a health check
            tools = await self.get_tools()
            return len(tools) >= 0  # Even 0 tools is a valid response
            
        except Exception as e:
            self.logger.error(f"Health check failed: {e}")
            return False

class MCPClientManager:
    """Manager for multiple MCP clients"""
    
    def __init__(self):
        self.clients = {}
        self.logger = logging.getLogger("AGENT.MCPManager")
    
    def add_client(self, client: BaseMCPClient):
        """Add an MCP client to the manager"""
        self.clients[client.client_name] = client
        self.logger.info(f"Added {client.client_name} MCP client")
    
    async def initialize_all(self):
        """Initialize all MCP clients"""
        results = {}
        
        for name, client in self.clients.items():
            try:
                success = await client.initialize()
                results[name] = success
                
                if success:
                    self.logger.info(f"✅ {name} client initialized successfully")
                else:
                    self.logger.error(f"❌ {name} client initialization failed")
                    
            except Exception as e:
                self.logger.error(f"❌ {name} client initialization error: {e}")
                results[name] = False
        
        return results
    
    async def disconnect_all(self):
        """Disconnect all MCP clients"""
        for client in self.clients.values():
            await client.disconnect()
    
    async def get_all_training_data(self) -> Dict:
        """Get training data from all clients"""
        training_data = {}
        
        for name, client in self.clients.items():
            try:
                if client.is_connected:
                    data = await client.get_training_data()
                    training_data[name] = data
                    
            except Exception as e:
                self.logger.error(f"Failed to get training data from {name}: {e}")
                training_data[name] = {"success": False, "error": str(e)}
        
        return training_data
    
    async def health_check_all(self) -> Dict:
        """Perform health check on all clients"""
        health_status = {}
        
        for name, client in self.clients.items():
            health_status[name] = await client.health_check()
        
        return health_status
    
    def get_client(self, name: str) -> Optional[BaseMCPClient]:
        """Get a specific client by name"""
        return self.clients.get(name)
    
    def get_all_clients(self) -> Dict[str, BaseMCPClient]:
        """Get all clients"""
        return self.clients.copy()
    
    def get_status(self) -> Dict:
        """Get status of all clients"""
        return {
            name: client.get_status()
            for name, client in self.clients.items()
        }
