import json
import asyncio
import websockets
import logging
import ccxt.async_support as ccxt
from abc import ABC, abstractmethod
from typing import Optional, Set

# লগিং সেটআপ
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Abstract Strategy Base Class ---
class MarketStreamStrategy(ABC):
    def __init__(self, callback):
        self.callback = callback
        self.running = False
        self.current_pair = ""
        
    @abstractmethod
    async def start(self, pair: str):
        pass

    @abstractmethod
    async def stop(self):
        pass

# --- Strategy 1: Binance Direct WebSocket (Fastest) ---
class BinanceWebSocketStrategy(MarketStreamStrategy):
    async def start(self, pair: str):
        self.current_pair = pair.replace("/", "").lower()
        self.running = True
        url = f"wss://stream.binance.com:9443/ws/{self.current_pair}@trade"
        
        logger.info(f"🚀 Starting Binance WS Strategy for {self.current_pair}")
        while self.running:
            try:
                async with websockets.connect(url) as ws:
                    logger.info(f"✅ Connected to Binance: {self.current_pair}")
                    while self.running:
                        try:
                            msg = await asyncio.wait_for(ws.recv(), timeout=1.0)
                            data = json.loads(msg)
                            price = float(data['p'])
                            await self.callback(price)
                        except asyncio.TimeoutError:
                            continue
                        except websockets.ConnectionClosed:
                            break
                        except Exception as e:
                            logger.error(f"Binance Stream Error: {e}")
                            break
            except Exception as e:
                if self.running:
                    logger.error(f"Binance Connection Error: {e}")
                    await asyncio.sleep(2)

    async def stop(self):
        self.running = False
        logger.info("🛑 Stopping Binance Strategy")

# --- Strategy 2: CCXT Polling (Universal Support) ---
class CCXTPollingStrategy(MarketStreamStrategy):
    def __init__(self, callback, exchange_id: str):
        super().__init__(callback)
        self.exchange_id = exchange_id
        
    async def start(self, pair: str):
        self.current_pair = pair
        self.running = True
        
        logger.info(f"� Starting Standard Polling Strategy for {self.exchange_id.upper()} : {pair}")
        
        try:
            exchange_class = getattr(ccxt, self.exchange_id)
            async with exchange_class() as exchange:
                while self.running:
                    try:
                        ticker = await exchange.fetch_ticker(pair)
                        price = ticker['last']
                        await self.callback(price)
                        await asyncio.sleep(1.5) # ১.৫ সেকেন্ড ডিলে (রেট লিমিট এড়াতে)
                    except Exception as e:
                        logger.error(f"Polling Error ({self.exchange_id}): {e}")
                        await asyncio.sleep(5)
        except Exception as e:
            logger.error(f"Exchange Init Error: {e}")

    async def stop(self):
        self.running = False
        logger.info(f"🛑 Stopping Polling Strategy ({self.exchange_id})")


# --- Context Class (The Engine) ---
class LiveMarketStream:
    def __init__(self):
        self.current_pair = "BTC/USDT"
        self.current_exchange = "binance"
        self.latest_price = 0.0
        self.subscribers: Set[asyncio.Queue] = set()
        
        self.strategy: Optional[MarketStreamStrategy] = None
        self.param_lock = asyncio.Lock() # রেস কন্ডিশন এড়াতে
        self.task_runner = None

    async def broadcast_price(self, price: float):
        """স্ট্র্যাটেজি থেকে কলব্যাক পাওয়ার মেথড"""
        self.latest_price = price
        payload = {
            "type": "TICKER",
            "data": {
                "pair": self.current_pair,
                "exchange": self.current_exchange,
                "price": self.latest_price,
                "timestamp": asyncio.get_running_loop().time()
            }
        }
        for q in list(self.subscribers):
            try:
                q.put_nowait(payload)
            except asyncio.QueueFull:
                pass

    async def subscribe(self) -> asyncio.Queue:
        q = asyncio.Queue(maxsize=100)
        self.subscribers.add(q)
        return q

    async def unsubscribe(self, q: asyncio.Queue):
        if q in self.subscribers:
            self.subscribers.remove(q)

    async def start_engine(self):
        """ডিফল্ট স্ট্র্যাটেজি দিয়ে ইঞ্জিন চালু করা"""
        await self.change_stream("binance", "BTC/USDT")

    async def change_stream(self, exchange_id: str, pair: str):
        """যেকোনো এক্সচেঞ্জ বা পেয়ারে সুইচ করার মাস্টার ফাংশন"""
        async with self.param_lock:
            # ১. আগের স্ট্র্যাটেজি বন্ধ করা
            if self.strategy:
                await self.strategy.stop()
                if self.task_runner:
                    self.task_runner.cancel()
                    try:
                        await self.task_runner
                    except asyncio.CancelledError:
                        pass
            
            # ২. নতুন প্যারামিটার সেট
            self.current_exchange = exchange_id
            self.current_pair = pair
            logger.info(f"twisted_rightwards_arrows Switching Engine to: {exchange_id.upper()} -> {pair}")

            # ৩. স্ট্র্যাটেজি সিলেক্ট করা
            if exchange_id == "binance":
                self.strategy = BinanceWebSocketStrategy(self.broadcast_price)
            else:
                self.strategy = CCXTPollingStrategy(self.broadcast_price, exchange_id)
            
            # ৪. নতুন স্ট্র্যাটেজি ব্যাকগ্রাউন্ডে চালানো
            self.task_runner = asyncio.create_task(self.strategy.start(pair))

market_stream = LiveMarketStream()
