import pandas as pd
import pandas_ta as ta
import numpy as np
import time
import logging

# লগিং সেটআপ

from app.services.data_sanitizer import data_sanitizer  # Import Sanitizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SignalEngine")

class SignalEngine:
    def __init__(self):
        self.buy_votes = 0
        self.sell_votes = 0
        self.neutral_votes = 0
        self.details = []
        
        # --- Caching Mechanism (Phase 3 Optimization) ---
        self.cache = None
        self.last_calculation_time = 0
        self.cache_duration = 60  # ১ মিনিট (৬০ সেকেন্ড) পর্যন্ত ডাটা ভ্যালিড থাকবে

    def _add_vote(self, name, signal):
        """ভোট এবং ডিটেইলস লিস্ট আপডেট করার হেল্পার ফাংশন"""
        if signal == "BUY":
            self.buy_votes += 1
        elif signal == "SELL":
            self.sell_votes += 1
        else:
            self.neutral_votes += 1
        
        self.details.append({"name": name, "signal": signal})

    def analyze_market_sentiment(self, ohlcv_data):
        """
        স্মার্ট সেন্টিমেন্ট এনালাইসিস ইঞ্জিন (with Caching & Optimization)
        """
        current_time = time.time()

        # ১. Time-Check Logic: যদি ১ মিনিটের মধ্যে ক্যালকুলেশন হয়ে থাকে, তবে ক্যাশ রিটার্ন করো
        if self.cache and (current_time - self.last_calculation_time < self.cache_duration):
            return self.cache

        # ==========================================
        # ১. গ্যাপ ফিলিং (Gap Filler Layer)
        # ==========================================
        # কাঁচা OHLCV ডাটাকে আগে ক্লিন করা হচ্ছে
        cleaned_ohlcv = data_sanitizer.fill_candle_gaps(ohlcv_data)

        # ২. ডাটা ফ্রেম তৈরি
        df = pd.DataFrame(cleaned_ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        
        if len(df) < 50:
            return {"verdict": "LOADING...", "score": 0, "details": []}

        # টাইপ কনভার্সন
        cols = ['open', 'high', 'low', 'close', 'volume']
        df[cols] = df[cols].astype(float)
        
        if 'timestamp' in df.columns:
            df['datetime'] = pd.to_datetime(df['timestamp'], unit='ms')
            df.set_index('datetime', inplace=True)

        # ==========================================
        # ৩. NaN এবং Inf হ্যান্ডলিং (Data Integrity)
        # ==========================================
        # লজিক: কোনো কারণে যদি জিরো ডিভিশন এরর (Infinite) আসে, সেটাকে NaN বানাও
        df.replace([np.inf, -np.inf], np.nan, inplace=True)

        # লজিক: কোনো ভ্যালু মিসিং (NaN) থাকলে আগের ভ্যালু দিয়ে পূরণ করো (Forward Fill)
        # এটি i3 এর জন্য ভারী interpolation এর চেয়ে অনেক ফাস্ট
        df.fillna(method='ffill', inplace=True)
        
        # যদি শুরুর দিকেই NaN থাকে (যেখানে আগের ভ্যালু নেই), তবে 0 দিয়ে পূরণ করো
        df.fillna(0, inplace=True)

        # রিসেট ভোটিং
        self.buy_votes = 0
        self.sell_votes = 0
        self.neutral_votes = 0
        self.details = []

        last_close = df['close'].iloc[-1]
        
        try:
            # ==========================================
            # ১. Trend Indicators
            # ==========================================
            # SMA (50)
            sma50 = df.ta.sma(length=50)
            if sma50 is not None:
                self._add_vote("SMA (50)", "BUY" if last_close > sma50.iloc[-1] else "SELL")

            # EMA (20)
            ema20 = df.ta.ema(length=20)
            if ema20 is not None:
                self._add_vote("EMA (20)", "BUY" if last_close > ema20.iloc[-1] else "SELL")

            # MACD
            macd = df.ta.macd(fast=12, slow=26, signal=9)
            if macd is not None:
                macd_line = macd['MACD_12_26_9'].iloc[-1]
                signal_line = macd['MACDs_12_26_9'].iloc[-1]
                self._add_vote("MACD", "BUY" if macd_line > signal_line else "SELL")

            # ADX
            adx = df.ta.adx(length=14)
            if adx is not None:
                adx_val = adx['ADX_14'].iloc[-1]
                dmp = adx['DMP_14'].iloc[-1]
                dmn = adx['DMN_14'].iloc[-1]
                if adx_val > 25:
                    self._add_vote("ADX", "BUY" if dmp > dmn else "SELL")
                else:
                    self._add_vote("ADX", "NEUTRAL")

            # Ichimoku Cloud
            ichi = df.ta.ichimoku()
            if ichi is not None:
                span_a, _ = ichi[0], ichi[1]
                tenkan = span_a[span_a.columns[0]].iloc[-1]
                kijun = span_a[span_a.columns[1]].iloc[-1]
                self._add_vote("Ichimoku", "BUY" if tenkan > kijun else "SELL")

            # Supertrend
            supertrend = df.ta.supertrend()
            if supertrend is not None:
                direction = supertrend[supertrend.columns[1]].iloc[-1]
                self._add_vote("Supertrend", "BUY" if direction == 1 else "SELL")

            # ==========================================
            # ২. Momentum Indicators
            # ==========================================
            # RSI (14)
            rsi = df.ta.rsi(length=14)
            if rsi is not None:
                val = rsi.iloc[-1]
                self._add_vote("RSI (14)", "BUY" if val < 30 else "SELL" if val > 70 else "NEUTRAL")

            # Stochastic
            stoch = df.ta.stoch()
            if stoch is not None:
                k = stoch['STOCHk_14_3_3'].iloc[-1]
                self._add_vote("Stochastic", "BUY" if k < 20 else "SELL" if k > 80 else "NEUTRAL")

            # CCI
            cci = df.ta.cci(length=20)
            if cci is not None:
                val = cci.iloc[-1]
                self._add_vote("CCI", "BUY" if val < -100 else "SELL" if val > 100 else "NEUTRAL")

            # ==========================================
            # ৩. Volatility & Volume
            # ==========================================
            # Bollinger Bands
            bb = df.ta.bbands(length=20, std=2)
            if bb is not None:
                bbl_col = next((c for c in bb.columns if c.startswith('BBL')), None)
                bbu_col = next((c for c in bb.columns if c.startswith('BBU')), None)
                if bbl_col and bbu_col:
                    if last_close < bb[bbl_col].iloc[-1]: self._add_vote("BB", "BUY")
                    elif last_close > bb[bbu_col].iloc[-1]: self._add_vote("BB", "SELL")
                    else: self._add_vote("BB", "NEUTRAL")

            # OBV
            obv = df.ta.obv()
            if obv is not None:
                self._add_vote("OBV", "BUY" if obv.iloc[-1] > obv.iloc[-2] else "SELL")

            # VWAP
            vwap = df.ta.vwap()
            if vwap is not None:
                self._add_vote("VWAP", "BUY" if last_close > vwap.iloc[-1] else "SELL")

        except Exception as e:
            logger.error(f"Signal Calculation Error: {e}")
            return {"verdict": "ERROR", "score": 0, "details": []}

        # ==========================================
        # ফাইনাল রেজাল্ট প্রসেসিং
        # ==========================================
        score = self.buy_votes - self.sell_votes
        verdict = "NEUTRAL 😐"
        color = "#ffb300"

        if score >= 6:
            verdict = "STRONG BUY 🚀"
            color = "#00c853"
        elif score >= 2:
            verdict = "BUY 📈"
            color = "#00e676"
        elif score <= -6:
            verdict = "STRONG SELL 📉"
            color = "#ff3d00"
        elif score <= -2:
            verdict = "SELL 🔻"
            color = "#ff5722"

        result = {
            "verdict": verdict,
            "color": color,
            "score": score,
            "summary": {"buy": self.buy_votes, "sell": self.sell_votes, "neutral": self.neutral_votes},
            "details": self.details
        }

        # ৩. ক্যাশ আপডেট করা
        self.cache = result
        self.last_calculation_time = current_time
        
        return result

# সিঙ্গেলটন ইনস্ট্যান্স
signal_engine = SignalEngine()
