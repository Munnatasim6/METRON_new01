import ccxt.async_support as ccxt
import asyncio
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ArbitrageEngine")

class ArbitrageEngine:
    def __init__(self):
        self.exchanges = {
            'binance': ccxt.binance(),
            'kraken': ccxt.kraken(),
            'kucoin': ccxt.kucoin(),
            'bybit': ccxt.bybit(),
            'gateio': ccxt.gateio()
        }
        self.logos = {
            'binance': '🟡',
            'kraken': '🟣',
            'kucoin': '🟢',
            'bybit': '⚫',
            'gateio': '🔴'
        }
        # Common unified symbol
        self.target_symbol = "BTC/USDT"

    async def fetch_price(self, name, exchange):
        """
        Fetch price from a specific exchange securely
        """
        try:
            # Kraken sometimes uses XBT instead of BTC in API, but ccxt handles 'BTC/USDT' mapping mostly.
            # However some exchanges might not have USDT pair directly (e.g. USD).
            # For this demo we stick to BTC/USDT.
            ticker = await exchange.fetch_ticker(self.target_symbol)
            return {
                "exchange": name.capitalize(),
                "price": ticker['last'],
                "logo": self.logos.get(name, '🌐')
            }
        except Exception as e:
            # logger.warning(f"Failed to fetch from {name}: {e}")
            return None

    async def get_arbitrage_opportunities(self, symbol="BTC/USDT"):
        """
        Fetch prices concurrently and calculate spread
        """
        self.target_symbol = symbol
        tasks = []
        
        for name, exchange in self.exchanges.items():
            tasks.append(self.fetch_price(name, exchange))
        
        results = await asyncio.gather(*tasks)
        
        # Filter None values (failed fetches)
        valid_data = [r for r in results if r is not None]
        
        if len(valid_data) < 2:
            return []

        # Calculate Spread (Optional logic for backend analysis, frontend does its own math)
        # But we return the list as requested by frontend format
        
        # Sorting by price ascending (Best Buy first)
        valid_data.sort(key=lambda x: x['price'])
        
        return valid_data

    async def close_connections(self):
        """
        Close all exchange sessions
        """
        for exchange in self.exchanges.values():
            await exchange.close()

# Export singleton
arbitrage_engine = ArbitrageEngine()
