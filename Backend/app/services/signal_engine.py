import pandas as pd
import pandas_ta as ta
import numpy as np
import time
import logging

from app.services.data_sanitizer import data_sanitizer

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
        Legacy Support for basic dashboard sentiment
        """
        current_time = time.time()

        # ১. Time-Check Logic: যদি ১ মিনিটের মধ্যে ক্যালকুলেশন হয়ে থাকে, তবে ক্যাশ রিটার্ন করো
        if self.cache and (current_time - self.last_calculation_time < self.cache_duration):
            return self.cache

        # ==========================================
        # ১. গ্যাপ ফিলিং (Gap Filler Layer)
        # ==========================================
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

        # ৩. NaN এবং Inf হ্যান্ডলিং
        df.replace([np.inf, -np.inf], np.nan, inplace=True)
        df.ffill(inplace=True) # Updated from fillna(method='ffill')
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

            # ==========================================
            # ৪. New Indicators to reach 20+ (Pro Feature)
            # ==========================================
            # 13. Williams %R
            willr = df.ta.willr(length=14)
            if willr is not None:
                val = willr.iloc[-1]
                self._add_vote("Williams %R", "BUY" if val < -80 else "SELL" if val > -20 else "NEUTRAL")

            # 14. Ultimate Oscillator
            uo = df.ta.uo()
            if uo is not None:
                val = uo.iloc[-1]
                self._add_vote("Ultimate Osc", "BUY" if val > 70 else "SELL" if val < 30 else "NEUTRAL")

            # 15. Parabolic SAR
            psar = df.ta.psar()
            if psar is not None:
                # PSAR returns columns like PSARl_0.02_0.2 and PSARs_...
                # Usually if close > psar, it's defined in one of the columns or combined
                # pandas_ta returns two columns usually, one for long, one for short
                # Or simpler check: if PSAR is below price -> Bullish
                curr_psar = psar[psar.columns[0]].iloc[-1]
                # If psar value is NaN it means the other column has value (trend switch)
                # But let's assume if any value is present and < close -> Buy
                # Simplified check:
                if not np.isnan(curr_psar):
                     self._add_vote("Parabolic SAR", "BUY" if last_close > curr_psar else "SELL")

            # 16. MFI (Money Flow Index)
            mfi = df.ta.mfi(length=14)
            if mfi is not None:
                val = mfi.iloc[-1]
                self._add_vote("MFI", "BUY" if val < 20 else "SELL" if val > 80 else "NEUTRAL")

            # 17. Awesome Oscillator
            ao = df.ta.ao()
            if ao is not None:
                val = ao.iloc[-1]
                prev = ao.iloc[-2]
                self._add_vote("Awesome Osc", "BUY" if val > 0 and val > prev else "SELL" if val < 0 else "NEUTRAL")

            # 18. Keltner Channels
            kc = df.ta.kc()
            if kc is not None:
                # Check if price is above upper or below lower
                upper = kc[kc.columns[0]].iloc[-1] # Usually Upper is first or distinct named
                lower = kc[kc.columns[2]].iloc[-1] # Lower 3rd
                if last_close > upper: self._add_vote("Keltner Ch", "BUY")
                elif last_close < lower: self._add_vote("Keltner Ch", "SELL")
                else: self._add_vote("Keltner Ch", "NEUTRAL")

            # 19. TRIX
            trix = df.ta.trix()
            if trix is not None:
                 # TRIX returns tuple sometimes (TRIX, TRIXs)
                 val = trix[trix.columns[0]].iloc[-1]
                 self._add_vote("TRIX", "BUY" if val > 0 else "SELL")

            # 20. ROC (Rate of Change)
            roc = df.ta.roc()
            if roc is not None:
                val = roc.iloc[-1]
                self._add_vote("ROC", "BUY" if val > 0 else "SELL")

        except Exception as e:
            logger.error(f"Signal Calculation Error: {e}")
            return {"verdict": "ERROR", "score": 0, "details": []}

        # ফাইনাল রেজাল্ট প্রসেসিং
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

        # ক্যাশ আপডেট
        self.cache = result
        self.last_calculation_time = current_time
        
        return result

    def extract_signals(self, df_features, timeframe):
        """
        Phase 3 Signal Extraction: Features -> Actionable Signals
        """
        if df_features is None or df_features.empty:
            return None

        # লেটেস্ট ডাটা নেওয়া
        curr = df_features.iloc[-1]
        prev = df_features.iloc[-2]
        
        signals = []
        phase = curr.get('market_phase', 'Unknown')

        # --- ১. [cite_start]Trend Signals (SMA/EMA/MACD) [cite: 5, 11] ---
        # EMA + MACD কম্বিনেশন
        if 'EMA_20' in curr and 'EMA_50' in curr:
             if curr['EMA_20'] > curr['EMA_50']:
                if prev['MACD_12_26_9'] < prev['MACDs_12_26_9'] and curr['MACD_12_26_9'] > curr['MACDs_12_26_9']:
                    signals.append(f"[{timeframe}] BUY: Trend Following (EMA + MACD Cross)")

        # --- ২. [cite_start]Momentum Signals (RSI + Bollinger) [cite: 67, 75] ---
        # Bollinger Bands + Stochastic/RSI
        # Note: Need correct BBL column name. pandas_ta usually names it slightly confusingly or BBL_{length}_{std}
        # Assuming the caller knows, but safety check:
        bbl_cols = [c for c in df_features.columns if c.startswith('BBL')]
        if bbl_cols and 'RSI_14' in curr:
             bbl_col = bbl_cols[0] 
             if curr['close'] < curr[bbl_col] and curr['RSI_14'] < 30:
                  signals.append(f"[{timeframe}] BUY: Reversal (Oversold + BB Support)")

        # --- ৩. [cite_start]Volatility Breakout (Keltner + ADX) [cite: 211, 223] ---
        # ADX > 25 মানে স্ট্রং ট্রেন্ড, সাথে Keltner Channel ব্রেকআউট
        # KC also has multiple columns usually KC_{len}_{scalar}_L/U
        # But logic says close > KC. Assuming Upper KC? Or just channel? 
        # Typically Breakout means crossing Upper.
        # Let's search KC upper column
        kcu_cols = [c for c in df_features.columns if c.startswith('KCU')] # Keltner Channel Upper
        if kcu_cols and 'ADX_14' in curr:
             kcu_col = kcu_cols[0]
             if curr['ADX_14'] > 25 and curr['close'] > curr[kcu_col]:
                  signals.append(f"[{timeframe}] BUY: Volatility Breakout")

        # --- ৪. Market Phase Filter (Smart Money Logic) ---
        if phase == "Accumulation":
            signals.append(f"[{timeframe}] INFO: Accumulation Phase - Look for LONG entries only.")
        elif phase == "Distribution":
            signals.append(f"[{timeframe}] INFO: Distribution Phase - Look for SHORT entries or Exit.")
        
        # Smart Delta Alert
        if curr.get('smart_delta', 0) > 0 and curr['close'] < curr['open']:
            signals.append(f"[{timeframe}] ALERT: Hidden Buying (Price Down but Delta Positive)")

        return {
            "timeframe": timeframe,
            "phase": phase,
            "extracted_signals": signals,
            "metrics": {
                "vwap": curr.get('vwap', 0),
                "turnover": curr.get('turnover', 0),
                "smart_delta": curr.get('smart_delta', 0)
            }
        }

# সিঙ্গেলটন ইনস্ট্যান্স
signal_engine = SignalEngine()
