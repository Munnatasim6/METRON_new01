import logging
import ccxt.async_support as ccxt
import asyncio
from datetime import datetime
from app.core.config import settings
from app.database import db  # Database Import

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TradeExecutor")

class TradeExecutor:
    def __init__(self):
        self.paper_trading = settings.PAPER_TRADING
        self.risk_percentage = settings.RISK_PERCENTAGE
        self.positions = [] # RAM Memory
        
        # Initialize Exchanges
        self.exchanges = {}
        self._init_exchanges()

    def _init_exchanges(self):
        if settings.BINANCE_API_KEY and settings.BINANCE_SECRET_KEY:
            self.exchanges['binance'] = ccxt.binance({
                'apiKey': settings.BINANCE_API_KEY,
                'secret': settings.BINANCE_SECRET_KEY,
                'enableRateLimit': True,
                'options': {'defaultType': 'future'} 
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

    # ============================================================
    # CORE LOGIC: RECONCILIATION (Startup Sync)
    # ============================================================
    async def sync_positions(self):
        """
        বট রিস্টার্ট হলে ডাটাবেস এবং এক্সচেঞ্জের সাথে পজিশন সিঙ্ক করে।
        (এটি Ghost Order এবং Memory Loss থেকে বাঁচাবে)
        """
        logger.info("🔄 Syncing Positions (DB <-> Exchange)...")
        
        # ১. ডাটাবেস থেকে ওপেন ট্রেড আনা
        db_trades = await db.get_open_trades()
        synced_positions = []

        for trade in db_trades:
            symbol = trade['symbol']
            order_id = trade['order_id']
            exchange_name = trade['exchange']
            mode = trade['mode']
            
            # ২. পেপার ট্রেডিং হ্যান্ডলিং (শুধুমাত্র লোকাল ডিবি বিশ্বাস করবে)
            if mode == "PAPER TRADING":
                # ফরম্যাট ঠিক করে RAM এ লোড
                trade_record = {
                    "id": order_id, "timestamp": str(trade['timestamp']), "symbol": symbol,
                    "side": trade['side'], "price": trade['price'], "amount": trade['amount'],
                    "status": trade['status'], "exchange": exchange_name, "mode": mode
                }
                synced_positions.append(trade_record)
                logger.info(f"📝 [RESTORED] Paper Position: {symbol}")
                continue

            # ৩. রিয়েল ট্রেডিং হ্যান্ডলিং (এক্সচেঞ্জের সাথে ক্রস-চেক)
            if exchange_name in self.exchanges:
                exchange = self.exchanges[exchange_name]
                try:
                    # এক্সচেঞ্জকে জিজ্ঞেস করা: এই অর্ডারটির বর্তমান অবস্থা কী?
                    # উল্লেখ্য: fetch_order সব এক্সচেঞ্জে সাপোর্ট নাও করতে পারে, তখন fetch_open_orders দিয়ে লজিক লিখতে হয়।
                    # আমরা এখানে fetch_order ব্যবহার করছি যা বাইনান্স ফিউচারে কাজ করে।
                    order_info = await exchange.fetch_order(order_id, symbol)
                    
                    current_status = order_info['status'] # open, closed, canceled

                    if current_status == 'open':
                        # দৃশ্যপট ১: সব ঠিক আছে
                        trade_record = {
                            "id": order_id, "timestamp": str(trade['timestamp']), "symbol": symbol,
                            "side": trade['side'], "price": trade['price'], "amount": trade['amount'],
                            "status": 'OPEN', "exchange": exchange_name, "mode": "REAL"
                        }
                        synced_positions.append(trade_record)
                        logger.info(f"✅ [RESTORED] Real Position Verified: {symbol}")
                    
                    elif current_status in ['closed', 'canceled']:
                        # দৃশ্যপট ২: এক্সচেঞ্জে ক্লোজ হয়ে গেছে, কিন্তু ডিবিতে ওপেন ছিল
                        logger.warning(f"⚠️ Order {order_id} found CLOSED on Exchange. Updating DB...")
                        await db.update_trade_status(order_id, 'CLOSED')
                    
                except Exception as e:
                    # দৃশ্যপট ৩: অর্ডার খুঁজে পাওয়া যাচ্ছে না (Phantom Order)
                    logger.error(f"❌ Could not verify order {order_id}: {e}")
                    # সেইফটির জন্য আমরা এটাকে আপাতত লোড করতে পারি অথবা ম্যানুয়াল চেক এর জন্য ফ্ল্যাগ করতে পারি
                    # এখানে আমরা ইগনোর করছি যােত ভুল ট্রেড ম্যানেজ না করে
                    pass

        # ৪. মেমোরি আপডেট
        self.positions = synced_positions
        logger.info(f"🏁 Sync Complete. Active Positions: {len(self.positions)}")

    async def update_config(self, risk_pct=None, paper_trading=None):
        if risk_pct is not None:
            self.risk_percentage = float(risk_pct)
        if paper_trading is not None:
            self.paper_trading = paper_trading
            logger.info(f"🔄 Mode Switched to: {'PAPER' if self.paper_trading else 'REAL'}")

    async def get_balance(self, exchange_name='binance'):
        if exchange_name not in self.exchanges: return 0.0
        try:
            exchange = self.exchanges[exchange_name]
            balance = await exchange.fetch_balance()
            return balance.get('USDT', {}).get('free', 0.0)
        except Exception as e:
            logger.error(f"❌ Failed to fetch balance: {e}")
            return 0.0

    def calculate_position_size(self, balance, price):
        if balance <= 0 or price <= 0: return 0
        amount_usdt = balance * (self.risk_percentage / 100)
        return amount_usdt / price

    async def execute_trade(self, signal, exchange_name='binance'):
        if not signal or signal.get('side') not in ['BUY', 'SELL']: return None

        symbol = signal.get('symbol', 'BTC/USDT')
        side = signal['side'].lower()
        price = signal.get('price')
        strategy = signal.get('strategy', 'Unknown')
        
        # --- 1. Paper Trading Flow ---
        if self.paper_trading:
            trade_record = {
                "id": f"PAPER-{int(datetime.now().timestamp())}",
                "timestamp": datetime.now().isoformat(),
                "symbol": symbol,
                "side": side.upper(),
                "price": price,
                "amount": 0.0, # Paper amount placeholder
                "status": "FILLED (PAPER)",
                "exchange": exchange_name,
                "mode": "PAPER TRADING",
                "strategy": strategy
            }
            
            # ATOMIC WRITE: DB -> RAM
            await db.save_trade(trade_record) # DB তে আগে সেভ
            self.positions.append(trade_record) # তারপর RAM এ
            
            logger.info(f"📝 [PAPER] {side.upper()} {symbol} Saved to DB & RAM.")
            return trade_record

        # --- 2. Real Trading Flow ---
        if exchange_name not in self.exchanges: return None
        exchange = self.exchanges[exchange_name]
        
        try:
            balance = await self.get_balance(exchange_name)
            if balance < 10: return None

            amount = self.calculate_position_size(balance, price)
            if amount == 0: return None
                
            logger.info(f"🚀 [REAL] Executing {side.upper()} {symbol}...")
            
            # অর্ডার প্লেস করা
            order = await exchange.create_order(symbol, 'market', side, amount)
            
            trade_record = {
                "id": str(order['id']),
                "timestamp": datetime.now().isoformat(),
                "symbol": symbol,
                "side": side.upper(),
                "price": order.get('average', price),
                "amount": float(order.get('amount', amount)),
                "status": "OPEN", # আমরা ধরে নিচ্ছি ওপেন, পরে স্ট্যাটাস চেক হবে
                "exchange": exchange_name,
                "mode": "REAL",
                "strategy": strategy
            }
            
            # ATOMIC WRITE: DB -> RAM
            await db.save_trade(trade_record) # আগে ডাটাবেসে সেভ
            self.positions.append(trade_record) # তারপর র‍্যামে
            
            logger.info(f"✅ [REAL] Trade Executed & Saved: {trade_record['id']}")
            return trade_record

        except Exception as e:
            logger.error(f"❌ Execution Failed: {e}")
            return {"status": "FAILED", "error": str(e)}

    async def close_connections(self):
        for name, exchange in self.exchanges.items():
            await exchange.close()

trade_executor = TradeExecutor()
