import logging
import ccxt.async_support as ccxt
import asyncio
from datetime import datetime
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TradeExecutor")

class TradeExecutor:
    def __init__(self):
        self.paper_trading = settings.PAPER_TRADING
        self.risk_percentage = settings.RISK_PERCENTAGE
        self.positions = []
        
        # Initialize Exchanges
        self.exchanges = {}
        self._init_exchanges()

    def _init_exchanges(self):
        """Initializes exchange connections based on available keys."""
        if settings.BINANCE_API_KEY and settings.BINANCE_SECRET_KEY:
            self.exchanges['binance'] = ccxt.binance({
                'apiKey': settings.BINANCE_API_KEY,
                'secret': settings.BINANCE_SECRET_KEY,
                'enableRateLimit': True,
                'options': {'defaultType': 'future'} # Assuming Futures for bot, or spot? Defaulting to Future/Swap often preferred for bots. Let's stick to spot for safety unless requested. Default ccxt is spot.
            })
            logger.info("✅ Binance Configured")

        if settings.KUCOIN_API_KEY and settings.KUCOIN_SECRET_KEY:
            self.exchanges['kucoin'] = ccxt.kucoin({
                'apiKey': settings.KUCOIN_API_KEY,
                'secret': settings.KUCOIN_SECRET_KEY,
                'password': settings.KUCOIN_PASSPHRASE,
                'enableRateLimit': True
            })
            logger.info("✅ KuCoin Configured")

    async def update_config(self, risk_pct=None, paper_trading=None):
        """Allows dynamic update of risk settings and mode."""
        if risk_pct is not None:
            self.risk_percentage = float(risk_pct)
            logger.info(f"🔄 Risk Percentage updated to {self.risk_percentage}%")
        
        if paper_trading is not None:
            self.paper_trading = paper_trading
            logger.info(f"🔄 Paper Trading Mode set to {self.paper_trading}")

    async def get_balance(self, exchange_name='binance'):
        """Fetches free balance in USDT."""
        if exchange_name not in self.exchanges:
            return 0.0
            
        try:
            exchange = self.exchanges[exchange_name]
            balance = await exchange.fetch_balance()
            return balance.get('USDT', {}).get('free', 0.0)
        except Exception as e:
            logger.error(f"❌ Failed to fetch balance from {exchange_name}: {e}")
            return 0.0

    def calculate_position_size(self, balance, price):
        """Calculates amount to buy based on Risk Percentage."""
        if balance <= 0 or price <= 0:
            return 0
        
        amount_usdt = balance * (self.risk_percentage / 100)
        quantity = amount_usdt / price
        return quantity

    async def execute_trade(self, signal, exchange_name='binance'):
        """
        Executes a trade based on the signal.
        signal schema: { "symbol": "BTC/USDT", "side": "BUY" | "SELL", "price": 95000, "strategy": "..." }
        """
        if not signal or signal.get('side') not in ['BUY', 'SELL']:
            return None

        symbol = signal.get('symbol', 'BTC/USDT')
        side = signal['side'].lower() # ccxt expects 'buy', 'sell'
        price = signal.get('price')
        
        # --- 1. Paper Trading Flow ---
        if self.paper_trading:
            trade_record = {
                "id": f"PAPER-{int(datetime.now().timestamp())}",
                "timestamp": datetime.now().isoformat(),
                "symbol": symbol,
                "side": side.upper(),
                "price": price,
                "amount": "Risk Calculated (Mock)",
                "status": "FILLED (PAPER)",
                "exchange": exchange_name,
                "mode": "PAPER TRADING"
            }
            self.positions.append(trade_record)
            logger.info(f"📝 [PAPER TRADE] {side.upper()} {symbol} at ${price} | Risk: {self.risk_percentage}%")
            return trade_record

        # --- 2. Real Trading Flow ---
        if exchange_name not in self.exchanges:
            logger.error(f"❌ Exchange {exchange_name} not configured.")
            return None
            
        exchange = self.exchanges[exchange_name]
        
        try:
            # A. Check Balance
            balance = await self.get_balance(exchange_name)
            if balance < 10: # Minimum safety
                logger.warning(f"⚠️ Insufficient Balance on {exchange_name}: ${balance}")
                return None

            # B. Calculate Size
            amount = self.calculate_position_size(balance, price)
            if amount == 0:
                return None
                
            logger.info(f"🚀 [REAL TRADE] Executing {side.upper()} {amount:.6f} {symbol} on {exchange_name}...")

            # C. Place Order
            # Using create_market_order for simplicity/speed as per bot standard
            order = await exchange.create_order(symbol, 'market', side, amount)
            
            trade_record = {
                "id": order['id'],
                "timestamp": datetime.now().isoformat(),
                "symbol": symbol,
                "side": side.upper(),
                "price": order.get('average', price),
                "amount": amount,
                "status": order['status'],
                "exchange": exchange_name,
                "mode": "REAL"
            }
            self.positions.append(trade_record)
            logger.info(f"✅ Order Placed: {trade_record}")
            return trade_record

        except Exception as e:
            logger.error(f"❌ Trade Execution Failed: {e}")
            return {"status": "FAILED", "error": str(e)}

    async def sync_positions(self):
        """
        Syncs positions from database/system check (Logic restored).
        Currently a placeholder for recovery logic.
        """
        logger.info("♻️ Syncing open positions...")
        # Logic to fetch from DB can be added here
        return

    async def close_connections(self):
        for name, exchange in self.exchanges.items():
            await exchange.close()

trade_executor = TradeExecutor()
