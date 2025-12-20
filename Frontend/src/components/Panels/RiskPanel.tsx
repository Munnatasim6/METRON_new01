import React from 'react';
import { Shield, AlertTriangle, Skull } from 'lucide-react';
import { RiskConfig } from '../../types';

interface Props {
  config: RiskConfig;
  updateConfig: (cfg: RiskConfig) => void;
  onApply: () => void;
  onKillSwitch: () => void;
}

const RiskPanel: React.FC<Props> = ({ config, updateConfig, onApply, onKillSwitch }) => {
  const toggleAsset = (asset: keyof typeof config.assets) => {
    updateConfig({
      ...config,
      assets: { ...config.assets, [asset]: !config.assets[asset] },
    });
  };

  return (
    <div className='p-6 space-y-8 animate-fade-in h-full flex flex-col'>
      <div className='flex items-center gap-2 mb-2 border-b border-gray-800 pb-2'>
        <Shield className='text-orange-500' />
        <h2 className='text-lg font-bold font-mono'>RISK MANAGER</h2>
      </div>

      {/* ASSET SELECTOR */}
      <div className='space-y-3'>
        <label className='block text-sm font-mono text-gray-400'>Whitelisted Assets</label>
        <div className='grid grid-cols-2 gap-3'>
          {Object.entries(config.assets).map(([asset, active]) => (
            <label
              key={asset}
              className={`
                    flex items-center justify-between p-3 rounded border cursor-pointer transition-all
                    ${active ? 'bg-orange-500/10 border-orange-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-500'}
                `}
            >
              <span className='font-mono font-bold'>{asset}</span>
              <input
                type='checkbox'
                checked={active}
                onChange={() => toggleAsset(asset as any)}
                className='accent-orange-500'
              />
            </label>
          ))}
        </div>
      </div>

      {/* LOSS LIMIT */}
      <div className='space-y-2'>
        <label className='block text-sm font-mono text-gray-400'>Daily Max Loss Limit (%)</label>
        <div className='flex items-center gap-2'>
          <AlertTriangle className='text-red-500' size={16} />
          <input
            type='number'
            step='0.1'
            min='0.1'
            max='10'
            value={config.dailyLossLimit}
            onChange={(e) =>
              updateConfig({ ...config, dailyLossLimit: parseFloat(e.target.value) })
            }
            className='w-full bg-gray-900 border border-gray-800 rounded py-2 px-4 font-mono text-red-500 font-bold focus:border-red-500 focus:outline-none'
          />
        </div>
      </div>

      {/* SIZING MODE */}
      <div className='space-y-2'>
        <label className='block text-sm font-mono text-gray-400'>Position Sizing</label>
        <div className='flex bg-gray-900 rounded p-1 border border-gray-800'>
          {['Fixed', 'Dynamic'].map((mode) => (
            <button
              key={mode}
              onClick={() => updateConfig({ ...config, sizingMode: mode as any })}
              className={`
                        flex-1 py-1 rounded text-xs font-bold font-mono transition-all
                        ${config.sizingMode === mode ? 'bg-gray-700 text-white' : 'text-gray-500'}
                    `}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className='flex-1'></div>

      {/* KILL SWITCH */}
      <div className='border-t border-gray-800 pt-6'>
        <button
          onClick={onKillSwitch}
          className='w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.5)] border-2 border-red-500 flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 group'
        >
          <Skull size={32} className='group-hover:animate-pulse' />
          <div className='flex flex-col items-start'>
            <span className='text-xl tracking-wider'>EMERGENCY KILL</span>
            <span className='text-[10px] opacity-80 font-mono'>SHIFT + ESC</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default RiskPanel;
