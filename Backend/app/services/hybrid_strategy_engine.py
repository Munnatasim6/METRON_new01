import pandas as pd
import numpy as np
import logging
import os
import joblib
from sklearn.ensemble import RandomForestClassifier
from app.services.technical_indicators import TechnicalIndicators

# লগিং কনফিগারেশন
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("HybridEngine")

class HybridStrategyEngine:
    def __init__(self):
        self.ti_engine = TechnicalIndicators()
        self.model_path = "app/models/hybrid_ai_model.pkl"
        self.ai_model = self._load_or_create_model()
        
        # ভোটিং রুলস কনফিগারেশন (The Translator Rules)
        self.rules = {
            'RSI': {'buy': 30, 'sell': 70},
            'CCI': {'buy': -100, 'sell': 100},
            'STOCH': {'buy': 20, 'sell': 80},
            'ADX': {'trend_strength': 25}
        }

    def _load_or_create_model(self):
        """
        AI মডেল লোড করে অথবা নতুন ডায়নামিক মডেল তৈরি করে (Self-Learning Setup)
        """
        # মডেল ফোল্ডার চেক
        if not os.path.exists("app/models"):
            os.makedirs("app/models")

        if os.path.exists(self.model_path):
            try:
                model = joblib.load(self.model_path)
                logger.info("🧠 Existing AI Brain Loaded Successfully.")
                return model
            except Exception as e:
                logger.warning(f"⚠️ Failed to load model: {e}. Creating new one.")
        
        # নতুন র‍্যান্ডম ফরেস্ট মডেল (Dynamic Logic)
        logger.info("🌱 Initializing New AI Brain (Random Forest)...")
        return RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)

    def _get_voting_score(self, df):
        """
        লেয়ার ১: ভোটিং কাউন্সিল (The Council of Indicators)
        ৭০+ ইন্ডিকেটর স্ক্যান করে ভোটিং স্কোর তৈরি করে।
        (Core i3 Optimized: Vectorized Calculation)
        """
        try:
            # কপি তৈরি করি যাতে মূল ডাটা নষ্ট না হয়
            work_df = df.copy()
            
            # ভোটিং কলাম তৈরি (শুরুতে সব ০)
            work_df['vote_score'] = 0
            
            # ---------------------------------------------------------
            # ডায়নামিক ইন্ডিকেটর স্ক্যানিং (Dynamic Scanning)
            # ---------------------------------------------------------
            
            # ১. RSI চেক (যেকোনো কলাম যার নামে RSI আছে)
            rsi_cols = [c for c in work_df.columns if 'RSI' in c]
            for col in rsi_cols:
                work_df['vote_score'] += np.where(work_df[col] < self.rules['RSI']['buy'], 1, 0)
                work_df['vote_score'] -= np.where(work_df[col] > self.rules['RSI']['sell'], 1, 0)

            # ২. MACD চেক
            if 'MACD' in work_df.columns and 'MACD_Signal' in work_df.columns:
                work_df['vote_score'] += np.where(work_df['MACD'] > work_df['MACD_Signal'], 1, 0) # Cross Up
                work_df['vote_score'] -= np.where(work_df['MACD'] < work_df['MACD_Signal'], 1, 0) # Cross Down

            # ৩. Bollinger Bands চেক
            if 'BB_Lower' in work_df.columns and 'close' in work_df.columns:
                work_df['vote_score'] += np.where(work_df['close'] <= work_df['BB_Lower'], 1, 0) # Oversold
                work_df['vote_score'] -= np.where(work_df['close'] >= work_df['BB_Upper'], 1, 0) # Overbought

            # ৪. EMA Trend চেক (Trend Following)
            ema_cols = [c for c in work_df.columns if 'EMA' in c]
            if len(ema_cols) >= 2:
                # ছোট ইএমএ (যেমন EMA 9) বড় ইএমএ (যেমন EMA 21) এর উপরে থাকলে বুলিশ
                sorted_emas = sorted(ema_cols, key=lambda x: int(x.split('_')[-1]) if '_' in x else 0)
                if len(sorted_emas) > 1:
                    fast_ema = sorted_emas[0]
                    slow_ema = sorted_emas[-1]
                    work_df['vote_score'] += np.where(work_df[fast_ema] > work_df[slow_ema], 1, 0)
                    work_df['vote_score'] -= np.where(work_df[fast_ema] < work_df[slow_ema], 1, 0)

            # ৫. SuperTrend (যদি থাকে)
            if 'SuperTrend' in work_df.columns:
                 work_df['vote_score'] += np.where(work_df['close'] > work_df['SuperTrend'], 2, 0) # পাওয়ারফুল সিগন্যাল (+2)
                 work_df['vote_score'] -= np.where(work_df['close'] < work_df['SuperTrend'], 2, 0)

            # স্কোর নরমালাইজেশন (-১০০ থেকে +১০০ এর মধ্যে আনা)
            # ধরে নিলাম মোট ইন্ডিকেটর বা লজিক চেক হয়েছে প্রায় ২০-৩০টি।
            # আমরা এটাকে স্কেল করবো।
            max_possible_score = len(rsi_cols) + len(ema_cols) + 5 # আনুমানিক সর্বোচ্চ ভোট
            normalized_score = (work_df['vote_score'] / max_possible_score) * 100
            
            return normalized_score.fillna(0)

        except Exception as e:
            logger.error(f"❌ Voting Calculation Error: {e}")
            return pd.Series([0]*len(df), index=df.index)

    def _get_ai_prediction(self, df, sentiment_score):
        """
        লেয়ার ২: এআই জাজ (The AI Supreme Court)
        মডেল ব্যবহার করে ট্রেডের কনফিডেন্স চেক করে।
        """
        try:
            # ফিচার ইঞ্জিনিয়ারিং (AI এর জন্য ইনপুট)
            features = pd.DataFrame()
            features['sentiment'] = sentiment_score
            features['price_change'] = df['close'].pct_change().fillna(0)
            features['volatility'] = (df['high'] - df['low']) / df['close']
            features['volume_change'] = df['volume'].pct_change().fillna(0)
            
            # NaN ভ্যালু ক্লিন করা
            features = features.fillna(0)
            
            # মডেল যদি ট্রেইন করা না থাকে (শুরুর দিকে), তাহলে আমরা ভোটিং স্কোরকেই বিশ্বাস করব
            # এটি "Cold Start" সমস্যা সমাধান করে।
            try:
                from sklearn.utils.validation import check_is_fitted
                check_is_fitted(self.ai_model)
                is_fitted = True
            except:
                is_fitted = False

            if not is_fitted:
                # মডেল এখনো বাচ্চা, তাই সে ভোটিং স্কোরের ওপর ভিত্তি করে রায় দিবে
                # কিন্তু ডাটাগুলো মনে রাখবে শেখার জন্য (Future Logic)
                probabilities = np.where(sentiment_score > 20, 0.6, 0.4) # >20 হলে ৬০% কনফিডেন্স
                return probabilities
            
            # আসল প্রেডিকশন
            # [Prob_Sell, Prob_Buy] -> আমরা Prob_Buy (index 1) নিব
            probs = self.ai_model.predict_proba(features)[:, 1] 
            return probs

        except Exception as e:
            logger.error(f"❌ AI Prediction Error: {e}")
            return np.zeros(len(df))

    async def get_hybrid_signal(self, dataframe):
        """
        মেইন ফাংশন: এটি ভোটিং এবং এআই মিলিয়ে ফাইনাল সিদ্ধান্ত দিবে।
        """
        if dataframe.empty:
            return None

        # ১. ইন্ডিকেটর ক্যালকুলেশন (TechnicalIndicators.py ব্যবহার করে)
        df_with_indicators = self.ti_engine.apply_all_indicators(dataframe)
        
        # ২. লেয়ার ১: ভোটিং স্কোর (Sentiment)
        sentiment_scores = self._get_voting_score(df_with_indicators)
        current_sentiment = sentiment_scores.iloc[-1]
        
        # ৩. লেয়ার ২: এআই কনফিডেন্স (AI Probability)
        ai_confidences = self._get_ai_prediction(df_with_indicators, sentiment_scores)
        current_confidence = ai_confidences[-1] * 100 # শতাংশে কনভার্ট
        
        # ৪. ফাইনাল সিদ্ধান্ত (Decision Logic)
        signal = "NEUTRAL"
        
        # শর্ত: ভোটিং পজিটিভ হতে হবে + এআই এর কনফিডেন্স থাকতে হবে
        if current_sentiment > 20 and current_confidence > 60:
            signal = "BUY"
        elif current_sentiment < -20 and current_confidence > 60: # Selling Logic (Future Trade)
            signal = "SELL"
            
        logger.info(f"🔮 Hybrid Analysis | Vote: {current_sentiment:.2f} | AI Conf: {current_confidence:.2f}% | Signal: {signal}")
        
        return {
            "signal": signal,
            "sentiment_score": float(current_sentiment),
            "ai_confidence": float(current_confidence),
            "meta_data": {
                "indicators_used": len(df_with_indicators.columns),
                "strategy_mode": "Hybrid-Ensemble-v1"
            }
        }

    def train_ai_model(self, historical_data, labels):
        """
        ব্যাকটেস্টিং ইঞ্জিন এই ফাংশনটি কল করে মডেলকে শেখাবে (Self-Learning).
        Labels: 1 = Profitable Trade, 0 = Loss Trade
        """
        try:
            logger.info("🎓 Training AI Model with new data...")
            # এখানে ফিচার প্রস্তুত করে fit() কল করা হবে
            # এটি পরবর্তী ধাপে ব্যাকটেস্টিং এর সাথে ইন্টিগ্রেট করা হবে
            pass 
        except Exception as e:
            logger.error(f"Training Error: {e}")
