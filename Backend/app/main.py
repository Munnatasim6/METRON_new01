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
from app.database import db

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
    last_sentiment_time = 0  # টাইমার ট্র্যাক করার জন্য
    
    # এক্সচেঞ্জ একবারই ইনিশিয়েট করা ভালো (Context Manager লুপের বাইরে রাখা যেতে পারে যদি দীর্ঘ কানেকশন হয়)
    # তবে ccxt async এর জন্য প্রতিবার কল করা সেফ, আমরা শুধু কল ফ্রিকোয়েন্সি কমাবো।

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
                # এটি সবসময় চলবে যাতে ইউজার রিয়েল-টাইম প্রাইস দেখে
                trades = await exchange.fetch_trades(symbol, limit=10)
                formatted_trades = [{
                    "id": t['id'], "price": t['price'], "amount": t['amount'], 
                    "side": t['side'], "time": t['datetime'].split('T')[1][:8]
                } for t in trades]
                
                await manager.broadcast({"type": "TRADES", "payload": formatted_trades})

                # ==========================================
                # ২. সেন্টিমেন্ট এনালাইসিস (SLOW - প্রতি ১ মিনিটে)
                # ==========================================
                # টাইম-চেক: ৬০ সেকেন্ড পার হয়েছে কিনা?
                if current_time - last_sentiment_time > 60:
                    # ভারী ডেটা ফেচ (OHLCV) শুধু তখনই হবে যখন দরকার
                    ohlcv = await exchange.fetch_ohlcv(symbol, '1h', limit=100)
                    if ohlcv:
                        # signal_engine নিজেই ক্যাশ চেক করবে, কিন্তু আমরা API কল বাঁচালাম
                        sentiment_result = signal_engine.analyze_market_sentiment(ohlcv)
                        sentiment_result["symbol"] = symbol
                        await manager.broadcast({"type": "SENTIMENT", "payload": sentiment_result})
                        
                        last_sentiment_time = current_time # টাইমার আপডেট
                        print("✅ Sentiment Updated (1 min interval)")

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
async def shutdown_event():
    await db.disconnect()

# --- API Endpoints ---
@app.websocket("/ws/feed")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- REST API Endpoints ---

@app.get("/api/exchanges")
async def get_exchanges():
    """Available Exchanges"""
    return ["binance", "coinbase", "kraken", "kucoin"]

@app.get("/api/markets/{exchange_id}")
async def get_markets(exchange_id: str):
    """Get Markets for an Exchange"""
    try:
        # CCXT Dynamic Loading
        exchange_class = getattr(ccxt, exchange_id.lower())
        async with exchange_class() as exchange:
            # markets = await exchange.load_markets()
            # return list(markets.keys())
            # For speed, just returning top pairs mocked if load fails or for demo
            # But let's try to fetch real
             await exchange.load_markets()
             return list(exchange.markets.keys())
    except Exception as e:
        # Fallback if offline
        return ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"]

@app.get("/api/strategy")
async def get_strategy():
    """Current Strategy Config"""
    return {
        "strategy": "Hybrid Sentiment & Arbitrage",
        "status": "ACTIVE",
        "config": {
            "sentiment_interval": "1m",
            "arbitrage_threshold": 0.5
        }
    }

@app.get("/api/arbitrage")
async def get_arbitrage(symbol: str = Query("BTC/USDT")):
    """Arbitrage Opportunities (Mock for now)"""
    return [
        {"buy_exchange": "binance", "sell_exchange": "coinbase", "profit": 0.5, "symbol": symbol},
        {"buy_exchange": "kraken", "sell_exchange": "kucoin", "profit": 0.2, "symbol": symbol}
    ]

# System Control
@app.post("/api/system/start")
async def start_system():
    # Trigger logic here
    return {"status": "ONLINE", "message": "System Started"}

@app.post("/api/system/stop")
async def stop_system():
    return {"status": "OFFLINE", "message": "System Stopped"}

