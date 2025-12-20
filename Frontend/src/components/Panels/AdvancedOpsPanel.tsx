import React, { useState, useEffect } from 'react';
import {
  Blocks,
  Globe,
  Server,
  Shield,
  Cpu,
  Zap,
  RefreshCw,
  Database,
  Map,
  Lock,
  FileText,
  Eye,
  AlertTriangle,
  Mic,
  Bell,
  Shuffle,
  Layers,
  Box,
  Wallet,
  ArrowRightLeft,
  Flame,
  Activity,
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
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

type Tab = 'WEB3_DEFI' | 'CLOUD_OPS' | 'SENTINEL_SEC' | 'AI_RELIABILITY';

const AdvancedOpsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('WEB3_DEFI');

  // Mock Data States
  const [gasPrice, setGasPrice] = useState(25);
  const [blockHeight, setBlockHeight] = useState(19240500);
  const [driftData, setDriftData] = useState<any[]>([]);

  useEffect(() => {
    // Simulate Web3 Live Data
    const interval = setInterval(() => {
      setGasPrice((prev) => Math.max(10, prev + (Math.random() * 10 - 5)));
      setBlockHeight((prev) => prev + 1);
    }, 3000);

    // Simulate Model Drift
    const drift = [];
    let acc = 0.95;
    for (let i = 0; i < 30; i++) {
      acc -= Math.random() * 0.01;
      drift.push({ day: i, accuracy: acc, threshold: 0.85 });
    }
    setDriftData(drift);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='p-6 h-full flex flex-col animate-fade-in bg-gray-950'>
      {/* HEADER */}
      <div className='shrink-0 mb-6'>
        <div className='flex items-center justify-between border-b border-gray-800 pb-4 mb-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-cyan-600/10 rounded-lg'>
              <Blocks className='text-cyan-500' size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold font-mono text-white'>
                ADVANCED MODULES (WEB3 & OPS)
              </h2>
              <p className='text-xs text-gray-500 font-mono'>
                Phase 11: DeFi Integration, Auto-Scaling & Self-Healing AI
              </p>
            </div>
          </div>

          <div className='flex bg-gray-900 rounded-lg p-1 border border-gray-800 overflow-x-auto max-w-[700px] custom-scrollbar'>
            {[
              { id: 'WEB3_DEFI', icon: Wallet, label: 'Web3 & DeFi' },
              { id: 'CLOUD_OPS', icon: Server, label: 'Cloud Ops' },
              { id: 'SENTINEL_SEC', icon: Shield, label: 'Sentinel & Sec' },
              { id: 'AI_RELIABILITY', icon: Cpu, label: 'AI Reliability' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`
                            px-4 py-2 rounded text-xs font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap
                            ${
                              activeTab === item.id
                                ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
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
        {/* --- TAB 1: WEB3 & DEFI --- */}
        {activeTab === 'WEB3_DEFI' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. WEB3 CONNECTION STATUS */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Globe size={16} className='text-blue-400' /> Web3.py Gateway
              </h3>
              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div className='bg-gray-950 p-3 rounded border border-gray-800 flex items-center justify-between'>
                  <div>
                    <div className='text-[10px] text-gray-500 uppercase'>Provider</div>
                    <div className='text-sm font-bold text-white'>Infura (Mainnet)</div>
                  </div>
                  <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]'></div>
                </div>
                <div className='bg-gray-950 p-3 rounded border border-gray-800 flex items-center justify-between'>
                  <div>
                    <div className='text-[10px] text-gray-500 uppercase'>Block Height</div>
                    <div className='text-sm font-bold text-blue-400'>#{blockHeight}</div>
                  </div>
                  <Activity size={16} className='text-blue-500' />
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex justify-between items-center text-xs font-mono text-gray-400 bg-black/40 p-2 rounded'>
                  <span className='flex items-center gap-2'>
                    <Flame size={12} className='text-orange-500' /> Gas Price
                  </span>
                  <span className='text-orange-400 font-bold'>{gasPrice.toFixed(0)} Gwei</span>
                </div>
                <div className='flex justify-between items-center text-xs font-mono text-gray-400 bg-black/40 p-2 rounded'>
                  <span className='flex items-center gap-2'>
                    <Eye size={12} className='text-purple-500' /> Mempool Scan
                  </span>
                  <span className='text-purple-400 font-bold'>4,203 Pending Txs</span>
                </div>
              </div>
            </div>

            {/* 2. DEX ROUTING & AGGREGATION */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <ArrowRightLeft size={16} className='text-pink-400' /> DEX Aggregation
                (Uniswap/Pancake)
              </h3>
              <div className='bg-gray-950 p-4 rounded border border-gray-800'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2'>
                    <div className='w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-xs text-white'>
                      ETH
                    </div>
                    <ArrowRightLeft size={14} className='text-gray-600' />
                    <div className='w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-xs text-white'>
                      USDT
                    </div>
                  </div>
                  <div className='text-xs text-gray-500'>Route: Best Price</div>
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between items-center p-2 bg-gray-900 rounded border border-green-500/30 relative overflow-hidden'>
                    <div className='absolute left-0 top-0 bottom-0 w-1 bg-green-500'></div>
                    <span className='text-xs font-bold text-gray-300'>Uniswap V3</span>
                    <span className='text-xs font-bold text-green-400'>1 ETH = 3,240.50 USDT</span>
                  </div>
                  <div className='flex justify-between items-center p-2 bg-gray-900 rounded border border-gray-800 opacity-60'>
                    <span className='text-xs font-bold text-gray-300'>SushiSwap</span>
                    <span className='text-xs text-gray-500'>3,238.10 USDT</span>
                  </div>
                  <div className='flex justify-between items-center p-2 bg-gray-900 rounded border border-gray-800 opacity-60'>
                    <span className='text-xs font-bold text-gray-300'>Curve</span>
                    <span className='text-xs text-gray-500'>3,235.00 USDT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. BRIDGE STATUS */}
            <div className='lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Layers size={16} className='text-yellow-400' /> Bridge & Cross-Chain Liquidity
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Optimism', 'Solana'].map(
                  (chain, i) => (
                    <div
                      key={chain}
                      className='bg-gray-950 p-3 rounded border border-gray-800 flex items-center justify-between'
                    >
                      <div className='flex items-center gap-2'>
                        <div
                          className={`w-2 h-2 rounded-full ${i < 4 ? 'bg-green-500' : 'bg-yellow-500'}`}
                        ></div>
                        <span className='text-xs font-bold text-gray-300'>{chain}</span>
                      </div>
                      <span className='text-[10px] text-gray-500 font-mono'>
                        {i < 4 ? 'Active' : 'Congested'}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: CLOUD OPS --- */}
        {activeTab === 'CLOUD_OPS' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. KUBERNETES CLUSTER */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-2'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-6'>
                <Box size={16} className='text-blue-400' /> Kubernetes Auto-Scaling Cluster
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {[1, 2, 3, 4].map((node) => (
                  <div
                    key={node}
                    className='bg-gray-950 p-4 rounded border border-gray-800 relative overflow-hidden group'
                  >
                    <div className='absolute top-0 left-0 w-full h-1 bg-blue-500'></div>
                    <div className='flex justify-between items-start mb-4'>
                      <span className='text-xs font-bold text-gray-300'>Worker Node 0{node}</span>
                      <span className='text-[10px] text-green-500 bg-green-900/20 px-1 rounded'>
                        Ready
                      </span>
                    </div>
                    <div className='space-y-2'>
                      <div className='flex gap-1 flex-wrap'>
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className='w-6 h-6 bg-gray-800 rounded flex items-center justify-center text-[8px] text-gray-500 border border-gray-700'
                            title='Pod'
                          >
                            P{i}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className='mt-4 pt-2 border-t border-gray-900 flex justify-between text-[10px] text-gray-500'>
                      <span>CPU: 45%</span>
                      <span>Mem: 60%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. DATABASE MAINTENANCE */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Database size={16} className='text-purple-400' /> DB Pruning & Hygiene
              </h3>
              <div className='flex items-center gap-6'>
                <div className='w-1/3 text-center'>
                  <div className='relative inline-flex items-center justify-center'>
                    <svg className='transform -rotate-90 w-24 h-24'>
                      <circle
                        cx='48'
                        cy='48'
                        r='40'
                        stroke='currentColor'
                        strokeWidth='8'
                        fill='transparent'
                        className='text-gray-800'
                      />
                      <circle
                        cx='48'
                        cy='48'
                        r='40'
                        stroke='currentColor'
                        strokeWidth='8'
                        fill='transparent'
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 * (1 - 0.75)}
                        className='text-purple-500'
                      />
                    </svg>
                    <span className='absolute text-xl font-bold text-white'>75%</span>
                  </div>
                  <div className='text-xs text-gray-500 mt-2'>Storage Used</div>
                </div>
                <div className='flex-1 space-y-3'>
                  <div className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'>
                    <span className='text-xs text-gray-300'>Auto-Prune Old Logs</span>
                    <span className='text-[10px] text-green-400'>ON (&gt;30 Days)</span>
                  </div>
                  <div className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'>
                    <span className='text-xs text-gray-300'>Vacuum Analyze</span>
                    <span className='text-[10px] text-gray-500'>Scheduled (04:00)</span>
                  </div>
                  <button className='w-full py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 rounded border border-gray-700 flex items-center justify-center gap-2'>
                    <RefreshCw size={12} /> Run Manual Prune
                  </button>
                </div>
              </div>
            </div>

            {/* 3. IP ROTATION & PROXY */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Shuffle size={16} className='text-orange-400' /> IP Rotation System
              </h3>
              <div className='space-y-4'>
                <div className='bg-black/40 p-3 rounded border border-gray-800 font-mono text-xs'>
                  <div className='flex justify-between mb-2'>
                    <span className='text-gray-500'>Current IP</span>
                    <span className='text-green-400'>192.168.X.X (US-East)</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Next Rotation</span>
                    <span className='text-white'>04:59 (12m left)</span>
                  </div>
                </div>
                <div className='flex gap-2'>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${i < 3 ? 'bg-orange-500' : 'bg-gray-800'}`}
                    ></div>
                  ))}
                </div>
                <div className='text-center text-[10px] text-gray-500'>
                  Pool Health: 98% (420 Active Proxies)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: SENTINEL & SEC --- */}
        {activeTab === 'SENTINEL_SEC' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. GEO-LOCKING MAP */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Map size={16} className='text-green-400' /> Geo-Fencing & Restrictions
              </h3>
              <div className='h-[200px] bg-gray-950 rounded border border-gray-800 flex items-center justify-center relative overflow-hidden'>
                <div className='text-gray-700 font-bold text-4xl opacity-20 select-none'>
                  WORLD MAP
                </div>
                {/* Fake Hotspots */}
                <div className='absolute top-1/3 left-1/4 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]'></div>
                <div className='absolute top-1/4 right-1/3 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444] animate-pulse'></div>
              </div>
              <div className='flex justify-between mt-4 text-xs font-mono'>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span className='text-gray-400'>Allowed: USA, EU, JP</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                  <span className='text-gray-400'>Blocked: NK, IR, SY</span>
                </div>
              </div>
            </div>

            {/* 2. COMPLIANCE & KYC */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <FileText size={16} className='text-yellow-400' /> Compliance & Reporting
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='flex items-center gap-3'>
                    <Lock size={16} className='text-gray-500' />
                    <div className='text-xs font-bold text-gray-200'>KYC Status</div>
                  </div>
                  <span className='text-[10px] bg-green-900/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30'>
                    VERIFIED (TIER 3)
                  </span>
                </div>
                <div className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='flex items-center gap-3'>
                    <FileText size={16} className='text-gray-500' />
                    <div className='text-xs font-bold text-gray-200'>Tax Report Generator</div>
                  </div>
                  <button className='text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded'>
                    GENERATE CSV
                  </button>
                </div>
                <div className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='flex items-center gap-3'>
                    <Eye size={16} className='text-gray-500' />
                    <div className='text-xs font-bold text-gray-200'>Audit Log</div>
                  </div>
                  <span className='text-[10px] text-gray-500'>Immutable (On-Chain)</span>
                </div>
              </div>
            </div>

            {/* 3. SENTINEL WATCHDOG */}
            <div className='lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Shield size={16} className='text-red-500' /> Sentinel System (Watchdog)
              </h3>
              <div className='grid grid-cols-4 gap-4'>
                {[
                  { n: 'API Anomaly', s: 'Secure', c: 'text-green-500' },
                  { n: 'Balance Drain', s: 'Secure', c: 'text-green-500' },
                  { n: 'Login Attempts', s: '1 Failed', c: 'text-yellow-500' },
                  { n: 'Config Change', s: 'Verified', c: 'text-green-500' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className='bg-gray-950 p-3 rounded border border-gray-800 text-center'
                  >
                    <div className='text-[10px] text-gray-500 uppercase mb-1'>{item.n}</div>
                    <div className={`text-sm font-bold ${item.c}`}>{item.s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: AI RELIABILITY --- */}
        {activeTab === 'AI_RELIABILITY' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. MODEL DRIFT */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Activity size={16} className='text-pink-400' /> Model Drift Detection
              </h3>
              <div className='h-[200px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={driftData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
                    <XAxis dataKey='day' hide />
                    <YAxis domain={[0.8, 1]} stroke='#4b5563' fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        fontSize: '10px',
                      }}
                    />
                    <Line
                      type='monotone'
                      dataKey='accuracy'
                      stroke='#ec4899'
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type='monotone'
                      dataKey='threshold'
                      stroke='#ef4444'
                      strokeDasharray='3 3'
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className='text-xs text-center text-gray-500 mt-2'>
                Accuracy Decay vs Retraining Threshold (Red Line)
              </div>
            </div>

            {/* 2. CHAOS MONKEY */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <AlertTriangle size={16} className='text-orange-500' /> Chaos Testing (Simulated
                Failures)
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                {[
                  { n: 'Kill DB Connection', active: false },
                  { n: 'Inject 500ms Latency', active: true },
                  { n: 'Corrupt L2 Data', active: false },
                  { n: 'Random API 429', active: true },
                ].map((test, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded border flex justify-between items-center ${test.active ? 'bg-orange-900/10 border-orange-500/30' : 'bg-gray-950 border-gray-800 opacity-50'}`}
                  >
                    <span className='text-xs text-gray-300'>{test.n}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${test.active ? 'bg-orange-500 animate-pulse' : 'bg-gray-600'}`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. VOICE & SMART NOTIFICATIONS */}
            <div className='lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg flex justify-between gap-6'>
              <div className='flex-1'>
                <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                  <Mic size={16} className='text-blue-400' /> Voice Command Center
                </h3>
                <div className='bg-black/40 p-3 rounded border border-gray-800 h-24 overflow-y-auto custom-scrollbar font-mono text-xs text-gray-400'>
                  <p>&gt; "System status check"</p>
                  <p className='text-green-500'>System is nominal. All services online.</p>
                  <p>&gt; "Stop all trading"</p>
                  <p className='text-yellow-500'>Confirm emergency stop? (Y/N)</p>
                </div>
                <div className='mt-2 flex items-center gap-2'>
                  <div className='w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse'>
                    <Mic size={16} className='text-red-500' />
                  </div>
                  <span className='text-xs text-gray-500'>Listening...</span>
                </div>
              </div>

              <div className='flex-1'>
                <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                  <Bell size={16} className='text-yellow-400' /> Smart Notification Routing
                </h3>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center text-xs text-gray-400 p-2 bg-gray-950 rounded border border-gray-800'>
                    <span>Critical Errors</span>
                    <span className='text-white font-bold'>SMS + Call (Twilio)</span>
                  </div>
                  <div className='flex justify-between items-center text-xs text-gray-400 p-2 bg-gray-950 rounded border border-gray-800'>
                    <span>Trade Fills</span>
                    <span className='text-white font-bold'>Telegram</span>
                  </div>
                  <div className='flex justify-between items-center text-xs text-gray-400 p-2 bg-gray-950 rounded border border-gray-800'>
                    <span>Daily Report</span>
                    <span className='text-white font-bold'>Email (SendGrid)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedOpsPanel;
