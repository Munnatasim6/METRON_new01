import React, { useState, useEffect } from 'react';
import {
  Zap,
  Server,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  ArrowRightLeft,
  Coins,
  Layers,
  RefreshCw,
  Clock,
  Settings,
  Globe,
  Database,
  Hash,
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
  Cell,
  AreaChart,
  Area,
} from 'recharts';

type Tab = 'CORE_EXECUTION' | 'API_NETWORK' | 'OPTIMIZATION';

const ExecutionPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('CORE_EXECUTION');

  // Mock Data States
  const [latencyData, setLatencyData] = useState<any[]>([]);
  const [rateLimit, setRateLimit] = useState(120); // Used weight
  const [balanceSync, setBalanceSync] = useState(false);

  useEffect(() => {
    // Simulate Latency Jitter
    const interval = setInterval(() => {
      setLatencyData((prev) => {
        const ping = 25 + Math.random() * 40 - 10;
        return [...prev, { time: prev.length, ping }].slice(-50);
      });

      // Simulate Rate Limit Decay/Usage
      setRateLimit((prev) => {
        const change = Math.random() > 0.7 ? 50 : -5; // Bursts of requests vs decay
        return Math.max(0, Math.min(1200, prev + change));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSync = () => {
    setBalanceSync(true);
    setTimeout(() => setBalanceSync(false), 2000);
  };

  return (
    <div className='p-6 h-full flex flex-col animate-fade-in bg-gray-950'>
      {/* HEADER */}
      <div className='shrink-0 mb-6'>
        <div className='flex items-center justify-between border-b border-gray-800 pb-4 mb-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-yellow-600/10 rounded-lg'>
              <Zap className='text-yellow-500' size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold font-mono text-white'>EXECUTION ENGINE</h2>
              <p className='text-xs text-gray-500 font-mono'>
                Phase 8: API Interaction & Order Routing
              </p>
            </div>
          </div>

          <div className='flex bg-gray-900 rounded-lg p-1 border border-gray-800'>
            {['CORE_EXECUTION', 'API_NETWORK', 'OPTIMIZATION'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={`
                            px-4 py-2 rounded text-xs font-bold font-mono transition-all flex items-center gap-2
                            ${
                              activeTab === tab
                                ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
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
        {/* --- TAB 1: CORE EXECUTION --- */}
        {activeTab === 'CORE_EXECUTION' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. API ORDER TERMINAL */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg flex flex-col h-[400px]'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Terminal size={16} className='text-green-400' /> Order Placement API Log
              </h3>
              <div className='flex-1 bg-black rounded border border-gray-800 p-4 overflow-y-auto custom-scrollbar font-mono text-xs'>
                <div className='space-y-3'>
                  {[
                    {
                      m: 'POST /api/v3/order',
                      d: '{"symbol": "BTCUSDT", "side": "BUY", "type": "LIMIT", "quantity": 0.5, "price": 42100}',
                      t: '14:05:01',
                      s: 200,
                    },
                    {
                      m: 'POST /api/v3/order',
                      d: '{"symbol": "ETHUSDT", "side": "SELL", "type": "MARKET", "quantity": 5.0}',
                      t: '14:05:05',
                      s: 200,
                    },
                    {
                      m: 'DELETE /api/v3/order',
                      d: '{"symbol": "BTCUSDT", "orderId": 882910}',
                      t: '14:05:12',
                      s: 200,
                    },
                    {
                      m: 'PUT /api/v3/order',
                      d: '{"orderId": 882915, "newPrice": 42150}',
                      t: '14:05:20',
                      s: 200,
                    },
                  ].map((req, i) => (
                    <div key={i} className='border-b border-gray-900 pb-2 mb-2'>
                      <div className='flex justify-between text-gray-500 mb-1'>
                        <span>[{req.t}]</span>
                        <span className='text-green-500'>HTTP {req.s} OK</span>
                      </div>
                      <div className='text-yellow-500 font-bold mb-1'>{req.m}</div>
                      <div className='text-gray-400 break-all pl-4 border-l-2 border-gray-800'>
                        {req.d}
                      </div>
                    </div>
                  ))}
                  <div className='animate-pulse flex gap-2 items-center text-gray-600 pt-2'>
                    <span className='w-2 h-2 bg-green-500 rounded-full'></span> Listening for
                    execution signals...
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PARTIAL PROFIT & LIFECYCLE */}
            <div className='space-y-6'>
              {/* Partial TP Logic */}
              <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
                <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                  <Layers size={16} className='text-blue-400' /> Partial Profit Booking System
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800'>
                    <span className='text-xs font-mono text-gray-400'>TP Level 1</span>
                    <div className='flex items-center gap-4'>
                      <span className='text-green-400 text-sm font-bold'>+1.5% Gain</span>
                      <span className='text-gray-500 text-xs'>Sell 25% Size</span>
                    </div>
                    <div className='w-24 h-2 bg-gray-800 rounded-full overflow-hidden'>
                      <div className='h-full bg-blue-500 w-[25%]'></div>
                    </div>
                  </div>
                  <div className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800'>
                    <span className='text-xs font-mono text-gray-400'>TP Level 2</span>
                    <div className='flex items-center gap-4'>
                      <span className='text-green-400 text-sm font-bold'>+3.0% Gain</span>
                      <span className='text-gray-500 text-xs'>Sell 50% Size</span>
                    </div>
                    <div className='w-24 h-2 bg-gray-800 rounded-full overflow-hidden'>
                      <div className='h-full bg-blue-500 w-[50%]'></div>
                    </div>
                  </div>
                  <div className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800 opacity-50'>
                    <span className='text-xs font-mono text-gray-400'>TP Level 3</span>
                    <div className='flex items-center gap-4'>
                      <span className='text-green-400 text-sm font-bold'>+5.0% Gain</span>
                      <span className='text-gray-500 text-xs'>Sell 100% Size</span>
                    </div>
                    <div className='w-24 h-2 bg-gray-800 rounded-full overflow-hidden'>
                      <div className='h-full bg-blue-500 w-full'></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
                <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                  <CheckCircle2 size={16} className='text-purple-400' /> Order Status Lifecycle
                </h3>
                <div className='flex items-center justify-between relative'>
                  <div className='absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -z-10'></div>
                  {['Created', 'Submitted', 'Open', 'Partially Filled', 'Filled'].map((s, i) => (
                    <div key={s} className='flex flex-col items-center gap-2 bg-gray-950 px-2 py-1'>
                      <div
                        className={`w-3 h-3 rounded-full border-2 ${i === 4 ? 'border-green-500 bg-green-500' : 'border-purple-500 bg-gray-900'}`}
                      ></div>
                      <span className='text-[9px] text-gray-400 uppercase'>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: API NETWORK --- */}
        {activeTab === 'API_NETWORK' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. RATE LIMIT MONITOR */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Server size={16} className='text-orange-400' /> API Rate Limit Handler
              </h3>
              <div className='flex items-center justify-center gap-8 mb-6'>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-white font-mono'>{rateLimit}</div>
                  <div className='text-xs text-gray-500 uppercase'>Used Weight (1m)</div>
                </div>
                <div className='h-16 w-px bg-gray-800'></div>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-gray-500 font-mono'>1200</div>
                  <div className='text-xs text-gray-500 uppercase'>Max Limit</div>
                </div>
              </div>
              <div className='w-full h-4 bg-gray-800 rounded-full overflow-hidden relative border border-gray-700'>
                <div
                  className={`h-full transition-all duration-300 ${rateLimit > 800 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${(rateLimit / 1200) * 100}%` }}
                ></div>
              </div>
              <div className='mt-4 text-xs font-mono text-gray-400 bg-black/40 p-2 rounded text-center'>
                Header: <span className='text-yellow-500'>X-MBX-USED-WEIGHT-1M</span>
              </div>
            </div>

            {/* 2. LATENCY CHART */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Wifi size={16} className='text-cyan-400' /> Latency Jitter (Ping)
              </h3>
              <div className='h-[200px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={latencyData}>
                    <defs>
                      <linearGradient id='colorPing' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#06b6d4' stopOpacity={0.3} />
                        <stop offset='95%' stopColor='#06b6d4' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
                    <XAxis dataKey='time' hide />
                    <YAxis domain={[0, 100]} stroke='#4b5563' fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        fontSize: '10px',
                      }}
                    />
                    <Area
                      type='monotone'
                      dataKey='ping'
                      stroke='#06b6d4'
                      strokeWidth={2}
                      fill='url(#colorPing)'
                      name='Ping (ms)'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. ERROR HANDLER */}
            <div className='lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <AlertTriangle size={16} className='text-red-500' /> Trade Error Handling Module
              </h3>
              <div className='grid grid-cols-3 gap-4'>
                <div className='p-3 bg-red-900/10 border border-red-500/20 rounded'>
                  <div className='text-xs text-red-400 font-bold mb-1'>
                    HTTP 429 (Too Many Requests)
                  </div>
                  <div className='text-[10px] text-gray-400'>
                    Action: Exponential Backoff (1s -&gt; 2s -&gt; 4s)
                  </div>
                </div>
                <div className='p-3 bg-red-900/10 border border-red-500/20 rounded'>
                  <div className='text-xs text-red-400 font-bold mb-1'>
                    HTTP 500 (Exchange Down)
                  </div>
                  <div className='text-[10px] text-gray-400'>
                    Action: Halt Trading, Alert User, Try Secondary Exchange
                  </div>
                </div>
                <div className='p-3 bg-red-900/10 border border-red-500/20 rounded'>
                  <div className='text-xs text-red-400 font-bold mb-1'>
                    Order Reject (Insufficient Funds)
                  </div>
                  <div className='text-[10px] text-gray-400'>
                    Action: Sync Balance, Recalculate Size
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: OPTIMIZATION --- */}
        {activeTab === 'OPTIMIZATION' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. SMART ORDER ROUTING */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-2'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-6'>
                <Globe size={16} className='text-indigo-400' /> Smart Order Routing (SOR) Simulator
              </h3>
              <div className='flex items-center justify-between gap-4'>
                {/* Source */}
                <div className='flex flex-col items-center'>
                  <div className='w-16 h-16 rounded-full bg-gray-800 border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]'>
                    <span className='font-bold text-white'>BOT</span>
                  </div>
                  <div className='mt-2 text-xs font-mono text-gray-400'>Order: 5.0 BTC</div>
                </div>

                {/* Arrows */}
                <div className='flex-1 flex flex-col gap-4 relative'>
                  {/* Path 1 */}
                  <div className='flex items-center gap-2'>
                    <div className='h-0.5 flex-1 bg-gradient-to-r from-indigo-500 to-green-500'></div>
                    <div className='text-[10px] bg-green-900/20 text-green-400 px-2 rounded border border-green-500/30'>
                      3.0 BTC @ $42,100 (Binance)
                    </div>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  </div>
                  {/* Path 2 */}
                  <div className='flex items-center gap-2'>
                    <div className='h-0.5 flex-1 bg-gradient-to-r from-indigo-500 to-yellow-500'></div>
                    <div className='text-[10px] bg-yellow-900/20 text-yellow-400 px-2 rounded border border-yellow-500/30'>
                      2.0 BTC @ $42,105 (Bybit)
                    </div>
                    <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                  </div>
                </div>

                {/* Destinations */}
                <div className='flex flex-col gap-4'>
                  <div className='w-12 h-12 rounded bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-bold'>
                    Binance
                  </div>
                  <div className='w-12 h-12 rounded bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-bold'>
                    Bybit
                  </div>
                </div>
              </div>
              <div className='mt-6 text-center text-xs text-green-400 font-mono'>
                Net Savings vs Single Exchange: $45.20 (Slippage Reduction)
              </div>
            </div>

            {/* 2. FEE OPTIMIZER */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Coins size={16} className='text-yellow-400' /> Fee Optimization & Calculation
              </h3>
              <table className='w-full text-left font-mono text-xs'>
                <thead className='text-gray-500 border-b border-gray-800'>
                  <tr>
                    <th className='pb-2'>Type</th>
                    <th className='pb-2'>Rate</th>
                    <th className='pb-2'>Cost (1 BTC)</th>
                    <th className='pb-2 text-right'>Optimization</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-800'>
                  <tr>
                    <td className='py-3 text-gray-300'>Taker (Market)</td>
                    <td className='py-3 text-red-400'>0.05%</td>
                    <td className='py-3 text-white'>$21.00</td>
                    <td className='py-3 text-right'>
                      <span className='text-gray-600'>-</span>
                    </td>
                  </tr>
                  <tr>
                    <td className='py-3 text-gray-300'>Maker (Limit)</td>
                    <td className='py-3 text-green-400'>0.02%</td>
                    <td className='py-3 text-white'>$8.40</td>
                    <td className='py-3 text-right'>
                      <span className='text-green-500 font-bold'>SAVE 60%</span>
                    </td>
                  </tr>
                  <tr>
                    <td className='py-3 text-gray-300'>BNB Burn</td>
                    <td className='py-3 text-green-400'>0.015%</td>
                    <td className='py-3 text-white'>$6.30</td>
                    <td className='py-3 text-right'>
                      <span className='text-green-500 font-bold'>SAVE 25%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. BALANCE SYNC */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='font-bold text-gray-300 flex items-center gap-2'>
                  <RefreshCw
                    size={16}
                    className={`text-blue-400 ${balanceSync ? 'animate-spin' : ''}`}
                  />{' '}
                  Balance Synchronization
                </h3>
                <button
                  onClick={handleSync}
                  className='text-[10px] bg-blue-500/10 text-blue-400 px-3 py-1 rounded border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-colors'
                >
                  SYNC NOW
                </button>
              </div>
              <div className='space-y-3'>
                {[
                  { coin: 'USDT', total: 45200.5, avail: 12000.0, inOrder: 33200.5 },
                  { coin: 'BTC', total: 1.254, avail: 0.5, inOrder: 0.754 },
                  { coin: 'ETH', total: 15.0, avail: 15.0, inOrder: 0.0 },
                ].map((bal) => (
                  <div
                    key={bal.coin}
                    className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'
                  >
                    <div className='flex items-center gap-2'>
                      <div className='w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-xs'>
                        {bal.coin}
                      </div>
                      <div className='flex flex-col'>
                        <span className='text-xs font-bold text-white'>{bal.total}</span>
                        <span className='text-[10px] text-gray-500'>Total</span>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-xs font-bold text-green-400'>{bal.avail}</div>
                      <div className='text-[10px] text-gray-500'>Available</div>
                    </div>
                    <div className='text-right'>
                      <div className='text-xs font-bold text-yellow-400'>{bal.inOrder}</div>
                      <div className='text-[10px] text-gray-500'>Locked</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionPanel;
