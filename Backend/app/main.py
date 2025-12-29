from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import asyncio
import logging
import ccxt.async_support as ccxt

# সার্ভিস ইমপোর্ট
from app.services.timeframe_manager import TimeframeManager
from app.services.technical_indicators import TechnicalIndicators
from app.services.stream_engine import StreamEngine
from app.services.strategy_manager import strategy_manager
from app.services.arbitrage_engine import arbitrage_engine
from app.services.trade_executor import trade_executor # Gap 1 Fix
from app.database import db # Gap 1 & 2 Fix

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
# MARKET LISTENER SERVICE (GAP 3 FIXED: Auto-Healing Connection)
# ============================================================
async def start_market_listener():
    """
    ব্যাকগ্রাউন্ড টাস্ক: বাইনান্স থেকে ডাটা আনবে।
    নেটওয়ার্ক ফেল করলে অটোমেটিক কানেকশন রিসেট করবে (Zombie Killer Logic)।
    """
    symbol = "BTC/USDT"
    logger.info(f"📡 Market Listener Service Initialized for {symbol}")

    # ১. আউটার লুপ (The Manager Loop - কানেকশন ম্যানেজার)
    while True:
        exchange = None
        try:
            # প্রতিবার লুপের শুরুতে একদম নতুন কানেকশন তৈরি হবে
            logger.info("🔄 Creating Fresh Connection to Binance...")
            exchange = ccxt.binance({
                'enableRateLimit': True,
                'options': {'defaultType': 'future'} 
            })
            
            # ২. ইনার লুপ (The Worker Loop - ডাটা ফেচার)
            while True:
                try:
                    # ডাটা ফেচিং (Real-time 1m candle)
                    ohlcv = await exchange.fetch_ohlcv(symbol, '1m', limit=1)

                    if ohlcv:
                        latest_candle = ohlcv[-1]
                        
                        # ডাটা ফরম্যাটিং
                        candle_data = {
                            'time': latest_candle[0],
                            'open': latest_candle[1],
                            'high': latest_candle[2],
                            'low': latest_candle[3],
                            'close': latest_candle[4],
                            'volume': latest_candle[5],
                            's': symbol
                        }

                        # ইঞ্জিনে ব্রডকাস্ট (যা ডাটাবেসেও সেভ করবে)
                        await stream_engine.broadcast(candle_data)

                    # Core i3 Optimization: ১ সেকেন্ড বিশ্রাম
                    await asyncio.sleep(1)

                except Exception as worker_error:
                    # ৩. এরর ডিটেকশন (নেটওয়ার্ক সমস্যা হলে লুপ ব্রেক করবে)
                    logger.warning(f"⚠️ Network/API Error in Worker Loop: {worker_error}")
                    logger.warning("♻️ Killing Zombie Connection and Restarting...")
                    break # ইনার লুপ ব্রেক করে আউটার লুপে পাঠাবে

        except Exception as manager_error:
            logger.error(f"❌ Critical Manager Loop Error: {manager_error}")
        
        finally:
            # ৪. ক্লিনআপ (মেমোরি লিক রোধ করতে কানেকশন ক্লোজ)
            if exchange:
                try:
                    await exchange.close()
                    logger.info("🗑️ Old Connection Closed & Cleanup Done.")
                except Exception as close_error:
                    logger.error(f"⚠️ Cleanup Error: {close_error}")

        # ৫. ব্যাক-অফ স্ট্র্যাটেজি (পুনরায় কানেক্ট করার আগে ৫ সেকেন্ড অপেক্ষা)
        logger.info("⏳ Waiting 5s before Re-connection...")
        await asyncio.sleep(5)

# ============================================================
# LIFECYCLE EVENTS (Startup & Shutdown)
# ============================================================
@app.on_event("startup")
async def startup_event():
    """অ্যাপ রান করার সময় ডাটাবেস কানেকশন ও লিসেনার চালু করা"""
    logger.info("🚀 Metron AI System Booting Up...")
    
    # ১. ডাটাবেস কানেকশন (TimescaleDB)
    await db.connect()
    
    # ২. পজিশন রিকভারি (Gap 1 Fix - Trade Memory Restore)
    await trade_executor.sync_positions()
    
    # ৩. মার্কেট লিসেনার চালু (Gap 3 Fix - Robust Data Pump)
    asyncio.create_task(start_market_listener())

@app.on_event("shutdown")
async def shutdown_event():
    """অ্যাপ বন্ধ করার সময় ক্লিনআপ"""
    logger.info("🌙 System Shutting Down...")
    await trade_executor.close_connections()

# ============================================================
# API ENDPOINTS
# ============================================================

@app.get("/")
def read_root():
    return {
        "status": "active", 
        "system": "Metron AI Core i3 Optimized", 
        "active_positions": len(trade_executor.positions),
        "connection_mode": "Auto-Healing"
    }

@app.get("/api/v1/market-status")
async def get_market_status(timeframe: str = Query("1H", description="Timeframe like 15m, 1H, 4H")):
    """
    Gap 2 Fix: Real Database -> Resampling -> Indicators -> Frontend
    """
    try:
        # ডাটা ফেচিং
        raw_df = await db.get_recent_candles("BTC/USDT", limit=2000)
        
        if raw_df.empty:
            return {"status": "waiting", "message": "Data syncing from Binance... Please wait."}
        
        # টাইমফ্রেম কনভারশন
        tf_map = {"1H": "1h", "4H": "4h", "15m": "15T", "1D": "1D"}
        target_tf = tf_map.get(timeframe, "1h")
        
        resampled_df = tf_manager.prepare_and_resample(raw_df, target_tf)
        
        if resampled_df is None or resampled_df.empty:
            return {"status": "waiting", "message": "Insufficient data for this timeframe."}

        # ইন্ডিকেটর ক্যালকুলেশন
        final_df = ti_engine.apply_all_indicators(resampled_df)
        
        # ডাটা ক্লিনিং (NaN Removal)
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
    return await arbitrage_engine.get_arbitrage_opportunities(symbol)

@app.get("/api/exchanges")
async def get_exchanges():
    return ["binance", "kraken", "kucoin", "bybit"]

@app.get("/api/markets")
async def get_markets(exchange: str = "binance"):
    return ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"]

@app.websocket("/ws/feed")
async def websocket_endpoint(websocket: WebSocket):
    """
    রিয়েল-টাইম ডাটা স্ট্রিমিং পয়েন্ট
    """
    await stream_engine.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        stream_engine.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")
        stream_engine.disconnect(websocket)
