import asyncio
import json
import time
import ccxt.async_support as ccxt
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

# মডিউল ইম্পোর্ট (Database যোগ করা হয়েছে আগের নির্দেশনা অনুযায়ী)
from app.services.stream_engine import market_stream
from app.services.signal_engine import signal_engine
from app.services.arbitrage_engine import arbitrage_engine
from app.services.notification_manager import notification_manager
from app.services.strategy_manager import strategy_manager
from app.services.trade_executor import trade_executor
from app.services.backtest_engine import backtest_engine
from app.database import db
from pydantic import BaseModel

app = FastAPI(title="Metron Hybrid Brain (Advanced)")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# কানেকশন ম্যানেজার (আগের মতোই)
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections[:]:
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# --- ব্রডকাস্ট ইঞ্জিন (অপ্টিমাইজড) ---
async def broadcast_market_data():
    """
    Decoupled Loop:
    - প্রাইস এবং ট্রেড: প্রতি ২ সেকেন্ডে (Fast)
    - সেন্টিমেন্ট/ইন্ডিকেটর: প্রতি ৬০ সেকেন্ডে (Slow)
    """
    error_count = 0
    last_sentiment_time = 0 
    last_arbitrage_time = 0 # Arbitrage টাইমার

    while True:
        try:
            if not manager.active_connections:
                await asyncio.sleep(3)
                continue

            current_time = time.time()
            symbol = "BTC/USDT"

            async with ccxt.binance() as exchange:
                exchange.timeout = 3000
                
                # ==========================================
                # ১. ট্রেড ও টিকার আপডেট (FAST - প্রতি ২ সেকেন্ডে)
                # ==========================================
                trades = await exchange.fetch_trades(symbol, limit=10)
                formatted_trades = [{
                    "id": t['id'], "price": t['price'], "amount": t['amount'], 
                    "side": t['side'], "time": t['datetime'].split('T')[1][:8]
                } for t in trades]
                
                await manager.broadcast({"type": "TRADES", "payload": formatted_trades})

                # ==========================================
                # ২. সেন্টিমেন্ট এনালাইসিস (SLOW - প্রতি ১ মিনিটে)
                # ==========================================
                if current_time - last_sentiment_time > 60:
                    ohlcv = await exchange.fetch_ohlcv(symbol, '1h', limit=100)
                    if ohlcv:
                        # --- STRATEGY & DECISION LAYER ---
                        # Signal Engine gives raw score, Strategy Manager decides ACTION
                        # We guess phase from context or pass it if available. 
                        # For now, simple assumption or fetching from last feature set (Optimized in Phase 4)
                        # We will use "Consolidation" as default if unknown, but better to get from TechnicalIndicators
                        # Since main.py doesn't access TI directly, we rely on what signal_engine provides?
                        # SignalEngine analyze_market_sentiment doesn't return phase.
                        # We will make StrategyManager robust to missing phase for now.
                        
                        sentiment_result = signal_engine.analyze_market_sentiment(ohlcv)
                        decision = strategy_manager.get_strategy_decision(sentiment_result, market_phase="Unknown")
                        
                        # Payload Update with Strategy Info
                        sentiment_result["strategy"] = decision
                        
                        await manager.broadcast({"type": "SENTIMENT", "payload": sentiment_result})
                        
                        # --- NOTIFICATION TRIGGER ---
                        # Only notify if Strategy says YES (should_trade) OR if it's a significant State Change
                        # We pass the strategy verdict (e.g. WAIT or BUY)
                        current_price = ohlcv[-1][4]
                        await notification_manager.send_alert(
                            verdict=decision['final_verdict'], # Using Strategy Verdict instead of Raw
                            symbol=symbol,
                            price=current_price,
                            details=f"Mode: {decision['strategy']} | Reason: {decision['reason']}"
                        )

                        last_sentiment_time = current_time 
                        print(f"✅ Sentiment Updated | Mode: {decision['strategy']}")

                # ==========================================
                # ৩. আর্বিট্রেজ মনিটর (MEDIUM - প্রতি ২০ সেকেন্ডে)
                # ==========================================
                # API Rate Limit এড়ানোর জন্য ২০ সেকেন্ড ইন্টারভাল সেট করা হলো
                if current_time - last_arbitrage_time > 20:
                    arb_data = await arbitrage_engine.get_arbitrage_opportunities(symbol)
                    if arb_data:
                        await manager.broadcast({"type": "ARBITRAGE", "payload": arb_data})
                        last_arbitrage_time = current_time
                        print("✅ Arbitrage Data Updated (20s interval)")

            # লুপ ডিলে
            await asyncio.sleep(2)

        except Exception as e:
            error_count += 1
            sleep_time = min(30, 2 * error_count)
            print(f"⚠️ Broadcast Error: {e}")
            await asyncio.sleep(sleep_time)

# --- ইভেন্টস ---
@app.on_event("startup")
async def startup_event():
    await db.connect() # ডাটাবেস কানেকশন
    loop = asyncio.get_event_loop()
    loop.create_task(market_stream.start_engine())
    loop.create_task(broadcast_market_data())

@app.on_event("shutdown")
@app.on_event("shutdown")
async def shutdown_event():
    await db.disconnect()
    await arbitrage_engine.close_connections()
    await trade_executor.close_connections()

# --- API Endpoints ---
class StrategyRequest(BaseModel):
    mode: str

@app.post("/api/strategy")
async def set_strategy(req: StrategyRequest):
    success, msg = strategy_manager.set_mode(req.mode)
    if success:
        return {"status": "success", "message": msg, "current_mode": strategy_manager.current_mode}
    else:
        raise HTTPException(status_code=400, detail=msg)

@app.get("/api/strategy")
async def get_strategy():
    return {
        "current_mode": strategy_manager.current_mode,
        "strategy": strategy_manager.current_mode, # Frontend Compatibility
        "available_modes": list(strategy_manager.strategies.keys()) + ["AI-Adaptive"]
    }

@app.get("/api/arbitrage")
async def get_arbitrage(symbol: str = Query("BTC/USDT")):
    """Live Arbitrage Opportunities (Backend Powered)"""
    data = await arbitrage_engine.get_arbitrage_opportunities(symbol)
    return {"data": data} if data else {"data": []}

class TradingConfigRequest(BaseModel):
    risk_percentage: float = None
    paper_trading: bool = None

@app.post("/api/config/trading")
async def configure_trading(req: TradingConfigRequest):
    await trade_executor.update_config(risk_pct=req.risk_percentage, paper_trading=req.paper_trading)
    return {
        "status": "success", 
        "current_risk": trade_executor.risk_percentage, 
        "paper_trading": trade_executor.paper_trading
    }

class BacktestRequest(BaseModel):
    exchange: str = "binance"
    symbol: str = "BTC/USDT"
    timeframe: str = "1h"
    limit: int = 1000
    strategy: str = "Balanced"

@app.post("/api/backtest")
async def start_backtest(req: BacktestRequest):
    result = await backtest_engine.run_backtest(
        req.exchange, req.symbol, req.timeframe, req.limit, req.strategy
    )
    return result

@app.websocket("/ws/feed")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- REST API Endpoints (Legacy Removed) ---
# New dynamic endpoints are defined above.

# System Control
@app.post("/api/system/start")
async def start_system():
    # Trigger logic here
    return {"status": "ONLINE", "message": "System Started"}

@app.post("/api/system/stop")
async def stop_system():
    return {"status": "OFFLINE", "message": "System Stopped"}

