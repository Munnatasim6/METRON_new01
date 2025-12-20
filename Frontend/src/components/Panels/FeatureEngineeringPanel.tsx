import React, { useState } from 'react';
import {
  Binary,
  GitMerge,
  LineChart as LineChartIcon,
  FunctionSquare,
  Scan,
  Network,
  Activity,
  CalendarClock,
  Percent,
  Scissors,
  Check,
  Settings2,
  Sigma,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from 'recharts';

const FeatureEngineeringPanel: React.FC = () => {
  const [activeNorm, setActiveNorm] = useState<'MinMax' | 'Z-Score' | 'Log'>('MinMax');
  const [splitRatio, setSplitRatio] = useState(80);

  // Mock Data for Normalization Visualization
  const rawData = [
    { name: 'T1', raw: 42000, scaled: 0.1 },
    { name: 'T2', raw: 43500, scaled: 0.4 },
    { name: 'T3', raw: 41000, scaled: 0.05 },
    { name: 'T4', raw: 45000, scaled: 0.8 },
    { name: 'T5', raw: 44200, scaled: 0.6 },
    { name: 'T6', raw: 46000, scaled: 0.95 },
    { name: 'T7', raw: 43000, scaled: 0.35 },
  ];

  // Mock Correlation Matrix Data
  const correlationData = [
    { x: 1, y: 1, z: 1 },
    { x: 1, y: 2, z: 0.85 },
    { x: 1, y: 3, z: -0.4 },
    { x: 2, y: 1, z: 0.85 },
    { x: 2, y: 2, z: 1 },
    { x: 2, y: 3, z: 0.1 },
    { x: 3, y: 1, z: -0.4 },
    { x: 3, y: 2, z: 0.1 },
    { x: 3, y: 3, z: 1 },
  ];
  const axisLabels = ['BTC', 'ETH', 'USDT.D'];

  return (
    <div className='p-6 space-y-6 animate-fade-in h-full overflow-y-auto custom-scrollbar'>
      {/* HEADER */}
      <div className='flex items-center justify-between border-b border-gray-800 pb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-purple-500/10 rounded-lg'>
            <Binary className='text-purple-400' size={24} />
          </div>
          <div>
            <h2 className='text-xl font-bold font-mono text-white'>FEATURE ENGINEERING LAB</h2>
            <p className='text-xs text-gray-500 font-mono'>
              Phase 3: Signal Extraction & Data Transformation
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded border border-gray-800 font-mono text-xs'>
          <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></span>
          <span className='text-gray-400'>PIPELINE STATUS:</span>
          <span className='text-green-400 font-bold'>OPTIMIZED</span>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
        {/* 1. DATA NORMALIZATION & SCALING */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg'>
          <div className='flex justify-between items-start mb-4'>
            <h3 className='font-bold text-gray-300 flex items-center gap-2'>
              <Sigma size={16} className='text-blue-400' /> 1. Data Scaling
            </h3>
            <div className='flex bg-gray-900 rounded p-1 border border-gray-800'>
              {['MinMax', 'Z-Score', 'Log'].map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveNorm(m as any)}
                  className={`px-2 py-0.5 text-[10px] rounded transition-colors ${activeNorm === m ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className='h-40 w-full relative'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={rawData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
                <XAxis dataKey='name' hide />
                <YAxis
                  yAxisId='left'
                  stroke='#6b7280'
                  fontSize={10}
                  domain={['auto', 'auto']}
                  hide
                />
                <YAxis
                  yAxisId='right'
                  orientation='right'
                  stroke='#60a5fa'
                  fontSize={10}
                  domain={[0, 1]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    fontSize: '10px',
                  }}
                />
                <Line
                  yAxisId='left'
                  type='monotone'
                  dataKey='raw'
                  stroke='#4b5563'
                  strokeDasharray='3 3'
                  dot={false}
                  strokeWidth={1}
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='scaled'
                  stroke='#3b82f6'
                  dot={{ r: 2 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className='absolute top-2 left-2 text-[10px] text-gray-500 font-mono'>
              Gray: Raw Price | Blue: Scaled (0-1)
            </div>
          </div>
        </div>

        {/* 2. TIMEFRAME CONVERSION */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg'>
          <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
            <GitMerge size={16} className='text-orange-400' /> 2. Resampling & Timeframe
          </h3>
          <div className='space-y-3'>
            <div className='flex justify-between items-center p-2 bg-black/20 rounded border border-gray-800'>
              <div className='flex flex-col'>
                <span className='text-xs font-bold text-gray-300'>Base Source: 1-Minute</span>
                <span className='text-[10px] text-gray-500'>Raw OHLCV Stream</span>
              </div>
              <Activity size={14} className='text-green-500 animate-pulse' />
            </div>
            <div className='grid grid-cols-3 gap-2 text-center'>
              {['5m', '15m', '1H', '4H', '1D'].map((tf) => (
                <div
                  key={tf}
                  className='bg-gray-800/50 border border-gray-700 rounded p-2 flex flex-col items-center'
                >
                  <span className='text-xs font-mono font-bold text-white'>{tf}</span>
                  <span className='text-[8px] text-gray-500 mt-1'>Aggregated</span>
                </div>
              ))}
              <div className='bg-gray-800/50 border border-gray-700 rounded p-2 flex flex-col items-center opacity-50'>
                <span className='text-xs font-mono font-bold text-gray-400'>Custom</span>
                <span className='text-[8px] text-gray-500 mt-1'>N/A</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 & 4. TECHNICAL INDICATORS */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg'>
          <div className='flex justify-between items-start mb-2'>
            <h3 className='font-bold text-gray-300 flex items-center gap-2'>
              <LineChartIcon size={16} className='text-green-400' /> 3-4. Indicators (Std & Custom)
            </h3>
          </div>
          <div className='space-y-2 overflow-y-auto max-h-40 custom-scrollbar pr-2'>
            {[
              { name: 'RSI (14)', val: '42.5', type: 'std', status: 'neutral' },
              { name: 'MACD (12,26,9)', val: '-12.4', type: 'std', status: 'bearish' },
              { name: 'Bollinger Bands', val: 'Width: 2.1', type: 'std', status: 'volatility' },
              { name: 'VWAP (Session)', val: '$44,205', type: 'custom', status: 'bullish' },
              { name: 'Delta Divergence', val: '+450K', type: 'custom', status: 'bullish' },
            ].map((ind, i) => (
              <div
                key={i}
                className='flex justify-between items-center p-2 rounded bg-gray-800/30 border border-gray-800 hover:bg-gray-800 transition-colors'
              >
                <div className='flex items-center gap-2'>
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${ind.type === 'custom' ? 'bg-purple-500' : 'bg-blue-500'}`}
                  />
                  <span className='text-xs font-mono text-gray-300'>{ind.name}</span>
                </div>
                <div className='text-right'>
                  <span className='block text-xs font-bold text-white'>{ind.val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. PATTERN RECOGNITION */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg'>
          <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
            <Scan size={16} className='text-red-400' /> 5. Candle Patterns
          </h3>
          <div className='grid grid-cols-2 gap-3'>
            <div className='p-3 bg-red-900/10 border border-red-500/20 rounded flex flex-col'>
              <span className='text-[10px] text-gray-400 uppercase font-mono'>Latest Detected</span>
              <span className='text-sm font-bold text-red-400 mt-1'>Bearish Engulfing</span>
              <span className='text-[10px] text-gray-500 mt-2'>Conf: 88% | Time: 14:05</span>
            </div>
            <div className='p-3 bg-green-900/10 border border-green-500/20 rounded flex flex-col opacity-60'>
              <span className='text-[10px] text-gray-400 uppercase font-mono'>Previous</span>
              <span className='text-sm font-bold text-green-400 mt-1'>Hammer</span>
              <span className='text-[10px] text-gray-500 mt-2'>Conf: 72% | Time: 13:45</span>
            </div>
          </div>
          <div className='mt-3'>
            <div className='text-[10px] text-gray-500 mb-1'>Active Scanners</div>
            <div className='flex gap-1 flex-wrap'>
              {['Doji', 'Shooting Star', 'Morning Star', '3 Soldiers'].map((p) => (
                <span
                  key={p}
                  className='px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-[9px] border border-gray-700'
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 6. CORRELATION MATRIX */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg lg:col-span-1'>
          <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
            <Network size={16} className='text-yellow-400' /> 6. Asset Correlation
          </h3>
          <div className='h-40 w-full flex items-center justify-center'>
            <ResponsiveContainer width='100%' height='100%'>
              <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis type='number' dataKey='x' name='Asset A' hide domain={[0, 4]} />
                <YAxis type='number' dataKey='y' name='Asset B' hide domain={[0, 4]} />
                <ZAxis type='number' dataKey='z' range={[50, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className='bg-gray-900 border border-gray-700 p-2 text-xs font-mono rounded'>
                          {axisLabels[d.x - 1]} vs {axisLabels[d.y - 1]}:{' '}
                          <span className={d.z > 0 ? 'text-green-400' : 'text-red-400'}>{d.z}</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={correlationData} shape='square'>
                  {correlationData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.z === 1 ? '#374151' : entry.z > 0 ? '#4ade80' : '#f87171'}
                      fillOpacity={Math.abs(entry.z)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className='flex justify-between px-6 text-[10px] font-mono text-gray-500'>
            {axisLabels.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>

        {/* 7. VOLATILITY ANALYSIS (ATR) */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg'>
          <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
            <Activity size={16} className='text-pink-400' /> 7. Volatility (ATR)
          </h3>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between text-xs text-gray-400 mb-1 font-mono'>
                <span>Current Volatility Regime</span>
                <span className='text-pink-400 font-bold'>HIGH (82/100)</span>
              </div>
              <div className='w-full h-2 bg-gray-800 rounded-full overflow-hidden'>
                <div className='h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 w-[82%]'></div>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-gray-800/50 p-2 rounded border border-gray-700'>
                <span className='block text-[9px] text-gray-500 uppercase'>ATR (14)</span>
                <span className='block text-lg font-bold text-white'>$1,240</span>
              </div>
              <div className='bg-gray-800/50 p-2 rounded border border-gray-700'>
                <span className='block text-[9px] text-gray-500 uppercase'>
                  Bollinger Bandwidth
                </span>
                <span className='block text-lg font-bold text-white'>0.08</span>
              </div>
            </div>
          </div>
        </div>

        {/* 8. SEASONALITY */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg'>
          <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
            <CalendarClock size={16} className='text-teal-400' /> 8. Seasonality
          </h3>
          <div className='flex items-center gap-4'>
            <div className='text-center p-2 bg-gray-800 rounded border border-gray-700 min-w-[80px]'>
              <div className='text-[10px] text-gray-500'>Current Hour</div>
              <div className='text-2xl font-bold text-white'>14:00</div>
              <div className='text-[9px] text-green-400 mt-1'>Historically Bullish</div>
            </div>
            <div className='flex-1 space-y-2'>
              <div className='flex justify-between text-xs text-gray-400'>
                <span>Day of Week (Tuesday)</span>
                <span className='text-red-400'>-0.5% Exp</span>
              </div>
              <div className='flex justify-between text-xs text-gray-400'>
                <span>Month (December)</span>
                <span className='text-green-400'>+5.2% Exp</span>
              </div>
            </div>
          </div>
        </div>

        {/* 9. FUNDING RATES */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg'>
          <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
            <Percent size={16} className='text-yellow-200' /> 9. Futures Funding
          </h3>
          <table className='w-full text-left font-mono text-xs'>
            <thead>
              <tr className='text-gray-500 border-b border-gray-800'>
                <th className='pb-2'>Pair</th>
                <th className='pb-2'>Rate (8h)</th>
                <th className='pb-2 text-right'>Pred.</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-800'>
              {[
                { p: 'BTC-PERP', r: '0.0100%', pred: 'Up' },
                { p: 'ETH-PERP', r: '0.0125%', pred: 'Stable' },
                { p: 'SOL-PERP', r: '-0.005%', pred: 'Down' },
              ].map((row, i) => (
                <tr key={i} className='hover:bg-gray-800/30'>
                  <td className='py-2 text-gray-300'>{row.p}</td>
                  <td
                    className={`py-2 ${row.r.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}
                  >
                    {row.r}
                  </td>
                  <td className='py-2 text-right text-gray-500'>{row.pred}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 10. TRAIN / TEST SPLIT */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg lg:col-span-1'>
          <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
            <Scissors size={16} className='text-gray-400' /> 10. Dataset Splitting
          </h3>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between text-xs font-mono text-gray-400 mb-2'>
                <span>Train Set: {splitRatio}%</span>
                <span>Test Set: {100 - splitRatio}%</span>
              </div>
              <input
                type='range'
                min='50'
                max='95'
                value={splitRatio}
                onChange={(e) => setSplitRatio(parseInt(e.target.value))}
                className='w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-blue'
              />
            </div>
            <div className='flex gap-2 text-[10px] font-mono justify-between'>
              <div className='flex flex-col items-center p-2 bg-gray-800 rounded border border-gray-700 w-1/3'>
                <span className='text-gray-500'>Rows</span>
                <span className='text-white font-bold'>1,450,200</span>
              </div>
              <div className='flex flex-col items-center p-2 bg-gray-800 rounded border border-gray-700 w-1/3'>
                <span className='text-gray-500'>Features</span>
                <span className='text-white font-bold'>48</span>
              </div>
              <div className='flex flex-col items-center p-2 bg-gray-800 rounded border border-gray-700 w-1/3'>
                <span className='text-gray-500'>Lookback</span>
                <span className='text-white font-bold'>120</span>
              </div>
            </div>
            <button className='w-full py-2 mt-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded border border-gray-700 flex items-center justify-center gap-2 transition-colors'>
              <Settings2 size={12} /> RE-SHUFFLE DATASET
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureEngineeringPanel;
