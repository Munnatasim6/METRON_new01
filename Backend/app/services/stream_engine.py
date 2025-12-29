import asyncio
import json
import logging
import pandas as pd
import ccxt.async_support as ccxt
from datetime import datetime, timedelta

# ডিপেন্ডেন্সি ইমপোর্ট
from app.services.timeframe_manager import TimeframeManager
from app.services.technical_indicators import TechnicalIndicators
from app.services.signal_engine import SignalEngine
from app.services.strategy_manager import strategy_manager
from app.services.trade_executor import trade_executor
from app.database import db

logger = logging.getLogger("StreamEngine")

class StreamEngine:
    def __init__(self):
        self.connected_clients = set()
        
        # কোর সার্ভিস
        self.tf_manager = TimeframeManager()
        self.tech_indicators = TechnicalIndicators()
        self.signal_engine = SignalEngine()
        
        # বাফার
        self.data_buffer = pd.DataFrame()
        self.symbol = "BTC/USDT" # ডিফল্ট সিম্বল
        
        # টাইমার
        self.last_analysis_time = datetime.min 
        self.analysis_interval_sec = 30
        
        # স্টার্টআপ লজিক
        asyncio.create_task(self.initialize_buffer())

    async def initialize_buffer(self):
        """TimescaleDB থেকে কোল্ড স্টার্ট ডাটা লোড"""
        logger.info("🔄 Initializing Buffer from TimescaleDB...")
        try:
            db_df = await db.get_recent_candles(self.symbol, limit=1500)
            
            needs_fetch = False
            
            if db_df.empty:
                logger.warning("⚠️ DB Empty! Fetching from Binance...")
                needs_fetch = True
            else:
                self.data_buffer = db_df
                last_time = db_df.index[-1]
                # Timezone info বাদ দিয়ে তুলনা (Error avoid করার জন্য)
                if last_time.tzinfo:
                    last_time = last_time.tz_localize(None)
                
                time_now = datetime.now()
                
                if (time_now - last_time).total_seconds() > 600:
                    logger.warning(f"⚠️ Data Outdated. Syncing...")
                    needs_fetch = True
            
            if needs_fetch:
                await self.sync_with_exchange()
                
        except Exception as e:
            logger.error(f"Initialization Error: {e}")

    async def sync_with_exchange(self):
        """Binance থেকে মিসিং ডাটা আনা"""
        exchange = ccxt.binance({'enableRateLimit': True})
        try:
            ohlcv = await exchange.fetch_ohlcv(self.symbol, '1m', limit=1500)
            if ohlcv:
                formatted_data = []
                for candle in ohlcv:
                    formatted_data.append({
                        'time': datetime.fromtimestamp(candle[0]/1000).isoformat(),
                        's': self.symbol,
                        'open': candle[1], 'high': candle[2], 'low': candle[3], 
                        'close': candle[4], 'volume': candle[5]
                    })
                
                if formatted_data:
                    await db.save_bulk_candles(formatted_data)
                    self.data_buffer = await db.get_recent_candles(self.symbol, limit=1500)
                
        except Exception as e:
            logger.error(f"Sync Error: {e}")
        finally:
            await exchange.close()

    async def run_automation_logic(self, candle_data):
        """
        মার্কেট ডাটা আসার পর এই ফাংশনটি চলে।
        এটি এখন AI সিগন্যাল হ্যান্ডেল করতে পারে।
        """
        # ডাটাফ্রেমে কনভার্ট (সিম্পলিফাইড)
        # যেহেতু broadcast এ ডাটা এড হচ্ছে, আমরা data_buffer ব্যবহার করতে পারি
        if self.data_buffer.empty: return {"trade_signal": "NEUTRAL", "ai_data": None}
        
        df = self.data_buffer.copy()

        # ১. স্ট্র্যাটেজি ম্যানেজার থেকে সিগন্যাল আনা
        # এখন এটি শুধু "BUY" স্ট্রিং না হয়ে একটি Dictionary ও হতে পারে
        signal_data = await strategy_manager.get_signal(df)
        
        trade_signal = "NEUTRAL"
        ai_meta_data = None

        # ২. সিগন্যালটি কি সাধারণ স্ট্রিং নাকি AI অবজেক্ট? চেক করা হচ্ছে
        if isinstance(signal_data, dict):
            # এটি হাইব্রিড ইঞ্জিনের ডাটা
            trade_signal = signal_data.get('signal', 'NEUTRAL')
            ai_meta_data = {
                'vote': signal_data.get('sentiment_score', 0),
                'confidence': signal_data.get('ai_confidence', 0),
                'is_ai': True
            }
        else:
            # এটি সাধারণ স্ট্র্যাটেজির ডাটা
            trade_signal = str(signal_data)
            ai_meta_data = {'is_ai': False}

        # ৩. ট্রেড এক্সিকিউশন (Executor কে শুধু BUY/SELL স্ট্রিং দেওয়া হবে)
        if trade_signal in ["BUY", "SELL"]:
            await trade_executor.execute_trade({
                "symbol": candle_data.get('s', self.symbol),
                "side": trade_signal,
                "price": candle_data.get('close'),
                "strategy": strategy_manager.current_mode
            })

        # ৪. ফ্রন্টএন্ডের জন্য ডাটা রিটার্ন (WebSocket এর মাধ্যমে যাবে)
        return {
            "trade_signal": trade_signal,
            "ai_data": ai_meta_data
        }

    async def broadcast(self, raw_candle_data):
        if not self.connected_clients:
            return

        try:
            # ============================================================
            # FIX: Symbol Definition
            # ============================================================
            symbol = raw_candle_data.get('s', self.symbol)

            # ============================================================
            # ধাপ-১: ডাটা প্রসেসিং
            # ============================================================
            processed_data = {
                'open': float(raw_candle_data.get('open', 0)),
                'high': float(raw_candle_data.get('high', 0)),
                'low': float(raw_candle_data.get('low', 0)),
                'close': float(raw_candle_data.get('close', 0)),
                'volume': float(raw_candle_data.get('volume', 0)),
                's': symbol
            }
            
            # টাইমস্ট্যাম্প হ্যান্ডলিং (UTC)
            raw_time = raw_candle_data.get('time') or raw_candle_data.get('t')
            if raw_time:
                current_time = pd.to_datetime(raw_time, unit='ms', utc=True)
            else:
                current_time = pd.Timestamp.now(tz='UTC')

            new_candle = pd.DataFrame([processed_data], index=[current_time])
            new_candle.index.name = 'timestamp'

            # ============================================================
            # ধাপ-২: বাফার ও TimescaleDB সেভিং
            # ============================================================
            if self.data_buffer.empty:
                self.data_buffer = pd.concat([self.data_buffer, new_candle])
            else:
                last_idx_time = self.data_buffer.index[-1]
                
                # নতুন মিনিট ডিটেকশন
                if current_time.minute != last_idx_time.minute:
                    last_completed_candle = self.data_buffer.iloc[-1].to_dict()
                    last_completed_candle['time'] = last_idx_time.isoformat()
                    last_completed_candle['s'] = symbol 
                    
                    # Async Save to TimescaleDB
                    asyncio.create_task(db.save_candle(last_completed_candle))
                    logger.info(f"💾 Persisted Candle: {last_idx_time.strftime('%H:%M')}")

                    self.data_buffer = pd.concat([self.data_buffer, new_candle])
                else:
                    self.data_buffer = self.data_buffer.iloc[:-1]
                    self.data_buffer = pd.concat([self.data_buffer, new_candle])

            if len(self.data_buffer) > 1500: 
                self.data_buffer = self.data_buffer.iloc[-1500:]

            # ============================================================
            # ধাপ-৩: প্রসেসিং এবং অটোমেশন
            # ============================================================
            # Analysis Logic call
            analysis_result = await self.run_automation_logic(processed_data)
            
            # Message Send
            message = json.dumps({
                "type": "market_update",
                "price_data": processed_data,
                "analysis": analysis_result # এর ভেতরেই AI Confidence আছে
            })

            if self.connected_clients:
                await asyncio.gather(*[client.send_text(message) for client in self.connected_clients])

        except Exception as e:
            logger.error(f"StreamEngine Error: {e}", exc_info=True)

    async def connect(self, websocket):
        await websocket.accept()
        self.connected_clients.add(websocket)

    def disconnect(self, websocket):
        if websocket in self.connected_clients:
            self.connected_clients.remove(websocket)
