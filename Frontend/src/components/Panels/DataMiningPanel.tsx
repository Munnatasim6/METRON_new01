import React, { useState, useEffect } from 'react';
import {
  Database,
  Wifi,
  Globe,
  Server,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Download,
  Activity,
} from 'lucide-react';

const DataMiningPanel: React.FC = () => {
  // Mock statuses for the UI
  const [ccxtStatus, setCcxtStatus] = useState<'CONNECTED' | 'CONNECTING' | 'ERROR'>('CONNECTED');
  const [wsLatency, setWsLatency] = useState(45);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    // Simulate WebSocket latency fluctuations
    const interval = setInterval(() => {
      setWsLatency((prev) => Math.max(10, Math.min(150, prev + (Math.random() * 20 - 10))));
    }, 1000);

    // Simulate Historical Sync Progress
    const syncInterval = setInterval(() => {
      setSyncProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, []);

  const modules = [
    {
      id: 1,
      name: 'CCXT Integration',
      sub: 'Binance, Bybit Handshake',
      status: 'active',
      icon: Server,
    },
    {
      id: 2,
      name: 'Historical OHLCV',
      sub: 'Backfill Engine',
      status: 'processing',
      icon: Database,
    },
    {
      id: 3,
      name: 'WebSocket Stream',
      sub: 'Real-time Ticker/Trade',
      status: 'active',
      icon: Wifi,
    },
    { id: 4, name: 'On-Chain Analytics', sub: 'Glassnode / Dune API', status: 'idle', icon: Globe },
    {
      id: 5,
      name: 'Macro-Economic Data',
      sub: 'CPI, Rates (ForexFactory)',
      status: 'waiting',
      icon: Activity,
    },
    { id: 6, name: 'L2 Order Book', sub: 'Depth Snapshots', status: 'active', icon: LayersIcon },
    {
      id: 7,
      name: 'Liquidity Aggregator',
      sub: 'Cross-Exchange Vol',
      status: 'active',
      icon: Droplet,
    },
    {
      id: 8,
      name: 'Data Gap Filler',
      sub: 'Integrity Check',
      status: 'warning',
      icon: AlertCircle,
    },
    {
      id: 9,
      name: 'Raw Data Validation',
      sub: 'Sanitization Pipeline',
      status: 'active',
      icon: CheckCircle,
    },
    { id: 10, name: 'Sentiment Scraper', sub: 'News/Twitter NLP', status: 'idle', icon: FileText },
  ];

  return (
    <div className='p-6 space-y-6 animate-fade-in h-full overflow-y-auto custom-scrollbar'>
      <div className='flex items-center justify-between border-b border-gray-800 pb-4'>
        <div className='flex items-center gap-3'>
          <Database className='text-neon-blue' size={24} />
          <div>
            <h2 className='text-xl font-bold font-mono text-white'>DATA MINING & COLLECTION</h2>
            <p className='text-xs text-gray-500 font-mono'>Phase 2: Ingestion Pipeline Status</p>
          </div>
        </div>
        <div className='flex gap-4 text-xs font-mono'>
          <div className='flex items-center gap-2 bg-gray-900 px-3 py-1 rounded border border-gray-800'>
            <div
              className={`w-2 h-2 rounded-full ${ccxtStatus === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span>EXCHANGES: {ccxtStatus}</span>
          </div>
          <div className='flex items-center gap-2 bg-gray-900 px-3 py-1 rounded border border-gray-800'>
            <Activity size={12} className='text-neon-blue' />
            <span>STREAM LATENCY: {wsLatency.toFixed(0)}ms</span>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
        {/* 1. CCXT & EXCHANGE CONNECTIONS */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4'>
          <div className='flex justify-between items-start mb-4'>
            <h3 className='font-bold text-gray-300 flex items-center gap-2'>
              <Server size={16} className='text-purple-400' /> Exchange Connectors
            </h3>
            <span className='text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded border border-green-900'>
              HEALTHY
            </span>
          </div>
          <div className='space-y-3 font-mono text-sm'>
            <div className='flex justify-between items-center p-2 bg-black/40 rounded border border-gray-800'>
              <span className='flex items-center gap-2'>
                <img
                  src='https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=026'
                  className='w-4 h-4 grayscale opacity-80'
                  alt=''
                />{' '}
                Binance Fut
              </span>
              <span className='text-green-500 text-xs'>● Connected (24ms)</span>
            </div>
            <div className='flex justify-between items-center p-2 bg-black/40 rounded border border-gray-800'>
              <span className='flex items-center gap-2'>
                <img
                  src='https://cryptologos.cc/logos/xrp-xrp-logo.svg?v=026'
                  className='w-4 h-4 grayscale opacity-80'
                  alt=''
                />{' '}
                Bybit Perp
              </span>
              <span className='text-green-500 text-xs'>● Connected (31ms)</span>
            </div>
            <div className='flex justify-between items-center p-2 bg-black/40 rounded border border-gray-800 opacity-50'>
              <span className='flex items-center gap-2 text-gray-500'>
                <Globe size={14} /> Coinbase Pro
              </span>
              <span className='text-gray-600 text-xs'>○ Disabled</span>
            </div>
          </div>
        </div>

        {/* 2. HISTORICAL DATA SYNC */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4'>
          <div className='flex justify-between items-start mb-4'>
            <h3 className='font-bold text-gray-300 flex items-center gap-2'>
              <Download size={16} className='text-blue-400' /> Historical Sync
            </h3>
            <RefreshCw size={14} className='text-blue-400 animate-spin-slow' />
          </div>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between text-xs text-gray-400 mb-1 font-mono'>
                <span>BTC/USDT (1m Candles)</span>
                <span>{syncProgress}%</span>
              </div>
              <div className='w-full h-1.5 bg-gray-800 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-blue-500 transition-all duration-300'
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
            <div>
              <div className='flex justify-between text-xs text-gray-400 mb-1 font-mono'>
                <span>ETH/USDT (5m Candles)</span>
                <span>100%</span>
              </div>
              <div className='w-full h-1.5 bg-gray-800 rounded-full overflow-hidden'>
                <div className='h-full bg-green-500 w-full' />
              </div>
            </div>
            <div className='p-2 bg-blue-900/10 border border-blue-900/30 rounded text-[10px] text-blue-200 font-mono'>
              Downloading batch #89221 (2022-04-12)...
            </div>
          </div>
        </div>

        {/* 3. DATA PIPELINE STATUS */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 lg:col-span-1 xl:row-span-2'>
          <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
            <Activity size={16} className='text-neon-green' /> Pipeline Modules
          </h3>
          <div className='space-y-2'>
            {modules.slice(2).map((mod) => (
              <div
                key={mod.id}
                className='flex items-center justify-between p-2 rounded hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-800'
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`p-1.5 rounded bg-gray-800 ${mod.status === 'active' ? 'text-neon-green' : 'text-gray-500'}`}
                  >
                    <mod.icon size={14} />
                  </div>
                  <div>
                    <div className='text-xs font-bold text-gray-300'>{mod.name}</div>
                    <div className='text-[9px] text-gray-500 font-mono uppercase'>{mod.sub}</div>
                  </div>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    mod.status === 'active'
                      ? 'bg-neon-green shadow-[0_0_5px_#00ff9d]'
                      : mod.status === 'warning'
                        ? 'bg-yellow-500 animate-pulse'
                        : mod.status === 'processing'
                          ? 'bg-blue-500 animate-pulse'
                          : 'bg-gray-700'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 4. TERMINAL OUTPUT */}
        <div className='lg:col-span-2 bg-black border border-gray-800 rounded-xl p-4 font-mono text-xs overflow-hidden flex flex-col h-48'>
          <div className='text-gray-500 border-b border-gray-900 pb-1 mb-2 flex justify-between'>
            <span>ingestion_log.txt</span>
            <span className='text-green-500'>● LIVE</span>
          </div>
          <div className='flex-1 overflow-y-auto space-y-1 text-gray-400 custom-scrollbar'>
            <p>
              <span className='text-blue-500'>[14:20:01]</span> Fetching funding rates from
              Glassnode API...
            </p>
            <p>
              <span className='text-green-500'>[14:20:02]</span> WebSocket stream re-connected
              (Session ID: 88291)
            </p>
            <p>
              <span className='text-blue-500'>[14:20:03]</span> L2 Snapshot: Order book depth valid.
              Spread: 0.01%
            </p>
            <p>
              <span className='text-yellow-500'>[14:20:05]</span> Data Gap detected in ETH-PERP
              (Timestamp 162299100). Filling...
            </p>
            <p>
              <span className='text-green-500'>[14:20:06]</span> Gap filled successfully using
              linear interpolation.
            </p>
            <p>
              <span className='text-blue-500'>[14:20:08]</span> Macro Data: CPI Release schedule
              updated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple icons for specific modules locally
const LayersIcon = ({ size, className }: { size: number; className?: string }) => (
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
    <polygon points='12 2 2 7 12 12 22 7 12 2'></polygon>
    <polyline points='2 17 12 22 22 17'></polyline>
    <polyline points='2 12 12 17 22 12'></polyline>
  </svg>
);
const Droplet = ({ size, className }: { size: number; className?: string }) => (
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
    <path d='M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z'></path>
  </svg>
);

export default DataMiningPanel;
