import asyncpg
import logging
import pandas as pd
from datetime import datetime
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TimescaleDB")

class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        try:
            self.pool = await asyncpg.create_pool(
                dsn=settings.DATABASE_URL, 
                min_size=1, 
                max_size=10, 
                command_timeout=60
            )
            await self.init_db()
            logger.info("✅ Connected to TimescaleDB (Async Pool Ready)")
        except Exception as e:
            logger.error(f"❌ DB Connection Failed: {e}")

    async def init_db(self):
        async with self.pool.acquire() as conn:
            # 1. Market Data Table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS market_candles (
                    time TIMESTAMPTZ NOT NULL,
                    symbol TEXT NOT NULL,
                    open DOUBLE PRECISION,
                    high DOUBLE PRECISION,
                    low DOUBLE PRECISION,
                    close DOUBLE PRECISION,
                    volume DOUBLE PRECISION,
                    UNIQUE(time, symbol)
                );
            """)
            
            # 2. Trade Ledger Table (NEW: Position Memory)
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS trade_ledger (
                    order_id TEXT PRIMARY KEY,
                    symbol TEXT NOT NULL,
                    side TEXT NOT NULL,
                    price DOUBLE PRECISION,
                    amount DOUBLE PRECISION,
                    status TEXT NOT NULL,
                    strategy TEXT,
                    timestamp TIMESTAMPTZ,
                    mode TEXT,
                    exchange TEXT
                );
            """)
            
            try:
                await conn.execute("""
                    SELECT create_hypertable('market_candles', 'time', if_not_exists => TRUE);
                """)
                logger.info("⚡ Tables 'market_candles' & 'trade_ledger' Ready.")
            except Exception as e:
                logger.warning(f"Hypertable creation msg: {e}")

    async def save_candle(self, data):
        if not self.pool: return
        query = """
            INSERT INTO market_candles (time, symbol, open, high, low, close, volume)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (time, symbol) 
            DO UPDATE SET 
                open = EXCLUDED.open, 
                high = EXCLUDED.high, 
                low = EXCLUDED.low, 
                close = EXCLUDED.close, 
                volume = EXCLUDED.volume;
        """
        try:
            ts = pd.to_datetime(data['time'])
            if ts.tzinfo is None: ts = ts.tz_localize('UTC')
            else: ts = ts.tz_convert('UTC')

            async with self.pool.acquire() as conn:
                await conn.execute(query, ts, data['s'], float(data['open']), float(data['high']), float(data['low']), float(data['close']), float(data['volume']))
        except Exception as e:
            logger.error(f"Save Candle Error: {e}")

    async def save_bulk_candles(self, data_list):
        if not self.pool or not data_list: return
        records = []
        for d in data_list:
            ts = pd.to_datetime(d['time'])
            if ts.tzinfo is None: ts = ts.tz_localize('UTC')
            else: ts = ts.tz_convert('UTC')
            records.append((ts, d.get('s', 'BTC/USDT'), d['open'], d['high'], d['low'], d['close'], d['volume']))
        
        try:
            async with self.pool.acquire() as conn:
                query = """
                    INSERT INTO market_candles (time, symbol, open, high, low, close, volume)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (time, symbol) DO NOTHING;
                """
                await conn.executemany(query, records)
                logger.info(f"💾 Bulk Saved {len(data_list)} candles to TimescaleDB")
        except Exception as e:
            logger.error(f"Bulk Save Error: {e}")

    async def get_recent_candles(self, symbol, limit=300):
        if not self.pool: return pd.DataFrame()
        query = "SELECT time, open, high, low, close, volume FROM market_candles WHERE symbol = $1 ORDER BY time ASC LIMIT $2;"
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch(query, symbol, limit)
                if not rows: return pd.DataFrame()
                data = [dict(row) for row in rows]
                df = pd.DataFrame(data)
                df['time'] = pd.to_datetime(df['time'])
                df.set_index('time', inplace=True)
                df.index.name = 'timestamp'
                return df
        except Exception as e:
            logger.error(f"Fetch Error: {e}")
            return pd.DataFrame()

    # ==========================================
    # NEW: Trade Persistence Methods
    # ==========================================
    async def save_trade(self, trade_data):
        """নতুন ট্রেড ডাটাবেসে সেভ করা (Atomic Write)"""
        if not self.pool: return
        query = """
            INSERT INTO trade_ledger (order_id, symbol, side, price, amount, status, strategy, timestamp, mode, exchange)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (order_id) DO NOTHING;
        """
        try:
            ts = pd.to_datetime(trade_data['timestamp'])
            if ts.tzinfo is None: ts = ts.tz_localize('UTC')
            
            async with self.pool.acquire() as conn:
                await conn.execute(query, 
                    str(trade_data['id']), 
                    trade_data['symbol'], 
                    trade_data['side'], 
                    float(trade_data['price']), 
                    float(trade_data['amount']), 
                    trade_data['status'], 
                    trade_data.get('strategy', 'Manual'),
                    ts,
                    trade_data['mode'],
                    trade_data['exchange']
                )
                logger.info(f"💾 Trade Saved to DB: {trade_data['id']}")
        except Exception as e:
            logger.error(f"❌ Failed to Save Trade to DB: {e}")

    async def get_open_trades(self):
        """স্টার্টআপের সময় ওপেন ট্রেড খুঁজে বের করা"""
        if not self.pool: return []
        query = "SELECT * FROM trade_ledger WHERE status = 'OPEN' OR status = 'FILLED' OR status = 'FILLED (PAPER)';"
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch(query)
                return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"❌ Failed to fetch open trades: {e}")
            return []

    async def update_trade_status(self, order_id, new_status):
        """ট্রেড ক্লোজ হলে স্ট্যাটাস আপডেট করা"""
        if not self.pool: return
        query = "UPDATE trade_ledger SET status = $1 WHERE order_id = $2;"
        try:
            async with self.pool.acquire() as conn:
                await conn.execute(query, new_status, str(order_id))
                logger.info(f"🔄 DB Updated: Order {order_id} -> {new_status}")
        except Exception as e:
            logger.error(f"❌ Failed to update trade status: {e}")

db = Database()
