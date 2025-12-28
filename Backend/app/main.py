from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import asyncio
import logging
import ccxt.async_support as ccxt  # CCXT লাইব্রেরি ইমপোর্ট

# সার্ভিস ইমপোর্ট
from app.services.timeframe_manager import TimeframeManager
from app.services.technical_indicators import TechnicalIndicators
from app.services.stream_engine import StreamEngine
from app.services.strategy_manager import strategy_manager
from app.services.arbitrage_engine import arbitrage_engine

# লগিং কনফিগারেশন
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MainAPI")

app = FastAPI(title="Metron AI Trading Backend")

# CORS (Frontend Connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# গ্লোবাল সার্ভিস ইন্সট্যান্স
stream_engine = StreamEngine()
tf_manager = TimeframeManager()
ti_engine = TechnicalIndicators()

# ============================================================
# MARKET LISTENER SERVICE (Core i3 Optimized)
# ============================================================
async def start_market_listener():
    """
    ব্যাকগ্রাউন্ড টাস্ক যা বাইনান্স থেকে রিয়েল-টাইম ডাটা ফেচ করে
    StreamEngine-এ পুশ করবে।
    """
    # পাবলিক ইন্সট্যান্স (API Key ছাড়া) - এতে রেট লিমিট সমস্যা কম হয়
    exchange = ccxt.binance({
        'enableRateLimit': True,
        'options': {'defaultType': 'future'} # ফিউচার মার্কেট ডাটা (প্রয়োজন হলে 'spot' করা যাবে)
    })
    
    symbol = "BTC/USDT"
    logger.info(f"📡 Market Listener Started via REST Polling for {symbol}...")

    try:
        while True:
            try:
                # ১. ডাটা ফেচিং (REST Polling)
                # limit=1 মানে শুধু লেটেস্ট ক্যান্ডেলটা আনছি (ব্যান্ডউইথ সেভিং)
                ohlcv = await exchange.fetch_ohlcv(symbol, '1m', limit=1)

                if ohlcv:
                    latest_candle = ohlcv[-1] # [Time, Open, High, Low, Close, Volume]

                    # ২. ডাটা ফরম্যাটিং (Dynamic Dict Creation)
                    candle_data = {
                        'time': latest_candle[0],
                        'open': latest_candle[1],
                        'high': latest_candle[2],
                        'low': latest_candle[3],
                        'close': latest_candle[4],
                        'volume': latest_candle[5],
                        's': symbol # সিম্বল আইডেন্টিফায়ার
                    }

                    # ৩. ইঞ্জিনে পুশ করা (Broadcast)
                    await stream_engine.broadcast(candle_data)

                # Core i3 Optimization: রেট লিমিটিং
                # ১ সেকেন্ড অপেক্ষা (বাইনান্সের ওপর চাপ কমানোর জন্য)
                await asyncio.sleep(1)

            except Exception as inner_e:
                logger.warning(f"⚠️ Fetch Error: {inner_e}. Retrying in 5s...")
                await asyncio.sleep(5) # এরর হলে একটু বেশি সময় অপেক্ষা

    except asyncio.CancelledError:
        logger.info("🛑 Market Listener Stopped.")
    finally:
        await exchange.close()

# ============================================================
# LIFECYCLE EVENTS (Startup & Shutdown)
# ============================================================
from app.database import db

@app.on_event("startup")
async def startup_event():
    """অ্যাপ রান করার সময় ব্যাকগ্রাউন্ড লুপ চালু করা"""
    logger.info("🚀 Metron AI System Booting Up...")
    await db.connect()
    # লিসেনার টাস্ক হিসেবে অ্যাসাইন করা
    asyncio.create_task(start_market_listener())

@app.on_event("shutdown")
async def shutdown_event():
    """অ্যাপ বন্ধ করার সময় ক্লিনআপ"""
    logger.info("🌙 System Shutting Down...")
    # কানেকশন ক্লোজ লজিক এখানে থাকতে পারে

# ============================================================
# API ENDPOINTS
# ============================================================

# মক ডাটাবেস (যেহেতু রিয়েল ডিবি কানেকশন কোড নেই, এটি প্লেসহোল্ডার)
def get_mock_historical_data():
    dates = pd.date_range(end=pd.Timestamp.now(), periods=300, freq='1min')
    data = {
        'open': [50000 + i*10 for i in range(300)],
        'high': [50100 + i*10 for i in range(300)],
        'low': [49900 + i*10 for i in range(300)],
        'close': [50050 + i*10 for i in range(300)],
        'volume': [100 + i for i in range(300)]
    }
    df = pd.DataFrame(data, index=dates)
    return df

@app.get("/")
def read_root():
    return {"status": "active", "system": "Metron AI Core i3 Optimized", "listener": "RUNNING"}

@app.get("/api/v1/market-status")
async def get_market_status(timeframe: str = Query("1H", description="Timeframe like 15T, 1H, 4H")):
    """
    ফ্রন্টএন্ড লোড হওয়ার সময় পূর্ণাঙ্গ চার্ট ডাটা পাওয়ার জন্য API
    """
    try:
        # TODO: ভবিষ্যতে এটি রিয়েল ডাটাবেস (bot_data.db) থেকে ডাটা আনবে
        raw_df = get_mock_historical_data() 
        
        tf_map = {"1H": "1h", "4H": "4h", "15m": "15T", "1D": "1D"}
        target_tf = tf_map.get(timeframe, "1h")
        
        resampled_df = tf_manager.prepare_and_resample(raw_df, target_tf)
        
        if resampled_df is None or resampled_df.empty:
            return {"status": "error", "message": "Insufficient data"}

        final_df = ti_engine.apply_all_indicators(resampled_df)
        
        records = final_df.reset_index().to_dict(orient='records')
        clean_records = [{k: (v if pd.notna(v) else None) for k, v in rec.items()} for rec in records]
        
        current_phase = final_df.iloc[-1].get('market_phase', 'Unknown')

        return {
            "status": "success",
            "timeframe": timeframe,
            "current_phase": current_phase,
            "data": clean_records
        }

    except Exception as e:
        logger.error(f"API Error: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/api/strategy")
async def get_strategy_config():
    return {
        "current_mode": strategy_manager.current_mode,
        "strategies": list(strategy_manager.strategies.keys())
    }

@app.get("/api/arbitrage")
async def get_arbitrage_data(symbol: str = "BTC/USDT"):
    """Fetch live prices for Arbitrage Monitor"""
    return await arbitrage_engine.get_arbitrage_opportunities(symbol)

@app.get("/api/exchanges")
async def get_exchanges():
    """Returns supported exchanges"""
    return ["binance", "kraken", "kucoin", "bybit", "gateio"]

@app.get("/api/markets")
async def get_markets(exchange: str = "binance"):
    """Returns market pairs"""
    return ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"]

@app.websocket("/ws/feed")
async def websocket_endpoint(websocket: WebSocket):
    """
    রিয়েল-টাইম ডাটা স্ট্রিমিং পয়েন্ট (Frontend এর সাথে কানেকশন)
    """
    await stream_engine.connect(websocket)
    try:
        while True:
            # ক্লায়েন্ট থেকে মেসেজ রিসিভ (Heartbeat বা Subscription)
            data = await websocket.receive_text()
            # বর্তমানে আমরা ক্লায়েন্ট থেকে কিছু রিসিভ করে অ্যাকশন নিচ্ছি না, 
            # কিন্তু কানেকশন ধরে রাখার জন্য এই লুপ জরুরি।
    except WebSocketDisconnect:
        stream_engine.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")
        stream_engine.disconnect(websocket)
