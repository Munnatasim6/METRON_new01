import logging
import pandas as pd

logger = logging.getLogger("SignalEngine")

class SignalEngine:
    def __init__(self):
        pass

    def analyze(self, df):
        """
        লেটেস্ট ডাটার ওপর ভিত্তি করে বাই/সেল সিগন্যাল জেনারেট করে।
        FIX: 'Ambiguous Series' এরর ফিক্স করা হয়েছে .iloc[-1] ব্যবহার করে।
        """
        if df is None or df.empty:
            return {"score": 0, "verdict": "NEUTRAL", "signals": []}

        try:
            # সবসময় সর্বশেষ ক্যান্ডেল (Latest Row) চেক করতে হবে
            current = df.iloc[-1]
            
            score = 0
            signals = []

            # ১. RSI Logic
            rsi = current.get('rsi', 50)
            if rsi < 30:
                score += 2
                signals.append("RSI Oversold (Bullish)")
            elif rsi > 70:
                score -= 2
                signals.append("RSI Overbought (Bearish)")

            # ২. EMA Trend Logic
            close = current.get('close', 0)
            ema_50 = current.get('ema_50', 0)
            ema_200 = current.get('ema_200', 0)

            if close > ema_50 and ema_50 > ema_200:
                score += 3
                signals.append("Golden Trend Alignment")
            elif close < ema_50 and ema_50 < ema_200:
                score -= 3
                signals.append("Death Trend Alignment")

            # ৩. MACD Crossover Logic
            # এখানে আমাদের আগের ক্যান্ডেলও দেখতে হবে ক্রসওভার বোঝার জন্য
            if len(df) > 2:
                prev = df.iloc[-2]
                macd_curr = current.get('macd', 0)
                signal_curr = current.get('macd_signal', 0)
                macd_prev = prev.get('macd', 0)
                signal_prev = prev.get('macd_signal', 0)

                # Bullish Crossover (MACD লাইন সিগন্যাল লাইনের নিচ থেকে উপরে উঠল)
                if macd_prev < signal_prev and macd_curr > signal_curr:
                    score += 2
                    signals.append("MACD Bullish Cross")
                
                # Bearish Crossover
                if macd_prev > signal_prev and macd_curr < signal_curr:
                    score -= 2
                    signals.append("MACD Bearish Cross")

            # Verdict
            verdict = "NEUTRAL"
            if score >= 4: verdict = "STRONG_BUY"
            elif score >= 2: verdict = "BUY"
            elif score <= -4: verdict = "STRONG_SELL"
            elif score <= -2: verdict = "SELL"

            return {
                "score": score,
                "verdict": verdict,
                "signals": signals
            }

        except Exception as e:
            logger.error(f"Signal Calculation Error: {e}")
            return {"score": 0, "verdict": "ERROR", "signals": []}

signal_engine = SignalEngine()
