import logging
import pandas as pd
# নতুন হাইব্রিড ইঞ্জিন ইমপোর্ট
from app.services.hybrid_strategy_engine import HybridStrategyEngine
from app.services.technical_indicators import TechnicalIndicators

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("StrategyManager")

class StrategyManager:
    def __init__(self):
        self.ti_engine = TechnicalIndicators()
        # ফিউচার প্রুফ: ইঞ্জিনটি একবারই লোড হবে
        self.hybrid_engine = HybridStrategyEngine()
        
        self.strategies = {
            "Scalping": self.scalping_strategy,
            "Momentum": self.momentum_strategy,
            "Hybrid AI (Ensemble)": self.hybrid_ai_strategy, # নতুন অপশন
            "Conservative": self.conservative_strategy,
            "Balanced": self.balanced_strategy,
            "Aggressive": self.aggressive_strategy,
            "AI-Adaptive": self.ai_adaptive_strategy,
            "Ultra-Safe": self.ultra_safe_strategy,
            "Scalper Pro": self.scalper_pro_strategy,
            "Swing Master": self.swing_master_strategy,
            "Snipe Hunter": self.snipe_hunter_strategy,
            "Trend Surfer": self.trend_surfer_strategy
        }
        self.current_mode = "Scalping" # ডিফল্ট

    def set_mode(self, mode_name):
        if mode_name in self.strategies:
            self.current_mode = mode_name
            logger.info(f"✅ Strategy Switched to: {mode_name}")
            return True
        return False

    async def get_signal(self, df):
        """
        এই ফাংশনটি ডিসিশন মেকার। সে সিলেক্ট করা মোড অনুযায়ী ইঞ্জিনে কল পাঠাবে।
        """
        if df.empty: return None
        
        strategy_func = self.strategies.get(self.current_mode)
        
        if strategy_func:
            # যদি হাইব্রিড মোড হয়, তবে এটি async হতে পারে
            if self.current_mode == "Hybrid AI (Ensemble)":
                return await strategy_func(df)
            else:
                return strategy_func(df)
        return None

    # --- পুরাতন স্ট্র্যাটেজিগুলো (অক্ষত আছে) ---
    def scalping_strategy(self, df):
        # ... (আপনার আগের লজিক এখানে থাকবে, আমি ছোট করে লিখলাম বোঝার সুবিধার্থে) ...
        last_row = df.iloc[-1]
        if last_row.get('RSI', 50) < 30: return "BUY"
        if last_row.get('RSI', 50) > 70: return "SELL"
        return "NEUTRAL"

    def momentum_strategy(self, df):
        # Placeholder for Momentum
        return "NEUTRAL"
        
    def conservative_strategy(self, df):
        # Strict rules (example)
        latest = df.iloc[-1]
        phases = ["Markup", "Accumulation"]
        if latest.get('market_phase') in phases and latest.get('RSI') < 25:
             return "BUY"
        return "NEUTRAL"

    def balanced_strategy(self, df):
        latest = df.iloc[-1]
        if latest.get('RSI') < 30: return "BUY"
        if latest.get('RSI') > 70: return "SELL"
        return "NEUTRAL"

    def aggressive_strategy(self, df):
        return self.scalping_strategy(df)

    def ai_adaptive_strategy(self, df):
        # Just a placeholder for now
        return "NEUTRAL"
        
    def ultra_safe_strategy(self, df):
        return "NEUTRAL"
        
    def scalper_pro_strategy(self, df):
        return self.scalping_strategy(df)
        
    def swing_master_strategy(self, df):
        return "NEUTRAL"
        
    def snipe_hunter_strategy(self, df):
        return "NEUTRAL"
        
    def trend_surfer_strategy(self, df):
        return "NEUTRAL"

    # --- নতুন হাইব্রিড কানেকশন ---
    async def hybrid_ai_strategy(self, df):
        """
        এটি সরাসরি হাইব্রিড ইঞ্জিনের সাথে কথা বলবে।
        রিটার্ন করবে: { 'signal': 'BUY', 'vote': 45, 'confidence': 88 }
        """
        result = await self.hybrid_engine.get_hybrid_signal(df)
        return result
        
strategy_manager = StrategyManager()
