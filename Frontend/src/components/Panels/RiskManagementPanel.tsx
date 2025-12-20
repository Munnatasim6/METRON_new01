import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  Sliders,
  TrendingDown,
  Activity,
  Lock,
  PieChart as PieChartIcon,
  AlertTriangle,
  MoveDown,
  ArrowDownToLine,
  Scale,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
  Percent,
  Crosshair,
  Anchor,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
} from 'recharts';

type Tab = 'CAPITAL_GUARD' | 'ENTRY_CONTROLS' | 'EXIT_STRATEGY';

const RiskManagementPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('CAPITAL_GUARD');
  const [dailyLoss, setDailyLoss] = useState(1.2);
  const [drawdown, setDrawdown] = useState(3.5);
  const [leverage, setLeverage] = useState(5);

  // Mock Trade Simulation for Trailing Stop
  const [trailData, setTrailData] = useState<any[]>([]);

  useEffect(() => {
    // Simulate Trailing Stop Price Action
    const data = [];
    let price = 100;
    let stop = 95;
    for (let i = 0; i < 20; i++) {
      const change = Math.random() * 4 - 1.5; // Upward trend
      price += change;
      if (price - 5 > stop) stop = price - 5; // Trail by 5
      data.push({
        time: i,
        price: price,
        stop: stop,
        tp: 115,
      });
    }
    setTrailData(data);

    // Live Metrics Simulation
    const interval = setInterval(() => {
      setDailyLoss((prev) => Math.min(5, Math.max(0, prev + (Math.random() * 0.2 - 0.1))));
      setDrawdown((prev) => Math.min(10, Math.max(2, prev + (Math.random() * 0.1 - 0.05))));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const PIE_DATA = [
    { name: 'BTC', value: 40, color: '#f59e0b' },
    { name: 'ETH', value: 25, color: '#3b82f6' },
    { name: 'USDT', value: 20, color: '#1f2937' },
    { name: 'Alts', value: 15, color: '#a855f7' },
  ];

  return (
    <div className='p-6 h-full flex flex-col animate-fade-in bg-gray-950'>
      {/* HEADER */}
      <div className='shrink-0 mb-6'>
        <div className='flex items-center justify-between border-b border-gray-800 pb-4 mb-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-red-600/10 rounded-lg'>
              <ShieldAlert className='text-red-500' size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold font-mono text-white'>RISK MANAGEMENT ENGINE</h2>
              <p className='text-xs text-gray-500 font-mono'>
                Phase 7: Capital Preservation & Safety Protocols
              </p>
            </div>
          </div>

          <div className='flex bg-gray-900 rounded-lg p-1 border border-gray-800'>
            {['CAPITAL_GUARD', 'ENTRY_CONTROLS', 'EXIT_STRATEGY'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={`
                            px-4 py-2 rounded text-xs font-bold font-mono transition-all flex items-center gap-2
                            ${
                              activeTab === tab
                                ? 'bg-red-900/30 text-red-300 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                                : 'text-gray-500 hover:text-gray-300'
                            }
                        `}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto custom-scrollbar pr-2'>
        {/* --- TAB 1: CAPITAL GUARD --- */}
        {activeTab === 'CAPITAL_GUARD' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. DRAWDOWN & LOSS LIMITS */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-6'>
                <TrendingDown size={16} className='text-red-400' /> Drawdown & Daily Limits
              </h3>

              <div className='space-y-6'>
                {/* Daily Loss */}
                <div>
                  <div className='flex justify-between text-xs font-mono mb-2'>
                    <span className='text-gray-400'>Daily Loss Limit (Max 3%)</span>
                    <span
                      className={`${dailyLoss > 2.5 ? 'text-red-500 font-bold' : 'text-white'}`}
                    >
                      -{dailyLoss.toFixed(2)}%
                    </span>
                  </div>
                  <div className='w-full h-3 bg-gray-800 rounded-full overflow-hidden relative'>
                    <div className='absolute top-0 bottom-0 right-[25%] w-0.5 bg-red-500/50 z-10'></div>{' '}
                    {/* Limit Line */}
                    <div
                      className={`h-full transition-all duration-500 ${dailyLoss > 2 ? 'bg-red-500' : 'bg-orange-500'}`}
                      style={{ width: `${(dailyLoss / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Max Drawdown */}
                <div>
                  <div className='flex justify-between text-xs font-mono mb-2'>
                    <span className='text-gray-400'>Max Portfolio Drawdown (Hard Stop 10%)</span>
                    <span className='text-white'>-{drawdown.toFixed(2)}%</span>
                  </div>
                  <div className='w-full h-3 bg-gray-800 rounded-full overflow-hidden relative'>
                    <div className='absolute top-0 bottom-0 right-0 w-1 bg-red-600 z-10'></div>{' '}
                    {/* Hard Stop */}
                    <div
                      className='h-full bg-purple-600 transition-all duration-500'
                      style={{ width: `${(drawdown / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className='p-4 bg-red-900/10 border border-red-500/20 rounded flex items-start gap-3 mt-4'>
                  <Lock size={16} className='text-red-500 mt-0.5' />
                  <div>
                    <div className='text-sm font-bold text-red-400'>Circuit Breaker Active</div>
                    <div className='text-xs text-red-300/70'>
                      System will auto-liquidate if Drawdown &gt; 10%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PORTFOLIO EXPOSURE */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-2 self-start'>
                <PieChartIcon size={16} className='text-blue-400' /> Portfolio Exposure
              </h3>
              <div className='flex items-center gap-8 w-full'>
                <div className='h-[200px] w-1/2'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={PIE_DATA}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey='value'
                      >
                        {PIE_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke='none' />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          borderColor: '#374151',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className='w-1/2 space-y-2'>
                  {PIE_DATA.map((item) => (
                    <div
                      key={item.name}
                      className='flex justify-between items-center p-2 bg-gray-800/50 rounded border border-gray-800/50'
                    >
                      <div className='flex items-center gap-2'>
                        <div
                          className='w-2 h-2 rounded-full'
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className='text-xs font-mono text-gray-300'>{item.name}</span>
                      </div>
                      <span className='text-xs font-bold text-white'>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: ENTRY CONTROLS --- */}
        {activeTab === 'ENTRY_CONTROLS' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. DYNAMIC POSITION SIZING */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Scale size={16} className='text-green-400' /> Dynamic Position Sizer
              </h3>
              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                  <label className='text-[10px] text-gray-500 uppercase block mb-1'>
                    Account Balance
                  </label>
                  <div className='bg-black p-2 rounded border border-gray-800 text-white font-mono'>
                    $10,000
                  </div>
                </div>
                <div>
                  <label className='text-[10px] text-gray-500 uppercase block mb-1'>
                    Risk Per Trade
                  </label>
                  <select className='w-full bg-gray-950 border border-gray-800 rounded p-2 text-white font-mono text-sm'>
                    <option>1.0% ($100)</option>
                    <option>2.0% ($200)</option>
                    <option>0.5% ($50)</option>
                  </select>
                </div>
                <div>
                  <label className='text-[10px] text-gray-500 uppercase block mb-1'>
                    Entry Price
                  </label>
                  <div className='bg-black p-2 rounded border border-gray-800 text-white font-mono'>
                    42,500
                  </div>
                </div>
                <div>
                  <label className='text-[10px] text-gray-500 uppercase block mb-1'>
                    Stop Loss Price
                  </label>
                  <div className='bg-black p-2 rounded border border-gray-800 text-red-400 font-mono'>
                    42,100
                  </div>
                </div>
              </div>
              <div className='p-4 bg-green-900/10 border border-green-500/20 rounded text-center'>
                <div className='text-xs text-green-500 uppercase font-bold mb-1'>
                  Recommended Position Size
                </div>
                <div className='text-2xl font-mono font-bold text-white'>0.25 BTC</div>
                <div className='text-[10px] text-gray-500 mt-1'>Leverage Required: 1.1x</div>
              </div>
            </div>

            {/* 2. LEVERAGE & SPREAD SAFETY */}
            <div className='space-y-6'>
              {/* Leverage */}
              <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
                <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                  <Activity size={16} className='text-yellow-400' /> Automated Leverage Control
                </h3>
                <div className='space-y-2'>
                  <div className='flex justify-between text-xs font-mono text-gray-400'>
                    <span>Current Max Leverage</span>
                    <span className='text-yellow-400 font-bold'>{leverage}x</span>
                  </div>
                  <input
                    type='range'
                    min='1'
                    max='20'
                    value={leverage}
                    onChange={(e) => setLeverage(parseInt(e.target.value))}
                    className='w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-400'
                  />
                  <div className='flex justify-between text-[10px] text-gray-600 font-mono'>
                    <span>1x (Safe)</span>
                    <span>10x (Risky)</span>
                    <span>20x (Degen)</span>
                  </div>
                </div>
              </div>

              {/* Spread Check */}
              <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
                <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                  <MoveDown size={16} className='text-cyan-400' /> Slippage & Spread Guard
                </h3>
                <div className='flex items-center justify-between p-3 bg-black/40 rounded border border-gray-800 mb-2'>
                  <span className='text-xs text-gray-400'>Max Slippage Tolerance</span>
                  <span className='text-xs font-bold text-white'>0.2%</span>
                </div>
                <div className='flex items-center justify-between p-3 bg-black/40 rounded border border-gray-800'>
                  <span className='text-xs text-gray-400'>Min Spread for Entry</span>
                  <span className='text-xs font-bold text-red-400'>0.01%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: EXIT STRATEGY --- */}
        {activeTab === 'EXIT_STRATEGY' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. TRAILING STOP VISUALIZER */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-2'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Anchor size={16} className='text-blue-400' /> Trailing Stop Logic (Simulation)
              </h3>
              <div className='h-[300px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={trailData}>
                    <defs>
                      <linearGradient id='colorPrice' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#10b981' stopOpacity={0.1} />
                        <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
                    <XAxis dataKey='time' hide />
                    <YAxis domain={['auto', 'auto']} stroke='#4b5563' fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        fontSize: '10px',
                      }}
                    />

                    <Area
                      type='monotone'
                      dataKey='price'
                      stroke='#10b981'
                      strokeWidth={2}
                      fill='url(#colorPrice)'
                      name='Price'
                    />
                    <Line
                      type='stepAfter'
                      dataKey='stop'
                      stroke='#ef4444'
                      strokeWidth={2}
                      dot={false}
                      name='Trailing Stop'
                    />
                    <ReferenceLine
                      y={115}
                      stroke='#3b82f6'
                      strokeDasharray='3 3'
                      label={{
                        value: 'Take Profit',
                        fill: '#3b82f6',
                        fontSize: 10,
                        position: 'insideTopRight',
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className='flex justify-center gap-8 mt-4'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-1 bg-green-500'></div>
                  <span className='text-xs text-gray-400'>Asset Price</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-1 bg-red-500'></div>
                  <span className='text-xs text-gray-400'>Dynamic Stop Loss</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-1 bg-blue-500 border border-dashed border-blue-500 bg-transparent'></div>
                  <span className='text-xs text-gray-400'>Take Profit Target</span>
                </div>
              </div>
            </div>

            {/* 2. AUTOMATED CONFIGURATION */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Settings2 size={16} className='text-gray-400' /> Auto-Exit Configuration
              </h3>
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='flex items-center gap-3'>
                    <ArrowDownToLine size={16} className='text-red-400' />
                    <span className='text-sm font-bold text-gray-300'>Stop Loss</span>
                  </div>
                  <select className='bg-gray-900 border border-gray-700 rounded text-xs text-white p-1'>
                    <option>Fixed % (2%)</option>
                    <option>ATR Multiplier (2x)</option>
                    <option>Support Level</option>
                  </select>
                </div>
                <div className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='flex items-center gap-3'>
                    <Crosshair size={16} className='text-green-400' />
                    <span className='text-sm font-bold text-gray-300'>Take Profit</span>
                  </div>
                  <select className='bg-gray-900 border border-gray-700 rounded text-xs text-white p-1'>
                    <option>Risk:Reward (1:2)</option>
                    <option>Risk:Reward (1:3)</option>
                    <option>Fibonacci 1.618</option>
                  </select>
                </div>
                <div className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='flex items-center gap-3'>
                    <RefreshCw size={16} className='text-blue-400' />
                    <span className='text-sm font-bold text-gray-300'>Trailing Trigger</span>
                  </div>
                  <select className='bg-gray-900 border border-gray-700 rounded text-xs text-white p-1'>
                    <option>Immediate</option>
                    <option>After TP1</option>
                    <option>After 1% Gain</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Icon Helper
const Settings2 = ({ size, className }: { size: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M20 7h-9'></path>
    <path d='M14 17H5'></path>
    <circle cx='17' cy='17' r='3'></circle>
    <circle cx='7' cy='7' r='3'></circle>
  </svg>
);

export default RiskManagementPanel;
