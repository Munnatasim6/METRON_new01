import React from 'react';
import { Cpu, Server, Zap } from 'lucide-react';
import { HardwareConfig } from '../../types';

interface Props {
  config: HardwareConfig;
  updateConfig: (cfg: HardwareConfig) => void;
  onApply: () => void;
}

const HardwarePanel: React.FC<Props> = ({ config, updateConfig, onApply }) => {
  return (
    <div className='p-6 space-y-8 animate-fade-in'>
      <div className='flex items-center gap-2 mb-6 border-b border-gray-800 pb-2'>
        <Server className='text-purple-500' />
        <h2 className='text-lg font-bold font-mono'>HARDWARE ENGINE</h2>
      </div>

      {/* RAM LIMIT */}
      <div className='space-y-2'>
        <div className='flex justify-between text-sm font-mono'>
          <span className='text-gray-400'>RAM Allocation Limit</span>
          <span className='text-purple-400 font-bold'>{config.ramLimit} GB</span>
        </div>
        <input
          type='range'
          min='1'
          max='128'
          value={config.ramLimit}
          onChange={(e) => updateConfig({ ...config, ramLimit: parseInt(e.target.value) })}
          className='w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500'
        />
        <div className='flex justify-between text-xs text-gray-600 font-mono'>
          <span>1 GB</span>
          <span>128 GB</span>
        </div>
      </div>

      {/* CPU PRIORITY */}
      <div className='space-y-2'>
        <label className='block text-sm font-mono text-gray-400'>CPU Process Priority</label>
        <div className='grid grid-cols-3 gap-3'>
          {['Eco', 'Balanced', 'High Perf'].map((mode) => (
            <button
              key={mode}
              onClick={() => updateConfig({ ...config, cpuPriority: mode as any })}
              className={`
                        py-3 px-2 rounded border text-xs font-bold font-mono transition-all
                        ${
                          config.cpuPriority === mode
                            ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                            : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'
                        }
                    `}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* THREADS */}
      <div className='space-y-2'>
        <label className='block text-sm font-mono text-gray-400'>Worker Threads</label>
        <div className='relative'>
          <Cpu className='absolute left-3 top-2.5 text-gray-500' size={16} />
          <input
            type='number'
            min='1'
            max='64'
            value={config.threads}
            onChange={(e) => updateConfig({ ...config, threads: parseInt(e.target.value) })}
            className='w-full bg-gray-900 border border-gray-800 rounded py-2 pl-10 pr-4 font-mono text-white focus:border-purple-500 focus:outline-none'
          />
        </div>
      </div>

      <div className='pt-4'>
        <button
          onClick={onApply}
          className='w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition-all active:scale-95'
        >
          <Zap size={18} fill='currentColor' />
          APPLY CONFIGURATION
        </button>
      </div>
    </div>
  );
};

export default HardwarePanel;
