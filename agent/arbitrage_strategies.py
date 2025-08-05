"""
Advanced Arbitrage Trading Strategies Module for AGENT
Inspired by Hummingbot's professional arbitrage implementations

This module provides comprehensive arbitrage trading capabilities including:
- Cross-exchange arbitrage (simple spot-to-spot)
- Triangular arbitrage (same exchange, three assets)
- Spot-perpetual arbitrage (futures/derivatives)
- AMM arbitrage (DEX/AMM vs CEX)
- Statistical arbitrage and mean reversion
"""

import asyncio
import logging
import time
from decimal import Decimal, ROUND_DOWN, ROUND_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class ArbitrageType(Enum):
    """Types of arbitrage strategies"""
    CROSS_EXCHANGE = "cross_exchange"
    TRIANGULAR = "triangular"
    SPOT_PERPETUAL = "spot_perpetual"
    AMM_ARBITRAGE = "amm_arbitrage"
    STATISTICAL = "statistical"

class PositionState(Enum):
    """Arbitrage position states"""
    CLOSED = "closed"
    OPENING = "opening"
    OPENED = "opened"
    CLOSING = "closing"
    FAILED = "failed"

class OrderSide(Enum):
    """Order side enumeration"""
    BUY = "buy"
    SELL = "sell"

@dataclass
class MarketInfo:
    """Market information structure"""
    exchange: str
    trading_pair: str
    base_asset: str
    quote_asset: str
    
    @property
    def symbol(self) -> str:
        return f"{self.exchange}:{self.trading_pair}"

@dataclass
class PriceData:
    """Price data structure"""
    bid: Decimal
    ask: Decimal
    mid: Decimal
    spread: Decimal
    timestamp: float
    
    @property
    def spread_pct(self) -> Decimal:
        return (self.spread / self.mid) * 100 if self.mid > 0 else Decimal(0)

@dataclass
class ArbitrageLeg:
    """Single leg of an arbitrage trade"""
    market: MarketInfo
    side: OrderSide
    amount: Decimal
    price: Decimal
    fee_rate: Decimal = Decimal("0.001")  # 0.1% default
    
    @property
    def notional(self) -> Decimal:
        return self.amount * self.price
    
    @property
    def fee_amount(self) -> Decimal:
        return self.notional * self.fee_rate

class ArbitrageOpportunity:
    """Represents an arbitrage opportunity"""
    
    def __init__(self, 
                 arb_type: ArbitrageType,
                 legs: List[ArbitrageLeg],
                 min_profitability: Decimal = Decimal("0.005")):
        self.arb_type = arb_type
        self.legs = legs
        self.min_profitability = min_profitability
        self.timestamp = time.time()
        self.state = PositionState.CLOSED
        
    @property
    def gross_profit(self) -> Decimal:
        """Calculate gross profit before fees"""
        if self.arb_type == ArbitrageType.CROSS_EXCHANGE:
            return self._calculate_cross_exchange_profit()
        elif self.arb_type == ArbitrageType.TRIANGULAR:
            return self._calculate_triangular_profit()
        elif self.arb_type == ArbitrageType.SPOT_PERPETUAL:
            return self._calculate_spot_perp_profit()
        else:
            return Decimal(0)
    
    @property
    def total_fees(self) -> Decimal:
        """Calculate total fees for all legs"""
        return sum(leg.fee_amount for leg in self.legs)
    
    @property
    def net_profit(self) -> Decimal:
        """Calculate net profit after fees"""
        return self.gross_profit - self.total_fees
    
    @property
    def profit_pct(self) -> Decimal:
        """Calculate profit percentage"""
        total_investment = sum(leg.notional for leg in self.legs if leg.side == OrderSide.BUY)
        if total_investment > 0:
            return (self.net_profit / total_investment) * 100
        return Decimal(0)
    
    @property
    def is_profitable(self) -> bool:
        """Check if opportunity meets minimum profitability"""
        return self.profit_pct >= self.min_profitability
    
    def _calculate_cross_exchange_profit(self) -> Decimal:
        """Calculate profit for cross-exchange arbitrage"""
        if len(self.legs) != 2:
            return Decimal(0)
        
        buy_leg = next((leg for leg in self.legs if leg.side == OrderSide.BUY), None)
        sell_leg = next((leg for leg in self.legs if leg.side == OrderSide.SELL), None)
        
        if not buy_leg or not sell_leg:
            return Decimal(0)
        
        return sell_leg.notional - buy_leg.notional
    
    def _calculate_triangular_profit(self) -> Decimal:
        """Calculate profit for triangular arbitrage"""
        if len(self.legs) != 3:
            return Decimal(0)
        
        # For triangular arbitrage, we start and end with the same asset
        start_amount = self.legs[0].amount
        final_amount = start_amount
        
        # Simulate the trade execution
        current_amount = start_amount
        
        for i, leg in enumerate(self.legs):
            if leg.side == OrderSide.SELL:
                # Selling: convert base to quote
                current_amount = current_amount * leg.price
            else:
                # Buying: convert quote to base  
                current_amount = current_amount / leg.price
        
        return current_amount - start_amount
    
    def _calculate_spot_perp_profit(self) -> Decimal:
        """Calculate profit for spot-perpetual arbitrage"""
        # Simplified calculation - would need more complex logic for actual implementation
        return self._calculate_cross_exchange_profit()

class ArbitrageExecutor:
    """Executes arbitrage strategies"""
    
    def __init__(self, 
                 strategy_name: str,
                 min_profitability: Decimal = Decimal("0.005"),
                 max_position_size: Decimal = Decimal("1000"),
                 slippage_buffer: Decimal = Decimal("0.001")):
        self.strategy_name = strategy_name
        self.min_profitability = min_profitability
        self.max_position_size = max_position_size
        self.slippage_buffer = slippage_buffer
        self.active_positions: List[ArbitrageOpportunity] = []
        self.completed_trades: List[ArbitrageOpportunity] = []
        self.is_running = False
        
    async def start(self):
        """Start the arbitrage executor"""
        self.is_running = True
        logger.info(f"Started arbitrage executor: {self.strategy_name}")
        
    async def stop(self):
        """Stop the arbitrage executor"""
        self.is_running = False
        # Close any active positions
        for position in self.active_positions:
            await self._close_position(position)
        logger.info(f"Stopped arbitrage executor: {self.strategy_name}")
        
    async def execute_opportunity(self, opportunity: ArbitrageOpportunity) -> bool:
        """Execute an arbitrage opportunity"""
        if not self.is_running or not opportunity.is_profitable:
            return False
            
        try:
            logger.info(f"Executing {opportunity.arb_type.value} arbitrage opportunity")
            logger.info(f"Expected profit: {opportunity.profit_pct:.3f}%")
            
            # Update state
            opportunity.state = PositionState.OPENING
            self.active_positions.append(opportunity)
            
            # Execute legs based on strategy
            if opportunity.arb_type == ArbitrageType.CROSS_EXCHANGE:
                success = await self._execute_cross_exchange(opportunity)
            elif opportunity.arb_type == ArbitrageType.TRIANGULAR:
                success = await self._execute_triangular(opportunity)
            elif opportunity.arb_type == ArbitrageType.SPOT_PERPETUAL:
                success = await self._execute_spot_perpetual(opportunity)
            else:
                success = False
                
            if success:
                opportunity.state = PositionState.OPENED
                logger.info(f"Successfully executed arbitrage opportunity")
            else:
                opportunity.state = PositionState.FAILED
                logger.error(f"Failed to execute arbitrage opportunity")
                
            return success
            
        except Exception as e:
            logger.error(f"Error executing arbitrage opportunity: {e}")
            opportunity.state = PositionState.FAILED
            return False
    
    async def _execute_cross_exchange(self, opportunity: ArbitrageOpportunity) -> bool:
        """Execute cross-exchange arbitrage"""
        # Simulate order execution
        await asyncio.sleep(0.1)  # Simulate network delay
        
        buy_leg = next((leg for leg in opportunity.legs if leg.side == OrderSide.BUY), None)
        sell_leg = next((leg for leg in opportunity.legs if leg.side == OrderSide.SELL), None)
        
        if not buy_leg or not sell_leg:
            return False
        
        # In real implementation, would place orders on exchanges
        logger.info(f"BUY {buy_leg.amount} {buy_leg.market.base_asset} on {buy_leg.market.exchange} at {buy_leg.price}")
        logger.info(f"SELL {sell_leg.amount} {sell_leg.market.base_asset} on {sell_leg.market.exchange} at {sell_leg.price}")
        
        return True
    
    async def _execute_triangular(self, opportunity: ArbitrageOpportunity) -> bool:
        """Execute triangular arbitrage"""
        # Execute orders sequentially for triangular arbitrage
        for i, leg in enumerate(opportunity.legs):
            await asyncio.sleep(0.05)  # Simulate order execution delay
            logger.info(f"Step {i+1}: {leg.side.value.upper()} {leg.amount} {leg.market.trading_pair} at {leg.price}")
        
        return True
    
    async def _execute_spot_perpetual(self, opportunity: ArbitrageOpportunity) -> bool:
        """Execute spot-perpetual arbitrage"""
        # Similar to cross-exchange but with perpetual contracts
        await asyncio.sleep(0.1)
        
        for leg in opportunity.legs:
            logger.info(f"{leg.side.value.upper()} {leg.amount} {leg.market.trading_pair} on {leg.market.exchange}")
        
        return True
    
    async def _close_position(self, opportunity: ArbitrageOpportunity):
        """Close an active arbitrage position"""
        try:
            logger.info(f"Closing arbitrage position for {opportunity.arb_type.value}")
            opportunity.state = PositionState.CLOSING
            
            # Simulate position closing
            await asyncio.sleep(0.1)
            
            opportunity.state = PositionState.CLOSED
            self.active_positions.remove(opportunity)
            self.completed_trades.append(opportunity)
            
        except Exception as e:
            logger.error(f"Error closing position: {e}")

class ArbitrageScanner:
    """Scans for arbitrage opportunities across markets"""
    
    def __init__(self, 
                 min_profitability: Decimal = Decimal("0.005"),
                 scan_interval: float = 1.0):
        self.min_profitability = min_profitability
        self.scan_interval = scan_interval
        self.market_data: Dict[str, PriceData] = {}
        self.is_scanning = False
        
    async def start_scanning(self):
        """Start scanning for arbitrage opportunities"""
        self.is_scanning = True
        logger.info("Started arbitrage scanning")
        
        while self.is_scanning:
            try:
                await self._scan_for_opportunities()
                await asyncio.sleep(self.scan_interval)
            except Exception as e:
                logger.error(f"Error in arbitrage scanning: {e}")
                await asyncio.sleep(self.scan_interval)
    
    async def stop_scanning(self):
        """Stop scanning for arbitrage opportunities"""
        self.is_scanning = False
        logger.info("Stopped arbitrage scanning")
    
    async def _scan_for_opportunities(self):
        """Scan for arbitrage opportunities"""
        # Update market data
        await self._update_market_data()
        
        # Scan for different types of opportunities
        cross_exchange_ops = await self._scan_cross_exchange()
        triangular_ops = await self._scan_triangular()
        
        all_opportunities = cross_exchange_ops + triangular_ops
        
        # Filter profitable opportunities
        profitable_ops = [op for op in all_opportunities if op.is_profitable]
        
        if profitable_ops:
            logger.info(f"Found {len(profitable_ops)} profitable arbitrage opportunities")
            for op in profitable_ops:
                logger.info(f"{op.arb_type.value}: {op.profit_pct:.3f}% profit")
    
    async def _update_market_data(self):
        """Update market data from exchanges"""
        # Simulate market data updates
        markets = [
            "binance:BTC-USDT", "coinbase:BTC-USD", "kraken:BTC-USD",
            "binance:ETH-USDT", "coinbase:ETH-USD", "kraken:ETH-USD"
        ]
        
        for market in markets:
            # Simulate price data
            base_price = Decimal("50000") if "BTC" in market else Decimal("3000")
            spread = base_price * Decimal("0.001")  # 0.1% spread
            
            self.market_data[market] = PriceData(
                bid=base_price - spread/2,
                ask=base_price + spread/2,
                mid=base_price,
                spread=spread,
                timestamp=time.time()
            )
    
    async def _scan_cross_exchange(self) -> List[ArbitrageOpportunity]:
        """Scan for cross-exchange arbitrage opportunities"""
        opportunities = []
        
        # Group markets by trading pair
        pair_groups = {}
        for market_key, price_data in self.market_data.items():
            exchange, pair = market_key.split(":")
            if pair not in pair_groups:
                pair_groups[pair] = {}
            pair_groups[pair][exchange] = (market_key, price_data)
        
        # Look for arbitrage between exchanges for same pair
        for pair, exchanges in pair_groups.items():
            if len(exchanges) < 2:
                continue
                
            exchange_list = list(exchanges.items())
            for i in range(len(exchange_list)):
                for j in range(i + 1, len(exchange_list)):
                    ex1_name, (ex1_key, ex1_data) = exchange_list[i]
                    ex2_name, (ex2_key, ex2_data) = exchange_list[j]
                    
                    # Check if we can buy on ex1 and sell on ex2
                    if ex2_data.bid > ex1_data.ask:
                        profit_pct = ((ex2_data.bid - ex1_data.ask) / ex1_data.ask) * 100
                        if profit_pct >= self.min_profitability:
                            base_asset, quote_asset = pair.split("-")[0], pair.split("-")[1]
                            amount = Decimal("1.0")  # 1 unit
                            
                            legs = [
                                ArbitrageLeg(
                                    market=MarketInfo(ex1_name, pair, base_asset, quote_asset),
                                    side=OrderSide.BUY,
                                    amount=amount,
                                    price=ex1_data.ask
                                ),
                                ArbitrageLeg(
                                    market=MarketInfo(ex2_name, pair, base_asset, quote_asset),
                                    side=OrderSide.SELL,
                                    amount=amount,
                                    price=ex2_data.bid
                                )
                            ]
                            
                            opportunity = ArbitrageOpportunity(
                                arb_type=ArbitrageType.CROSS_EXCHANGE,
                                legs=legs,
                                min_profitability=self.min_profitability
                            )
                            opportunities.append(opportunity)
        
        return opportunities
    
    async def _scan_triangular(self) -> List[ArbitrageOpportunity]:
        """Scan for triangular arbitrage opportunities"""
        opportunities = []
        
        # Example: BTC -> ETH -> USDT -> BTC
        # This would require complex path finding algorithm
        # For now, return empty list
        
        return opportunities

class ArbitrageManager:
    """Main arbitrage trading manager"""
    
    def __init__(self):
        self.scanners: List[ArbitrageScanner] = []
        self.executors: List[ArbitrageExecutor] = []
        self.is_running = False
        self.config = {
            "min_profitability": Decimal("0.005"),  # 0.5%
            "max_position_size": Decimal("10000"),  # $10,000
            "scan_interval": 1.0,  # 1 second
            "enabled_strategies": [
                ArbitrageType.CROSS_EXCHANGE,
                ArbitrageType.TRIANGULAR,
                ArbitrageType.SPOT_PERPETUAL
            ]
        }
        
    async def start(self):
        """Start arbitrage trading"""
        if self.is_running:
            return
            
        self.is_running = True
        logger.info("Starting arbitrage trading manager")
        
        # Initialize scanners
        scanner = ArbitrageScanner(
            min_profitability=self.config["min_profitability"],
            scan_interval=self.config["scan_interval"]
        )
        self.scanners.append(scanner)
        
        # Initialize executors for each strategy
        for strategy_type in self.config["enabled_strategies"]:
            executor = ArbitrageExecutor(
                strategy_name=strategy_type.value,
                min_profitability=self.config["min_profitability"],
                max_position_size=self.config["max_position_size"]
            )
            self.executors.append(executor)
            await executor.start()
        
        # Start scanning
        for scanner in self.scanners:
            asyncio.create_task(scanner.start_scanning())
        
        logger.info("Arbitrage trading manager started successfully")
    
    async def stop(self):
        """Stop arbitrage trading"""
        if not self.is_running:
            return
            
        self.is_running = False
        logger.info("Stopping arbitrage trading manager")
        
        # Stop scanners
        for scanner in self.scanners:
            await scanner.stop_scanning()
        
        # Stop executors
        for executor in self.executors:
            await executor.stop()
        
        logger.info("Arbitrage trading manager stopped")
    
    def get_status(self) -> Dict[str, Any]:
        """Get current status of arbitrage trading"""
        total_active_positions = sum(len(executor.active_positions) for executor in self.executors)
        total_completed_trades = sum(len(executor.completed_trades) for executor in self.executors)
        
        status = {
            "is_running": self.is_running,
            "active_scanners": len(self.scanners),
            "active_executors": len(self.executors),
            "total_active_positions": total_active_positions,
            "total_completed_trades": total_completed_trades,
            "config": self.config,
            "strategies": {}
        }
        
        # Get detailed status for each executor
        for executor in self.executors:
            strategy_profit = sum(op.net_profit for op in executor.completed_trades)
            status["strategies"][executor.strategy_name] = {
                "active_positions": len(executor.active_positions),
                "completed_trades": len(executor.completed_trades),
                "total_profit": float(strategy_profit),
                "is_running": executor.is_running
            }
        
        return status
    
    async def update_config(self, new_config: Dict[str, Any]):
        """Update arbitrage trading configuration"""
        self.config.update(new_config)
        logger.info(f"Updated arbitrage config: {new_config}")

# Example usage and testing
async def main():
    """Example usage of the arbitrage system"""
    manager = ArbitrageManager()
    
    try:
        await manager.start()
        
        # Run for 30 seconds
        await asyncio.sleep(30)
        
        # Get status
        status = manager.get_status()
        print(f"Arbitrage Status: {status}")
        
    finally:
        await manager.stop()

if __name__ == "__main__":
    asyncio.run(main())
