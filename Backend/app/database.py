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
            try:
                await conn.execute("""
                    SELECT create_hypertable('market_candles', 'time', if_not_exists => TRUE);
                """)
                logger.info("⚡ Hypertable 'market_candles' configured.")
            except Exception as e:
                logger.warning(f"Hypertable creation msg: {e}")

    async def save_candle(self, data):
        """FIXED: Timezone Handling"""
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
            # টাইমস্ট্যাম্প প্রসেসিং
            ts = pd.to_datetime(data['time'])
            
            # যদি টাইমজোন না থাকে (Naive), তবে UTC তে সেট করা
            if ts.tzinfo is None:
                ts = ts.tz_localize('UTC')
            else:
                ts = ts.tz_convert('UTC')

            async with self.pool.acquire() as conn:
                await conn.execute(query, 
                    ts, data['s'], 
                    float(data['open']), float(data['high']), float(data['low']), 
                    float(data['close']), float(data['volume'])
                )
        except Exception as e:
            logger.error(f"Save Candle Error: {e}")

    async def save_bulk_candles(self, data_list):
        if not self.pool or not data_list: return

        records = []
        for d in data_list:
            ts = pd.to_datetime(d['time'])
            if ts.tzinfo is None:
                ts = ts.tz_localize('UTC')
            else:
                ts = ts.tz_convert('UTC')
                
            records.append((
                ts, d.get('s', 'BTC/USDT'), d['open'], d['high'], d['low'], d['close'], d['volume']
            ))
        
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

        query = """
            SELECT time, open, high, low, close, volume 
            FROM market_candles 
            WHERE symbol = $1 
            ORDER BY time ASC 
            LIMIT $2;
        """
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

db = Database()
