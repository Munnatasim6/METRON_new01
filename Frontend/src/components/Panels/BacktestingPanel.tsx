import React, { useState, useEffect } from 'react';
import {
  History,
  PlayCircle,
  FastForward,
  BarChart2,
  Maximize2,
  AlertTriangle,
  Thermometer,
  GitCommit,
  Box,
  RefreshCcw,
  Shield,
  Printer,
  FileText,
  TrendingUp,
  TrendingDown,
  Sliders,
  Calendar,
  Layers,
  Activity,
  Settings,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Cell,
  ReferenceLine,
  ComposedChart,
} from 'recharts';

type Tab = 'LAB' | 'ANALYTICS' | 'OPTIMIZATION' | 'STRESS_SIM' | 'PAPER_TRADE';

const BacktestingPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('LAB');
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Mock Data
  const [equityData, setEquityData] = useState<any[]>([]);
  const [monteCarloData, setMonteCarloData] = useState<any[]>([]);

  // Simulation Loop
  useEffect(() => {
    if (isRunning && progress < 100) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsRunning(false);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isRunning, progress]);

  // Generate Equity Curve
  useEffect(() => {
    const data = [];
    let balance = 10000;
    for (let i = 0; i < 100; i++) {
      balance = balance * (1 + (Math.random() * 0.04 - 0.015)); // Upward drift
      data.push({
        date: `Week ${i}`,
        equity: balance,
        drawdown: Math.random() * -5,
        benchmark: 10000 * (1 + i * 0.005),
      });
    }
    setEquityData(data);

    // Monte Carlo Distribution
    const mc = [];
    for (let i = 0; i < 50; i++) {
      mc.push({
        bin: `${90 + i}%`,
        freq: Math.floor(Math.random() * 100 * Math.exp(-Math.pow(i - 25, 2) / 100)),
      });
    }
    setMonteCarloData(mc);
  }, []);

  return (
    <div className='p-6 h-full flex flex-col animate-fade-in bg-gray-950'>
      {/* HEADER */}
      <div className='shrink-0 mb-6'>
        <div className='flex items-center justify-between border-b border-gray-800 pb-4 mb-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-indigo-600/10 rounded-lg'>
              <History className='text-indigo-500' size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold font-mono text-white'>BACKTESTING & SIMULATION</h2>
              <p className='text-xs text-gray-500 font-mono'>
                Phase 9: Historical Verification & Robustness Labs
              </p>
            </div>
          </div>

          <div className='flex bg-gray-900 rounded-lg p-1 border border-gray-800 overflow-x-auto max-w-[600px] custom-scrollbar'>
            {[
              { id: 'LAB', icon: PlayCircle, label: 'Backtest Lab' },
              { id: 'ANALYTICS', icon: BarChart2, label: 'Analytics' },
              { id: 'OPTIMIZATION', icon: Sliders, label: 'Optimization' },
              { id: 'STRESS_SIM', icon: Thermometer, label: 'Stress & Sim' },
              { id: 'PAPER_TRADE', icon: Printer, label: 'Paper Trading' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`
                            px-4 py-2 rounded text-xs font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap
                            ${
                              activeTab === item.id
                                ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                                : 'text-gray-500 hover:text-gray-300'
                            }
                        `}
              >
                <item.icon size={14} /> {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto custom-scrollbar pr-2'>
        {/* --- TAB 1: BACKTEST LAB --- */}
        {activeTab === 'LAB' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* 1. CONFIGURATION CONSOLE */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-1'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-6'>
                <Settings className='text-gray-400' size={16} /> Engine Configuration
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='text-[10px] text-gray-500 uppercase block mb-1'>
                    Backtest Engine
                  </label>
                  <select className='w-full bg-gray-950 border border-gray-800 rounded p-2 text-white font-mono text-xs'>
                    <option>Backtrader (Python)</option>
                    <option>Lean (QuantConnect)</option>
                    <option>VectorBT (Fast)</option>
                  </select>
                </div>
                <div>
                  <label className='text-[10px] text-gray-500 uppercase block mb-1'>
                    Data Source (5 Years)
                  </label>
                  <div className='flex items-center gap-2 bg-gray-950 p-2 rounded border border-gray-800'>
                    <Calendar size={14} className='text-indigo-400' />
                    <span className='text-xs text-white'>Jan 1, 2019 - Dec 31, 2024</span>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-[10px] text-gray-500 uppercase block mb-1'>
                      Initial Capital
                    </label>
                    <input
                      type='number'
                      value='10000'
                      className='w-full bg-gray-950 border border-gray-800 rounded p-2 text-white text-xs font-mono'
                    />
                  </div>
                  <div>
                    <label className='text-[10px] text-gray-500 uppercase block mb-1'>
                      Commission
                    </label>
                    <input
                      type='text'
                      value='0.04%'
                      className='w-full bg-gray-950 border border-gray-800 rounded p-2 text-white text-xs font-mono'
                    />
                  </div>
                </div>
                <div>
                  <label className='text-[10px] text-gray-500 uppercase block mb-1'>
                    Strategy Logic
                  </label>
                  <div className='p-2 bg-black/40 rounded border border-gray-800 font-mono text-[10px] text-gray-400 h-24 overflow-y-auto custom-scrollbar'>
                    {`class NeuralStrategy(bt.Strategy):
    def next(self):
        if self.data.close[0] > self.sma[0]:
            self.buy(size=0.1)
        elif self.position:`}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProgress(0);
                    setIsRunning(true);
                  }}
                  className={`w-full py-3 mt-4 rounded font-bold font-mono text-sm flex items-center justify-center gap-2 transition-all ${isRunning ? 'bg-gray-800 text-gray-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'}`}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <RefreshCcw size={16} className='animate-spin' />
                  ) : (
                    <PlayCircle size={16} />
                  )}
                  {isRunning ? 'RUNNING SIMULATION...' : 'RUN BACKTEST'}
                </button>
              </div>
            </div>

            {/* 2. PROGRESS & LOGS */}
            <div className='lg:col-span-2 flex flex-col gap-6'>
              {/* Progress Bar */}
              <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='font-bold text-gray-300 text-sm'>Simulation Progress</h3>
                  <span className='text-indigo-400 font-mono text-xs font-bold'>{progress}%</span>
                </div>
                <div className='w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700'>
                  <div
                    className='h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-75 relative'
                    style={{ width: `${progress}%` }}
                  >
                    <div className='absolute right-0 top-0 bottom-0 w-1 bg-white opacity-50 shadow-[0_0_10px_white]'></div>
                  </div>
                </div>
                <div className='flex justify-between mt-2 text-[10px] text-gray-500 font-mono'>
                  <span>Processing: 2021-05-12</span>
                  <span>Speed: 12,000 candles/sec</span>
                </div>
              </div>

              {/* Simulation Console */}
              <div className='flex-1 bg-black border border-gray-800 rounded-xl p-4 flex flex-col font-mono text-xs overflow-hidden'>
                <div className='border-b border-gray-900 pb-2 mb-2 text-gray-500 flex justify-between'>
                  <span>Console Output</span>
                  <span className='text-green-500'>● Live</span>
                </div>
                <div className='flex-1 overflow-y-auto custom-scrollbar space-y-1'>
                  <p className='text-gray-400'>
                    [INIT] Loading OHLCV data for BTC/USDT (1m timeframe)...
                  </p>
                  <p className='text-gray-400'>[INIT] Strategy 'NeuralHybrid_V2' instantiated.</p>
                  {progress > 10 && (
                    <p className='text-indigo-400'>
                      [2019-02-15] BUY 0.5 BTC @ $3,800 | Confidence: 82%
                    </p>
                  )}
                  {progress > 20 && (
                    <p className='text-green-400'>
                      [2019-03-20] SELL 0.5 BTC @ $4,100 | Profit: +$150
                    </p>
                  )}
                  {progress > 40 && (
                    <p className='text-red-400'>
                      [2020-03-12] STOP LOSS TRIGGERED @ $5,200 | Loss: -$420
                    </p>
                  )}
                  {progress > 60 && (
                    <p className='text-indigo-400'>
                      [2021-01-05] BUY 0.2 BTC @ $32,000 | Confidence: 95%
                    </p>
                  )}
                  {progress === 100 && (
                    <p className='text-yellow-400 font-bold'>
                      &gt;&gt;&gt; SIMULATION COMPLETE. GENERATING REPORT...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: PERFORMANCE ANALYTICS --- */}
        {activeTab === 'ANALYTICS' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* 1. KEY METRICS CARD */}
            <div className='lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4'>
              {[
                { l: 'Total Return', v: '+425.2%', c: 'text-green-400' },
                { l: 'Sharpe Ratio', v: '2.45', c: 'text-indigo-400' },
                { l: 'Max Drawdown', v: '-18.2%', c: 'text-red-400' },
                { l: 'Win Rate', v: '62.5%', c: 'text-yellow-400' },
              ].map((m, i) => (
                <div
                  key={i}
                  className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg text-center'
                >
                  <div className='text-xs text-gray-500 uppercase mb-1'>{m.l}</div>
                  <div className={`text-2xl font-bold font-mono ${m.c}`}>{m.v}</div>
                </div>
              ))}
            </div>

            {/* 2. EQUITY CURVE */}
            <div className='lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg h-[400px]'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <TrendingUp size={16} className='text-green-400' /> Equity Curve vs Benchmark (Buy &
                Hold)
              </h3>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id='colorEq' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#4f46e5' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#4f46e5' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
                  <XAxis dataKey='date' hide />
                  <YAxis orientation='right' stroke='#4b5563' fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#374151',
                      fontSize: '10px',
                    }}
                  />
                  <Area
                    type='monotone'
                    dataKey='equity'
                    stroke='#4f46e5'
                    strokeWidth={2}
                    fill='url(#colorEq)'
                    name='Strategy'
                  />
                  <Line
                    type='monotone'
                    dataKey='benchmark'
                    stroke='#6b7280'
                    strokeDasharray='3 3'
                    dot={false}
                    name='Buy & Hold'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 3. UNDERWATER CHART (DRAWDOWN) */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg h-[400px]'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <TrendingDown size={16} className='text-red-400' /> Drawdown Profile
              </h3>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={equityData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
                  <XAxis dataKey='date' hide />
                  <YAxis stroke='#4b5563' fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#374151',
                      fontSize: '10px',
                    }}
                  />
                  <Area
                    type='step'
                    dataKey='drawdown'
                    stroke='#ef4444'
                    fill='#ef4444'
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 4. MONTHLY RETURNS HEATMAP */}
            <div className='lg:col-span-3 bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Calendar size={16} className='text-yellow-400' /> Monthly Returns Heatmap
              </h3>
              <div className='overflow-x-auto'>
                <div className='grid grid-cols-13 gap-1 min-w-[800px]'>
                  <div className='text-[10px] text-gray-500 font-bold'></div>
                  {[
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                  ].map((m) => (
                    <div key={m} className='text-[10px] text-gray-500 font-bold text-center'>
                      {m}
                    </div>
                  ))}

                  {[2019, 2020, 2021, 2022, 2023, 2024].map((year) => (
                    <React.Fragment key={year}>
                      <div className='text-[10px] text-gray-400 font-bold self-center'>{year}</div>
                      {[...Array(12)].map((_, i) => {
                        const val = Math.random() * 20 - 5;
                        return (
                          <div
                            key={i}
                            className={`h-8 rounded flex items-center justify-center text-[10px] font-mono
                                                    ${
                                                      val > 10
                                                        ? 'bg-green-600 text-white font-bold'
                                                        : val > 0
                                                          ? 'bg-green-900/50 text-green-300'
                                                          : val > -5
                                                            ? 'bg-red-900/50 text-red-300'
                                                            : 'bg-red-600 text-white font-bold'
                                                    }
                                                `}
                            title={`${year}-${i + 1}: ${val.toFixed(1)}%`}
                          >
                            {val.toFixed(1)}%
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: OPTIMIZATION & ROBUSTNESS --- */}
        {activeTab === 'OPTIMIZATION' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. WALK-FORWARD ANALYSIS */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <FastForward size={16} className='text-blue-400' /> Walk-Forward Analysis
              </h3>
              <div className='space-y-2'>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className='flex items-center gap-2'>
                    <div className='w-20 text-[10px] text-gray-500 font-mono'>Run {i + 1}</div>
                    <div className='flex-1 flex h-4 rounded-full overflow-hidden bg-gray-800'>
                      <div className='h-full bg-transparent' style={{ width: `${i * 15}%` }}></div>
                      <div
                        className='h-full bg-blue-500'
                        style={{ width: '20%' }}
                        title='Training Set'
                      ></div>
                      <div
                        className='h-full bg-green-500'
                        style={{ width: '5%' }}
                        title='Test Set'
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className='mt-4 flex gap-4 text-xs'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-blue-500 rounded'></div>
                  <span className='text-gray-400'>In-Sample (Train)</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-green-500 rounded'></div>
                  <span className='text-gray-400'>Out-Of-Sample (Test)</span>
                </div>
              </div>
            </div>

            {/* 2. OVERFITTING DETECTION */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-6 self-start'>
                <Shield size={16} className='text-yellow-400' /> Overfitting Detection System
              </h3>

              <div className='relative w-64 h-32 overflow-hidden mb-2'>
                <div className='absolute top-0 left-0 w-full h-full bg-gray-800 rounded-t-full'></div>
                <div
                  className='absolute top-0 left-0 w-full h-full rounded-t-full bg-green-500 origin-bottom transition-all'
                  style={{ transform: 'rotate(-45deg)' }}
                ></div>
                <div className='absolute bottom-0 left-1/2 -translate-x-1/2 text-2xl font-bold text-white'>
                  LOW RISK
                </div>
              </div>
              <p className='text-xs text-center text-gray-500 max-w-sm'>
                Training Sharpe (2.8) vs Testing Sharpe (2.4). Small divergence indicates robust
                logic.
              </p>
            </div>

            {/* 3. PARAMETER HEATMAP */}
            <div className='lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <GridIcon size={16} className='text-pink-400' /> Parameter Optimization Heatmap
              </h3>
              <div className='h-[300px] w-full flex items-center justify-center border border-gray-800 bg-gray-950 rounded relative'>
                <div className='absolute left-2 top-1/2 -rotate-90 text-xs text-gray-500 font-bold'>
                  RSI Period
                </div>
                <div className='absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-bold'>
                  Stop Loss %
                </div>

                {/* Simple visual representation of a heatmap */}
                <div className='grid grid-cols-10 gap-1 p-8 w-full h-full'>
                  {[...Array(100)].map((_, i) => {
                    const intensity = Math.random();
                    return (
                      <div
                        key={i}
                        style={{ backgroundColor: `rgba(236, 72, 153, ${intensity})` }}
                        className='rounded-sm hover:border border-white/50'
                        title={`Sharpe: ${(intensity * 3).toFixed(2)}`}
                      ></div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: STRESS & SIMULATION --- */}
        {activeTab === 'STRESS_SIM' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. MONTE CARLO SIMULATION */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-2'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Box size={16} className='text-cyan-400' /> Monte Carlo Simulation (1,000 Runs)
              </h3>
              <div className='h-[300px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={monteCarloData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
                    <XAxis dataKey='bin' stroke='#4b5563' fontSize={10} />
                    <YAxis stroke='#4b5563' fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }}
                    />
                    <Bar dataKey='freq' fill='#06b6d4' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className='grid grid-cols-3 gap-4 mt-4 text-center'>
                <div className='bg-gray-800 p-2 rounded'>
                  <span className='block text-xs text-gray-500'>95% Confidence</span>
                  <span className='font-bold text-white text-lg'>$12,400</span>
                </div>
                <div className='bg-gray-800 p-2 rounded'>
                  <span className='block text-xs text-gray-500'>Median Outcome</span>
                  <span className='font-bold text-cyan-400 text-lg'>$18,200</span>
                </div>
                <div className='bg-gray-800 p-2 rounded'>
                  <span className='block text-xs text-gray-500'>Max Drawdown Risk</span>
                  <span className='font-bold text-red-400 text-lg'>-22%</span>
                </div>
              </div>
            </div>

            {/* 2. STRESS TEST SCENARIOS */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-2'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Thermometer size={16} className='text-red-500' /> Historical Stress Scenarios
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {[
                  { name: 'Covid Crash (Mar 2020)', drop: '-50%', result: '-15%', surv: 'Pass' },
                  { name: 'Luna Collapse (May 2022)', drop: '-99%', result: '-5%', surv: 'Pass' },
                  { name: 'FTX Insolvency (Nov 2022)', drop: '-30%', result: '-8%', surv: 'Pass' },
                  { name: 'China Ban (May 2021)', drop: '-40%', result: '-12%', surv: 'Pass' },
                ].map((scen, i) => (
                  <div
                    key={i}
                    className='bg-gray-950 p-4 rounded border border-gray-800 hover:border-red-500/30 transition-colors'
                  >
                    <div className='text-xs font-bold text-gray-300 mb-2'>{scen.name}</div>
                    <div className='flex justify-between text-[10px] text-gray-500 mb-1'>
                      <span>Market Drop</span>
                      <span className='text-red-500 font-bold'>{scen.drop}</span>
                    </div>
                    <div className='flex justify-between text-[10px] text-gray-500 mb-2'>
                      <span>Strategy DD</span>
                      <span className='text-yellow-500 font-bold'>{scen.result}</span>
                    </div>
                    <div className='mt-2 text-center bg-green-900/20 text-green-400 text-xs font-bold py-1 rounded border border-green-500/20'>
                      {scen.surv}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: PAPER TRADING --- */}
        {activeTab === 'PAPER_TRADE' && (
          <div className='grid grid-cols-1 gap-6 h-full'>
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center h-[500px]'>
              <Printer size={48} className='text-gray-700 mb-4' />
              <h3 className='text-xl font-bold text-gray-300'>Paper Trading Environment</h3>
              <p className='text-gray-500 text-sm mb-6'>
                Forward test your strategy in real-time without risking real capital.
              </p>

              <div className='grid grid-cols-3 gap-8 w-full max-w-2xl mb-8'>
                <div className='text-center'>
                  <div className='text-xs text-gray-500 uppercase'>Virtual Balance</div>
                  <div className='text-2xl font-mono text-white'>$100,000</div>
                </div>
                <div className='text-center'>
                  <div className='text-xs text-gray-500 uppercase'>Unrealized PnL</div>
                  <div className='text-2xl font-mono text-green-400'>+$250</div>
                </div>
                <div className='text-center'>
                  <div className='text-xs text-gray-500 uppercase'>Open Positions</div>
                  <div className='text-2xl font-mono text-white'>2</div>
                </div>
              </div>

              <button className='px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded shadow-lg flex items-center gap-2'>
                <Activity size={16} /> LAUNCH PAPER TRADING SESSION
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Icon
const GridIcon = ({ size, className }: { size: number; className?: string }) => (
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
    <rect x='3' y='3' width='7' height='7'></rect>
    <rect x='14' y='3' width='7' height='7'></rect>
    <rect x='14' y='14' width='7' height='7'></rect>
    <rect x='3' y='14' width='7' height='7'></rect>
  </svg>
);

export default BacktestingPanel;
