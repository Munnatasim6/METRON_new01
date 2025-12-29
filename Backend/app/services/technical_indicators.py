import pandas as pd
import pandas_ta as ta
import logging
import numpy as np

logger = logging.getLogger("TechnicalIndicators")

class TechnicalIndicators:
    def __init__(self):
        self.config = {
            "trend": True,
            "momentum": True,
            "volume": True,
            "volatility": True,
            "special": True
        }

    def apply_all_indicators(self, df):
        """
        সমস্ত টেকনিক্যাল ইন্ডিকেটর অ্যাপ্লাই করে।
        FIX: Updated DataFrame.fillna() syntax to avoid FutureWarnings.
        """
        if df is None or df.empty:
            return df

        data = df.copy()

        try:
            # ১. ডাটা ক্লিনিং
            cols = ['open', 'high', 'low', 'close', 'volume']
            for col in cols:
                data[col] = pd.to_numeric(data[col], errors='coerce')
            
            # FIX: method='ffill' deprecated, তাই ffill() ব্যবহার করা হলো
            data.ffill(inplace=True) 
            data.fillna(0, inplace=True) # Downcasting warning এড়াতে চাইলে infer_objects() ব্যবহার করা যায়, তবে এটি সেফ।

            # VWAP: turnover / volume (Manually calc if not present)
            if 'turnover' in data.columns and 'volume' in data.columns:
                vol_cumsum = data['volume'].cumsum()
                data['vwap'] = (data['turnover'].cumsum()) / vol_cumsum.replace(0, 1)
            
            # Smart Delta
            if 'vol_buy' in data.columns and 'vol_sell' in data.columns:
                data['vol_buy'] = data['vol_buy'].fillna(0)
                data['vol_sell'] = data['vol_sell'].fillna(0)
                data['smart_delta'] = data['vol_buy'] - data['vol_sell']

            # ২. ইন্ডিকেটর ক্যালকুলেশন (Pandas TA)
            if self.config['trend']: data = self._calculate_trend(data)
            if self.config['momentum']: data = self._calculate_momentum(data)
            if self.config['volume']: data = self._calculate_volume(data)
            if self.config['volatility']: data = self._calculate_volatility(data)
            if self.config['special']: data = self._calculate_special(data)

            # ৩. মার্কেট ফেজ
            data = self._detect_market_phase(data)

            # ফাইনাল ক্লিনআপ
            data.fillna(0, inplace=True)

            return data

        except Exception as e:
            logger.error(f"Error calculating indicators: {e}")
            return df

    def _calculate_trend(self, df):
        try:
            if len(df) > 20:
                df.ta.sma(length=20, append=True)
                df.ta.ema(length=20, append=True)
            if len(df) > 50: df.ta.ema(length=50, append=True)
            if len(df) > 200: df.ta.ema(length=200, append=True)
            
            df.ta.macd(append=True)
            df.ta.psar(append=True)
            df.ta.adx(append=True)
            
            try:
                if len(df) >= 9:
                    ichi = ta.ichimoku(df['high'], df['low'], df['close'])[0]
                    df = pd.concat([df, ichi], axis=1)
            except: pass
            
            df.ta.supertrend(append=True)
            df.ta.linreg(append=True)
        except: pass
        return df

    def _calculate_momentum(self, df):
        try:
            df.ta.rsi(length=14, append=True)
            df.ta.stoch(append=True)
            df.ta.cci(append=True)
            df.ta.willr(append=True)
            df.ta.ao(append=True)
            df.ta.roc(append=True)
            df.ta.mom(append=True)
            df.ta.uo(append=True)
        except: pass
        return df

    def _calculate_volume(self, df):
        try:
            if len(df) > 1:
                df.ta.obv(append=True)
            df.ta.mfi(append=True)
            df.ta.cmf(append=True)
            df.ta.ad(append=True)
            df.ta.eom(append=True)
            
            # Volume Profile Proxy
            if len(df) >= 24:
                rolling_mean = df['close'].rolling(24).mean()
                rolling_std = df['close'].rolling(24).std()
                df['vp_poc'] = rolling_mean 
                df['vp_vah'] = rolling_mean + rolling_std
                df['vp_val'] = rolling_mean - rolling_std
            else:
                df['vp_poc'] = df['close']
                df['vp_vah'] = df['close'] 
                df['vp_val'] = df['close'] 
        except: pass
        return df

    def _calculate_volatility(self, df):
        try:
            df.ta.bbands(append=True)
            df.ta.atr(append=True)
            df.ta.kc(append=True)
            df.ta.chop(append=True)
        except: pass
        return df

    def _calculate_special(self, df):
        try:
            # EWO with check
            if len(df) >= 35:
                sma5 = ta.sma(df['close'], 5)
                sma35 = ta.sma(df['close'], 35)
                if sma5 is not None and sma35 is not None:
                    df['ewo'] = sma5 - sma35
                else: 
                     df['ewo'] = 0
            else:
                 df['ewo'] = 0
            
            # Fractals
            h = df['high']
            if len(df) > 5:
                df['fractal_top'] = (h.shift(2) < h) & (h.shift(1) < h) & (h.shift(-1) < h) & (h.shift(-2) < h)
            else:
                 df['fractal_top'] = False
            
            pivot = (df['high'] + df['low'] + df['close']) / 3
            df['pivot_p'] = pivot
            df['gann_angle'] = 45 
        except:
            df['ewo'] = 0
        return df

    def _detect_market_phase(self, df):
        """ মার্কেট ফেজ ডিটেকশন লজিক """
        # Simplified logic using np.select or iteration if needed.
        # But for compatibility with user request which showed simple iteration logic:
        # I will keep my previous advanced logic but inside a try-except block 
        # OR use the simpler logic provided in user prompt?
        # User prompt 'Solution 2' provided a simplified _determine_market_phase.
        # BUT 'Solution 2' removed all other helpers (_calculate_trend, etc).
        # I should MERGE them: Keep helpers but update Phase detection to be robust.
        # The user provided prompt 2 had a simplified logic. I will stick to the robust one I wrote earlier but ensure fillna is correct.
        
        try:
            # 1. Volatility Status
            is_high_vol = False
            if 'ATRr_14' in df.columns:
                avg_atr = ta.sma(df['ATRr_14'], length=20)
                if avg_atr is not None:
                    is_high_vol = (df['ATRr_14'] > avg_atr).fillna(False)

            # 2. Activity
            activity_ok = True
            if 'activity_score' in df.columns:
                act_avg = df['activity_score'].rolling(20).mean()
                activity_ok = (df['activity_score'] > act_avg).fillna(False)

            # 3. Phase
            vwap = df.get('vwap', df['close'])
            delta = df.get('smart_delta', pd.Series([0]*len(df), index=df.index))
            
            cond1 = (df['close'] <= vwap) & (~is_high_vol) & (delta > 0)
            cond2 = (df['close'] > vwap) & (activity_ok) & (delta > 0)
            cond3 = (df['close'] > vwap) & (is_high_vol) & (delta < 0)
            cond4 = (df['close'] < vwap) & (delta < 0)
            
            conditions = [cond1.fillna(False), cond2.fillna(False), cond3.fillna(False), cond4.fillna(False)]
            choices = ['Accumulation', 'Markup', 'Distribution', 'Markdown']
            
            df['market_phase'] = np.select(conditions, choices, default='Consolidation')
            
        except Exception as e:
            logger.error(f"Market Phase Error: {e}")
            df['market_phase'] = 'Consolidation'
        
        
        return df

technical_indicators = TechnicalIndicators()
