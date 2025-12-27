import pandas as pd
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TimeframeManager")

class TimeframeManager:
    def __init__(self):
        pass

    def prepare_and_resample(self, df_1m, target_timeframe):
        """
        ইনপুট: ১ মিনিটের র-ডাটা (df_1m)
        আউটপুট: টার্গেট টাইমফ্রেমের (যেমন '15T', '1H', '4H') ক্লিন ক্যান্ডেলস্টিক ডাটা।
        """
        if df_1m.empty:
            logger.warning("No data provided for resampling.")
            return None

        # ১. ডাটা টাইপ ফিক্সিং (যাতে কোনো স্ট্রিং না থাকে)
        cols = ['open', 'high', 'low', 'close', 'volume']
        df_1m[cols] = df_1m[cols].apply(pd.to_numeric, errors='coerce')
        
        # ২. প্রি-প্রসেসিং: রিস্যাম্পল করার আগে কিছু বেসিক কলাম তৈরি করা জরুরি
        # Turnover (Money Flow) = (H+L+C)/3 * Volume
        # এটি ১ মিনিট লেভেলেই ক্যালকুলেট করতে হবে, যাতে যোগফল (Sum) সঠিক হয়।
        df_1m['money_flow'] = ((df_1m['high'] + df_1m['low'] + df_1m['close']) / 3) * df_1m['volume']

        # Smart Delta প্রিপারেশন: ১ মিনিট ক্যান্ডেলের ক্লোজ দেখে বায়ার/সেলার ভলিউম আলাদা করা
        # রিস্যাম্পল করার পর এই কলামগুলো যোগ (Sum) করলে বড় টাইমফ্রেমের ডেল্টা নিখুঁত হবে।
        df_1m['vol_buy'] = np.where(df_1m['close'] >= df_1m['open'], df_1m['volume'], 0)
        df_1m['vol_sell'] = np.where(df_1m['close'] < df_1m['open'], df_1m['volume'], 0)

        # ৩. রিস্যাম্পলিং লজিক (১ মিনিট -> টার্গেট টাইমফ্রেম)
        # রুলস: Open=First, High=Max, Low=Min, Close=Last, Volume=Sum
        agg_rules = {
            'open': 'first',
            'high': 'max',
            'low': 'min',
            'close': 'last',
            'volume': 'sum',
            'money_flow': 'sum',  # Turnover যোগ হবে
            'vol_buy': 'sum',     # বায়ার ভলিউম যোগ হবে
            'vol_sell': 'sum'     # সেলার ভলিউম যোগ হবে
        }

        # যদি 'trades' কলাম থাকে (Binance ডাটা), তবে সেটিও যোগ হবে
        if 'trades' in df_1m.columns:
            agg_rules['trades'] = 'sum'

        try:
            # মেইন কনভার্শন প্রসেস
            df_resampled = df_1m.resample(target_timeframe).agg(agg_rules)
            
            # টাইমফ্রেম সিঙ্ক রাখার জন্য যে ক্যান্ডেলগুলোর ডাটা নেই (NaN), সেগুলো বাদ দিচ্ছি
            df_resampled.dropna(subset=['open', 'close'], inplace=True)

            # ৪. কলামের নাম স্ট্যান্ডার্ড করা (পরের লেয়ারের সুবিধার জন্য)
            df_resampled['turnover'] = df_resampled['money_flow']
            
            # যদি ট্রেড কাউন্ট না থাকে, তাহলে Activity Score এর বেস ভ্যালু তৈরি করে দেওয়া
            if 'trades' not in df_resampled.columns:
                # Activity Proxy: (High-Low)/Open * Volume
                range_pct = (df_resampled['high'] - df_resampled['low']) / df_resampled['open']
                df_resampled['activity_raw'] = range_pct * df_resampled['volume']
                df_resampled['activity_raw'] = df_resampled['activity_raw'].fillna(0)

            return df_resampled

        except Exception as e:
            logger.error(f"Resampling Error for {target_timeframe}: {e}")
            return None

timeframe_manager = TimeframeManager()
