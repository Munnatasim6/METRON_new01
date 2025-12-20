import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Server,
  Zap,
  Shield,
  AlertTriangle,
  Skull,
  BrainCircuit,
  BarChart2,
  Layers,
  Activity,
  Terminal,
  Check,
  Power,
} from 'lucide-react';
import { HardwareConfig, StrategyConfig, RiskConfig } from '../../types';

interface Props {
  hwConfig: HardwareConfig;
  setHwConfig: (c: HardwareConfig) => void;
  stratConfig: StrategyConfig;
  setStratConfig: (c: StrategyConfig) => void;
  riskConfig: RiskConfig;
  setRiskConfig: (c: RiskConfig) => void;
  onKillSwitch: () => void;
  onApplyHw: () => void;
  onApplyStrat: () => void;
  onApplyRisk: () => void;
}

const MasterConfigPanel: React.FC<Props> = ({
  hwConfig,
  setHwConfig,
  stratConfig,
  setStratConfig,
  riskConfig,
  setRiskConfig,
  onKillSwitch,
  onApplyHw,
  onApplyStrat,
  onApplyRisk,
}) => {
  // --- STRATEGY LOG LOGIC ---
  const [logs, setLogs] = useState<{ time: string; type: string; msg: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const interval = setInterval(() => {
      const types = ['INFERENCE', 'TENSOR', 'WEIGHTS', 'DECISION'];
      const type = types[Math.floor(Math.random() * types.length)];
      let msg = '';

      if (type === 'INFERENCE') {
        msg = `${stratConfig.model} forward pass complete (${(Math.random() * 10).toFixed(2)}ms)`;
      } else if (type === 'TENSOR') {
        msg = `Matrix multiplication: [128, 64] x [64, 1]`;
      } else if (type === 'WEIGHTS') {
        if (stratConfig.liveTraining) {
          msg = `Backpropagation: Gradients updated (Loss: 0.0${Math.floor(Math.random() * 9)})`;
        } else {
          msg = `Validation check: Weights frozen`;
        }
      } else if (type === 'DECISION') {
        const conf = (stratConfig.confidence + (Math.random() * 10 - 5)).toFixed(1);
        msg = `Signal generated | Confidence: ${conf}%`;
      }

      const newLog = {
        time: new Date().toLocaleTimeString().split(' ')[0],
        type,
        msg,
      };
      setLogs((prev) => [...prev, newLog].slice(-50));
    }, 1500);

    return () => clearInterval(interval);
  }, [stratConfig]);

  // --- HANDLERS ---
  const toggleAsset = (asset: keyof typeof riskConfig.assets) => {
    setRiskConfig({
      ...riskConfig,
      assets: { ...riskConfig.assets, [asset]: !riskConfig.assets[asset] },
    });
  };

  return (
    <div className='p-6 h-full flex flex-col animate-fade-in bg-gray-950 overflow-y-auto custom-scrollbar'>
      {/* PAGE HEADER */}
      <div className='flex items-center gap-3 mb-6 border-b border-gray-800 pb-4 shrink-0'>
        <div className='p-2 bg-white/5 rounded-lg'>
          <Power className='text-white' size={24} />
        </div>
        <div>
          <h2 className='text-xl font-bold font-mono text-white'>MASTER CONFIGURATION</h2>
          <p className='text-xs text-gray-500 font-mono'>
            Central Control Plane: Hardware, Strategy & Risk
          </p>
        </div>
      </div>

      {/* EMERGENCY KILL SWITCH - MOVED TO TOP */}
      <div className='mb-8'>
        <button
          onClick={onKillSwitch}
          className='w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-lg shadow-[0_0_25px_rgba(220,38,38,0.5)] border-2 border-red-500 flex items-center justify-center gap-4 transition-transform hover:scale-[1.01] active:scale-95 group relative overflow-hidden'
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <Skull size={32} className='group-hover:animate-pulse z-10' />
          <div className='flex flex-col items-start z-10'>
            <span className='text-2xl tracking-widest'>EMERGENCY KILL SWITCH</span>
            <span className='text-xs opacity-90 font-mono'>
              INSTANTLY HALT ALL TRADING & CLOSE POSITIONS
            </span>
          </div>
        </button>
      </div>

      {/* MAIN CONFIG GRID: 3 COLUMNS */}
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6'>
        {/* COL 1: HARDWARE ENGINE */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col'>
          <div className='flex items-center gap-2 mb-4 pb-2 border-b border-gray-800'>
            <Server className='text-purple-500' size={18} />
            <h3 className='text-sm font-bold text-gray-300 font-mono'>HARDWARE ENGINE</h3>
          </div>

          <div className='space-y-4 flex-1'>
            <div className='space-y-1'>
              <div className='flex justify-between text-xs font-mono text-gray-400'>
                <span>RAM Allocation</span>
                <span className='text-purple-400'>{hwConfig.ramLimit} GB</span>
              </div>
              <input
                type='range'
                min='1'
                max='128'
                value={hwConfig.ramLimit}
                onChange={(e) => setHwConfig({ ...hwConfig, ramLimit: parseInt(e.target.value) })}
                className='w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500'
              />
            </div>

            <div className='space-y-1'>
              <label className='text-xs font-mono text-gray-400'>CPU Priority</label>
              <div className='grid grid-cols-3 gap-2'>
                {['Eco', 'Balanced', 'High Perf'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setHwConfig({ ...hwConfig, cpuPriority: mode as any })}
                    className={`py-1.5 text-[10px] font-bold border rounded transition-all ${hwConfig.cpuPriority === mode ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-gray-800 border-gray-700 text-gray-500'}`}
                  >
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className='space-y-1'>
              <label className='text-xs font-mono text-gray-400'>Threads</label>
              <div className='flex items-center gap-2 bg-gray-950 border border-gray-800 rounded px-2 py-1.5'>
                <Cpu size={14} className='text-gray-500' />
                <input
                  type='number'
                  min='1'
                  max='64'
                  value={hwConfig.threads}
                  onChange={(e) => setHwConfig({ ...hwConfig, threads: parseInt(e.target.value) })}
                  className='w-full bg-transparent text-white text-xs font-mono focus:outline-none'
                />
              </div>
            </div>
          </div>

          <button
            onClick={onApplyHw}
            className='mt-4 w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors'
          >
            <Zap size={14} fill='currentColor' /> APPLY HARDWARE
          </button>
        </div>

        {/* COL 2: AI STRATEGY CONFIG */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col'>
          <div className='flex items-center gap-2 mb-4 pb-2 border-b border-gray-800'>
            <BrainCircuit className='text-neon-blue' size={18} />
            <h3 className='text-sm font-bold text-gray-300 font-mono'>AI STRATEGY</h3>
          </div>

          <div className='space-y-4 flex-1'>
            <div className='space-y-1'>
              <label className='text-xs font-mono text-gray-400'>Model Architecture</label>
              <select
                value={stratConfig.model}
                onChange={(e) => setStratConfig({ ...stratConfig, model: e.target.value as any })}
                className='w-full bg-gray-950 border border-gray-800 rounded px-2 py-1.5 text-xs text-neon-blue font-mono focus:border-neon-blue focus:outline-none'
              >
                <option value='Nano-LSTM'>Nano-LSTM</option>
                <option value='Transformer-XL'>Transformer-XL</option>
                <option value='Deep-ConvNet'>Deep-ConvNet</option>
                <option value='Hybrid'>Hybrid Ensemble</option>
              </select>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <label className='text-xs font-mono text-gray-400'>Market Depth</label>
                <div className='flex items-center gap-2 bg-gray-950 border border-gray-800 rounded px-2 py-1.5'>
                  <Layers size={14} className='text-gray-500' />
                  <input
                    type='number'
                    value={stratConfig.marketDepth}
                    onChange={(e) =>
                      setStratConfig({ ...stratConfig, marketDepth: parseInt(e.target.value) })
                    }
                    className='w-full bg-transparent text-white text-xs font-mono focus:outline-none'
                  />
                </div>
              </div>
              <div className='space-y-1'>
                <label className='text-xs font-mono text-gray-400'>Min Confidence</label>
                <div className='flex items-center gap-2 bg-gray-950 border border-gray-800 rounded px-2 py-1.5'>
                  <Activity size={14} className='text-gray-500' />
                  <span className='text-white text-xs font-mono'>{stratConfig.confidence}%</span>
                </div>
              </div>
            </div>

            <div className='flex items-center justify-between bg-gray-950 p-2 rounded border border-gray-800'>
              <span className='text-xs text-gray-400 font-mono'>Live Training</span>
              <button
                onClick={() =>
                  setStratConfig({ ...stratConfig, liveTraining: !stratConfig.liveTraining })
                }
                className={`w-8 h-4 rounded-full p-0.5 transition-colors ${stratConfig.liveTraining ? 'bg-neon-green' : 'bg-gray-700'}`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${stratConfig.liveTraining ? 'translate-x-4' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>

          <button
            onClick={onApplyStrat}
            className='mt-4 w-full py-2 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/50 text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors'
          >
            <BarChart2 size={14} /> UPDATE MODEL
          </button>
        </div>

        {/* COL 3: RISK MANAGEMENT */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col'>
          <div className='flex items-center gap-2 mb-4 pb-2 border-b border-gray-800'>
            <Shield className='text-orange-500' size={18} />
            <h3 className='text-sm font-bold text-gray-300 font-mono'>RISK SETTINGS</h3>
          </div>

          <div className='space-y-4 flex-1'>
            <div className='space-y-2'>
              <label className='text-xs font-mono text-gray-400'>Allowed Assets</label>
              <div className='grid grid-cols-4 gap-2'>
                {Object.entries(riskConfig.assets).map(([asset, active]) => (
                  <button
                    key={asset}
                    onClick={() => toggleAsset(asset as any)}
                    className={`text-[10px] py-1 rounded border font-bold transition-all ${active ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-gray-950 border-gray-800 text-gray-600'}`}
                  >
                    {asset}
                  </button>
                ))}
              </div>
            </div>

            <div className='space-y-1'>
              <label className='text-xs font-mono text-gray-400'>Daily Loss Limit (%)</label>
              <div className='flex items-center gap-2 bg-gray-950 border border-gray-800 rounded px-2 py-1.5'>
                <AlertTriangle size={14} className='text-red-500' />
                <input
                  type='number'
                  step='0.1'
                  value={riskConfig.dailyLossLimit}
                  onChange={(e) =>
                    setRiskConfig({ ...riskConfig, dailyLossLimit: parseFloat(e.target.value) })
                  }
                  className='w-full bg-transparent text-red-400 font-bold text-xs font-mono focus:outline-none'
                />
              </div>
            </div>

            <div className='space-y-1'>
              <label className='text-xs font-mono text-gray-400'>Sizing Mode</label>
              <div className='flex bg-gray-950 rounded p-0.5 border border-gray-800'>
                {['Fixed', 'Dynamic'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setRiskConfig({ ...riskConfig, sizingMode: mode as any })}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${riskConfig.sizingMode === mode ? 'bg-gray-700 text-white' : 'text-gray-500'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className='mt-4'>
            <button
              onClick={onApplyRisk}
              className='w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors'
            >
              <Check size={14} /> SAVE CONFIG
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: LIVE STRATEGY LOGS */}
      <div className='flex-1 min-h-[300px] bg-black border border-gray-800 rounded-xl overflow-hidden flex flex-col shadow-lg'>
        <div className='bg-gray-900/80 p-3 border-b border-gray-800 flex justify-between items-center'>
          <div className='flex items-center gap-2 text-xs font-mono font-bold text-gray-400'>
            <Terminal size={14} /> LIVE INFERENCE STREAM
          </div>
          <div className='flex items-center gap-2'>
            <Cpu size={14} className='text-neon-blue animate-pulse' />
            <span className='text-[10px] text-neon-blue font-mono'>NEURAL ENGINE ACTIVE</span>
          </div>
        </div>
        <div
          ref={scrollRef}
          className='flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1.5 custom-scrollbar bg-black/50'
        >
          {logs.map((log, i) => (
            <div
              key={i}
              className='flex gap-3 animate-fade-in-up border-b border-gray-900/30 pb-0.5'
            >
              <span className='text-gray-600 shrink-0 select-none'>[{log.time}]</span>
              <span
                className={`font-bold shrink-0 w-24 ${
                  log.type === 'INFERENCE'
                    ? 'text-blue-400'
                    : log.type === 'WEIGHTS'
                      ? 'text-purple-400'
                      : log.type === 'DECISION'
                        ? 'text-green-400'
                        : 'text-gray-500'
                }`}
              >
                {log.type}
              </span>
              <span className='text-gray-300 break-all'>{log.msg}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className='text-center text-gray-600 mt-10 italic'>
              Initializing neural network logging subsystem...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterConfigPanel;
