import React from 'react';
import {
  LayoutDashboard,
  Activity,
  MonitorPlay,
  ArrowRight,
  AlertCircle,
  Server,
  Skull,
  Network,
  Cpu,
} from 'lucide-react';
import { SystemStatus, AppModule } from '../../types';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface HomeDashboardPanelProps {
  onNavigate: (tab: string) => void;
  onKillSwitch: () => void;
  status: SystemStatus;
  metrics: {
    timeOffset: number;
    apiWeight: number;
    ping: number;
    buyPressure: number;
  };
  activePositionsCount: number;
  modules: AppModule[]; // Added prop for dynamic modules
}

const HomeDashboardPanel: React.FC<HomeDashboardPanelProps> = ({
  onNavigate,
  onKillSwitch,
  status,
  metrics,
  activePositionsCount,
  modules,
}) => {
  // Mock PnL Data for the mini chart
  const pnlData = Array.from({ length: 20 }, (_, i) => ({
    v: 1000 + Math.random() * 500 + i * 50,
  }));

  return (
    <div className='p-6 h-full flex flex-col animate-fade-in bg-gray-950 overflow-y-auto custom-scrollbar'>
      {/* HERO SECTION */}
      <div className='flex flex-col md:flex-row gap-6 mb-8'>
        {/* Welcome Card */}
        <div className='flex-1 bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group'>
          <div className='absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity'>
            <LayoutDashboard size={120} />
          </div>
          <div className='relative z-10 flex flex-col h-full justify-between'>
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <div
                  className={`w-3 h-3 rounded-full ${status === SystemStatus.RUNNING ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
                />
                <span className='text-xs font-mono font-bold text-gray-400 tracking-wider'>
                  SYSTEM STATUS
                </span>
              </div>
              <h1 className='text-4xl font-bold text-white mb-2 font-mono'>COMMAND CENTER</h1>
              <p className='text-gray-400 text-sm max-w-md'>
                Centralized control hub for the Neural AI Scalping Bot. Access all operational
                phases of the HFT pipeline.
              </p>
            </div>

            <div className='flex gap-4 mt-6'>
              <button
                onClick={() => onNavigate('monitor')}
                className='bg-neon-blue text-black px-6 py-3 rounded font-bold text-sm flex items-center gap-2 hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              >
                <Activity size={16} /> OPEN LIVE MONITOR
              </button>

              {/* MASTER DASHBOARD KILL SWITCH */}
              <button
                onClick={onKillSwitch}
                className='bg-red-600 text-white border border-red-500 px-6 py-3 rounded font-bold text-sm flex items-center gap-2 hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse'
              >
                <Skull size={18} /> EMERGENCY STOP
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='w-full md:w-80 flex flex-col gap-4'>
          {/* PnL Card */}
          <div className='flex-1 bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden'>
            <div className='absolute inset-0 opacity-20 pointer-events-none'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={pnlData}>
                  <Area type='monotone' dataKey='v' stroke='#22c55e' fill='#22c55e' />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className='relative z-10'>
              <div className='text-xs text-gray-500 font-mono uppercase'>Unrealized PnL</div>
              <div className='text-2xl font-bold text-green-400 font-mono'>+$1,245.50</div>
            </div>
            <div className='relative z-10 flex justify-between items-end mt-2'>
              <div className='text-[10px] text-gray-400'>Daily Target: $500</div>
              <div className='text-xs font-bold text-green-500'>+245%</div>
            </div>
          </div>

          {/* Latency Card */}
          <div className='h-24 bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center justify-between'>
            <div>
              <div className='text-xs text-gray-500 font-mono uppercase mb-1'>API Latency</div>
              <div
                className={`text-xl font-bold font-mono ${metrics.ping > 100 ? 'text-red-500' : 'text-white'}`}
              >
                {metrics.ping} <span className='text-xs text-gray-600'>ms</span>
              </div>
            </div>
            <Activity size={24} className={metrics.ping > 100 ? 'text-red-500' : 'text-blue-500'} />
          </div>
        </div>
      </div>

      {/* ALERTS & INFRASTRUCTURE SECTION (MOVED UP) */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        {/* Recent Alerts */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4'>
          <div className='flex items-center gap-2 mb-4 text-gray-400 text-xs font-bold uppercase'>
            <AlertCircle size={14} /> System Notices
          </div>
          <div className='space-y-2'>
            {[
              { type: 'INFO', msg: 'System initialized successfully.', time: '10:00:01' },
              { type: 'WARN', msg: 'API Weight approaching limit (78%).', time: '10:45:22' },
              { type: 'SUCCESS', msg: 'Strategy "Nano-LSTM" loaded.', time: '10:00:05' },
            ].map((log, i) => (
              <div
                key={i}
                className='flex justify-between items-center p-2 bg-gray-950 rounded border border-gray-800 text-xs'
              >
                <div className='flex items-center gap-2'>
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${log.type === 'WARN' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                  />
                  <span className='text-gray-300'>{log.msg}</span>
                </div>
                <span className='text-gray-600 font-mono'>{log.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure Health */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-4'>
          <div className='flex items-center gap-2 mb-4 text-gray-400 text-xs font-bold uppercase'>
            <Server size={14} /> Infrastructure
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='p-3 bg-gray-950 rounded border border-gray-800 flex items-center gap-3'>
              <Cpu size={20} className='text-purple-500' />
              <div>
                <div className='text-[10px] text-gray-500 uppercase'>Core Load</div>
                <div className='text-sm font-bold text-white'>32%</div>
              </div>
            </div>
            <div className='p-3 bg-gray-950 rounded border border-gray-800 flex items-center gap-3'>
              <Network size={20} className='text-blue-500' />
              <div>
                <div className='text-[10px] text-gray-500 uppercase'>Bandwidth</div>
                <div className='text-sm font-bold text-white'>12 MB/s</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODULE GRID */}
      <h2 className='text-sm font-bold text-gray-500 font-mono uppercase tracking-widest mb-4 border-b border-gray-800 pb-2'>
        System Modules & Phases
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8'>
        {modules
          .filter((mod) => mod.id !== 'dashboard') // Don't show Dashboard itself in the grid
          .map((mod) => (
            <button
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className={`
                    border rounded-xl p-4 text-left transition-all group flex flex-col justify-between h-28 relative overflow-hidden
                    ${mod.id === 'master_config' ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' : 'bg-gray-900/30 border-gray-800 hover:bg-gray-800 hover:border-gray-700'}
                  `}
            >
              <div className='flex justify-between items-start relative z-10'>
                <div
                  className={`p-1.5 rounded-lg bg-gray-950 group-hover:bg-gray-900 transition-colors ${mod.color}`}
                >
                  <mod.icon size={18} />
                </div>
                <ArrowRight
                  size={14}
                  className='text-gray-700 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1'
                />
              </div>
              <div className='relative z-10'>
                <div className='text-sm font-bold text-gray-200 group-hover:text-white mb-0.5'>
                  {mod.label}
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-[10px] text-gray-500'>{mod.desc}</span>

                  {/* Inject Dynamic Stats for specific modules */}
                  {mod.id === 'monitor' && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border ${status === SystemStatus.RUNNING ? 'bg-green-900/10 text-green-400 border-green-500/20' : 'bg-gray-800 text-gray-500 border-gray-700'}`}
                    >
                      {activePositionsCount} Trades
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
};

export default HomeDashboardPanel;
