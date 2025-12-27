import pandas as pd
import ccxt.async_support as ccxt
import time
import os
import asyncio
from datetime import datetime
from app.services.technical_indicators import technical_indicators
from app.services.signal_engine import signal_engine
from app.services.strategy_manager import strategy_manager
from app.core.config import settings

class BacktestEngine:
    def __init__(self):
        # Reports ডিরেক্টরি তৈরি
        self.report_dir = "Reports"
        if not os.path.exists(self.report_dir):
            os.makedirs(self.report_dir)

    async def fetch_historical_data(self, exchange_name, symbol, timeframe, limit=1000):
        """CCXT দিয়ে ঐতিহাসিক ডাটা ফেচ করে"""
        exchange_class = getattr(ccxt, exchange_name)()
        try:
            # এক্সচেঞ্জ কনফিগারেশন (Public Data এর জন্য API Key দরকার নেই, তবে থাকলে ভালো)
            if exchange_name == 'binance':
                exchange_class = ccxt.binance({'enableRateLimit': True, 'options': {'defaultType': 'future'}})
            
            print(f"⏳ Fetching {limit} candles for {symbol} ({timeframe}) from {exchange_name}...")
            # CCXT fetch_ohlcv
            ohlcv = await exchange_class.fetch_ohlcv(symbol, timeframe, limit=limit)
            
            if not ohlcv or len(ohlcv) < 50:
                print("❌ Not enough data fetched.")
                return None

            # DataFrame তৈরি
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['datetime'] = pd.to_datetime(df['timestamp'], unit='ms')
            return df
        
        except Exception as e:
            print(f"❌ Error fetching data: {e}")
            return None
        finally:
            await exchange_class.close()

    async def run_backtest(self, exchange, symbol, timeframe, limit, strategy_mode):
        """
        Main Backtest Loop
        1. Fetch Data
        2. Calculate Indicators (Loop or Vectorized)
        3. Apply Strategy Logic
        4. Calculate PnL
        """
        # ১. ডাটা আনা
        df = await self.fetch_historical_data(exchange, symbol, timeframe, limit)
        if df is None:
            return {"status": "error", "message": "Failed to fetch data"}

        # ২. টেকনিক্যাল ইন্ডিকেটর ক্যালকুলেশন (পুরো ডাটাফ্রেমে একসাথে)
        # technical_indicators.apply_all_indicators ফাংশনটি পুরো DF এর উপর কাজ করে
        print("⚙️ Calculating 70 Indicators...")
        df_analyzed = technical_indicators.apply_all_indicators(df)
        
        # ৩. সিমুলেশন লুপ
        trades = []
        balance = 1000 # ডিফল্ট শুরু ব্যালেন্স $১০০০
        position = None # { "entry_price": 100, "amount": 10, "type": "BUY" }
        total_trades = 0
        wins = 0
        
        # আমরা ৫০তম ক্যান্ডেল থেকে শুরু করব যাতে ইন্ডিকেটরগুলো স্টেবল হয়
        print("🚀 Running Simulation...")
        for i in range(50, len(df_analyzed)):
            current_candle = df_analyzed.iloc[i]
            prev_candle = df_analyzed.iloc[i-1]
            price = current_candle['close']
            timestamp = current_candle['datetime']
            
            # --- Signal Generation (Mocking Signal Engine Logic for Backtest) ---
            # যেহেতু SignalEngine রিয়েল-টাইম ডাটা নেয়, ব্যাকটেস্টে আমরা সরাসরি লজিক ব্যবহার করব 
            # অথবা কাস্টম লজিক দিয়ে চেক করব। 
            # ফাস্ট সিমুলেশনের জন্য আমরা Strategy Manager এর লজিক এখানে অ্যাপ্লাই করব।
            
            # স্কোর ক্যালকুলেশন (Simplify for speed: using Strategy Manager's logic directly if possible or re-calculating simple score)
            # সঠিক ফলাফলের জন্য আমাদের প্রতিটি ক্যান্ডেলের জন্য SignalEngine.analyze_market_sentiment কল করা উচিত, 
            # কিন্তু লুপে ১০০০ বার কল করলে স্লো হতে পারে। 
            # তাই আমরা এখানে একটি লাইটওয়েট স্কোরিং মেকানিজম বা Strategy Manager এর রুলস সরাসরি চেক করব।
            
            # এখানে আমরা StrategyManager এর 'get_strategy_decision' এর লজিক সিমুকেট করছি:
            # উদাহরনস্বরূপ: 'Balanced' মোডে স্কোর >= 4 হলে বাই।
            
            # লেটেন্সি কমানোর জন্য আমরা এখানে সিম্পল লজিক ব্যবহার করছি যা SignalEngine এর অনুরূপ:
            score = 0
            if current_candle['close'] > current_candle.get('EMA_20', 0): score += 1
            if current_candle.get('RSI_14', 50) < 30: score += 2 # Oversold Buy
            if current_candle.get('MACD_12_26_9', 0) > current_candle.get('MACDs_12_26_9', 0): score += 1
            if current_candle['close'] > current_candle.get('VWAP', 0): score += 1
            
            # ফেজ ডিটেকশন (TechnicalIndicators ইতিমধ্যে করে দিয়েছে)
            phase = current_candle.get('Market_Phase', 'Consolidation')
            
            # Strategy Decision
            # আমরা সাময়িক ভাবে result অবজেক্ট তৈরি করছি StrategyManager এর জন্য
            mock_result = {"score": score, "verdict": "BUY" if score > 0 else "SELL"}
            decision = strategy_manager.get_strategy_decision(mock_result, phase)
            
            # --- ট্রেড এক্সিকিউশন লজিক ---
            if position is None:
                # এন্ট্রি রুল
                if decision['should_trade'] and decision['final_verdict'] in ["BUY", "STRONG BUY"]:
                    amount = (balance * 0.95) / price # ৯৫% ব্যালেন্স দিয়ে কিনব
                    position = {"entry_price": price, "amount": amount, "entry_time": timestamp}
                    print(f"🟢 BUY at {price:.2f} [{timestamp}] | Mode: {decision['strategy']}")
            
            else:
                # এক্সিট রুল (Simple: Profit > 1% or Loss > 0.5% or Sell Signal)
                pnl_pct = (price - position['entry_price']) / position['entry_price'] * 100
                
                # যদি সেল সিগন্যাল আসে অথবা স্টপ লস হিট করে
                is_sell_signal = score <= -2 # সিম্পল সেল কন্ডিশন
                
                if is_sell_signal or pnl_pct > 2.0 or pnl_pct < -1.0:
                    balance = position['amount'] * price
                    profit = balance - (position['amount'] * position['entry_price'])
                    is_win = profit > 0
                    
                    trades.append({
                        "entry_time": position['entry_time'],
                        "exit_time": timestamp,
                        "entry_price": position['entry_price'],
                        "exit_price": price,
                        "profit_usdt": profit,
                        "profit_pct": pnl_pct,
                        "strategy": strategy_mode
                    })
                    
                    if is_win: wins += 1
                    total_trades += 1
                    position = None # পজিশন ক্লোজ
                    print(f"🔴 SELL at {price:.2f} [{timestamp}] | PnL: {profit:.2f}$ ({pnl_pct:.2f}%)")

        # ৪. রিপোর্ট জেনারেশন
        report_data = {
            "symbol": symbol,
            "strategy": strategy_mode,
            "total_trades": total_trades,
            "win_rate": (wins / total_trades * 100) if total_trades > 0 else 0,
            "final_balance": balance,
            "net_profit": balance - 1000
        }

        # CSV সেভ করা
        filename = f"{self.report_dir}/Report_{symbol.replace('/','-')}_{timeframe}_{strategy_mode}.csv"
        if trades:
            pd.DataFrame(trades).to_csv(filename, index=False)
            report_data['report_file'] = filename
            print(f"📝 Report saved to {filename}")
        else:
            print("⚠️ No trades generated.")

        return report_data

backtest_engine = BacktestEngine()
