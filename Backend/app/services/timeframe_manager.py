import pandas as pd
import pandas_ta as ta
import numpy as np
import logging

# লগিং সেটআপ
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FeatureEngineeringLab")

class TimeframeManager:
    def __init__(self):
        # ফ্ল্যাগ সিস্টেম: মেমোরি বাঁচানোর জন্য দরকার হলে কোনো গ্রুপ বন্ধ রাখা যাবে
        self.config = {
            'calc_trend': True,      # 1-15 Trend Indicators
            'calc_momentum': True,   # 16-35 Momentum Indicators
            'calc_volume': True,     # 36-50 Volume Indicators
            'calc_volatility': True, # 51-60 Volatility Indicators
            'calc_special': True     # 61-70 Special/Math Indicators
        }

    def transform_data(self, df_1m, target_timeframe):
        """
        Phase 3 Core Function: Resampling + Feature Engineering
        ১ মিনিটের ডাটা থেকে টার্গেট টাইমফ্রেমে (15m, 1H, etc.) ডাটা তৈরি এবং ফিচার এক্সট্রাকশন।
        """
        if df_1m.empty:
            logger.warning("No data provided for transformation.")
            return None

        # --- স্টেপ ১: বেসিক ডাটা প্রিপারেশন ---
        # [cite_start]Money Flow ক্যালকুলেশন (Turnover এর জন্য) [cite: 1]
        if 'money_flow' not in df_1m.columns:
            # Typical Price * Volume
            df_1m['money_flow'] = ((df_1m['high'] + df_1m['low'] + df_1m['close']) / 3) * df_1m['volume']

        # [cite_start]ট্রেড কলাম চেক (Smart Trade Count এর জন্য) [cite: 2]
        has_trades = 'trades' in df_1m.columns

        # --- স্টেপ ২: রিস্যাম্পলিং লজিক (Resampling) ---
        agg_dict = {
            'open': 'first',
            'high': 'max',
            'low': 'min',
            'close': 'last',
            'volume': 'sum',
            'money_flow': 'sum'  # Turnover হিসেবে কাজ করবে
        }
        if has_trades:
            agg_dict['trades'] = 'sum'

        # টার্গেট টাইমফ্রেমে কনভার্ট করা
        try:
            df_resampled = df_1m.resample(target_timeframe).agg(agg_dict)
            df_resampled.dropna(subset=['open', 'close'], inplace=True)
        except Exception as e:
            logger.error(f"Resampling Error: {e}")
            return None

        # --- স্টেপ ৩: অ্যাডভান্সড ফিচার ক্যালকুলেশন (Custom Logic) ---
        
        # [cite_start]৩.১: Turnover এবং VWAP [cite: 3]
        df_resampled['turnover'] = df_resampled['money_flow']
        # VWAP = Cumulative(Money Flow) / Cumulative(Volume)
        df_resampled['vwap'] = (df_resampled['money_flow'].cumsum()) / (df_resampled['volume'].cumsum())

        # [cite_start]৩.২: Activity Score (যদি ট্রেড ডাটা না থাকে) [cite: 2]
        if not has_trades:
            # লজিক: (Range / Open) * Volume -> ভোলাটিলিটি এবং ভলিউমের গুণফল
            df_resampled['activity_score'] = ((df_resampled['high'] - df_resampled['low']) / df_resampled['open']) * df_resampled['volume']
            df_resampled['activity_score'] = df_resampled['activity_score'].fillna(0)

        # [cite_start]৩.৩: Smart Delta (Buyer vs Seller Pressure) [cite: 3]
        # লজিক: Close >= Open হলে বায়ার ডমিনেন্স, নাহলে সেলার
        buy_vol = np.where(df_resampled['close'] >= df_resampled['open'], df_resampled['volume'], 0)
        sell_vol = np.where(df_resampled['close'] < df_resampled['open'], df_resampled['volume'], 0)
        df_resampled['smart_delta'] = buy_vol - sell_vol

        # --- স্টেপ ৪: ৭০টি ইন্ডিকেটর ক্যালকুলেশন (Feature Generation) ---
        df_features = self.calculate_indicators(df_resampled)

        # --- স্টেপ ৫: মার্কেট ফেজ ডিটেকশন (Market Phase) ---
        df_final = self.detect_market_phase(df_features)

        return df_final

    def calculate_indicators(self, df):
        """
        ৭০টি ইন্ডিকেটর ক্যালকুলেশন ইঞ্জিন (pandas-ta ব্যবহার করে অপ্টিমাইজড)
        """
        # [cite_start]--- Group 1: Trend Indicators (1-15) [cite: 5] ---
        if self.config['calc_trend']:
            df.ta.sma(length=20, append=True) # 1. SMA
            df.ta.ema(length=20, append=True) # 2. EMA
            df.ta.ema(length=50, append=True) # Major Trend
            df.ta.macd(append=True)           # 3. MACD
            df.ta.psar(append=True)           # 4. Parabolic SAR
            df.ta.adx(append=True)            # 5. ADX
            # 6. Ichimoku (Full System) returns 5 columns
            try:
                ichimoku = ta.ichimoku(df['high'], df['low'], df['close'])[0]
                df = pd.concat([df, ichimoku], axis=1)
            except Exception: pass
            
            df.ta.supertrend(append=True)     # 7. SuperTrend
            df.ta.hma(length=20, append=True) # 8. HMA
            # 9. ZigZag (Custom handling usually required, skipping heavy loop)
            df.ta.linreg(append=True)         # 10. Linear Regression
            # 11. Alligator (Requires custom logic or library support)
            df.ta.aroon(append=True)          # 12. Aroon
            df.ta.donchian(append=True)       # 13. Donchian
            # 14. GMMA (Multiple EMAs)
            df.ta.trix(append=True)           # 15. TRIX

        # [cite_start]--- Group 2: Momentum Indicators (16-35) [cite: 67] ---
        if self.config['calc_momentum']:
            df.ta.rsi(length=14, append=True) # 16. RSI
            df.ta.stoch(append=True)          # 17. Stochastic
            df.ta.cci(append=True)            # 18. CCI
            df.ta.willr(append=True)          # 19. Williams %R
            df.ta.ao(append=True)             # 20. Awesome Oscillator
            df.ta.roc(append=True)            # 21. ROC
            df.ta.mom(append=True)            # 22. Momentum
            df.ta.rvi(append=True)            # 23. RVI
            df.ta.uo(append=True)             # 24. Ultimate Oscillator
            df.ta.tsi(append=True)            # 25. TSI
            df.ta.stochrsi(append=True)       # 26. Stochastic RSI
            df.ta.kst(append=True)            # 27. KST
            df.ta.ppo(append=True)            # 28. PPO
            # 29. DPO (Detrended Price Oscillator)
            df.ta.dpo(append=True)
            df.ta.fisher(append=True)         # 30. Fisher Transform
            # 31. Connors RSI
            # 32. STC (Schaff Trend Cycle)
            # 33. COG (Center of Gravity)
            df.ta.cmmo(append=True)           # Chande Momentum
            df.ta.vortex(append=True)         # 35. Vortex

        # [cite_start]--- Group 3: Volume Indicators (36-50) [cite: 149] ---
        if self.config['calc_volume']:
            df.ta.obv(append=True)            # 36. OBV
            # 37. VWAP (Already Calculated Manually above)
            df.ta.mfi(append=True)            # 38. MFI
            df.ta.cmf(append=True)            # 39. CMF
            df.ta.ad(append=True)             # 40. A/D Line
            # 41. Volume Profile (Computationally heavy, handle with care)
            df.ta.eom(append=True)            # 42. EOM
            df.ta.efi(append=True)            # 43. Force Index
            # 44. Volume Oscillator
            df.ta.nvi(append=True)            # 45. NVI
            df.ta.pvi(append=True)            # 46. PVI
            df.ta.kvo(append=True)            # 47. Klinger
            df.ta.pvt(append=True)            # 48. PVT
            # 49. Elder Ray (Bull/Bear Power)
            # 50. Market Facilitation Index (BW MFI)

        # [cite_start]--- Group 4: Volatility Indicators (51-60) [cite: 211] ---
        if self.config['calc_volatility']:
            df.ta.bbands(append=True)         # 51. Bollinger Bands
            df.ta.atr(append=True)            # 52. ATR
            df.ta.kc(append=True)             # 53. Keltner Channels
            df.ta.stdev(append=True)          # 54. Standard Deviation
            # 55. Chaikin Volatility
            df.ta.ui(append=True)             # 56. Ulcer Index
            # 57. Historical Volatility
            df.ta.massi(append=True)          # 59. Mass Index
            df.ta.chop(append=True)           # 60. Choppiness Index

        # [cite_start]--- Group 5: Special/Math Indicators (61-70) [cite: 253] ---
        if self.config['calc_special']:
            # 61. Pivot Points (Need separate function usually, ta supports basic)
            # 62. Fibonacci (Logic based on High/Low)
            # 64. Elliott Wave Oscillator (EWO)
            df['EWO'] = df.ta.sma(length=5) - df.ta.sma(length=35)
            # 67. Hurst Exponent (Complex calculation)
            # 69. Fractals
            
        return df

    def detect_market_phase(self, df):
        """
        Phase 3 Critical Logic: Market Phase Detection
        [cite_start]৫টি উপাদানের ভিত্তিতে মার্কেট ফেজ নির্ণয় [cite: 3]
        """
        # ১. ভোলাটিলিটি স্ট্যাটাস (ATR দিয়ে)
        if 'ATRr_14' in df.columns:
            df['atr_ma'] = ta.sma(df['ATRr_14'], length=20)
            df['vol_status'] = np.where(df['ATRr_14'] > df['atr_ma'], 'High', 'Low')
        else:
            df['vol_status'] = 'Normal'

        # ২. অ্যাক্টিভিটি/ট্রেড স্ট্যাটাস
        act_col = 'trades' if 'trades' in df.columns else 'activity_score'
        if act_col in df.columns:
             df['act_ma'] = ta.sma(df[act_col], length=20)
             df['act_status'] = np.where(df[act_col] > df['act_ma'], 'High', 'Normal')

        # ৩. ফেজ ডিটেকশন লজিক ইমপ্লিমেন্টেশন
        def get_phase_label(row):
            price = row['close']
            vwap = row.get('vwap', 0)
            delta = row.get('smart_delta', 0)
            vol = row.get('vol_status', 'Normal')
            turnover = row.get('turnover', 0)
            
            # লজিক ১: Accumulation (সস্তা, শান্ত মার্কেট, স্মার্ট বায়িং)
            if price <= vwap and vol == 'Low' and delta > 0:
                return "Accumulation"
            
            # লজিক ২: Markup (দামি, ভলিউম বেশি, আপট্রেন্ড)
            elif price > vwap and turnover > 0 and delta > 0:
                return "Markup"
            
            # লজিক ৩: Distribution (অনেক দামি, অস্থির মার্কেট, সেলিং প্রেশার)
            elif price > vwap and vol == 'High' and delta < 0:
                return "Distribution"
            
            # লজিক ৪: Markdown (সস্তা, প্যানিক সেলিং, ডাউনট্রেন্ড)
            elif price < vwap and delta < 0:
                return "Markdown"
            
            else:
                return "Consolidation"

        df['market_phase'] = df.apply(get_phase_label, axis=1)
        return df

timeframe_manager = TimeframeManager()
