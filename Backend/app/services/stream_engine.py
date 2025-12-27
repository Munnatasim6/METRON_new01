import json
import asyncio
import websockets
import logging
import time
import ccxt.async_support as ccxt
from abc import ABC, abstractmethod
from typing import Optional, Set
from app.database import db


# --- Data Sanitizer Import (New) ---
from app.services.data_sanitizer import data_sanitizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("StreamEngine")

# --- Abstract Strategy ---
class MarketStreamStrategy(ABC):
    def __init__(self, callback):
        self.callback = callback
        self.running = False
        
    @abstractmethod
    async def start(self, pair: str):
        pass

    @abstractmethod
    async def stop(self):
        pass

# --- Strategy 1: Binance WebSocket (Updated) ---
class BinanceWebSocketStrategy(MarketStreamStrategy):
    async def start(self, pair: str):
        self.running = True
        formatted_pair = pair.replace("/", "").lower()
        url = f"wss://stream.binance.com:9443/ws/{formatted_pair}@trade"
        
        logger.info(f"🚀 Binance Stream Started: {pair}")
        
        while self.running:
            try:
                async with websockets.connect(url) as ws:
                    while self.running:
                        try:
                            msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
                            data = json.loads(msg)
                            price = float(data['p'])
                            timestamp = int(data['T']) # Event Time (ms)
                            
                            # কলব্যাক পাঠানো (Price Update + Timestamp)
                            await self.callback(price, timestamp)
                            
                        except asyncio.TimeoutError:
                            continue
                        except websockets.ConnectionClosed:
                            break
            except Exception as e:
                if self.running:
                    logger.error(f"Stream Connection Error: {e}")
                    await asyncio.sleep(5)

    async def stop(self):
        self.running = False

# --- CCXT Strategy (Omitted for brevity, logic remains similar) ---

# --- Main Context Class (Updated for Event Trigger) ---
class LiveMarketStream:
    def __init__(self):
        self.current_pair = "BTC/USDT"
        self.latest_price = 0.0
        self.subscribers: Set[asyncio.Queue] = set()
        self.strategy: Optional[MarketStreamStrategy] = None
        
        # ইভেন্ট ড্রিভেন ভেরিয়েবল
        self.last_candle_minute = 0 

    async def broadcast_price(self, price: float, timestamp_ms: int = None):
        """
        স্ট্র্যাটেজি থেকে কলব্যাক:
        ১. প্রাইস ব্রডকাস্ট করে
        ২. ডাটাবেসে সেভ করে
        ৩. নতুন মিনিট ক্যান্ডেল ডিটেক্ট করে (Event Trigger)
        """
        self.latest_price = price
        current_ts = timestamp_ms if timestamp_ms else int(time.time() * 1000)

        # ==========================================
        # ১. স্যানিটাইজেশন লেয়ার (Data Cleaning)
        # ==========================================
        # ডাটা যদি 'দূষিত' বা ইনভ্যালিড হয়, তাহলে এখানেই ফাংশন থেমে যাবে
        if not data_sanitizer.validate_tick(price, current_ts):
            return  # Bad data dropped silently to save CPU

        # ডাটা ভ্যালিড, এখন প্রসেসিং চলবে...
        
        # --- Event Driven Logic: New Minute Detection ---
        # টাইমস্ট্যাম্প (ms) থেকে বর্তমান মিনিট বের করা
        current_minute = int(current_ts / 60000)
        
        if current_minute > self.last_candle_minute:
            if self.last_candle_minute != 0:
                # নতুন মিনিট শুরু হয়েছে! সিগন্যাল ইঞ্জিন ট্রিগার করার সময়
                logger.info(f"⏰ New Candle Detected (Minute: {current_minute}). Triggering Analysis...")
                # এখানে আমরা ভবিষ্যতে 'signal_engine.force_calculate()' কল করতে পারি
            
            self.last_candle_minute = current_minute

        # ফ্রন্টএন্ড আপডেট
        payload = {
            "type": "TICKER",
            "data": {
                "pair": self.current_pair,
                "price": self.latest_price,
                "timestamp": current_ts / 1000
            }
        }
        for q in list(self.subscribers):
            try:
                q.put_nowait(payload)
            except asyncio.QueueFull:
                pass

        # ডাটাবেসে সেভ (Async Task)
        asyncio.create_task(self.save_to_db(price))

    async def save_to_db(self, price: float):
        # ডাটাবেসে ট্রেড সেভ করা
        await db.insert_trade_data(self.current_pair, price, "STREAM")

    def subscribe(self, q: asyncio.Queue):
        self.subscribers.add(q)

    # ... (rest of the methods: subscribe, start_engine, change_stream unchanged) ...
    # মনে রাখবে start_engine এবং change_stream মেথডগুলো আগের ফাইলের মতোই থাকবে
    # শুধু Strategy ক্লাসে callback আর্গুমেন্ট আপডেট করতে হবে (timestamp সহ)

    async def start_engine(self):
        await self.change_stream("binance", "BTC/USDT")

    async def change_stream(self, exchange_id: str, pair: str):
        if self.strategy:
            await self.strategy.stop()
        
        self.current_pair = pair
        # বর্তমানে শুধু বাইনান্স স্ট্র্যাটেজি আপডেট করা হয়েছে উদাহরণের জন্য
        self.strategy = BinanceWebSocketStrategy(self.broadcast_price)
        asyncio.create_task(self.strategy.start(pair))

market_stream = LiveMarketStream()
