import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Twitter,
  Rss,
  Brain,
  Newspaper,
  Megaphone,
  Github,
  ShieldAlert,
  FileDigit,
  Activity,
  ThumbsUp,
  ThumbsDown,
  AlertOctagon,
  Search,
  Filter,
  Share2,
  Terminal,
  Code2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

type Tab = 'SOCIAL' | 'NEURAL' | 'PSYCHOLOGY' | 'SIGNALS';

const SentimentPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('SOCIAL');
  const [fearGreed, setFearGreed] = useState(45);
  const [tokenizerInput, setTokenizerInput] = useState('Bitcoin ETF approved by SEC');

  // Mock Data Generators
  // Derived State (replaces effect)
  const tokenValues = React.useMemo(
    () => tokenizerInput.split(' ').map(() => Math.floor(Math.random() * 30000)),
    [tokenizerInput],
  );

  // Mock Data Generators - Lazy Initializers
  const [hypeData] = useState<any[]>(() =>
    Array.from({ length: 20 }, (_, i) => ({
      time: i,
      btc: 500 + Math.random() * 200,
      sol: 300 + Math.random() * 500,
      eth: 400 + Math.random() * 100,
    })),
  );

  const [whaleTx] = useState<any[]>(() => [
    {
      hash: '0x8a...9f2',
      coin: 'BTC',
      amount: 1250,
      value: '$58.2M',
      from: 'Wallet (Old)',
      to: 'Binance',
      type: 'INFLOW',
    },
    {
      hash: '0x3b...1c4',
      coin: 'ETH',
      amount: 15000,
      value: '$32.1M',
      from: 'Coinbase',
      to: 'Wallet (New)',
      type: 'OUTFLOW',
    },
    {
      hash: '0x1d...8a1',
      coin: 'SOL',
      amount: 500000,
      value: '$25.5M',
      from: 'Unknown',
      to: 'Unknown',
      type: 'TRANSFER',
    },
    {
      hash: '0x9e...2b3',
      coin: 'USDT',
      amount: 100000000,
      value: '$100M',
      from: 'Tether Treasury',
      to: 'Binance',
      type: 'MINT',
    },
  ]);

  // Helper for Fear Color
  const getFearColor = (val: number) => {
    if (val < 25) return '#ef4444';
    if (val < 45) return '#f97316';
    if (val < 55) return '#eab308';
    if (val < 75) return '#84cc16';
    return '#22c55e';
  };

  return (
    <div className='p-6 h-full flex flex-col animate-fade-in bg-gray-950'>
      {/* HEADER & TABS */}
      <div className='shrink-0 mb-6'>
        <div className='flex items-center justify-between border-b border-gray-800 pb-4 mb-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-pink-500/10 rounded-lg'>
              <MessageSquare className='text-pink-400' size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold font-mono text-white'>NLP & SENTIMENT ENGINE</h2>
              <p className='text-xs text-gray-500 font-mono'>
                Phase 4: Deep Learning Text Analysis
              </p>
            </div>
          </div>

          <div className='flex bg-gray-900 rounded-lg p-1 border border-gray-800'>
            {['SOCIAL', 'NEURAL', 'PSYCHOLOGY', 'SIGNALS'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={`
                            px-4 py-2 rounded text-xs font-bold font-mono transition-all
                            ${activeTab === tab
                    ? 'bg-gray-800 text-white shadow-sm border border-gray-700'
                    : 'text-gray-500 hover:text-gray-300'
                  }
                        `}
              >
                {tab} INTELLIGENCE
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className='flex-1 overflow-y-auto custom-scrollbar pr-2'>
        {/* --- TAB 1: SOCIAL INTELLIGENCE --- */}
        {activeTab === 'SOCIAL' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* 1. TWITTER/X FIREHOSE */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg lg:col-span-1 h-[400px] flex flex-col'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Twitter size={16} className='text-blue-400' /> X (Twitter) Firehose
              </h3>
              <div className='flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1'>
                {[
                  {
                    user: '@WatcherGuru',
                    text: 'JUST IN: BlackRock Bitcoin ETF volume hits $1B in first hour.',
                    viral: 'High',
                  },
                  {
                    user: '@WhaleTrades',
                    text: '🚨 5,000 #BTC transferred from Gemini to unknown wallet.',
                    viral: 'Med',
                  },
                  {
                    user: '@VitalikButerin',
                    text: 'Rollups are the future of Ethereum scaling...',
                    viral: 'High',
                  },
                  {
                    user: '@TraderJoe',
                    text: 'Shorting $SOL here looks like free money. NFA.',
                    viral: 'Low',
                  },
                ].map((tweet, i) => (
                  <div
                    key={i}
                    className='bg-black/40 p-3 rounded border border-gray-800 hover:border-gray-700 transition-colors'
                  >
                    <div className='flex justify-between items-start mb-1'>
                      <span className='text-xs font-bold text-blue-400'>{tweet.user}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded ${tweet.viral === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-500'}`}
                      >
                        {tweet.viral === 'High' ? '🔥 VIRAL' : 'Trending'}
                      </span>
                    </div>
                    <p className='text-xs text-gray-300 leading-relaxed'>"{tweet.text}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. CRYPTOPANIC FEED */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg lg:col-span-2 h-[400px] flex flex-col'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='font-bold text-gray-300 flex items-center gap-2'>
                  <Rss size={16} className='text-orange-400' /> CryptoPanic News Feed
                </h3>
                <div className='flex gap-2'>
                  <button className='p-1.5 bg-gray-800 rounded text-gray-400 hover:text-white'>
                    <Filter size={14} />
                  </button>
                  <button className='p-1.5 bg-gray-800 rounded text-gray-400 hover:text-white'>
                    <Search size={14} />
                  </button>
                </div>
              </div>
              <div className='flex-1 overflow-y-auto custom-scrollbar'>
                <table className='w-full text-left'>
                  <thead className='text-xs text-gray-500 font-mono bg-gray-900 sticky top-0'>
                    <tr>
                      <th className='p-2'>Source</th>
                      <th className='p-2'>Headline</th>
                      <th className='p-2'>Sentiment</th>
                      <th className='p-2 text-right'>Time</th>
                    </tr>
                  </thead>
                  <tbody className='text-sm font-mono'>
                    {[
                      {
                        src: 'CoinDesk',
                        title: 'SEC delays decision on Ethereum ETF',
                        sent: 'Bearish',
                        time: '5m',
                      },
                      {
                        src: 'TheBlock',
                        title: 'Solana TVL reaches new all-time high',
                        sent: 'Bullish',
                        time: '12m',
                      },
                      {
                        src: 'Reuters',
                        title: 'US Inflation data comes in lower than expected',
                        sent: 'Bullish',
                        time: '45m',
                      },
                      {
                        src: 'Decrypt',
                        title: 'NFT market volume drops 90% in Q4',
                        sent: 'Bearish',
                        time: '1h',
                      },
                      {
                        src: 'CoinTelegraph',
                        title: 'MicroStrategy purchases another 10k BTC',
                        sent: 'Bullish',
                        time: '2h',
                      },
                      {
                        src: 'Bloomberg',
                        title: 'Binance faces new regulatory hurdles in EU',
                        sent: 'Negative',
                        time: '3h',
                      },
                    ].map((news, i) => (
                      <tr key={i} className='border-b border-gray-800/50 hover:bg-gray-800/30'>
                        <td className='p-2 text-xs text-gray-400'>{news.src}</td>
                        <td className='p-2 text-gray-200 font-bold'>{news.title}</td>
                        <td className='p-2'>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold ${news.sent === 'Bullish'
                                ? 'bg-green-500/10 text-green-400'
                                : news.sent === 'Bearish'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-gray-700 text-gray-400'
                              }`}
                          >
                            {news.sent}
                          </span>
                        </td>
                        <td className='p-2 text-right text-xs text-gray-500'>{news.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. HYPE VOLUME CHART */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg lg:col-span-3 h-[250px]'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Megaphone size={16} className='text-indigo-400' /> Social Volume vs Price Action
              </h3>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={hypeData}>
                  <defs>
                    <linearGradient id='colorSol' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#8884d8' stopOpacity={0.8} />
                      <stop offset='95%' stopColor='#8884d8' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                  <XAxis dataKey='time' hide />
                  <YAxis hide />
                  <Area
                    type='monotone'
                    dataKey='sol'
                    stroke='#8884d8'
                    fillOpacity={1}
                    fill='url(#colorSol)'
                    name='Social Vol'
                  />
                  <Line
                    type='monotone'
                    dataKey='btc'
                    stroke='#f59e0b'
                    strokeWidth={2}
                    dot={false}
                    name='BTC Price'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* --- TAB 2: NEURAL ENGINE --- */}
        {activeTab === 'NEURAL' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. BERT MODEL VISUALIZER */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col justify-between'>
              <div className='flex justify-between items-start'>
                <h3 className='font-bold text-gray-300 flex items-center gap-2'>
                  <Brain size={16} className='text-pink-400' /> FinBERT Architecture
                </h3>
                <span className='text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30 animate-pulse'>
                  MODEL LIVE
                </span>
              </div>

              <div className='flex items-center justify-center gap-2 my-6'>
                {/* Layer Visualization */}
                {[...Array(6)].map((_, i) => (
                  <div key={i} className='flex flex-col items-center gap-1'>
                    <div
                      className={`w-8 h-12 rounded border border-gray-600 bg-gray-800/50 flex items-center justify-center text-[9px] text-gray-500 shadow-[0_0_10px_rgba(236,72,153,0.1)]`}
                    >
                      L{i + 1}
                    </div>
                    <div className='w-1 h-2 bg-gray-700'></div>
                  </div>
                ))}
                <div className='w-12 h-12 rounded-full border-2 border-pink-500 flex items-center justify-center bg-pink-500/10 shadow-[0_0_15px_rgba(236,72,153,0.3)]'>
                  <span className='text-[9px] font-bold text-pink-400'>OUT</span>
                </div>
              </div>

              <div className='grid grid-cols-3 gap-4 text-center'>
                <div className='p-2 bg-gray-800 rounded'>
                  <div className='text-[10px] text-gray-500 uppercase'>Attention Heads</div>
                  <div className='text-sm font-bold text-white'>12</div>
                </div>
                <div className='p-2 bg-gray-800 rounded'>
                  <div className='text-[10px] text-gray-500 uppercase'>Hidden Size</div>
                  <div className='text-sm font-bold text-white'>768</div>
                </div>
                <div className='p-2 bg-gray-800 rounded'>
                  <div className='text-[10px] text-gray-500 uppercase'>Latency</div>
                  <div className='text-sm font-bold text-green-400'>12ms</div>
                </div>
              </div>
            </div>

            {/* 2. TEXT TO VECTOR TOKENIZER */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <FileDigit size={16} className='text-cyan-400' /> Live Tokenizer (Text-to-Vector)
              </h3>
              <div className='space-y-4'>
                <input
                  type='text'
                  value={tokenizerInput}
                  onChange={(e) => setTokenizerInput(e.target.value)}
                  className='w-full bg-black border border-gray-700 rounded p-3 text-sm font-mono text-white focus:border-cyan-500 focus:outline-none'
                  placeholder='Enter text to tokenize...'
                />
                <div className='bg-black/50 p-3 rounded border border-gray-800 min-h-[100px]'>
                  <div className='text-[10px] text-gray-500 font-mono mb-2 uppercase'>
                    Token Embeddings (Vector Output)
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {tokenizerInput.split(' ').map((word, i) => (
                      <div
                        key={i}
                        className='flex flex-col items-center p-1 bg-gray-800 rounded border border-gray-700 min-w-[40px]'
                      >
                        <span className='text-[10px] text-cyan-300'>{word}</span>
                        <span className='text-[8px] text-gray-500'>{tokenValues[i] || 0}</span>
                      </div>
                    ))}
                  </div>
                  <div className='mt-3 pt-3 border-t border-gray-800 text-[10px] font-mono text-gray-400 break-all'>
                    [0.021, -0.442, 0.115, 0.992, -0.221, 0.551, 0.001, -0.992, ... 768 dims]
                  </div>
                </div>
              </div>
            </div>

            {/* 3. FAKE NEWS FILTER LOG */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-2'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <ShieldAlert size={16} className='text-red-500' /> Fake News / Spam Filter Log
              </h3>
              <table className='w-full text-left font-mono text-xs'>
                <thead className='text-gray-500 border-b border-gray-800'>
                  <tr>
                    <th className='pb-2'>Detected Text Segment</th>
                    <th className='pb-2'>Source</th>
                    <th className='pb-2'>Reason</th>
                    <th className='pb-2 text-right'>Action</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-800'>
                  <tr className='bg-red-900/5'>
                    <td className='py-3 text-gray-300'>"Giveaway! Send 1 ETH get 2 ETH back..."</td>
                    <td className='py-3 text-gray-500'>Twitter (Bot)</td>
                    <td className='py-3 text-red-400'>Scam Pattern (99%)</td>
                    <td className='py-3 text-right'>
                      <span className='px-2 py-0.5 bg-red-500 text-black font-bold rounded'>
                        BLOCKED
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className='py-3 text-gray-300'>"BREAKING: China bans Bitcoin again"</td>
                    <td className='py-3 text-gray-500'>Unknown RSS</td>
                    <td className='py-3 text-orange-400'>Repetitive FUD</td>
                    <td className='py-3 text-right'>
                      <span className='px-2 py-0.5 bg-gray-700 text-gray-300 rounded'>FLAGGED</span>
                    </td>
                  </tr>
                  <tr>
                    <td className='py-3 text-gray-300'>"SafeMoon 2.0 launching soon!"</td>
                    <td className='py-3 text-gray-500'>Twitter</td>
                    <td className='py-3 text-red-400'>Keyword Blacklist</td>
                    <td className='py-3 text-right'>
                      <span className='px-2 py-0.5 bg-red-500 text-black font-bold rounded'>
                        BLOCKED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 3: MARKET PSYCHOLOGY --- */}
        {activeTab === 'PSYCHOLOGY' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 h-full'>
            {/* 1. FEAR & GREED GAUGE */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-8 self-start w-full border-b border-gray-800 pb-2'>
                <Activity size={16} className='text-yellow-400' /> Fear & Greed Index
              </h3>

              <div className='relative w-64 h-32 overflow-hidden mb-4'>
                <div className='absolute top-0 left-0 w-full h-full bg-gray-800 rounded-t-full'></div>
                <div
                  className='absolute top-0 left-0 w-full h-full rounded-t-full origin-bottom transition-all duration-1000 ease-out'
                  style={{
                    backgroundColor: getFearColor(fearGreed),
                    transform: `rotate(${(fearGreed / 100) * 180 - 180}deg)`,
                  }}
                ></div>
              </div>
              <div className='text-center'>
                <div className='text-5xl font-bold text-white font-mono'>{fearGreed}</div>
                <div
                  className='text-lg uppercase font-bold tracking-[0.2em] mt-2'
                  style={{ color: getFearColor(fearGreed) }}
                >
                  {fearGreed < 45 ? 'Fear' : fearGreed > 55 ? 'Greed' : 'Neutral'}
                </div>
                <div className='text-xs text-gray-500 mt-4 max-w-xs'>
                  Calculated from Volatility (25%), Market Momentum (25%), Social Media (15%),
                  Dominance (10%), Trends (10%).
                </div>
              </div>
            </div>

            {/* 2. SENTIMENT TREND */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Newspaper size={16} className='text-teal-400' /> Sentiment Trend (7 Days)
              </h3>
              <div className='flex-1 min-h-[200px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart
                    data={[
                      { d: 'Mon', pos: 40, neg: 20 },
                      { d: 'Tue', pos: 45, neg: 15 },
                      { d: 'Wed', pos: 30, neg: 40 }, // FUD Spike
                      { d: 'Thu', pos: 55, neg: 25 },
                      { d: 'Fri', pos: 60, neg: 20 },
                      { d: 'Sat', pos: 65, neg: 15 },
                      { d: 'Sun', pos: 70, neg: 10 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
                    <XAxis dataKey='d' stroke='#4b5563' fontSize={10} />
                    <YAxis stroke='#4b5563' fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }}
                    />
                    <Line
                      type='monotone'
                      dataKey='pos'
                      stroke='#4ade80'
                      strokeWidth={2}
                      name='Positive'
                    />
                    <Line
                      type='monotone'
                      dataKey='neg'
                      stroke='#f87171'
                      strokeWidth={2}
                      name='Negative'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className='grid grid-cols-3 gap-4 mt-4 text-center'>
                <div className='bg-green-900/20 p-2 rounded border border-green-500/20'>
                  <span className='block text-xl font-bold text-green-400'>68%</span>
                  <span className='text-[10px] text-gray-400 uppercase'>Bullish</span>
                </div>
                <div className='bg-gray-800 p-2 rounded border border-gray-700'>
                  <span className='block text-xl font-bold text-gray-300'>12%</span>
                  <span className='text-[10px] text-gray-500 uppercase'>Neutral</span>
                </div>
                <div className='bg-red-900/20 p-2 rounded border border-red-500/20'>
                  <span className='block text-xl font-bold text-red-400'>20%</span>
                  <span className='text-[10px] text-gray-400 uppercase'>Bearish</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: SIGNALS --- */}
        {activeTab === 'SIGNALS' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* 1. WHALE ALERTS TABLE */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-2'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <AlertOctagon size={16} className='text-yellow-400' /> Large Whale Transactions
                (&gt; $10M)
              </h3>
              <div className='overflow-x-auto'>
                <table className='w-full text-left font-mono text-xs'>
                  <thead className='bg-gray-900 text-gray-500'>
                    <tr>
                      <th className='p-3 rounded-l'>Coin</th>
                      <th className='p-3'>Amount</th>
                      <th className='p-3'>Value</th>
                      <th className='p-3'>From</th>
                      <th className='p-3'>To</th>
                      <th className='p-3 rounded-r text-right'>Type</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-800'>
                    {whaleTx.map((tx, i) => (
                      <tr key={i} className='hover:bg-gray-800/30'>
                        <td className='p-3 font-bold text-white'>{tx.coin}</td>
                        <td className='p-3 text-gray-300'>{tx.amount.toLocaleString()}</td>
                        <td className='p-3 text-gray-300'>{tx.value}</td>
                        <td className='p-3 text-blue-400 truncate max-w-[100px]'>{tx.from}</td>
                        <td className='p-3 text-blue-400 truncate max-w-[100px]'>{tx.to}</td>
                        <td className='p-3 text-right'>
                          <span
                            className={`px-2 py-1 rounded font-bold ${tx.type === 'INFLOW'
                                ? 'bg-red-500/10 text-red-400'
                                : tx.type === 'OUTFLOW'
                                  ? 'bg-green-500/10 text-green-400'
                                  : 'bg-gray-800 text-gray-400'
                              }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. GITHUB ACTIVITY */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Github size={16} className='text-white' /> Developer Activity
              </h3>
              <div className='space-y-4'>
                {[
                  { name: 'Ethereum', commits: 450, color: '#3b82f6' },
                  { name: 'Polkadot', commits: 380, color: '#eab308' },
                  { name: 'Cardano', commits: 320, color: '#3b82f6' },
                  { name: 'Solana', commits: 290, color: '#a855f7' },
                  { name: 'Cosmos', commits: 210, color: '#6366f1' },
                ].map((dev, i) => (
                  <div key={i}>
                    <div className='flex justify-between text-xs mb-1'>
                      <span className='text-gray-300 font-bold'>{dev.name}</span>
                      <span className='text-gray-500'>{dev.commits} commits/week</span>
                    </div>
                    <div className='w-full h-1.5 bg-gray-800 rounded-full overflow-hidden'>
                      <div
                        className='h-full rounded-full'
                        style={{
                          width: `${(dev.commits / 500) * 100}%`,
                          backgroundColor: dev.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className='mt-6 p-4 bg-gray-800/50 rounded border border-gray-700 text-center'>
                <Code2 size={24} className='text-gray-500 mx-auto mb-2' />
                <div className='text-xs text-gray-400'>Tracking 450+ Repositories</div>
                <button className='mt-2 text-[10px] bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors'>
                  View Source
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentPanel;
