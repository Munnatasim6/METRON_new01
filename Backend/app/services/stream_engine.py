import asyncio
import json
import logging
import pandas as pd
from app.services.timeframe_manager import TimeframeManager
from app.services.technical_indicators import TechnicalIndicators

logger = logging.getLogger("StreamEngine")

class StreamEngine:
    def __init__(self):
        self.connected_clients = set()
        # ইঞ্জিন ইনিশিয়েট
        self.tf_manager = TimeframeManager()
        self.tech_indicators = TechnicalIndicators()
        
        # বাফার: লাইভ ডাটা প্রসেস করার জন্য হিস্ট্রি দরকার
        # বাস্তবে এটি ডাটাবেস থেকে লোড হবে, এখানে আমরা মেমোরিতে রাখছি
        self.data_buffer = pd.DataFrame()

    async def broadcast(self, raw_candle_data):
        """
        raw_candle_data: dict format {open, high, low, close, volume, ...}
        """
        if not self.connected_clients:
            return

        try:
            # ১. বাফারে ডাটা যোগ করা (যাতে ইন্ডিকেটর ক্যালকুলেট করা যায়)
            new_row = pd.DataFrame([raw_candle_data])
            self.data_buffer = pd.concat([self.data_buffer, new_row], ignore_index=True)
            
            # বাফার সাইজ লিমিট (মেমোরি সেভিং - i3 এর জন্য)
            if len(self.data_buffer) > 300: 
                self.data_buffer = self.data_buffer.iloc[-300:]

            # ২. প্রসেসিং (Resample + Indicators)
            # লাইভ স্ট্রিমে আমরা সাধারণত ১ মিনিটের ডাটাই দেখাই, তবে প্রসেস করা ফিচার সহ
            # TimeframeManager ব্যবহার করে ডাটা ক্লিন এবং এনরিচ (Turnover, Delta) করা
            # যেহেতু এটি লাইভ ১ মিনিট ক্যান্ডেল, আমরা রিস্যাম্পল না করে সরাসরি প্রসেস করতে পারি
            # অথবা tf_manager.prepare_and_resample কল করতে পারি যদি 1H চার্ট আপডেট করতে হয়
            
            # প্রিপারেশন (Turnover, Smart Delta)
            df_prepared = self.tf_manager.prepare_and_resample(self.data_buffer.copy(), '1min') 
            # Note: 1min 'resample' আসলে ডাটা ক্লিন এবং গ্যাপ ফিল করে দেয়
            
            # ৩. ইন্ডিকেটর অ্যাপ্লাই
            if df_prepared is not None and not df_prepared.empty:
                df_enriched = self.tech_indicators.apply_all_indicators(df_prepared)
                
                # লেটেস্ট প্রসেস করা ক্যান্ডেল
                latest_data = df_enriched.iloc[-1].to_dict()
                
                # NaN ভ্যালু হ্যান্ডলিং (JSON এর জন্য)
                clean_data = {k: (v if pd.notna(v) else None) for k, v in latest_data.items()}

                # ৪. ফ্রন্টএন্ডে পাঠানো
                message = json.dumps({
                    "type": "market_update",
                    "data": clean_data,
                    "phase": clean_data.get('market_phase', 'Unknown')
                })
            else:
                # যদি প্রসেসিং ফেইল করে, র-ডাটা পাঠানো (ফলব্যাক)
                message = json.dumps({"type": "raw_update", "data": raw_candle_data})

            # ব্রডকাস্ট
            if self.connected_clients:
                await asyncio.gather(*[client.send_text(message) for client in self.connected_clients])

        except Exception as e:
            logger.error(f"Broadcast Error: {e}")

    async def connect(self, websocket):
        await websocket.accept()
        self.connected_clients.add(websocket)
        logger.info("Client connected to Stream Engine")

    def disconnect(self, websocket):
        self.connected_clients.remove(websocket)
        logger.info("Client disconnected")
