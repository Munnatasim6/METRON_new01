import React, { useState, useEffect } from 'react';
import {
  Droplet,
  Waves,
  Activity,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Crosshair,
  Radar,
  DollarSign,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const LiquidityPanel: React.FC = () => {
  const [liquidityScore, setLiquidityScore] = useState(78);
  const [depthData, setDepthData] = useState<any[]>([]);
  const [whaleOrders, setWhaleOrders] = useState<any[]>([]);
  const [arbOpportunities, setArbOpportunities] = useState<any[]>([]);

  // Mock Data Generation
  useEffect(() => {
    // 1. Initial Depth Data
    const generateDepth = () => {
      const data = [];
      // Bids (Green)
      for (let i = 0; i < 10; i++) {
        data.push({
          price: (49000 - i * 50).toString(),
          volume: Math.floor(Math.random() * 500) + 100,
          type: 'bid',
        });
      }
      // Asks (Red)
      for (let i = 0; i < 10; i++) {
        data.push({
          price: (49050 + i * 50).toString(),
          volume: Math.floor(Math.random() * 500) + 100,
          type: 'ask',
        });
      }
      return data.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    };
    setDepthData(generateDepth());

    // 2. Loop for Live Updates
    const interval = setInterval(() => {
      setLiquidityScore((prev) => Math.min(100, Math.max(0, prev + (Math.random() * 4 - 2))));

      // Update Depth
      setDepthData((prev) =>
        prev.map((d) => ({
          ...d,
          volume: Math.max(50, d.volume + (Math.random() * 100 - 50)),
        })),
      );

      // Simulate Whale Orders
      if (Math.random() > 0.7) {
        const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
        const newWhale = {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          pair: 'BTC/USDT',
          size: (Math.random() * 50 + 10).toFixed(2), // 10-60 BTC
          price: (49000 + Math.random() * 500).toFixed(2),
          exchange: ['Binance', 'Bybit', 'OKX'][Math.floor(Math.random() * 3)],
          type,
        };
        setWhaleOrders((prev) => [newWhale, ...prev].slice(0, 6));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='p-6 space-y-6 animate-fade-in h-full overflow-y-auto custom-scrollbar'>
      {/* HEADER */}
      <div className='flex items-center justify-between border-b border-gray-800 pb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-blue-500/10 rounded-lg'>
            <Droplet className='text-blue-400' size={24} />
          </div>
          <div>
            <h2 className='text-xl font-bold font-mono text-white'>LIQUIDITY ENGINE</h2>
            <p className='text-xs text-gray-500 font-mono'>
              Cross-Exchange Aggregation & Slippage Analytics
            </p>
          </div>
        </div>

        {/* LIQUIDITY SCORE */}
        <div className='flex items-center gap-4 bg-gray-900/80 p-3 rounded-lg border border-gray-800 backdrop-blur-sm'>
          <div className='text-right'>
            <div className='text-[10px] text-gray-500 font-mono uppercase tracking-wider'>
              Global Liquidity Score
            </div>
            <div
              className={`text-2xl font-bold font-mono ${liquidityScore > 70 ? 'text-neon-green' : 'text-yellow-500'}`}
            >
              {liquidityScore.toFixed(1)}/100
            </div>
          </div>
          <div className='h-10 w-10 relative'>
            <svg className='h-full w-full' viewBox='0 0 36 36'>
              <path
                d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                fill='none'
                stroke='#1f2937'
                strokeWidth='4'
              />
              <path
                d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                fill='none'
                stroke={liquidityScore > 70 ? '#00ff9d' : '#eab308'}
                strokeWidth='4'
                strokeDasharray={`${liquidityScore}, 100`}
              />
            </svg>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* 1. DEPTH CHART VISUALIZER */}
        <div className='lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg flex flex-col min-h-[300px]'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='font-bold text-gray-300 flex items-center gap-2'>
              <Waves size={16} className='text-purple-400' /> Aggregated Order Book Depth
            </h3>
            <div className='flex gap-2'>
              <span className='text-[10px] flex items-center gap-1 text-green-400'>
                <span className='w-2 h-2 rounded-full bg-green-500'></span> BIDS
              </span>
              <span className='text-[10px] flex items-center gap-1 text-red-400'>
                <span className='w-2 h-2 rounded-full bg-red-500'></span> ASKS
              </span>
            </div>
          </div>

          <div className='flex-1 w-full min-h-[250px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={depthData} barGap={0}>
                <XAxis
                  dataKey='price'
                  stroke='#374151'
                  fontSize={10}
                  tickFormatter={(val) => val.substr(0, 5)}
                />
                <YAxis stroke='#374151' fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey='volume'>
                  {depthData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.type === 'bid' ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className='mt-2 flex justify-between text-xs font-mono text-gray-500'>
            <span>Support Wall: $48,850</span>
            <span>Resistance Wall: $49,400</span>
          </div>
        </div>

        {/* 2. WHALE RADAR */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg flex flex-col'>
          <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
            <Radar size={16} className='text-neon-blue animate-pulse' /> Whale Radar (Live)
          </h3>
          <div className='flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1'>
            {whaleOrders.length === 0 ? (
              <div className='text-center text-gray-600 text-xs py-10'>
                Scanning for large orders...
              </div>
            ) : (
              whaleOrders.map((order) => (
                <div
                  key={order.id}
                  className='bg-black/40 p-2 rounded border border-gray-800 flex justify-between items-center animate-fade-in'
                >
                  <div className='flex flex-col'>
                    <span
                      className={`text-xs font-bold ${order.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {order.type} {order.size} BTC
                    </span>
                    <span className='text-[10px] text-gray-500'>@ ${order.price}</span>
                  </div>
                  <div className='flex flex-col items-end'>
                    <span className='text-[10px] text-gray-400 font-mono'>{order.exchange}</span>
                    <span className='text-[9px] text-gray-600'>{order.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. SLIPPAGE MATRIX */}
        <div className='lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Card 1 */}
          <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4'>
            <div className='text-xs text-gray-400 mb-1 font-mono'>ESTIMATED SLIPPAGE (100k)</div>
            <div className='text-xl font-bold text-green-400 flex items-center gap-2'>
              0.02%{' '}
              <span className='text-[10px] text-gray-500 font-normal bg-gray-800 px-1 rounded'>
                LOW
              </span>
            </div>
            <div className='mt-2 w-full bg-gray-800 h-1 rounded-full overflow-hidden'>
              <div className='bg-green-500 h-full w-[10%]'></div>
            </div>
          </div>
          {/* Card 2 */}
          <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4'>
            <div className='text-xs text-gray-400 mb-1 font-mono'>ESTIMATED SLIPPAGE (1M)</div>
            <div className='text-xl font-bold text-yellow-500 flex items-center gap-2'>
              0.45%{' '}
              <span className='text-[10px] text-gray-500 font-normal bg-gray-800 px-1 rounded'>
                MED
              </span>
            </div>
            <div className='mt-2 w-full bg-gray-800 h-1 rounded-full overflow-hidden'>
              <div className='bg-yellow-500 h-full w-[45%]'></div>
            </div>
          </div>
          {/* Card 3 - Arbitrage */}
          <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4 md:col-span-2'>
            <div className='flex justify-between items-start'>
              <div>
                <div className='text-xs text-gray-400 mb-1 font-mono flex items-center gap-2'>
                  <ArrowRightLeft size={12} /> CROSS-EXCHANGE SPREAD (BTC)
                </div>
                <div className='text-lg font-bold text-white font-mono'>
                  Binance <span className='text-gray-500 mx-1'>vs</span> Bybit
                </div>
              </div>
              <div className='text-right'>
                <div className='text-2xl font-bold text-neon-blue'>$12.50</div>
                <div className='text-[10px] text-gray-500'>Arbitrage Delta (0.03%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. MARKET HEATMAP TABLE */}
        <div className='lg:col-span-3 bg-gray-900/50 border border-gray-800 rounded-xl p-4'>
          <h3 className='font-bold text-gray-300 flex items-center gap-2 mb-4'>
            <Activity size={16} className='text-blue-400' /> Liquidity Concentration Heatmap
          </h3>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead className='text-xs text-gray-500 font-mono border-b border-gray-800'>
                <tr>
                  <th className='p-3'>PAIR</th>
                  <th className='p-3'>24H VOL</th>
                  <th className='p-3'>ORDER BOOK DEPTH (-2%)</th>
                  <th className='p-3'>ORDER BOOK DEPTH (+2%)</th>
                  <th className='p-3'>LIQUIDITY SCORE</th>
                </tr>
              </thead>
              <tbody className='text-sm font-mono'>
                {[
                  { pair: 'BTC/USDT', vol: '$2.4B', down: '$45M', up: '$32M', score: 98 },
                  { pair: 'ETH/USDT', vol: '$1.1B', down: '$18M', up: '$15M', score: 92 },
                  { pair: 'SOL/USDT', vol: '$450M', down: '$5M', up: '$4.2M', score: 85 },
                  { pair: 'BNB/USDT', vol: '$210M', down: '$3.1M', up: '$2.8M', score: 78 },
                  { pair: 'DOGE/USDT', vol: '$120M', down: '$1.2M', up: '$1.5M', score: 65 },
                ].map((row, i) => (
                  <tr key={i} className='border-b border-gray-800/50 hover:bg-gray-800/30'>
                    <td className='p-3 font-bold text-white'>{row.pair}</td>
                    <td className='p-3 text-gray-300'>{row.vol}</td>
                    <td className='p-3 text-green-400 font-bold'>{row.down}</td>
                    <td className='p-3 text-red-400 font-bold'>{row.up}</td>
                    <td className='p-3'>
                      <div className='flex items-center gap-2'>
                        <div className='w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden'>
                          <div
                            className={`h-full ${row.score > 80 ? 'bg-green-500' : row.score > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${row.score}%` }}
                          />
                        </div>
                        <span className='text-xs text-gray-500'>{row.score}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityPanel;
