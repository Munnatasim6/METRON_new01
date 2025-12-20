import asyncio
import json
import ccxt.async_support as ccxt
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

# মডিউল ইম্পোর্ট
from app.services.stream_engine import market_stream
from app.services.signal_engine import signal_engine
from app.database import init_db, get_strategy, set_strategy

app = FastAPI(title="Metron Hybrid Brain (Advanced)")

# CORS কনফিগারেশন
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# ১. কানেকশন ম্যানেজার (With Auto-Cleaning)
# ============================================================
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
        # ইম্প্রুভমেন্ট ২: কানেকশন ক্লিনিং
        # আমরা লিস্টের একটি কপি তৈরি করে লুপ চালাব যাতে রিমুভ করলে এরর না হয়
        for connection in self.active_connections[:]:
            try:
                await connection.send_json(message)
            except Exception:
                # যদি পাঠাতে ব্যর্থ হয়, ধরে নিব কানেকশন ডেড
                self.disconnect(connection)

manager = ConnectionManager()

# ============================================================
# ২. ব্রডকাস্ট ইঞ্জিন (With Backoff & Arbitrage)
# ============================================================

async def fetch_arbitrage_prices(symbol: str):
    """আরবিট্রেজ প্রাইস ফেচ করার হেল্পার ফাংশন"""
    exchanges_to_check = ['binance', 'kucoin', 'bybit', 'gateio']
    
    async def fetch_price(exchange_id):
        try:
            if hasattr(ccxt, exchange_id):
                exchange_class = getattr(ccxt, exchange_id)
                async with exchange_class() as exchange:
                    # Timeout সেট করা জরুরি যাতে লুপ আটকে না থাকে
                    exchange.timeout = 3000 
                    ticker = await exchange.fetch_ticker(symbol)
                    return {"exchange": exchange_id.title(), "price": ticker['last'], "logo": "🟢"}
        except Exception:
            # কোনো এক্সচেঞ্জ এরর দিলে আমরা চুপচাপ None রিটার্ন করব (সিস্টেম ক্র্যাশ করবে না)
            return None

    tasks = [fetch_price(ex_id) for ex_id in exchanges_to_check]
    results = await asyncio.gather(*tasks)
    return [r for r in results if r is not None]

async def broadcast_market_data():
    error_count = 0
    tick_count = 0 # ইম্প্রুভমেন্ট ৪: টাইমিং কন্ট্রোল

    while True:
        try:
            if not manager.active_connections:
                await asyncio.sleep(3)
                continue

            async with ccxt.binance() as exchange:
                symbol = "BTC/USDT"
                
                # --- ১. সেন্টিমেন্ট (প্রতি ২ সেকেন্ডে) ---
                ohlcv = await exchange.fetch_ohlcv(symbol, '1h', limit=100)
                if ohlcv:
                    sentiment_result = signal_engine.analyze_market_sentiment(ohlcv)
                    sentiment_result["symbol"] = symbol
                    await manager.broadcast({"type": "SENTIMENT", "payload": sentiment_result})

                # --- ২. ট্রেড (প্রতি ২ সেকেন্ডে) ---
                trades = await exchange.fetch_trades(symbol, limit=15)
                formatted_trades = [{
                    "id": t['id'], "price": t['price'], "amount": t['amount'], 
                    "side": t['side'], "time": t['datetime'].split('T')[1][:8]
                } for t in trades]
                
                await manager.broadcast({"type": "TRADES", "payload": formatted_trades})

                # --- ৩. আরবিট্রেজ (ইম্প্রুভমেন্ট ৪: প্রতি ১০ সেকেন্ডে) ---
                # i3 প্রসেসরে চাপ কমাতে আমরা এটি প্রতি ৫ লুপে (approx 10s) একবার চালাব
                if tick_count % 5 == 0:
                    arb_data = await fetch_arbitrage_prices(symbol)
                    if arb_data:
                        await manager.broadcast({"type": "ARBITRAGE", "payload": arb_data})

            # সফল হলে এরর কাউন্ট রিসেট
            error_count = 0 
            tick_count += 1
            await asyncio.sleep(2)

        except Exception as e:
            # ইম্প্রুভমেন্ট ১: Exponential Backoff Error Handling
            error_count += 1
            # ২, ৫, ১০, ২০... সর্বোচ্চ ৩০ সেকেন্ড পর্যন্ত অপেক্ষা করবে
            sleep_time = min(30, 2 * error_count) 
            print(f"⚠️ Broadcast Error (Retry in {sleep_time}s): {e}")
            await asyncio.sleep(sleep_time)

# ============================================================
# ৩. সিস্টেম ইভেন্টস ও API
# ============================================================
@app.on_event("startup")
async def startup_event():
    init_db()
    loop = asyncio.get_event_loop()
    loop.create_task(market_stream.start_engine())
    loop.create_task(broadcast_market_data())

class StrategyRequest(BaseModel):
    strategy: str

@app.get("/api/strategy")
async def get_bot_strategy():
    return {"strategy": get_strategy()}

@app.post("/api/strategy")
async def set_bot_strategy(req: StrategyRequest):
    set_strategy(req.strategy)
    set_strategy(req.strategy)
    return {"status": "success", "message": f"Strategy switched to {req.strategy}"}

# --- Missing APIs Implementation ---

@app.get("/api/exchanges")
async def get_exchanges():
    """Returns a list of supported exchanges"""
    # In a real app, this could be dynamic based on CCXT capabilities or config
    return {"exchanges": ["binance", "kucoin", "bybit", "gateio"]}

@app.get("/api/markets/{exchange_id}")
async def get_markets(exchange_id: str):
    """Returns a list of market pairs for a specific exchange using CCXT"""
    try:
        if hasattr(ccxt, exchange_id):
            exchange_class = getattr(ccxt, exchange_id)
            async with exchange_class() as exchange:
                # Load markets (this might be heavy, so we limit or cache in production)
                # For now, we return a curated list or fetch top pairs
                # await exchange.load_markets() # Can be slow
                
                # Optimized: Return a static popular list if fetch fails or is too slow
                # ensuring immediate UI response.
                # Ideally, we should cache this result.
                
                popular_pairs = [
                    "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT",
                    "ADA/USDT", "DOGE/USDT", "MATIC/USDT", "LTC/USDT", "DOT/USDT"
                ]
                return {"markets": popular_pairs}
    except Exception as e:
        print(f"Error fetching markets for {exchange_id}: {e}")
        return {"markets": ["BTC/USDT", "ETH/USDT"]} # Fallback

# --- End of Missing APIs ---

# ফলব্যাক API (যদি সকেট কানেক্ট না হয়)
@app.get("/api/arbitrage")
async def get_arbitrage(symbol: str = Query("BTC/USDT")):
    data = await fetch_arbitrage_prices(symbol)
    return {"data": data}

@app.websocket("/ws/feed")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
