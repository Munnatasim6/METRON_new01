import asyncpg
import logging
import asyncio
from app.core.config import settings

# লগিং সেটআপ
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Database")

class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        """ডাটাবেস কানেকশন পুল তৈরি করা (Core i3 অপ্টিমাইজড)"""
        if not self.pool:
            try:
                self.pool = await asyncpg.create_pool(
                    user=settings.POSTGRES_USER,
                    password=settings.POSTGRES_PASSWORD,
                    database=settings.POSTGRES_DB,
                    host=settings.POSTGRES_SERVER,
                    port=settings.POSTGRES_PORT,
                    min_size=1,
                    max_size=10 # i3 এর জন্য কানেকশন সংখ্যা লিমিট রাখা ভালো
                )
                logger.info("✅ Database Connection Pool Created")
                await self.init_tables()
            except Exception as e:
                logger.error(f"❌ DB Connection Error: {e}")

    async def disconnect(self):
        if self.pool:
            await self.pool.close()
            logger.info("🛑 Database Connection Closed")

    async def init_tables(self):
        """টেবিল এবং হাইপারটেবিল তৈরি করা"""
        queries = [
            # ১. সেটিংস টেবিল (User Configuration)
            """
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            """,
            
            # ২. ট্রেড টেবিল (Bot Trades)
            """
            CREATE TABLE IF NOT EXISTS trades (
                id SERIAL PRIMARY KEY,
                symbol TEXT NOT NULL,
                side TEXT NOT NULL, -- BUY or SELL
                price DOUBLE PRECISION NOT NULL,
                amount DOUBLE PRECISION NOT NULL,
                strategy TEXT,
                timestamp TIMESTAMPTZ DEFAULT NOW()
            );
            """,

            # ৩. মার্কেট ডাটা টেবিল (1-Minute Candles)
            """
            CREATE TABLE IF NOT EXISTS candles_1m (
                time TIMESTAMPTZ NOT NULL,
                symbol TEXT NOT NULL,
                open DOUBLE PRECISION NOT NULL,
                high DOUBLE PRECISION NOT NULL,
                low DOUBLE PRECISION NOT NULL,
                close DOUBLE PRECISION NOT NULL,
                volume DOUBLE PRECISION NOT NULL,
                UNIQUE (time, symbol)
            );
            """,

            # ৪. TimescaleDB হাইপারটেবিল কনভারশন (Magic Step)
            # এটি সাধারণ টেবিলকে টাইম-সিরিজ পাওয়ারহাউজে রূপান্তর করে
            """
            SELECT create_hypertable('candles_1m', 'time', if_not_exists => TRUE);
            """
        ]

        async with self.pool.acquire() as conn:
            for query in queries:
                try:
                    await conn.execute(query)
                except Exception as e:
                    logger.error(f"Table Creation Error: {e}")
            logger.info("✅ Database Tables & Hypertables Ready")

    # --- Data Ingestion Methods ---

    async def insert_trade_data(self, symbol: str, price: float, side: str = "UNKNOWN"):
        """লাইভ ট্রেড ডাটা সেভ করা"""
        if not self.pool: return
        query = """
            INSERT INTO trades (symbol, side, price, amount) 
            VALUES ($1, $2, $3, $4)
        """
        try:
            # i3 অপ্টিমাইজেশন: আমরা এখানে await ব্যবহার করছি কিন্তু এটি non-blocking
            await self.pool.execute(query, symbol, side, price, 0.0) 
        except Exception as e:
            logger.error(f"Insert Error: {e}")

    async def insert_candle(self, candle_data: dict):
        """১ মিনিটের ক্যান্ডেল সেভ করা"""
        query = """
            INSERT INTO candles_1m (time, symbol, open, high, low, close, volume)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (time, symbol) DO NOTHING;
        """
        try:
            await self.pool.execute(query, 
                candle_data['time'], candle_data['symbol'], 
                candle_data['open'], candle_data['high'], 
                candle_data['low'], candle_data['close'], 
                candle_data['volume']
            )
        except Exception as e:
            logger.error(f"Candle Insert Error: {e}")

    # --- Settings Methods (Replacing SQLite) ---
    async def get_strategy(self):
        if not self.pool: return "conservative"
        val = await self.pool.fetchval("SELECT value FROM settings WHERE key='strategy'")
        return val if val else "conservative"

    async def set_strategy(self, strategy: str):
        if not self.pool: return
        await self.pool.execute(
            "INSERT INTO settings (key, value) VALUES ('strategy', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
            strategy
        )

# Global Instance
db = Database()
