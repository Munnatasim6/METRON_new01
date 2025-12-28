from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import asyncio
import logging

# নতুন সার্ভিস ইমপোর্ট
from app.services.timeframe_manager import TimeframeManager
from app.services.technical_indicators import TechnicalIndicators
from app.services.stream_engine import StreamEngine

# লগিং
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MainAPI")

app = FastAPI(title="Metron AI Trading Backend")

# CORS (Frontend Connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # প্রোডাকশনে স্পেসিফিক ডোমেইন দেবেন
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# গ্লোবাল ইন্সট্যান্স
stream_engine = StreamEngine()
tf_manager = TimeframeManager()
ti_engine = TechnicalIndicators()

# মক ডাটাবেস (যেহেতু রিয়েল ডিবি কানেকশন কোড নেই, এটি প্লেসহোল্ডার)
# বাস্তবে এটি database.py থেকে আসবে
def get_mock_historical_data():
    # এখানে অন্তত ২০০ ক্যান্ডেল জেনারেট করা উচিত টেস্টিংয়ের জন্য
    dates = pd.date_range(end=pd.Timestamp.now(), periods=300, freq='1min')
    data = {
        'open': [100 + i*0.1 for i in range(300)],
        'high': [101 + i*0.1 for i in range(300)],
        'low': [99 + i*0.1 for i in range(300)],
        'close': [100.5 + i*0.1 for i in range(300)],
        'volume': [1000 + i*10 for i in range(300)]
    }
    df = pd.DataFrame(data, index=dates)
    return df

@app.get("/")
def read_root():
    return {"status": "active", "system": "Metron AI Core i3 Optimized"}

@app.get("/api/v1/market-status")
async def get_market_status(timeframe: str = Query("1H", description="Timeframe like 15T, 1H, 4H")):
    """
    ফ্রন্টএন্ড এই API কল করে ফুল চার্ট এবং এনালাইসিস ডাটা পাবে।
    """
    try:
        # ১. ডাটা আনা (DB থেকে)
        raw_df = get_mock_historical_data() # Replace with real DB fetch
        
        # ২. প্রসেসিং (Timeframe Resample)
        # map frontend timeframe (1H) to pandas (1h) if needed
        tf_map = {"1H": "1h", "4H": "4h", "15m": "15T", "1D": "1D"}
        target_tf = tf_map.get(timeframe, "1h")
        
        resampled_df = tf_manager.prepare_and_resample(raw_df, target_tf)
        
        if resampled_df is None or resampled_df.empty:
            return {"status": "error", "message": "Insufficient data"}

        # ৩. ইন্ডিকেটর অ্যাপ্লাই
        final_df = ti_engine.apply_all_indicators(resampled_df)
        
        # ৪. রেসপন্স ফরম্যাট (JSON)
        # NaN ভ্যালু None এ কনভার্ট করা
        records = final_df.reset_index().to_dict(orient='records')
        clean_records = [{k: (v if pd.notna(v) else None) for k, v in rec.items()} for rec in records]
        
        # লেটেস্ট ফেজ
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

@app.websocket("/ws/feed")
async def websocket_endpoint(websocket: WebSocket):
    """
    রিয়েল-টাইম ডাটা স্ট্রিমিং পয়েন্ট
    """
    await stream_engine.connect(websocket)
    try:
        while True:
            # ক্লায়েন্ট থেকে কোনো মেসেজ আসলে (যেমন সাবস্ক্রিপশন রিকোয়েস্ট)
            data = await websocket.receive_text()
            # এখানে দরকার হলে লজিক বসানো যাবে
            
            # সিমুলেশন: রিয়েল সিস্টেমে এক্সচেঞ্জ কানেক্টর এখানে stream_engine.broadcast কল করবে
            # আপাতত stream_engine.broadcast() অন্য কোনো থ্রেড বা লুপ থেকে কল হবে
    except WebSocketDisconnect:
        stream_engine.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")
        stream_engine.disconnect(websocket)

# ব্যাকগ্রাউন্ড টাস্ক হিসেবে এক্সচেঞ্জ লিসেনার রান করতে হবে (main.py এর শেষে বা আলাদা ফাইলে)
