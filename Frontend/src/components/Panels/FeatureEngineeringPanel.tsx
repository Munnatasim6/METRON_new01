import React, { useEffect, useState } from 'react';
import { RefreshCw, Activity, Layers, TrendingUp, AlertTriangle } from 'lucide-react';
import { fetchMarketAnalysis } from '../../services/api/marketApi';
import { MarketData } from '../../types';

const FeatureEngineeringPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [phase, setPhase] = useState<string>('Unknown');

  // ডাটা লোড ফাংশন
  const loadData = async () => {
    setLoading(true);
    const result = await fetchMarketAnalysis('1H'); // ডিফল্ট ১ ঘন্টার চার্ট
    if (result && result.data && result.data.length > 0) {
      // লেটেস্ট ক্যান্ডেল ডাটা নেওয়া
      const latest = result.data[result.data.length - 1];
      setMarketData(latest);
      setPhase(result.current_phase || latest.market_phase || 'Unknown');
    }
    setLoading(false);
  };

  // প্রথম লোড এবং অটো রিফ্রেশ (Optional)
  useEffect(() => {
    loadData();
    // লাইভ আপডেটের জন্য সকেট কানেকশন এখানে ইন্টিগ্রেট করা হবে পরে
  }, []);

  // ফেজ অনুযায়ী কালার নির্ধারণ
  const getPhaseColor = (p: string) => {
    switch (p?.toLowerCase()) {
      case 'accumulation': return 'text-green-400 border-green-500/50 bg-green-500/10';
      case 'markup': return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
      case 'distribution': return 'text-red-400 border-red-500/50 bg-red-500/10';
      case 'markdown': return 'text-orange-400 border-orange-500/50 bg-orange-500/10';
      default: return 'text-gray-400 border-gray-600 bg-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/80">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <h2 className="font-semibold text-gray-100">Feature Engineering Lab</h2>
        </div>
        <button
          onClick={loadData}
          className={`p-2 rounded-lg hover:bg-gray-800 transition-colors ${loading ? 'animate-spin text-purple-500' : 'text-gray-400'}`}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* 1. Market Phase Card (The Brain's Main Output) */}
        <div className={`p-4 rounded-lg border ${getPhaseColor(phase)} transition-all duration-300`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-70">Detected Market Phase</p>
              <h3 className="text-2xl font-bold mt-1">{phase}</h3>
            </div>
            <Activity className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-xs opacity-60">
            Logic: VWAP + Smart Delta + Volatility Check
          </p>
        </div>

        {/* 2. Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* VWAP Status */}
          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            <div className="text-gray-400 text-xs mb-1">VWAP Deviation</div>
            <div className={`text-lg font-mono font-medium ${marketData && marketData.close > (marketData.vwap || 0) ? 'text-green-400' : 'text-red-400'}`}>
              {marketData?.vwap ? marketData.vwap.toFixed(2) : '---'}
            </div>
          </div>

          {/* Smart Delta */}
          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            <div className="text-gray-400 text-xs mb-1">Smart Delta (Vol)</div>
            <div className={`text-lg font-mono font-medium ${marketData && (marketData.smart_delta || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {marketData?.smart_delta ? (marketData.smart_delta / 1000).toFixed(1) + 'K' : '---'}
            </div>
          </div>
        </div>

        {/* 3. Advanced Indicators Status */}
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-800">
          <h4 className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" /> TECHNICAL SIGNALS (Subset of 70)
          </h4>

          <div className="space-y-2">
            {/* RSI */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">RSI (14)</span>
              <span className={`font-mono ${(marketData?.rsi_14 || 50) > 70 ? 'text-red-400' :
                  (marketData?.rsi_14 || 50) < 30 ? 'text-green-400' : 'text-gray-300'
                }`}>
                {marketData?.rsi_14?.toFixed(2) || 'N/A'}
              </span>
            </div>

            {/* ADX Trend Strength */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Trend Strength (ADX)</span>
              <span className="font-mono text-gray-300">
                {marketData?.adx_14?.toFixed(2) || 'N/A'}
              </span>
            </div>

            {/* EMA Trend Check */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Major Trend (EMA 200)</span>
              <span className={`font-mono ${marketData && marketData.close > (marketData.ema_200 || 0) ? 'text-green-400' : 'text-red-400'}`}>
                {marketData && marketData.close > (marketData.ema_200 || 0) ? 'BULLISH' : 'BEARISH'}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Alerts / Warnings */}
        {(marketData?.smart_delta && marketData.smart_delta > 0 && marketData.close < marketData.open) && (
          <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg flex gap-2 items-start">
            <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-orange-400">Hidden Buying Detected</h5>
              <p className="text-[10px] text-gray-400">Price dropped but Net Volume (Delta) is positive.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FeatureEngineeringPanel;
