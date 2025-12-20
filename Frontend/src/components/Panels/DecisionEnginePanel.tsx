import React, { useState, useEffect } from 'react';
import {
  Gavel,
  Scale,
  GitPullRequest,
  AlertTriangle,
  TrendingUp,
  Ban,
  Zap,
  PieChart,
  Shuffle,
  Lock,
  ArrowRight,
  Brain,
  Search,
  CheckCircle2,
  XCircle,
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
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts';

type Tab = 'LOGIC_CORE' | 'MARKET_CONTEXT' | 'EXECUTION';

const DecisionEnginePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('LOGIC_CORE');

  // State for Logic Weights
  const [weights, setWeights] = useState({ technical: 40, sentiment: 30, ai_model: 30 });
  const [confidence, setConfidence] = useState(82);
  const [marketState, setMarketState] = useState<'BULL' | 'BEAR' | 'SIDEWAYS'>('SIDEWAYS');

  // Mock Forecast Data
  const [forecastData, setForecastData] = useState<any[]>([]);

  useEffect(() => {
    // Generate Mock Forecast
    const data = [];
    let price = 45000;
    for (let i = 0; i < 20; i++) {
      price = price + (Math.random() * 200 - 100);
      data.push({
        time: `T+${i}`,
        actual: i < 10 ? price : null,
        predicted: price + (Math.random() * 50 - 25),
        upper: price + 150,
        lower: price - 150,
      });
    }
    setForecastData(data);

    // Simulate Market State
    const interval = setInterval(() => {
      const states: any[] = ['BULL', 'BEAR', 'SIDEWAYS'];
      setMarketState(states[Math.floor(Math.random() * 3)]);
      setConfidence((prev) => Math.min(99, Math.max(50, prev + (Math.random() * 10 - 5))));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className='p-6 h-full flex flex-col animate-fade-in bg-gray-950'>
      {/* HEADER */}
      <div className='shrink-0 mb-6'>
        <div className='flex items-center justify-between border-b border-gray-800 pb-4 mb-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-orange-600/10 rounded-lg'>
              <Gavel className='text-orange-400' size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold font-mono text-white'>DECISION ENGINE</h2>
              <p className='text-xs text-gray-500 font-mono'>
                Phase 6: Logic Synthesis & Trade Execution
              </p>
            </div>
          </div>

          <div className='flex bg-gray-900 rounded-lg p-1 border border-gray-800'>
            {['LOGIC_CORE', 'MARKET_CONTEXT', 'EXECUTION'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={`
                            px-4 py-2 rounded text-xs font-bold font-mono transition-all flex items-center gap-2
                            ${
                              activeTab === tab
                                ? 'bg-orange-900/30 text-orange-300 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]'
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
        {/* --- TAB 1: LOGIC CORE --- */}
        {activeTab === 'LOGIC_CORE' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. HYBRID LOGIC WEIGHTS */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-6'>
                <Scale size={16} className='text-blue-400' /> Decision Weight Configuration
              </h3>
              <div className='space-y-6'>
                {/* Tech */}
                <div>
                  <div className='flex justify-between text-xs font-mono mb-2'>
                    <span className='text-gray-400'>Technical Indicators (RSI, MACD)</span>
                    <span className='text-blue-400 font-bold'>{weights.technical}%</span>
                  </div>
                  <input
                    type='range'
                    value={weights.technical}
                    onChange={(e) =>
                      setWeights({ ...weights, technical: parseInt(e.target.value) })
                    }
                    className='w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500'
                  />
                </div>
                {/* Sentiment */}
                <div>
                  <div className='flex justify-between text-xs font-mono mb-2'>
                    <span className='text-gray-400'>Sentiment (News, Social)</span>
                    <span className='text-pink-400 font-bold'>{weights.sentiment}%</span>
                  </div>
                  <input
                    type='range'
                    value={weights.sentiment}
                    onChange={(e) =>
                      setWeights({ ...weights, sentiment: parseInt(e.target.value) })
                    }
                    className='w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-pink-500'
                  />
                </div>
                {/* AI Model */}
                <div>
                  <div className='flex justify-between text-xs font-mono mb-2'>
                    <span className='text-gray-400'>Neural Network Confidence</span>
                    <span className='text-purple-400 font-bold'>{weights.ai_model}%</span>
                  </div>
                  <input
                    type='range'
                    value={weights.ai_model}
                    onChange={(e) => setWeights({ ...weights, ai_model: parseInt(e.target.value) })}
                    className='w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500'
                  />
                </div>

                <div className='pt-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500 font-mono'>
                  <span>Total Weight:</span>
                  <span
                    className={`${weights.technical + weights.sentiment + weights.ai_model === 100 ? 'text-green-500' : 'text-red-500 font-bold'}`}
                  >
                    {weights.technical + weights.sentiment + weights.ai_model}%
                  </span>
                </div>
              </div>
            </div>

            {/* 2. CONFLICT RESOLUTION MATRIX */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <GitPullRequest size={16} className='text-yellow-400' /> Conflict Resolution Logic
              </h3>
              <div className='space-y-2 text-xs font-mono'>
                <div className='grid grid-cols-4 gap-2 text-gray-500 mb-2 border-b border-gray-800 pb-1'>
                  <div>Tech</div>
                  <div>Sentiment</div>
                  <div>AI</div>
                  <div className='text-right'>Action</div>
                </div>
                {[
                  { t: 'BUY', s: 'BUY', a: 'BUY', res: 'STRONG BUY' },
                  { t: 'BUY', s: 'NEUTRAL', a: 'BUY', res: 'BUY' },
                  { t: 'BUY', s: 'SELL', a: 'BUY', res: 'HOLD (Senti Veto)' },
                  { t: 'SELL', s: 'BUY', a: 'NEUTRAL', res: 'WAIT' },
                  { t: 'SELL', s: 'SELL', a: 'SELL', res: 'STRONG SELL' },
                ].map((row, i) => (
                  <div
                    key={i}
                    className='grid grid-cols-4 gap-2 items-center py-2 border-b border-gray-800/50 hover:bg-gray-800/30'
                  >
                    <span className={row.t === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                      {row.t}
                    </span>
                    <span
                      className={
                        row.s === 'BUY'
                          ? 'text-green-400'
                          : row.s === 'SELL'
                            ? 'text-red-400'
                            : 'text-gray-400'
                      }
                    >
                      {row.s}
                    </span>
                    <span
                      className={
                        row.a === 'BUY'
                          ? 'text-green-400'
                          : row.a === 'SELL'
                            ? 'text-red-400'
                            : 'text-gray-400'
                      }
                    >
                      {row.a}
                    </span>
                    <span className='text-right font-bold text-white bg-gray-800 px-2 py-1 rounded'>
                      {row.res}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: MARKET CONTEXT --- */}
        {activeTab === 'MARKET_CONTEXT' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. MARKET CLASSIFIER & CONFIDENCE */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col justify-between'>
              <div>
                <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-6'>
                  <Search size={16} className='text-cyan-400' /> Context Classifier
                </h3>

                <div className='flex items-center justify-center gap-4 mb-8'>
                  {['BEAR', 'SIDEWAYS', 'BULL'].map((state) => (
                    <div
                      key={state}
                      className={`
                                        flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 transition-all duration-300
                                        ${
                                          marketState === state
                                            ? state === 'BULL'
                                              ? 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                              : state === 'BEAR'
                                                ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                                : 'border-gray-400 bg-gray-400/10'
                                            : 'border-gray-800 bg-gray-900 opacity-50'
                                        }
                                    `}
                    >
                      <span
                        className={`font-bold font-mono ${marketState === state ? 'text-white' : 'text-gray-600'}`}
                      >
                        {state}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className='p-4 bg-gray-950 rounded border border-gray-800'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-xs text-gray-500 uppercase font-mono'>
                    Final Confidence Score
                  </span>
                  <span
                    className={`text-xl font-bold font-mono ${confidence > 80 ? 'text-green-400' : 'text-yellow-400'}`}
                  >
                    {confidence.toFixed(1)}%
                  </span>
                </div>
                <div className='w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800'>
                  <div
                    className={`h-full transition-all duration-500 ${confidence > 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${confidence}%` }}
                  ></div>
                </div>
                <div className='text-[10px] text-gray-600 mt-2 text-center'>
                  Threshold for Entry: &gt; 80%
                </div>
              </div>
            </div>

            {/* 2. PRICE FORECASTING MODULE */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <TrendingUp size={16} className='text-green-400' /> Price Forecast (Next 10 Ticks)
              </h3>
              <div className='h-[250px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={forecastData}>
                    <defs>
                      <linearGradient id='colorPred' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#8884d8' stopOpacity={0.3} />
                        <stop offset='95%' stopColor='#8884d8' stopOpacity={0} />
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

                    {/* Confidence Interval Area */}
                    <Area
                      type='monotone'
                      dataKey='upper'
                      stroke='none'
                      fill='#374151'
                      fillOpacity={0.1}
                    />
                    <Area
                      type='monotone'
                      dataKey='lower'
                      stroke='none'
                      fill='#374151'
                      fillOpacity={0.1}
                    />

                    <Line
                      type='monotone'
                      dataKey='actual'
                      stroke='#ffffff'
                      strokeWidth={2}
                      dot={false}
                      name='Actual'
                    />
                    <Line
                      type='monotone'
                      dataKey='predicted'
                      stroke='#8884d8'
                      strokeDasharray='5 5'
                      dot={false}
                      name='Predicted'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: EXECUTION --- */}
        {activeTab === 'EXECUTION' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* 1. SIGNAL GENERATOR FEED */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg lg:col-span-1 h-[400px] flex flex-col'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Zap size={16} className='text-yellow-400' /> Signal Feed
              </h3>
              <div className='flex-1 overflow-y-auto custom-scrollbar space-y-2'>
                {[
                  {
                    time: '14:05:01',
                    pair: 'BTC/USDT',
                    action: 'BUY',
                    conf: '88%',
                    reason: 'Breakout + Sentiment',
                  },
                  {
                    time: '14:04:22',
                    pair: 'ETH/USDT',
                    action: 'WAIT',
                    conf: '45%',
                    reason: 'Low Volatility',
                  },
                  {
                    time: '14:02:10',
                    pair: 'SOL/USDT',
                    action: 'SELL',
                    conf: '92%',
                    reason: 'Resistance Rejection',
                  },
                  {
                    time: '14:00:05',
                    pair: 'ADA/USDT',
                    action: 'IGNORE',
                    conf: '0%',
                    reason: 'Blacklisted',
                  },
                ].map((sig, i) => (
                  <div
                    key={i}
                    className='bg-gray-950 p-3 rounded border border-gray-800 flex flex-col gap-1'
                  >
                    <div className='flex justify-between items-center'>
                      <span className='text-xs font-bold text-white'>{sig.pair}</span>
                      <span className='text-[10px] text-gray-500'>{sig.time}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span
                        className={`text-xs font-bold ${sig.action === 'BUY' ? 'text-green-400' : sig.action === 'SELL' ? 'text-red-400' : 'text-gray-500'}`}
                      >
                        {sig.action}
                      </span>
                      <span className='text-[10px] text-gray-400'>Conf: {sig.conf}</span>
                    </div>
                    <div className='text-[10px] text-gray-600 italic border-t border-gray-800 pt-1 mt-1'>
                      {sig.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. PORTFOLIO & BLACKLIST */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Portfolio Balancing */}
              <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg flex gap-6'>
                <div className='w-1/3 flex flex-col items-center justify-center'>
                  <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-2'>
                    <PieChart size={16} className='text-indigo-400' /> Rebalancing
                  </h3>
                  <ResponsiveContainer width={120} height={120}>
                    <RechartsPie
                      data={[
                        { n: 'BTC', v: 40 },
                        { n: 'ETH', v: 30 },
                        { n: 'Cash', v: 30 },
                      ]}
                      dataKey='v'
                      innerRadius={40}
                      outerRadius={60}
                    >
                      <Cell fill='#f59e0b' />
                      <Cell fill='#3b82f6' />
                      <Cell fill='#374151' />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className='w-2/3'>
                  <h4 className='text-xs font-mono text-gray-500 uppercase mb-3'>
                    Allocations (Target vs Actual)
                  </h4>
                  <div className='space-y-3'>
                    {['BTC', 'ETH', 'USDT'].map((asset, i) => (
                      <div key={asset}>
                        <div className='flex justify-between text-xs text-white mb-1'>
                          <span>{asset}</span>
                          <span
                            className={
                              i === 0
                                ? 'text-green-400'
                                : i === 1
                                  ? 'text-red-400'
                                  : 'text-gray-400'
                            }
                          >
                            {i === 0 ? '+2.5%' : i === 1 ? '-1.2%' : '0%'} Dev
                          </span>
                        </div>
                        <div className='w-full h-1.5 bg-gray-800 rounded-full overflow-hidden flex'>
                          <div className='bg-indigo-500 h-full w-[40%] opacity-50'></div>
                          <div className='bg-white w-0.5 h-full'></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className='mt-4 flex items-center gap-2 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-gray-300'>
                    <Shuffle size={12} /> Execute Rebalance
                  </button>
                </div>
              </div>

              {/* Blacklist & Emergency */}
              <div className='grid grid-cols-2 gap-6'>
                <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg'>
                  <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                    <Ban size={16} className='text-red-400' /> Blacklist
                  </h3>
                  <div className='space-y-2'>
                    {['LUNA', 'FTT', 'UST'].map((coin) => (
                      <div
                        key={coin}
                        className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'
                      >
                        <span className='text-xs font-bold text-gray-400'>{coin}</span>
                        <span className='text-[9px] text-red-500'>PERMANENT</span>
                      </div>
                    ))}
                    <div className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'>
                      <span className='text-xs font-bold text-white'>DOGE</span>
                      <span className='text-[9px] text-orange-400'>VOLATILITY HALT</span>
                    </div>
                  </div>
                </div>

                <div className='bg-red-900/10 border border-red-500/30 rounded-xl p-4 shadow-lg flex flex-col justify-center items-center text-center'>
                  <Lock size={32} className='text-red-500 mb-2' />
                  <h3 className='font-bold text-red-400 mb-1'>Logic Kill Switch</h3>
                  <p className='text-[10px] text-red-300/70 mb-4'>
                    Halts new signal generation. Existing trades remain open.
                  </p>
                  <button className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded shadow-lg transition-colors'>
                    HALT SIGNALS
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionEnginePanel;
