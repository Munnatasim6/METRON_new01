import time
import logging
import numpy as np

# লগিং সেটআপ
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DataSanitizer")

class DataSanitizer:
    def __init__(self):
        self.last_valid_price = None
        self.last_valid_timestamp = None
        # সার্ভার ক্লক এরর টলারেন্স (৫ সেকেন্ড ফিউচার টাইম এলাউড)
        self.FUTURE_TOLERANCE_MS = 5000 

    def validate_tick(self, price: float, timestamp_ms: int) -> bool:
        """
        লাইভ স্ট্রিম ডাটা ভ্যালিডেট করে।
        চেকলিস্ট:
        ১. প্রাইস কি পজিটিভ?
        ২. টাইমস্ট্যাম্প কি ভ্যালিড (ভবিষ্যতের নয় তো)?
        """
        current_time_ms = int(time.time() * 1000)

        # ১. প্রাইস চেক (Price Integrity)
        if price <= 0:
            logger.warning(f"⚠️ Invalid Price Detected: {price}. Dropping data.")
            return False

        # ২. টাইমস্ট্যাম্প চেক (Future Time Prevention)
        # যদি ডাটা বর্তমান সময়ের চেয়ে ৫ সেকেন্ডের বেশি অ্যাডভান্স হয়, তবে সেটা সন্দেহজনক
        if timestamp_ms > (current_time_ms + self.FUTURE_TOLERANCE_MS):
            logger.warning(f"⚠️ Future Timestamp Detected! Diff: {timestamp_ms - current_time_ms}ms. Sync System Clock.")
            return False

        # ডাটা ভ্যালিড
        self.last_valid_price = price
        self.last_valid_timestamp = timestamp_ms
        return True

    def fill_candle_gaps(self, ohlcv_data: list) -> list:
        """
        ঐতিহাসিক বা লাইভ ক্যান্ডেল ডাটার গ্যাপ পূরণ করে (Gap Filler)।
        লজিক: ১ মিনিটের বেশি গ্যাপ থাকলে আগের ডাটা দিয়ে কপি-পেস্ট (Forward Fill)।
        """
        if not ohlcv_data or len(ohlcv_data) < 2:
            return ohlcv_data

        sanitized_data = []
        expected_interval_ms = 60000 # ১ মিনিট = ৬০,০০০ মিলি সেকেন্ড

        # প্রথম ক্যান্ডেল যোগ করা
        sanitized_data.append(ohlcv_data[0])

        for i in range(1, len(ohlcv_data)):
            prev_candle = sanitized_data[-1]
            curr_candle = ohlcv_data[i]
            
            prev_time = prev_candle[0]
            curr_time = curr_candle[0]
            time_diff = curr_time - prev_time

            # গ্যাপ ডিটেকশন (Gap Detection)
            if time_diff > expected_interval_ms:
                # কতগুলো ক্যান্ডেল মিসিং?
                missing_count = int((time_diff / expected_interval_ms) - 1)
                
                if missing_count > 0:
                    # logger.info(f"🔧 Filling {missing_count} missing candles (Forward Fill)")
                    
                    # গ্যাপ পূরণ লজিক (Forward Fill - i3 অপ্টিমাইজড)
                    # আগের ক্লোজ প্রাইস দিয়েই ডামি ক্যান্ডেল বানানো হবে
                    fill_price = prev_candle[4] # Close price
                    
                    for j in range(missing_count):
                        dummy_time = prev_time + ((j + 1) * expected_interval_ms)
                        # [Time, Open, High, Low, Close, Volume]
                        # ভলিউম ০ দেওয়া হলো কারণ ফেক ক্যান্ডেলে ভলিউম থাকা উচিত না
                        dummy_candle = [dummy_time, fill_price, fill_price, fill_price, fill_price, 0.0]
                        sanitized_data.append(dummy_candle)

            sanitized_data.append(curr_candle)

        return sanitized_data

# সিঙ্গেলটন ইনস্ট্যান্স
data_sanitizer = DataSanitizer()
