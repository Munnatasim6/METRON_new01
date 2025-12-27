import json
import asyncio
import websockets
import logging
import time
import ccxt.async_support as ccxt
from abc import ABC, abstractmethod
from typing import Optional, Set
from app.database import db


from app.services.data_sanitizer import data_sanitizer
from app.services.timeframe_manager import timeframe_manager
from app.services.technical_indicators import technical_indicators
from app.services.signal_engine import signal_engine
from app.services.trade_executor import trade_executor
import pandas as pd

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
                
                # --- Feature Engineering Lab Integration ---
                # Background Task এ পাঠানো হচ্ছে যাতে ব্রডকাস্ট ব্লক না হয়
                asyncio.create_task(self.run_analysis_pipeline(self.current_pair))
            
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

    async def run_analysis_pipeline(self, pair: str):
        """
        Feature Engineering Lab Pipeline Execution
        1. Fetch Data -> 2. Transform -> 3. Extract Signals
        """
        try:
            # ১. ডাটা ফেচিং (২০০ ক্যান্ডেল যাতে ইন্ডিকেটর ঠিকমত কাজ করে)
            candles = await db.fetch_recent_candles(pair, limit=200)
            if not candles or len(candles) < 50:
                return

            # ২. ডাটাফ্রেম কনভার্সন
            df_1m = pd.DataFrame(candles)
            if 'time' in df_1m.columns:
                if 'datetime' not in df_1m.columns:
                     df_1m['datetime'] = pd.to_datetime(df_1m['time'])
                df_1m.set_index('datetime', inplace=True)
                df_1m.drop(columns=['time'], inplace=True)
            
            # ৩. ট্রান্সফর্মেশন (Timeframe Manager) -> Analytical Layer (Technical Indicators)
            target_tf = "15T"
            df_resampled = timeframe_manager.prepare_and_resample(df_1m, target_tf)
            
            if df_resampled is None or df_resampled.empty:
                return

            df_features = technical_indicators.apply_all_indicators(df_resampled)

            # ৪. সিগন্যাল এক্সট্রাকশন (Phase 3 Logic)
            signals_lab = None
            if df_features is not None:
                signals_lab = signal_engine.extract_signals(df_features, target_tf)
                
                # ৫. ট্রেড এক্সিকিউশন (যদি স্ট্রং সিগন্যাল থাকে)
                if signals_lab and signals_lab['extracted_signals']:
                    # Simple Logic: If any BUY signal found in lab, try execute
                    # This is just an integration demo, refined logic would be more complex
                    current_price = df_features['close'].iloc[-1]
                    for sig in signals_lab['extracted_signals']:
                        if "BUY" in sig:
                            trade_executor.execute_trade({
                                "symbol": pair, "side": "BUY", "price": current_price
                            })
                        elif "SELL" in sig:
                             trade_executor.execute_trade({
                                "symbol": pair, "side": "SELL", "price": current_price
                            })

            # ৫. লিগ্যাসি সেন্টিমেন্ট জেনারেশন (Frontend Compatibility)
            # Candles (Dict List) -> OHLCV (List of Lists) for Signal Engine
            ohlcv_list = [
                [c['time'].timestamp() * 1000 if hasattr(c['time'], 'timestamp') else c['time'], 
                 c['open'], c['high'], c['low'], c['close'], c['volume']] 
                for c in candles
            ]
            sentiment_result = signal_engine.analyze_market_sentiment(ohlcv_list)

            # ৬. মার্জিং: নতুন ল্যাব সিগন্যালগুলো ডিটেইলসে এড করা
            if signals_lab and signals_lab.get('extracted_signals'):
                logger.info(f"🔍 ANALYSIS RESULT [{pair}]: {signals_lab['extracted_signals']}")
                
                for sig_text in signals_lab['extracted_signals']:
                    # টেক্সট পার্সিং: "[15T] BUY: Trend..." -> Signal: BUY
                    sig_type = "NEUTRAL"
                    if "BUY" in sig_text: sig_type = "BUY"
                    elif "SELL" in sig_text: sig_type = "SELL"
                    
                    sentiment_result['details'].insert(0, {
                        "name": f"Feature Lab: {sig_text.split(':')[-1].strip()}",
                        "signal": sig_type
                    })

            # ৭. ফ্রন্টএন্ডে ব্রডকাস্ট (Legacy Format: SENTIMENT)
            # এটি Fronted এর SentimentWidget এর সাথে মিল রেখে পাঠানো হচ্ছে
            payload = {
                "type": "SENTIMENT",
                "payload": sentiment_result
            }
            
            for q in list(self.subscribers):
                try:
                    q.put_nowait(payload)
                except asyncio.QueueFull:
                    pass

        except Exception as e:
            logger.error(f"Analysis Pipeline Error: {e}")

market_stream = LiveMarketStream()
