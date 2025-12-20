import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Zap,
  Server,
  ShieldCheck,
  Terminal,
  Box,
  Activity,
  Layers,
  GitMerge,
  Code,
  Wifi,
  Database,
  Lock,
  ArrowRight,
  Gauge,
  Microchip,
  Archive,
  AlertOctagon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  Cell,
} from 'recharts';

type Tab = 'FOUNDATION' | 'CONNECTIVITY' | 'DATA_ENGINE' | 'AI_EXECUTION';

const RustTransformationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('FOUNDATION');
  // Mock Data Generators - Lazy Initializers
  const [throughput] = useState<any[]>(() => {
    const tData = [];
    for (let i = 0; i < 20; i++) {
      tData.push({
        time: i,
        python: 1200 + Math.random() * 200,
        rust: 45000 + Math.random() * 5000,
      });
    }
    return tData;
  });

  const [latencyDiff] = useState<any[]>(() => [
    { metric: 'JSON Parse', py: 450, rust: 12 },
    { metric: 'Order Book', py: 1200, rust: 45 },
    { metric: 'Risk Check', py: 350, rust: 2 },
    { metric: 'Net IO', py: 200, rust: 15 },
  ]);

  return (
    <div className='p-6 h-full flex flex-col animate-fade-in bg-gray-950'>
      {/* HEADER */}
      <div className='shrink-0 mb-6'>
        <div className='flex items-center justify-between border-b border-gray-800 pb-4 mb-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-orange-600/10 rounded-lg'>
              <Box className='text-orange-500' size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold font-mono text-white'>RUST HFT CORE</h2>
              <p className='text-xs text-gray-500 font-mono'>
                Phase 12: Microsecond Latency Transformation
              </p>
            </div>
          </div>

          <div className='flex bg-gray-900 rounded-lg p-1 border border-gray-800 overflow-x-auto max-w-[700px] custom-scrollbar'>
            {[
              { id: 'FOUNDATION', icon: Code, label: 'Rust Foundation' },
              { id: 'CONNECTIVITY', icon: Wifi, label: 'HFT Connectivity' },
              { id: 'DATA_ENGINE', icon: Database, label: 'Data Engine' },
              { id: 'AI_EXECUTION', icon: Zap, label: 'AI & Execution' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`
                            px-4 py-2 rounded text-xs font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap
                            ${
                              activeTab === item.id
                                ? 'bg-orange-900/30 text-orange-300 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]'
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
        {/* --- TAB 1: FOUNDATION --- */}
        {activeTab === 'FOUNDATION' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. BENCHMARK LAB (PYTHON vs RUST) */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-2'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Gauge size={16} className='text-orange-400' /> Performance Benchmark: Python vs
                Rust
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div className='h-[250px]'>
                  <div className='text-xs text-center text-gray-500 mb-2'>
                    Throughput (Events / Sec)
                  </div>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={throughput}>
                      <defs>
                        <linearGradient id='colorRust' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='5%' stopColor='#f97316' stopOpacity={0.3} />
                          <stop offset='95%' stopColor='#f97316' stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' vertical={false} />
                      <XAxis dataKey='time' hide />
                      <YAxis stroke='#4b5563' fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          borderColor: '#374151',
                          fontSize: '10px',
                        }}
                      />
                      <Area
                        type='monotone'
                        dataKey='rust'
                        stroke='#f97316'
                        fill='url(#colorRust)'
                        name='Rust (Tokio)'
                      />
                      <Area
                        type='monotone'
                        dataKey='python'
                        stroke='#3b82f6'
                        fill='none'
                        name='Python (Asyncio)'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className='h-[250px]'>
                  <div className='text-xs text-center text-gray-500 mb-2'>
                    Latency Comparison (µs)
                  </div>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={latencyDiff} layout='vertical'>
                      <CartesianGrid strokeDasharray='3 3' stroke='#1f2937' horizontal={false} />
                      <XAxis type='number' stroke='#4b5563' fontSize={10} />
                      <YAxis
                        dataKey='metric'
                        type='category'
                        stroke='#9ca3af'
                        fontSize={10}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          borderColor: '#374151',
                          fontSize: '10px',
                        }}
                      />
                      <Bar
                        dataKey='py'
                        fill='#3b82f6'
                        name='Python'
                        radius={[0, 4, 4, 0]}
                        barSize={10}
                      />
                      <Bar
                        dataKey='rust'
                        fill='#f97316'
                        name='Rust'
                        radius={[0, 4, 4, 0]}
                        barSize={10}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 2. SETUP CHECKLIST */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Terminal size={16} className='text-gray-400' /> Environment Setup
              </h3>
              <div className='space-y-3'>
                {[
                  { name: 'Rust Toolchain (Cargo)', status: 'INSTALLED', v: 'v1.75.0' },
                  { name: 'IDE Analysis (Rust Analyzer)', status: 'ACTIVE', v: 'LSP Ready' },
                  { name: 'Async Runtime (Tokio)', status: 'CONFIGURED', v: 'Multi-thread' },
                  { name: 'Logging (Tracing-Subscriber)', status: 'READY', v: 'JSON/Fmt' },
                  { name: 'Config Mgmt (Config-rs)', status: 'LOADED', v: 'Layered' },
                  { name: 'Docker Multi-Stage Build', status: 'OPTIMIZED', v: 'Distroless' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'
                  >
                    <div>
                      <div className='text-xs font-bold text-gray-200'>{item.name}</div>
                      <div className='text-[10px] text-gray-500'>{item.v}</div>
                    </div>
                    <span className='text-[10px] bg-green-900/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30 font-bold'>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. SAFETY & TESTING */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <ShieldCheck size={16} className='text-green-400' /> Safety & Benchmarking
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-500 mb-1'>Memory Safety</div>
                  <div className='text-sm font-bold text-white flex items-center gap-2'>
                    <Lock size={12} className='text-green-500' /> Borrow Checker
                  </div>
                  <div className='text-[10px] text-green-400 mt-1'>0 Data Races Detected</div>
                </div>
                <div className='p-3 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-500 mb-1'>Benchmarks</div>
                  <div className='text-sm font-bold text-white flex items-center gap-2'>
                    <Activity size={12} className='text-orange-500' /> Criterion.rs
                  </div>
                  <div className='text-[10px] text-gray-400 mt-1'>Regressions: None</div>
                </div>
              </div>
              <div className='mt-4 p-3 bg-black/40 rounded font-mono text-[10px] text-gray-400 overflow-x-auto'>
                $ cargo bench -- --save-baseline main
                <br />
                <span className='text-green-400'>Time: 12.45ns (+/- 0.2ns)</span>
                <br />
                <span className='text-blue-400'>Thrpt: 80.3 GiB/s</span>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: CONNECTIVITY --- */}
        {activeTab === 'CONNECTIVITY' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. PROTOCOL OPTIMIZATION */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Wifi size={16} className='text-blue-400' /> Low-Latency Protocols
              </h3>
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800'>
                  <div>
                    <div className='text-xs font-bold text-white'>WebSocket Client</div>
                    <div className='text-[10px] text-gray-500'>Crate: tokio-tungstenite</div>
                  </div>
                  <div className='text-right'>
                    <div className='text-xs font-mono text-green-400 font-bold'>Active</div>
                    <div className='text-[10px] text-gray-600'>Keep-Alive: 5ms</div>
                  </div>
                </div>
                <div className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800'>
                  <div>
                    <div className='text-xs font-bold text-white'>Serialization Engine</div>
                    <div className='text-[10px] text-gray-500'>Crate: simd-json / Serde</div>
                  </div>
                  <div className='text-right'>
                    <div className='text-xs font-mono text-orange-400 font-bold'>AVX2 Enabled</div>
                    <div className='text-[10px] text-gray-600'>Parse: 1.2µs</div>
                  </div>
                </div>
                <div className='flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800 opacity-60'>
                  <div>
                    <div className='text-xs font-bold text-gray-400'>FIX Protocol (Engine)</div>
                    <div className='text-[10px] text-gray-600'>Binary Protocol (SBE)</div>
                  </div>
                  <div className='text-right'>
                    <div className='text-xs font-mono text-gray-500'>Pending</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. NETWORK TUNING VISUALIZER */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-6'>
                <Server size={16} className='text-purple-400' /> Kernel & Network Tuning
              </h3>
              <div className='relative h-[200px] bg-black/40 rounded border border-gray-800 flex items-center justify-center'>
                {/* Diagram */}
                <div className='flex items-center gap-4 text-center'>
                  <div className='p-2 bg-gray-800 rounded border border-gray-700'>
                    <div className='text-[10px] text-gray-500'>NIC</div>
                    <div className='text-xs font-bold text-white'>Network Card</div>
                  </div>
                  <ArrowRight size={16} className='text-gray-600' />
                  <div className='p-2 bg-red-900/20 rounded border border-red-500/30 relative'>
                    <div className='text-[10px] text-red-400'>Kernel Space</div>
                    <div className='text-xs font-bold text-gray-400 line-through'>TCP Stack</div>
                    <div className='absolute -top-3 left-0 w-full text-[9px] text-green-500 font-bold animate-pulse'>
                      KERNEL BYPASS
                    </div>
                  </div>
                  <ArrowRight size={16} className='text-green-500' />
                  <div className='p-2 bg-orange-900/20 rounded border border-orange-500/30'>
                    <div className='text-[10px] text-orange-400'>User Space</div>
                    <div className='text-xs font-bold text-white'>Rust App</div>
                  </div>
                </div>
              </div>
              <div className='mt-4 grid grid-cols-2 gap-4 text-xs font-mono'>
                <div className='flex justify-between border-b border-gray-800 pb-1'>
                  <span className='text-gray-500'>Clock Sync</span>
                  <span className='text-white'>PTP (µs)</span>
                </div>
                <div className='flex justify-between border-b border-gray-800 pb-1'>
                  <span className='text-gray-500'>Rate Limiter</span>
                  <span className='text-white'>Token Bucket</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: DATA ENGINE --- */}
        {activeTab === 'DATA_ENGINE' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. ZERO-COPY PIPELINE */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-2'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-6'>
                <Zap size={16} className='text-yellow-400' /> Zero-Copy Data Pipeline
              </h3>
              <div className='flex items-center gap-4 overflow-x-auto pb-2'>
                {[
                  { step: 'Raw Bytes', desc: 'Ring Buffer', color: 'border-gray-600' },
                  {
                    step: 'Zero-Copy Parse',
                    desc: 'simd-json',
                    color: 'border-blue-500 bg-blue-900/10',
                  },
                  {
                    step: 'OrderBook Update',
                    desc: 'Lock-free Map',
                    color: 'border-orange-500 bg-orange-900/10',
                  },
                  {
                    step: 'Feature Calc',
                    desc: 'Rolling Win',
                    color: 'border-green-500 bg-green-900/10',
                  },
                  {
                    step: 'Strategy Sig',
                    desc: 'Atomic Bool',
                    color: 'border-purple-500 bg-purple-900/10',
                  },
                ].map((s, i) => (
                  <React.Fragment key={i}>
                    <div className={`flex-shrink-0 w-32 p-3 rounded border ${s.color} text-center`}>
                      <div className='text-xs font-bold text-white'>{s.step}</div>
                      <div className='text-[10px] text-gray-500 mt-1'>{s.desc}</div>
                    </div>
                    {i < 4 && <ArrowRight size={20} className='text-gray-600 flex-shrink-0' />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* 2. ORDER BOOK RECONSTRUCTION */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Layers size={16} className='text-cyan-400' /> L2 Order Book Engine
              </h3>
              <div className='space-y-4'>
                <div className='flex gap-4'>
                  <div className='w-1/2 p-3 bg-gray-950 rounded border border-gray-800 text-center'>
                    <div className='text-[10px] text-gray-500 uppercase'>Structure</div>
                    <div className='text-sm font-bold text-white'>BTreeMap</div>
                    <div className='text-[9px] text-green-400'>Sorted & Indexed</div>
                  </div>
                  <div className='w-1/2 p-3 bg-gray-950 rounded border border-gray-800 text-center'>
                    <div className='text-[10px] text-gray-500 uppercase'>Updates/Sec</div>
                    <div className='text-sm font-bold text-cyan-400'>250,000+</div>
                    <div className='text-[9px] text-gray-500'>Incremental</div>
                  </div>
                </div>
                <div className='h-24 bg-black/40 rounded border border-gray-800 relative overflow-hidden flex items-end gap-1 px-2'>
                  {/* Visualizing Depth */}
                  {[40, 60, 30, 80, 50, 20, 90, 45, 70, 30, 60, 40].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${i < 6 ? 'bg-green-500/50' : 'bg-red-500/50'}`}
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                  <div className='absolute top-2 left-2 text-[9px] text-gray-400'>
                    Bid/Ask Spread: 0.01
                  </div>
                </div>
              </div>
            </div>

            {/* 3. STORAGE & INTEGRITY */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Archive size={16} className='text-indigo-400' /> Storage & Integrity
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-300'>Efficient Storage</div>
                  <div className='flex gap-2'>
                    <span className='px-1.5 py-0.5 rounded bg-blue-900/20 text-blue-400 text-[10px] border border-blue-500/30'>
                      Polars
                    </span>
                    <span className='px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px] border border-gray-700'>
                      Parquet
                    </span>
                  </div>
                </div>
                <div className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-300'>Sequence Check</div>
                  <span className='text-[10px] text-green-400 font-bold'>Gap Detection Active</span>
                </div>
                <div className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'>
                  <div className='text-xs text-gray-300'>Imbalance Calc</div>
                  <span className='text-[10px] text-orange-400 font-bold'>Real-time (µs)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: AI & EXECUTION --- */}
        {activeTab === 'AI_EXECUTION' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 1. ONNX RUNTIME */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Microchip size={16} className='text-pink-400' /> Inference Engine (ONNX)
              </h3>
              <div className='flex items-center gap-4 mb-4'>
                <div className='flex-1 p-3 bg-gray-950 rounded border border-gray-800 text-center'>
                  <div className='text-[10px] text-gray-500 uppercase'>Python PyTorch</div>
                  <div className='text-lg font-bold text-red-400'>4.5 ms</div>
                </div>
                <ArrowRight size={24} className='text-gray-600' />
                <div className='flex-1 p-3 bg-gray-950 rounded border border-gray-800 text-center relative overflow-hidden'>
                  <div className='text-[10px] text-gray-500 uppercase'>Rust ONNX</div>
                  <div className='text-lg font-bold text-green-400'>0.12 ms</div>
                  <div className='absolute top-0 right-0 p-1'>
                    <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                  </div>
                </div>
              </div>
              <div className='text-xs font-mono text-gray-400 text-center'>
                Total Speedup: <span className='text-white font-bold'>37x Faster</span>
              </div>
            </div>

            {/* 2. ATOMIC RISK GUARD */}
            <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <AlertOctagon size={16} className='text-red-500' /> Pre-Trade Atomic Risk Guard
              </h3>
              <div className='space-y-3'>
                {[
                  { n: 'Position Limits', t: 'AtomicUsize', s: 'Passed' },
                  { n: 'Balance Check', t: 'RwLock<f64>', s: 'Passed' },
                  { n: 'Kill Switch', t: 'AtomicBool', s: 'Active' },
                  { n: 'Max Drawdown', t: 'AtomicF64', s: 'Monitoring' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800'
                  >
                    <div>
                      <div className='text-xs font-bold text-white'>{item.n}</div>
                      <div className='text-[10px] text-gray-500 font-mono text-orange-400'>
                        {item.t}
                      </div>
                    </div>
                    <span className='text-[10px] bg-green-900/20 text-green-400 px-2 py-0.5 rounded font-bold border border-green-500/30'>
                      {item.s}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. TUI (RATATUI) PREVIEW */}
            <div className='lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-lg'>
              <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
                <Terminal size={16} className='text-green-500' /> Headless TUI Dashboard (Ratatui)
              </h3>
              <div className='bg-black font-mono text-xs p-4 rounded border border-gray-800 text-gray-300 shadow-inner h-[250px] overflow-hidden relative'>
                {/* Mock TUI Layout */}
                <div className='flex justify-between border-b border-gray-700 pb-2 mb-2'>
                  <span>RUST_HFT_BOT v1.0</span>
                  <span className='text-green-500'>Connected: BINANCE</span>
                  <span>CPU: 4%</span>
                </div>
                <div className='grid grid-cols-3 gap-4 h-full'>
                  <div className='border border-gray-700 p-2'>
                    <div className='text-orange-500 mb-1 border-b border-gray-800'>LOGS</div>
                    <div className='text-gray-500'>[INFO] Market Data Connected</div>
                    <div className='text-gray-500'>[WARN] High Latency detected</div>
                    <div className='text-green-500'>[EXEC] Order Filled: BTC</div>
                  </div>
                  <div className='border border-gray-700 p-2'>
                    <div className='text-blue-500 mb-1 border-b border-gray-800'>POSITIONS</div>
                    <div className='flex justify-between'>
                      <span>BTC</span>
                      <span className='text-green-500'>+1.2%</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>ETH</span>
                      <span className='text-red-500'>-0.4%</span>
                    </div>
                  </div>
                  <div className='border border-gray-700 p-2'>
                    <div className='text-purple-500 mb-1 border-b border-gray-800'>METRICS</div>
                    <div>Tick/s: 42,000</div>
                    <div>Lat: 12µs</div>
                    <div>Err: 0</div>
                  </div>
                </div>
              </div>
              <div className='text-xs text-center text-gray-500 mt-2'>
                Interactive Terminal UI via SSH (No Overhead)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RustTransformationPanel;
