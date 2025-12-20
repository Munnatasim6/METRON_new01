import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, BarChart2, Layers, Terminal, Activity, Zap, Cpu } from 'lucide-react';
import { StrategyConfig } from '../../types';

interface Props {
  config: StrategyConfig;
  updateConfig: (cfg: StrategyConfig) => void;
  onApply: () => void;
}

const StrategyPanel: React.FC<Props> = ({ config, updateConfig, onApply }) => {
  const [logs, setLogs] = useState<{ time: string; type: string; msg: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Simulate Strategy Logs
  useEffect(() => {
    const interval = setInterval(() => {
      const types = ['INFERENCE', 'TENSOR', 'WEIGHTS', 'DECISION'];
      const type = types[Math.floor(Math.random() * types.length)];
      let msg = '';

      if (type === 'INFERENCE') {
        msg = `${config.model} forward pass complete (${(Math.random() * 10).toFixed(2)}ms)`;
      } else if (type === 'TENSOR') {
        msg = `Matrix multiplication: [128, 64] x [64, 1]`;
      } else if (type === 'WEIGHTS') {
        if (config.liveTraining) {
          msg = `Backpropagation: Gradients updated (Loss: 0.0${Math.floor(Math.random() * 9)})`;
        } else {
          msg = `Validation check: Weights frozen`;
        }
      } else if (type === 'DECISION') {
        const conf = (config.confidence + (Math.random() * 10 - 5)).toFixed(1);
        msg = `Signal generated | Confidence: ${conf}%`;
      }

      const newLog = {
        time: new Date().toLocaleTimeString().split(' ')[0],
        type,
        msg,
      };
      setLogs((prev) => [...prev, newLog].slice(-50)); // Keep last 50
    }, 1500);

    return () => clearInterval(interval);
  }, [config]);

  return (
    <div className='p-6 space-y-8 animate-fade-in h-full flex flex-col overflow-hidden'>
      <div className='flex items-center gap-2 mb-2 border-b border-gray-800 pb-2 shrink-0'>
        <BrainCircuit className='text-neon-blue' />
        <div>
          <h2 className='text-lg font-bold font-mono text-white'>AI STRATEGY ENGINE</h2>
          <p className='text-xs text-gray-500 font-mono'>Model Configuration & Live Inference</p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden min-h-0'>
        {/* LEFT: CONFIGURATION */}
        <div className='space-y-6 overflow-y-auto custom-scrollbar pr-2'>
          {/* MODEL SELECTION */}
          <div className='space-y-2'>
            <label className='block text-sm font-mono text-gray-400'>
              Neural Model Architecture
            </label>
            <div className='relative'>
              <select
                value={config.model}
                onChange={(e) => updateConfig({ ...config, model: e.target.value as any })}
                className='w-full bg-gray-900 border border-gray-800 text-neon-blue font-mono text-sm rounded px-4 py-3 focus:outline-none focus:border-neon-blue appearance-none'
              >
                <option value='Nano-LSTM'>Nano-LSTM (Low Latency)</option>
                <option value='Transformer-XL'>Transformer-XL (Context Heavy)</option>
                <option value='Deep-ConvNet'>Deep-ConvNet (Pattern Rec.)</option>
                <option value='Hybrid'>Hybrid Ensemble</option>
              </select>
              <Activity
                className='absolute right-3 top-3 text-gray-600 pointer-events-none'
                size={16}
              />
            </div>
          </div>

          {/* MARKET DEPTH */}
          <div className='space-y-2'>
            <label className='block text-sm font-mono text-gray-400'>
              L2 Market Depth Analysis (Levels)
            </label>
            <div className='relative'>
              <Layers className='absolute left-3 top-2.5 text-gray-500' size={16} />
              <input
                type='number'
                value={config.marketDepth}
                onChange={(e) => updateConfig({ ...config, marketDepth: parseInt(e.target.value) })}
                className='w-full bg-gray-900 border border-gray-800 rounded py-2 pl-10 pr-4 font-mono text-white focus:border-neon-blue focus:outline-none'
              />
            </div>
          </div>

          {/* CONFIDENCE THRESHOLD */}
          <div className='space-y-2 bg-gray-900/50 p-4 rounded border border-gray-800'>
            <div className='flex justify-between text-sm font-mono'>
              <span className='text-gray-400'>Entry Confidence Threshold</span>
              <span className='text-neon-blue font-bold'>{config.confidence}%</span>
            </div>
            <input
              type='range'
              min='50'
              max='99'
              value={config.confidence}
              onChange={(e) => updateConfig({ ...config, confidence: parseInt(e.target.value) })}
              className='w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-blue'
            />
          </div>

          {/* LIVE TRAINING TOGGLE */}
          <div className='flex items-center justify-between bg-gray-900 p-4 rounded border border-gray-800'>
            <div>
              <span className='block text-sm font-bold font-mono text-white flex items-center gap-2'>
                <Zap
                  size={14}
                  className={config.liveTraining ? 'text-yellow-400' : 'text-gray-600'}
                />
                Live Reinforcement Learning
              </span>
              <span className='text-xs text-gray-500'>Update weights on trade close</span>
            </div>
            <button
              onClick={() => updateConfig({ ...config, liveTraining: !config.liveTraining })}
              className={`
                        w-12 h-6 rounded-full p-1 transition-all duration-300
                        ${config.liveTraining ? 'bg-neon-green' : 'bg-gray-700'}
                    `}
            >
              <div
                className={`
                        w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300
                        ${config.liveTraining ? 'translate-x-6' : 'translate-x-0'}
                    `}
              />
            </button>
          </div>

          <div className='pt-2'>
            <button
              onClick={onApply}
              className='w-full bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue font-bold py-3 rounded flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            >
              <BarChart2 size={18} />
              DEPLOY STRATEGY
            </button>
          </div>
        </div>

        {/* RIGHT: LIVE LOGS */}
        <div className='flex flex-col bg-black border border-gray-800 rounded-xl overflow-hidden shadow-lg'>
          <div className='bg-gray-900/80 p-3 border-b border-gray-800 flex justify-between items-center'>
            <div className='flex items-center gap-2 text-xs font-mono font-bold text-gray-400'>
              <Terminal size={14} /> LIVE INFERENCE STREAM
            </div>
            <div className='flex items-center gap-2'>
              <Cpu size={14} className='text-neon-blue animate-pulse' />
              <span className='text-[10px] text-neon-blue font-mono'>GPU ACTIVE</span>
            </div>
          </div>
          <div
            ref={scrollRef}
            className='flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 custom-scrollbar bg-black/50'
          >
            {logs.map((log, i) => (
              <div key={i} className='flex gap-2 animate-fade-in-up'>
                <span className='text-gray-600 shrink-0'>[{log.time}]</span>
                <span
                  className={`font-bold shrink-0 w-20 ${
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
                Waiting for model initialization...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyPanel;
