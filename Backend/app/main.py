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
from app.services.trade_executor import trade_executor # Executor ইমপোর্ট
from app.services.backtest_engine import backtest_engine # Backtest Engine
from app.database import db # DB ইমপোর্ট
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MainAPI")

app = FastAPI(title="Metron AI Trading Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stream_engine = StreamEngine()
tf_manager = TimeframeManager()
ti_engine = TechnicalIndicators()

# ============================================================
# MARKET LISTENER SERVICE (Optimized)
# ============================================================
async def start_market_listener():
    exchange = ccxt.binance({
        'enableRateLimit': True,
        'options': {'defaultType': 'future'} 
    })
    symbol = "BTC/USDT"
    logger.info(f"📡 Market Listener Started for {symbol}...")

    try:
        while True:
            try:
                ohlcv = await exchange.fetch_ohlcv(symbol, '1m', limit=1)
                if ohlcv:
                    latest_candle = ohlcv[-1]
                    candle_data = {
                        'time': latest_candle[0], 'open': latest_candle[1], 
                        'high': latest_candle[2], 'low': latest_candle[3], 
                        'close': latest_candle[4], 'volume': latest_candle[5], 
                        's': symbol
                    }
                    await stream_engine.broadcast(candle_data)
                
                await asyncio.sleep(1)

            except Exception as inner_e:
                logger.warning(f"⚠️ Fetch Error: {inner_e}. Retrying...")
                await asyncio.sleep(5) 

    except asyncio.CancelledError:
        logger.info("🛑 Market Listener Stopped.")
    finally:
        await exchange.close()

# ============================================================
# LIFECYCLE EVENTS (Startup Logic Updated)
# ============================================================
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Metron AI System Booting Up...")
    
    # ১. ডাটাবেস কানেকশন
    await db.connect()
    
    # ২. পজিশন রিকভারি (Reconciliation Logic)
    # এটিই সেই ম্যাজিক লাইন যা রিস্টার্টের পর সব ঠিক করে দিবে
    await trade_executor.sync_positions()
    
    # ৩. লিসেনার চালু
    asyncio.create_task(start_market_listener())

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🌙 System Shutting Down...")
    await trade_executor.close_connections()

# ============================================================
# API ENDPOINTS
# ============================================================
@app.get("/")
def read_root():
    return {"status": "active", "system": "Metron AI Protected", "positions": len(trade_executor.positions)}

@app.get("/api/v1/market-status")
async def get_market_status(timeframe: str = Query("1H")):
    try:
        # রিয়েল ডাটাবেস কানেকশন (Mock ডাটা সরানো হয়েছে)
        raw_df = await db.get_recent_candles("BTC/USDT", limit=300)
        
        if raw_df.empty:
             return {"status": "waiting", "message": "Data syncing..."}

        tf_map = {"1H": "1h", "4H": "4h", "15m": "15T", "1D": "1D"}
        target_tf = tf_map.get(timeframe, "1h")
        
        resampled_df = tf_manager.prepare_and_resample(raw_df, target_tf)
        final_df = ti_engine.apply_all_indicators(resampled_df)
        
        records = final_df.reset_index().to_dict(orient='records')
        clean_records = [{k: (v if pd.notna(v) else None) for k, v in rec.items()} for rec in records]
        
        current_phase = final_df.iloc[-1].get('market_phase', 'Unknown') if not final_df.empty else "Unknown"

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

# ============================================================
# RESTORED MISSING ENDPOINTS (MANUAL FIX)
# ============================================================
@app.get("/api/exchanges")
async def get_exchanges():
    """Returns supported exchanges"""
    return ["binance", "kraken", "kucoin", "bybit", "gateio"]

@app.get("/api/markets")
async def get_markets(exchange: str = "binance"):
    """Returns market pairs"""
    return ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"]

# Pydantic Model for Backtest Request
class BacktestRequest(BaseModel):
    exchange: str = "binance"
    symbol: str = "BTC/USDT"
    timeframe: str = "1h"
    limit: int = 1000
    strategy: str = "MACD_RSI_VWAP"
    initial_balance: float = 1000.0

@app.post("/api/backtest")
async def run_backtest(request: BacktestRequest):
    """
    Run a simulation backtest.
    """
    try:
        result = await backtest_engine.run_backtest(
            exchange=request.exchange,
            symbol=request.symbol,
            timeframe=request.timeframe,
            limit=request.limit,
            strategy_mode=request.strategy,
            initial_balance=request.initial_balance
        )
        return result
    except Exception as e:
        logger.error(f"Backtest Error: {e}")
        return {"status": "error", "message": str(e)}

@app.websocket("/ws/feed")
async def websocket_endpoint(websocket: WebSocket):
    await stream_engine.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        stream_engine.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")
        stream_engine.disconnect(websocket)
