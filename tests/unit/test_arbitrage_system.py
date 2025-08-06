#!/usr/bin/env python3
"""
Test script for the enhanced arbitrage trading system
"""

import asyncio
import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent.enhanced_trading import TradingEngine, TradingConfig
from agent.arbitrage_strategies import ArbitrageManager, ArbitrageType
from decimal import Decimal

async def test_arbitrage_system():
    """Test the arbitrage trading system"""
    print("🚀 Testing AGENT Arbitrage Trading System")
    print("=" * 50)
    
    # Create trading configuration
    config = TradingConfig(
        enabled=True,
        max_total_exposure=Decimal("10000"),
        max_single_position=Decimal("1000"),
        min_profitability=Decimal("0.002"),  # 0.2%
        cross_exchange_enabled=True,
        triangular_enabled=True,
        spot_perpetual_enabled=False,
        amm_arbitrage_enabled=False,
        supported_exchanges=["binance", "coinbase", "kraken"]
    )
    
    print(f"📊 Configuration:")
    print(f"   Max Total Exposure: ${config.max_total_exposure:,.2f}")
    print(f"   Min Profitability: {config.min_profitability * 100:.2f}%")
    print(f"   Enabled Strategies: Cross-Exchange, Triangular")
    print()
    
    # Initialize trading engine
    print("🔧 Initializing trading engine...")
    engine = TradingEngine(config)
    
    try:
        await engine.initialize()
        print("✅ Trading engine initialized successfully")
        print()
        
        # Start trading engine
        print("▶️  Starting trading engine...")
        await engine.start()
        print("✅ Trading engine started successfully")
        print()
        
        # Run for 30 seconds and show status updates
        print("📈 Running arbitrage system for 30 seconds...")
        print("-" * 50)
        
        for i in range(6):  # 6 updates over 30 seconds
            await asyncio.sleep(5)
            
            status = await engine.get_comprehensive_status()
            
            print(f"Update {i+1}/6:")
            print(f"  🏦 Portfolio Value: ${status['portfolio']['total_value_usd']:,.2f}")
            print(f"  📊 Active Exchanges: {len([ex for ex, data in status['exchanges'].items() if data['connected']])}")
            print(f"  🔄 Active Arbitrage Positions: {status['arbitrage']['total_active_positions']}")
            print(f"  📈 Total Completed Trades: {status['arbitrage']['total_completed_trades']}")
            print(f"  ⚠️  Current Drawdown: {status['risk_status']['current_drawdown']:.2%}")
            print(f"  🎯 Risk Within Limits: {'✅' if status['risk_status']['within_limits'] else '❌'}")
            
            # Show exchange balances
            print("  💰 Exchange Balances:")
            for exchange, data in status['exchanges'].items():
                if data['connected']:
                    btc_balance = data['balances'].get('BTC', 0)
                    eth_balance = data['balances'].get('ETH', 0)
                    usd_balance = data['balances'].get('USD', 0) + data['balances'].get('USDT', 0)
                    print(f"    {exchange.capitalize()}: {btc_balance:.4f} BTC, {eth_balance:.4f} ETH, ${usd_balance:,.2f}")
            
            print()
        
        print("🎉 Test completed successfully!")
        
        # Final status
        final_status = await engine.get_comprehensive_status()
        print("\n📋 Final Status:")
        print(f"   Portfolio Metrics:")
        metrics = final_status['portfolio']['metrics']
        print(f"     - Total P&L: ${metrics['total_pnl']:.2f}")
        print(f"     - Total Trades: {metrics['total_trades']}")
        print(f"     - Win Rate: {metrics['win_rate'] * 100:.1f}%")
        print(f"     - Max Drawdown: {metrics['max_drawdown'] * 100:.2f}%")
        
        print(f"\n   Arbitrage Performance:")
        for strategy_name, strategy_data in final_status['arbitrage']['strategies'].items():
            print(f"     - {strategy_name.replace('_', ' ').title()}:")
            print(f"       * Active Positions: {strategy_data['active_positions']}")
            print(f"       * Completed Trades: {strategy_data['completed_trades']}")
            print(f"       * Total Profit: ${strategy_data['total_profit']:.2f}")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        # Stop trading engine
        print("\n🛑 Stopping trading engine...")
        await engine.stop()
        print("✅ Trading engine stopped successfully")

def test_arbitrage_calculations():
    """Test arbitrage opportunity calculations"""
    from agent.arbitrage_strategies import (
        ArbitrageOpportunity, ArbitrageLeg, OrderSide, 
        MarketInfo, ArbitrageType
    )
    
    print("\n🧮 Testing Arbitrage Calculations")
    print("=" * 40)
    
    # Test cross-exchange arbitrage
    btc_market_binance = MarketInfo("binance", "BTC-USDT", "BTC", "USDT")
    btc_market_coinbase = MarketInfo("coinbase", "BTC-USD", "BTC", "USD")
    
    # Create arbitrage legs (buy low, sell high)
    legs = [
        ArbitrageLeg(
            market=btc_market_binance,
            side=OrderSide.BUY,
            amount=Decimal("0.1"),
            price=Decimal("49900"),  # Buy at $49,900
            fee_rate=Decimal("0.001")  # 0.1% fee
        ),
        ArbitrageLeg(
            market=btc_market_coinbase,
            side=OrderSide.SELL,
            amount=Decimal("0.1"),
            price=Decimal("50100"),  # Sell at $50,100
            fee_rate=Decimal("0.001")  # 0.1% fee
        )
    ]
    
    opportunity = ArbitrageOpportunity(
        arb_type=ArbitrageType.CROSS_EXCHANGE,
        legs=legs,
        min_profitability=Decimal("0.002")  # 0.2%
    )
    
    print(f"Cross-Exchange Arbitrage Example:")
    print(f"  Buy: {legs[0].amount} BTC at ${legs[0].price} on {legs[0].market.exchange}")
    print(f"  Sell: {legs[1].amount} BTC at ${legs[1].price} on {legs[1].market.exchange}")
    print(f"  Gross Profit: ${opportunity.gross_profit:.2f}")
    print(f"  Total Fees: ${opportunity.total_fees:.2f}")
    print(f"  Net Profit: ${opportunity.net_profit:.2f}")
    print(f"  Profit %: {opportunity.profit_pct:.3f}%")
    print(f"  Is Profitable: {'✅' if opportunity.is_profitable else '❌'}")

if __name__ == "__main__":
    print("🤖 AGENT Enhanced Arbitrage Trading System Test")
    print("=" * 60)
    
    # Test calculations first
    test_arbitrage_calculations()
    
    # Test the full system
    try:
        asyncio.run(test_arbitrage_system())
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n🏁 Test completed!")
