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

    def calculate_metrics(self, trades, initial_balance, final_balance, equity_curve):
        """Advanced Metrics Calculation"""
        if not trades:
            return {
                "total_trades": 0,
                "win_rate": 0,
                "profit_factor": 0,
                "max_drawdown": 0,
                "sharpe_ratio": 0,
                "net_profit": 0,
                "final_balance": initial_balance
            }

        df_trades = pd.DataFrame(trades)
        wins = df_trades[df_trades['profit_usdt'] > 0]
        losses = df_trades[df_trades['profit_usdt'] <= 0]
        
        # Win Rate
        win_rate = float((len(wins) / len(trades)) * 100)

        # Profit Factor
        gross_profit = float(wins['profit_usdt'].sum())
        gross_loss = abs(float(losses['profit_usdt'].sum()))
        profit_factor = float(round(gross_profit / gross_loss, 2)) if gross_loss > 0 else 99.99

        # Max Drawdown & Sharpe Calculation using Equity Curve
        equity_series = pd.Series([x['balance'] for x in equity_curve])
        
        # Drawdown
        rolling_max = equity_series.cummax()
        drawdown = (equity_series - rolling_max) / rolling_max * 100
        max_drawdown = float(abs(drawdown.min()))

        # Sharpe Ratio (Simplified: using daily returns assumption for granularity)
        returns = equity_series.pct_change().dropna()
        if len(returns) > 1 and returns.std() > 0:
            sharpe_ratio = float((returns.mean() / returns.std()) * (252**0.5)) # Annualized
        else:
            sharpe_ratio = 0.0

        return {
            "total_trades": int(len(trades)),
            "win_rate": round(win_rate, 2),
            "profit_factor": profit_factor,
            "max_drawdown": round(max_drawdown, 2),
            "sharpe_ratio": round(sharpe_ratio, 2),
            "net_profit": round(float(final_balance - initial_balance), 2),
            "final_balance": round(float(final_balance), 2)
        }

    async def run_backtest(self, exchange, symbol, timeframe, limit, strategy_mode, initial_balance=1000, fee_percent=0.1, slippage_percent=0.0):
        """
        Main Backtest Loop with Advanced Features
        """
        # ১. ডাটা আনা
        df = await self.fetch_historical_data(exchange, symbol, timeframe, limit)
        if df is None:
            return {"status": "error", "message": "Failed to fetch data"}

        # ২. টেকনিক্যাল ইন্ডিকেটর ক্যালকুলেশন
        print(f"⚙️ Calculating Indicators for {symbol}...")
        df_analyzed = technical_indicators.apply_all_indicators(df)
        
        # ৩. সিমুলেশন লুপ ভেরিয়েবল
        trades = []
        balance = initial_balance
        equity_curve = [{"time": df_analyzed.iloc[0]['timestamp'], "balance": balance}]
        
        position = None # { "entry_price": 100, "amount": 10, "type": "BUY" }
        
        print(f"🚀 Running Simulation: Modes={strategy_mode} | Fee={fee_percent}% | Slippage={slippage_percent}%")
        
        # ৫০তম ক্যান্ডেল থেকে শুরু (Indicator Warmup)
        for i in range(50, len(df_analyzed)):
            current_candle = df_analyzed.iloc[i]
            price = current_candle['close']
            timestamp = current_candle['datetime'] # Timestamp অবজেক্ট
            ts_str = str(timestamp)
            
            # --- SIGNAL MOCKING (Strategy Logic) ---
            # রিয়েল টাইম Signal Engine এর লজিক এখানে ইমুলেট করা হচ্ছে
            score = 0
            # Simple Logic for Demonstration (Replace with rigorous Signal Engine calls if needed)
            if current_candle['close'] > current_candle.get('EMA_20', 0): score += 1
            if current_candle.get('RSI_14', 50) < 30: score += 2 # Oversold Buy
            if current_candle.get('MACD_12_26_9', 0) > current_candle.get('MACDs_12_26_9', 0): score += 1
            if current_candle['close'] > current_candle.get('VWAP', 0): score += 1
            
            # Phase Detection
            phase = current_candle.get('Market_Phase', 'Consolidation')
            
            mock_result = {"score": score, "verdict": "BUY" if score > 0 else "SELL"}
            decision = strategy_manager.get_strategy_decision(mock_result, phase)
            
            # --- TRADE EXECUTION ---
            if position is None:
                # ENTRY CHECK
                if decision['should_trade'] and decision['final_verdict'] in ["BUY", "STRONG BUY"]:
                    # Slippage Apply
                    entry_price = price * (1 + slippage_percent/100)
                    
                    # Fee Calculation (Entry)
                    usable_balance = balance * 0.95 # রিস্ক ম্যানেজমেন্টের জন্য ৫% বাফার
                    fee = usable_balance * (fee_percent/100)
                    net_investment = usable_balance - fee
                    
                    amount = net_investment / entry_price
                    
                    position = {
                        "entry_price": entry_price, 
                        "amount": amount, 
                        "entry_time": ts_str,
                        "entry_fee": fee
                    }
                    balance -= usable_balance # ব্যালেন্স থেকে টাকা পজিশনে গেল
                    # Equity stays same at entry moment roughly, but fees deducted
                    # print(f"🟢 BUY at {entry_price:.2f}")

            else:
                # EXIT CHECK
                current_value = position['amount'] * price
                entry_val = position['amount'] * position['entry_price']
                raw_pnl_pct = (current_value - entry_val) / entry_val * 100
                
                # Sell Signal or SL/TP
                is_sell_signal = score <= -2
                
                if is_sell_signal or raw_pnl_pct > 2.0 or raw_pnl_pct < -1.0:
                    # Slippage on Exit
                    exit_price = price * (1 - slippage_percent/100)
                    
                    gross_return = position['amount'] * exit_price
                    exit_fee = gross_return * (fee_percent/100)
                    net_return = gross_return - exit_fee
                    
                    # ক্যাশ ব্যাক পাওয়া গেল
                    balance += net_return # অবশিষ্ট ক্যাশের সাথে যোগ
                    
                    # Profit Calc
                    total_fee = position['entry_fee'] + exit_fee
                    net_profit = net_return - (position['amount'] * position['entry_price']) - position['entry_fee'] # Actually balance change is exact profit
                    
                    # Accurate Balance Delta Check:
                    # Old Balance (before Buy) -> New Balance (after Sell)
                    # Profit = New Balance - Old Balance
                    
                    trades.append({
                        "entry_time": position['entry_time'],
                        "exit_time": ts_str,
                        "entry_price": position['entry_price'],
                        "exit_price": exit_price,
                        "profit_usdt": net_profit, # This might be slight approx, better to diff balance
                        "profit_pct": raw_pnl_pct, # Raw Price move
                        "fees_paid": total_fee,
                        "strategy": strategy_mode
                    })
                    
                    # print(f"🔴 SELL at {exit_price:.2f} | PnL: {net_profit:.2f}")
                    position = None

            # --- EQUITY CURVE UPDATE ---
            # প্রতি ক্যান্ডেলে বর্তমান পোর্টফোলিও ভ্যালু
            current_equity = balance
            if position:
                # যদি পজিশন থাকে, তার বর্তমান ভ্যালু যোগ হবে
                current_equity += (position['amount'] * price)
            
            equity_curve.append({
                "time": int(current_candle['timestamp']), # JS এর জন্য মিলিসেকেন্ড
                "balance": round(current_equity, 2)
            })

        # ৪. ক্যালকুলেশন এবং রেসপন্স
        metrics = self.calculate_metrics(trades, initial_balance, balance, equity_curve)
        
        # ৫. ফাইল সেভ (ঐচ্ছিক, ডিবাগিংয়ের জন্য)
        if trades:
            filename = f"{self.report_dir}/Sim_{symbol.replace('/','-')}_{timeframe}.csv"
            pd.DataFrame(trades).to_csv(filename, index=False)

        # Sanitizing Data for JSON serialization (fixing numpy errors)
        candles_df = df_analyzed[['timestamp', 'open', 'high', 'low', 'close']].tail(500).copy()
        candles_df['timestamp'] = candles_df['timestamp'].apply(int) 
        for col in ['open', 'high', 'low', 'close']:
            candles_df[col] = candles_df[col].apply(float)
        
        candles_list = candles_df.to_dict(orient='records')
        
        # Sanitizing trades list (fixing numpy scalars from pandas iteration)
        sanitized_trades = []
        for t in trades:
            sanitized_trades.append({
                "entry_time": str(t['entry_time']),
                "exit_time": str(t['exit_time']),
                "entry_price": float(t['entry_price']),
                "exit_price": float(t['exit_price']),
                "profit_usdt": float(t['profit_usdt']),
                "profit_pct": float(t['profit_pct']),
                "fees_paid": float(t.get('fees_paid', 0.0)),
                "strategy": str(t['strategy'])
            })

        # Sanitizing equity curve
        sanitized_equity_curve = [{"time": int(x['time']), "balance": float(x['balance'])} for x in equity_curve]

        return {
            "status": "success",
            "symbol": symbol,
            "metrics": metrics,
            "trades": sanitized_trades, 
            "equity_curve": sanitized_equity_curve, 
            "candles": candles_list
        }

backtest_engine = BacktestEngine()
