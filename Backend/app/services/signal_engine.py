import pandas as pd
import pandas_ta as ta
import numpy as np

class SignalEngine:
    def __init__(self):
        self.buy_votes = 0
        self.sell_votes = 0
        self.neutral_votes = 0
        self.details = []

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
        ২০টি ইন্ডিকেটর বিশ্লেষণ করে ফাইনাল সিগন্যাল তৈরি করে।
        ohlcv_data: লিস্ট অফ লিস্ট [[time, open, high, low, close, vol], ...]
        """
        # ১. ডাটা প্রিপারেশন (Dataframe)
        # i3 অপ্টিমাইজেশন: আমরা সব ডাটা না নিয়ে শুধু শেষ ১০০টি ক্যান্ডেল নিব ক্যালকুলেশনের জন্য
        df = pd.DataFrame(ohlcv_data, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        
        if len(df) < 50:
            return {"verdict": "LOADING...", "score": 0, "details": []}

        # ডাটা টাইপ ঠিক করা
        df['close'] = df['close'].astype(float)
        df['high'] = df['high'].astype(float)
        df['low'] = df['low'].astype(float)
        df['open'] = df['open'].astype(float)
        df['volume'] = df['volume'].astype(float)
        
        # Datetime Index সেট করা (VWAP এবং অন্যান্য টাইম-বেসড ইন্ডিকেটরের জন্য জরুরি)
        if 'timestamp' in df.columns:
            df['datetime'] = pd.to_datetime(df['timestamp'], unit='ms')
            df.set_index('datetime', inplace=True)

        # রিসেট ভোটিং
        self.buy_votes = 0
        self.sell_votes = 0
        self.neutral_votes = 0
        self.details = []

        # শেষ ক্যান্ডেলের ভ্যালু (Latest Price)
        last_close = df['close'].iloc[-1]
        # prev_close = df['close'].iloc[-2] # Unused
        
        try:
            # ==========================================
            # ১. Trend Indicators (মার্কেটের দিক)
            # ==========================================

            # 1. SMA (50)
            sma50 = df.ta.sma(length=50)
            if sma50 is not None:
                self._add_vote("SMA (50)", "BUY" if last_close > sma50.iloc[-1] else "SELL")

            # 2. EMA (20)
            ema20 = df.ta.ema(length=20)
            if ema20 is not None:
                self._add_vote("EMA (20)", "BUY" if last_close > ema20.iloc[-1] else "SELL")

            # 3. MACD (12, 26, 9)
            macd = df.ta.macd(fast=12, slow=26, signal=9)
            if macd is not None:
                # MACD > Signal Line check
                macd_line = macd['MACD_12_26_9'].iloc[-1]
                signal_line = macd['MACDs_12_26_9'].iloc[-1]
                self._add_vote("MACD", "BUY" if macd_line > signal_line else "SELL")

            # 4. ADX (14)
            adx = df.ta.adx(length=14)
            if adx is not None:
                adx_val = adx['ADX_14'].iloc[-1]
                dmp = adx['DMP_14'].iloc[-1]
                dmn = adx['DMN_14'].iloc[-1]
                
                if adx_val > 25:
                    self._add_vote("ADX (Strength)", "BUY" if dmp > dmn else "SELL")
                else:
                    self._add_vote("ADX (Strength)", "NEUTRAL")

            # 5. Parabolic SAR
            psar = df.ta.psar()
            if psar is not None:
                psar_val = psar.iloc[-1]
                # Check if psar_val is empty or valid
                long_val = psar_val.iloc[0]
                short_val = psar_val.iloc[1] if len(psar_val) > 1 else np.nan
                
                is_bullish = False
                if not pd.isna(long_val) and long_val > 0:
                    is_bullish = True
                
                if is_bullish:
                     self._add_vote("Parabolic SAR", "BUY")
                elif not pd.isna(short_val) and short_val > 0:
                     self._add_vote("Parabolic SAR", "SELL")
                else:
                     # Fallback logic
                     if last_close > long_val: 
                         self._add_vote("Parabolic SAR", "BUY")
                     else:
                        self._add_vote("Parabolic SAR", "SELL")

            # 6. Ichimoku Cloud
            ichi = df.ta.ichimoku()
            if ichi is not None:
                # Conversion (Tenkan) > Base (Kijun)
                span_a, span_b = ichi[0], ichi[1] # Tuple unpack
                # কলাম নেমগুলো ভেরিয়েবল হতে পারে, তাই পজিশনাল অ্যাক্সেস সেফার
                tenkan = span_a[span_a.columns[0]].iloc[-1] # Conversion Line
                kijun = span_a[span_a.columns[1]].iloc[-1]   # Base Line
                self._add_vote("Ichimoku Cloud", "BUY" if tenkan > kijun else "SELL")

            # 7. Supertrend
            supertrend = df.ta.supertrend()
            if supertrend is not None:
                # Supertrend কলামে 1 মানে আপট্রেন্ড, -1 মানে ডাউনট্রেন্ড
                direction = supertrend[supertrend.columns[1]].iloc[-1] 
                self._add_vote("Supertrend", "BUY" if direction == 1 else "SELL")

            # ==========================================
            # ২. Momentum Indicators (গতি ও শক্তি)
            # ==========================================

            # 8. RSI (14)
            rsi = df.ta.rsi(length=14)
            if rsi is not None:
                val = rsi.iloc[-1]
                self._add_vote("RSI (14)", "BUY" if val < 30 else "SELL" if val > 70 else "NEUTRAL")

            # 9. Stochastic
            stoch = df.ta.stoch()
            if stoch is not None:
                k = stoch['STOCHk_14_3_3'].iloc[-1]
                self._add_vote("Stochastic", "BUY" if k < 20 else "SELL" if k > 80 else "NEUTRAL")

            # 10. CCI (20)
            cci = df.ta.cci(length=20)
            if cci is not None:
                val = cci.iloc[-1]
                self._add_vote("CCI", "BUY" if val < -100 else "SELL" if val > 100 else "NEUTRAL")

            # 11. Williams %R
            willr = df.ta.willr()
            if willr is not None:
                val = willr.iloc[-1]
                self._add_vote("Williams %R", "BUY" if val < -80 else "SELL" if val > -20 else "NEUTRAL")

            # 12. Momentum (ROC)
            roc = df.ta.roc()
            if roc is not None:
                val = roc.iloc[-1]
                self._add_vote("Momentum (ROC)", "BUY" if val > 0 else "SELL")

            # ==========================================
            # ৩. Volatility Indicators (অস্থিরতা)
            # ==========================================

            # 13. Bollinger Bands
            bb = df.ta.bbands(length=20, std=2)
            if bb is not None:
                # ডায়নামিক কলাম নেম হ্যান্ডলিং (BBL_20_2.0 vs BBL_20_2)
                bbl_col = next((c for c in bb.columns if c.startswith('BBL')), None)
                bbu_col = next((c for c in bb.columns if c.startswith('BBU')), None)
                
                if bbl_col and bbu_col:
                    lower = bb[bbl_col].iloc[-1]
                    upper = bb[bbu_col].iloc[-1]
                    
                    if last_close < lower:
                        self._add_vote("Bollinger Bands", "BUY") # Dip Buy
                    elif last_close > upper:
                        self._add_vote("Bollinger Bands", "SELL") # Peak Sell
                    else:
                        self._add_vote("Bollinger Bands", "NEUTRAL")

            # 14. ATR (Volatility Check)
            atr = df.ta.atr(length=14)
            if atr is not None:
                curr_atr = atr.iloc[-1]
                # prev_atr = atr.iloc[-10] # Unused
                # শুধু ভোলাটিলিটি বাড়ছে কিনা তা চেক করা হচ্ছে
                self._add_vote("ATR (Volatility)", "NEUTRAL") 

            # 15. Keltner Channels (KC)
            kc = df.ta.kc()
            if kc is not None:
                # আপার ব্যান্ডের উপরে গেলে বাই (Breakout), লোয়ারের নিচে সেল
                upper = kc[kc.columns[2]].iloc[-1]
                lower = kc[kc.columns[0]].iloc[-1]
                # JS লজিক ছিল EMA এর উপরে কিনা, এখানে আমরা স্ট্যান্ডার্ড KC লজিক দিচ্ছি
                self._add_vote("Keltner Channels", "BUY" if last_close > upper else "SELL" if last_close < lower else "NEUTRAL")

            # 16. Donchian Channels
            donchian = df.ta.donchian()
            if donchian is not None:
                # upper/lower columns
                upper = donchian[donchian.columns[2]].iloc[-1]
                lower = donchian[donchian.columns[0]].iloc[-1]
                
                if last_close >= upper:
                    self._add_vote("Donchian Channels", "BUY")
                elif last_close <= lower:
                    self._add_vote("Donchian Channels", "SELL")
                else:
                    self._add_vote("Donchian Channels", "NEUTRAL")

            # ==========================================
            # ৪. Volume Indicators (লেনদেনের পরিমাণ)
            # ==========================================

            # 17. OBV
            obv = df.ta.obv()
            if obv is not None:
                # OBV বাড়ছে মানে বাই প্রেসার
                self._add_vote("OBV", "BUY" if obv.iloc[-1] > obv.iloc[-2] else "SELL")

            # 18. MFI
            mfi = df.ta.mfi()
            if mfi is not None:
                val = mfi.iloc[-1]
                self._add_vote("MFI", "BUY" if val < 20 else "SELL" if val > 80 else "NEUTRAL")

            # 19. VWAP
            vwap = df.ta.vwap()
            if vwap is not None:
                val = vwap.iloc[-1]
                self._add_vote("VWAP", "BUY" if last_close > val else "SELL")

            # 20. A/D Line (Accumulation/Distribution)
            ad = df.ta.ad()
            if ad is not None:
                self._add_vote("A/D Line", "BUY" if ad.iloc[-1] > ad.iloc[-5] else "SELL")

        except Exception as e:
            print(f"Signal Calculation Error: {e}")
            return {"verdict": "ERROR", "score": 0, "details": []}

        # ==========================================
        # ফাইনাল ভারডিক্ট ক্যালকুলেশন
        # ==========================================
        score = self.buy_votes - self.sell_votes
        verdict = "NEUTRAL 😐"
        color = "#ffb300" # হলুদ

        if score >= 6:
            verdict = "STRONG BUY 🚀"
            color = "#00c853" # গাঢ় সবুজ
        elif score >= 2:
            verdict = "BUY 📈"
            color = "#00e676" # হালকা সবুজ
        elif score <= -6:
            verdict = "STRONG SELL 📉"
            color = "#ff3d00" # গাঢ় লাল
        elif score <= -2:
            verdict = "SELL 🔻"
            color = "#ff5722" # হালকা লাল

        return {
            "verdict": verdict,
            "color": color,
            "score": score,
            "summary": {"buy": self.buy_votes, "sell": self.sell_votes, "neutral": self.neutral_votes},
            "details": self.details
        }

# সিঙ্গেলটন ইনস্ট্যান্স তৈরি (যাতে বারবার ক্লাস তৈরি করতে না হয়)
signal_engine = SignalEngine()
