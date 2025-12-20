import React from 'react';
import { Activity, XCircle, Edit, Trash2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Position, LogEntry, RiskConfig } from '../../types';
import OrderFlowMeter from '../Widgets/OrderFlowMeter';
import { Virtuoso } from 'react-virtuoso';
import SmartCryptoSelector from '../common/SmartCryptoSelector'; // স্মার্ট সিলেক্টর ইম্পোর্ট
import TradingChart from '../Widgets/TradingChart'; // TradingChart ইম্পোর্ট
import StrategySelector from '../Widgets/StrategySelector';
import OrderBook from '../Widgets/OrderBook';
import RecentTrades from '../Widgets/RecentTrades';
import SentimentWidget from '../Widgets/SentimentWidget';
import ArbitrageMonitor from '../Widgets/ArbitrageMonitor';

interface DashboardPanelProps {
  metrics: {
    buyPressure: number;
    apiWeight: number;
    ping: number;
    timeOffset: number;
  };
  positions: Position[];
  riskConfig: RiskConfig;
  logs: LogEntry[];
  logFilter: 'ALL' | 'INFO' | 'TRADE' | 'ERROR';
  setLogFilter: (filter: 'ALL' | 'INFO' | 'TRADE' | 'ERROR') => void;
  clearLogs: () => void;
  onClosePosition: (id: string) => void;
  onCloseAllPositions: () => void;
  onEditPosition: (pos: Position) => void;

  // New Feature Props
  exchanges: string[];
  markets: string[];
  selectedExchange: string;
  onExchangeChange: (ex: string) => void;
  selectedPair: string;
  onPairChange: (pair: string) => void;
  latestPrice: number | null;
  isLoadingMarkets: boolean;
  recentTradesData: any[];
  sentimentData: any;
  arbitrageData: any[];
  currentStrategy: string;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({
  metrics,
  positions,
  riskConfig,
  logs,
  logFilter,
  setLogFilter,
  clearLogs,
  onClosePosition,
  onCloseAllPositions,
  onEditPosition,
  exchanges,
  markets,
  selectedExchange,
  onExchangeChange,
  selectedPair,
  onPairChange,
  latestPrice,
  isLoadingMarkets,
  recentTradesData,
  sentimentData,
  arbitrageData,
  currentStrategy,
}) => {
  const filteredLogs =
    logFilter === 'ALL' ? logs : logs.filter((l) => l.type === logFilter);

  return (
    <div className="h-full w-full bg-gray-950 p-4 animate-fade-in overflow-y-auto custom-scrollbar flex flex-col">
      <div className="flex flex-col gap-4 min-h-full">

        {/* --- Top Section: Trading Chart (Full Width) --- */}
        <div className="w-full bg-gray-900/50 border border-gray-800 rounded-xl p-1 shadow-lg backdrop-blur-sm shrink-0">
          <TradingChart symbol={selectedPair} />
        </div>

        <div className="flex flex-col lg:flex-row gap-4 h-auto">

          {/* 1. Left Column: Smart Controls, Metrics & Order Flow */}
          <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">

            {/* Live Price Display */}
            <div className="bg-gray-900/80 border border-cyan-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm flex flex-col items-center justify-center min-h-[100px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
              <span className="text-xs text-cyan-400 font-mono tracking-widest uppercase mb-1">{selectedPair} PRICE</span>
              <div className="text-3xl font-bold font-mono text-white animate-pulse">
                {latestPrice ? `$${latestPrice}` : "Connecting..."}
              </div>
            </div>

            {/* ✅ UPDATED: Dual Smart Selectors (Exchange & Asset) */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 space-y-4">
              {/* ... Selectors ... */}
              <SmartCryptoSelector
                label="TARGET EXCHANGE"
                options={exchanges}
                selected={selectedExchange}
                onSelect={onExchangeChange}
                storageKey="fav_exchanges"
              />
              <SmartCryptoSelector
                label={isLoadingMarkets ? "LOADING ASSETS..." : "ASSET PAIR"}
                options={markets}
                selected={selectedPair}
                onSelect={onPairChange}
                storageKey={`fav_pairs_${selectedExchange}`}
              />
            </div>



            {/* Metrics Row */}
            <div className="grid grid-cols-2 gap-4 shrink-0">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 shadow-lg backdrop-blur-sm flex flex-col justify-center items-center">
                <div className="text-[10px] text-gray-500 font-mono mb-1 tracking-wider">LATENCY</div>
                <div className="text-xl font-bold font-mono text-white">
                  {metrics.ping} <span className="text-xs text-gray-600">ms</span>
                </div>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 shadow-lg backdrop-blur-sm flex flex-col justify-center items-center">
                <div className="text-[10px] text-gray-500 font-mono mb-1 tracking-wider">OFFSET</div>
                <div className={`text-xl font-bold font-mono ${metrics.timeOffset > 500 ? 'text-red-500' : 'text-green-500'}`}>
                  +{metrics.timeOffset.toFixed(0)} <span className="text-xs text-gray-600">ms</span>
                </div>
              </div>
            </div>



            {/* Order Flow Meter */}
            <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg backdrop-blur-sm min-h-[150px]">
              <OrderFlowMeter buyPressure={metrics.buyPressure} />
            </div>
          </div>

          {/* 2. Active Positions (Middle - Unchanged) */}
          <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-xl p-4 shadow-lg backdrop-blur-sm flex flex-col min-w-0 min-h-[500px]">
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2">
                <Activity size={16} className="text-neon-blue" /> Active Positions ({positions.length})
              </h3>
              {positions.length > 0 && (
                <button
                  onClick={onCloseAllPositions}
                  className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded hover:bg-red-500 hover:text-white transition-colors uppercase font-bold tracking-wider"
                >
                  <XCircle size={12} /> CLOSE ALL POSITIONS
                </button>
              )}
            </div>



            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
              {positions.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-gray-700 font-mono py-10">
                  <Activity size={48} className="mb-4 opacity-20" />
                  <span>NO ACTIVE TRADES</span>
                  <span className="text-xs mt-2 opacity-50">Strategy engine is scanning...</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="text-xs text-gray-500 font-mono sticky top-0 bg-gray-900/95 backdrop-blur z-10 shadow-sm">
                    <tr>
                      <th className="pb-3 pl-2">PAIR</th>
                      <th className="pb-3">SIDE</th>
                      <th className="pb-3">
                        SIZE
                        <span className="ml-1 text-[9px] px-1 py-0.5 rounded bg-gray-800 text-gray-400 font-normal cursor-help border border-gray-700" title={`Sizing Mode: ${riskConfig.sizingMode}`}>
                          {riskConfig.sizingMode === 'Fixed' ? 'FIX' : 'DYN'}
                        </span>
                      </th>
                      <th className="pb-3">PNL</th>
                      <th className="pb-3 w-32 hidden md:table-cell">TREND</th>
                      <th className="pb-3 text-right pr-2">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-sm">
                    {positions.map((pos) => (
                      <tr key={pos.id} className="border-b border-gray-800/50 group hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 pl-2 text-white font-bold">{pos.pair}</td>
                        <td className={`py-3 ${pos.side === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>{pos.side}</td>
                        <td className="py-3 text-gray-400">{pos.size}</td>
                        <td className={`py-3 font-bold ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 w-32 h-12 hidden md:table-cell">
                          <div className="w-full h-full opacity-60">
                            {/* Chart placeholder */}
                          </div>
                        </td>
                        <td className="py-3 text-right flex justify-end gap-2 items-center h-full pr-2">
                          <button onClick={() => onClosePosition(pos.id)} className="px-3 py-1 bg-red-500/10 text-red-500 text-xs rounded border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors font-bold">CLOSE</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 3. System Log & Order Book (Right Column) */}
          <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0">

            {/* Strategy Control */}
            <StrategySelector />

            {/* Order Book Panel */}
            <div className="flex-none bg-gray-900/50 border border-gray-800 rounded-xl p-0 shadow-lg backdrop-blur-sm overflow-hidden h-[300px]">
              <div className="h-full overflow-hidden">
                <OrderBook />
              </div>
            </div>

            {/* Recent Trades panel */}
            <div className="flex-none h-[250px] overflow-hidden">
              <RecentTrades data={recentTradesData} />
            </div>

            {/* System Logs */}
            <div className="flex-1 bg-black border border-gray-800 rounded-xl p-4 shadow-lg flex flex-col min-h-[200px] overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-gray-500 font-mono">SYSTEM LOG</h3>
                <div className="flex gap-1">
                  {['ALL', 'INFO', 'TRADE', 'ERROR'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setLogFilter(f as any)}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${logFilter === f ? 'bg-gray-800 text-gray-200 border border-gray-700' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                      {f}
                    </button>
                  ))}
                  <button onClick={clearLogs} className="text-gray-600 hover:text-red-500 ml-2 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <Virtuoso
                data={filteredLogs}
                followOutput={'auto'}
                className="flex-1 font-mono text-xs custom-scrollbar"
                itemContent={(_, log) => (
                  <div className="flex gap-2 border-b border-gray-900/50 pb-0.5 pt-1">
                    <span className="text-gray-600 shrink-0 select-none">[{log.timestamp}]</span>
                    <span className={`break-all ${log.type === 'INFO' ? 'text-blue-400' : ''} ${log.type === 'TRADE' ? 'text-neon-green' : ''} ${log.type === 'ERROR' ? 'text-red-500' : ''}`}>
                      {log.type === 'TRADE' && '$ '}{log.message}
                    </span>
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        {/* --- NEW: Bottom Analysis Section (3-Column Fixed Panels) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-0 mt-auto shrink-0 min-h-min">

          {/* 1. Sentiment Widget Panel */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-0 shadow-md min-h-[180px]">
            {sentimentData ? <SentimentWidget data={sentimentData} /> : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500 italic">Initializing SentimentAI...</div>
            )}
          </div>

          {/* 2. Arbitrage Monitor Panel */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-0 overflow-hidden shadow-md min-h-[180px]">
            {arbitrageData && arbitrageData.length > 0 ? (
              <ArbitrageMonitor data={arbitrageData} />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500 italic">Scanning Markets...</div>
            )}
          </div>

          {/* 3. System Health Panel (RESTORED EXACTLY FROM DASHBOARD) */}
          <div className="bg-[#1e222d] rounded-xl p-4 border border-[#2a2e39] text-[#787b86] text-xs min-h-[180px] flex flex-col justify-center">
            <h4 className="text-[#d1d4dc] mb-2 font-bold uppercase tracking-wider">System Health</h4>
            <p className="my-1">Core: <span className="text-[#00c853]">Python Async Engine</span></p>
            <p className="my-1">Arb Rate: <span className="text-[#2962ff]">~10s (Optimized)</span></p>
            <p className="my-1">Strategy: <span className="text-[#ffb300] font-bold">{currentStrategy}</span></p>
            <div className="mt-2 p-2 bg-[#2a2e39] rounded border-l-4 border-[#00e676]">
              Status: <strong className="text-white">Fully Real-time & Type Safe</strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;
