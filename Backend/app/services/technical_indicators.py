import pandas as pd
import pandas_ta as ta
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TechnicalIndicators")

class TechnicalIndicators:
    def __init__(self):
        self.config = {
            'trend': True,
            'momentum': True,
            'volume': True,
            'volatility': True,
            'special': True,
            'calc_hurst': True 
        }

    def apply_all_indicators(self, df):
        if df is None or df.empty:
            return df

        data = df.copy()

        # --- 1. Basic Preparations (LOWERCASE FIXES) ---
        # VWAP: turnover / volume
        if 'turnover' in data.columns and 'volume' in data.columns:
            data['vwap'] = (data['turnover'].cumsum()) / (data['volume'].cumsum())
        
        # Smart Delta
        if 'vol_buy' in data.columns and 'vol_sell' in data.columns:
            data['smart_delta'] = data['vol_buy'] - data['vol_sell']

        # --- 2. Indicators ---
        try:
            if self.config['trend']: data = self._calculate_trend(data)
            if self.config['momentum']: data = self._calculate_momentum(data)
            if self.config['volume']: data = self._calculate_volume(data)
            if self.config['volatility']: data = self._calculate_volatility(data)
            if self.config['special']: data = self._calculate_special(data)
            
            # --- 3. Market Phase ---
            data = self._detect_market_phase(data)
            
        except Exception as e:
            logger.error(f"Error calculating indicators: {e}")

        return data

    def _calculate_trend(self, df):
        # Using lowercase prefixes where possible or renaming later if needed
        df.ta.sma(length=20, append=True)
        df.ta.ema(length=20, append=True)
        df.ta.ema(length=50, append=True)
        df.ta.ema(length=200, append=True)
        df.ta.macd(append=True)
        df.ta.psar(append=True)
        df.ta.adx(append=True)
        try:
            ichi = ta.ichimoku(df['high'], df['low'], df['close'])[0]
            df = pd.concat([df, ichi], axis=1)
        except: pass
        df.ta.supertrend(append=True)
        df.ta.linreg(append=True)
        return df

    def _calculate_momentum(self, df):
        df.ta.rsi(length=14, append=True)
        df.ta.stoch(append=True)
        df.ta.cci(append=True)
        df.ta.willr(append=True)
        df.ta.ao(append=True)
        df.ta.roc(append=True)
        df.ta.mom(append=True)
        df.ta.uo(append=True)
        return df

    def _calculate_volume(self, df):
        df.ta.obv(append=True)
        df.ta.mfi(append=True)
        df.ta.cmf(append=True)
        df.ta.ad(append=True)
        df.ta.eom(append=True)
        # Volume Profile Proxy (Session)
        rolling_mean = df['close'].rolling(24).mean()
        rolling_std = df['close'].rolling(24).std()
        df['vp_poc'] = rolling_mean 
        df['vp_vah'] = rolling_mean + rolling_std
        df['vp_val'] = rolling_mean - rolling_std
        return df

    def _calculate_volatility(self, df):
        df.ta.bbands(append=True)
        df.ta.atr(append=True)
        df.ta.kc(append=True)
        df.ta.chop(append=True)
        return df

    def _calculate_special(self, df):
        # EWO
        df['ewo'] = ta.sma(df['close'], 5) - ta.sma(df['close'], 35)
        
        # Fractals
        h, l = df['high'], df['low']
        df['fractal_top'] = (h.shift(2) < h) & (h.shift(1) < h) & (h.shift(-1) < h) & (h.shift(-2) < h)
        
        # ZigZag / Pitchfork / Gann Support (Simplified Math)
        # We need to return specific keys for frontend
        pivot = (df['high'] + df['low'] + df['close']) / 3
        df['pivot_p'] = pivot
        df['gann_angle'] = 45 # Static placeholder logic for now
        
        return df

    def _detect_market_phase(self, df):
        """
        Calculates: market_phase (lowercase)
        """
        # 1. Volatility Status
        if 'ATRr_14' in df.columns:
            avg_atr = ta.sma(df['ATRr_14'], length=20)
            is_high_vol = df['ATRr_14'] > avg_atr
        else:
            is_high_vol = False
            
        # 2. Activity / Volume Support
        activity_ok = True
        if 'activity_score' in df.columns:
            act_avg = df['activity_score'].rolling(20).mean()
            activity_ok = df['activity_score'] > act_avg

        # 3. Phase Conditions
        vwap = df.get('vwap', df['close']) # checking lowercase vwap
        delta = df.get('smart_delta', 0)
        
        conditions = [
            (df['close'] <= vwap) & (~is_high_vol) & (delta > 0), # Accumulation
            (df['close'] > vwap) & (activity_ok) & (delta > 0),   # Markup
            (df['close'] > vwap) & (is_high_vol) & (delta < 0),   # Distribution
            (df['close'] < vwap) & (delta < 0)                    # Markdown
        ]
        choices = ['Accumulation', 'Markup', 'Distribution', 'Markdown']
        
        # FIX: Variable name strictly lowercase for Frontend JSON
        df['market_phase'] = np.select(conditions, choices, default='Consolidation')
        
        return df
