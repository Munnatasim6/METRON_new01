import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Square,
  Play,
  Volume2,
  VolumeX,
  Settings,
  Wifi,
  Save,
  ChevronDown,
  Upload,
  Download,
} from 'lucide-react';
import AnalogClock from '../Widgets/AnalogClock';
import LanguageSwitcher from '../common/LanguageSwitcher';
import SettingsModal from '../Modals/SettingsModal';
import { useAppStore } from '../../store/useAppStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { SystemStatus, StrategyPreset } from '../../types';
import { playSound } from '../../services/soundService';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Store State
  const { status, metrics, soundEnabled, toggleSystem, toggleSound, addLog } = useAppStore();

  const { userSettings, setUserSettings, presets, addPreset } = useSettingsStore();

  // Local UI State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (soundEnabled) playSound('click');
  };

  // Preset Handlers
  const savePreset = () => {
    const name = prompt('Enter preset name (e.g., "Aggressive V1"):');
    if (name) {
      const newPreset: StrategyPreset = {
        id: Date.now().toString(),
        name,
        config: useSettingsStore.getState().strategyConfig, // Get current config
      };
      addPreset(newPreset);
      addLog('INFO', `Strategy preset "${name}" saved.`);
      setShowProfileMenu(false);
    }
  };

  const loadPreset = (preset: StrategyPreset) => {
    useSettingsStore.getState().setStrategyConfig(preset.config);
    addLog('INFO', `Strategy preset "${preset.name}" loaded.`);
    setShowProfileMenu(false);
  };

  return (
    <>
      <header className='h-16 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex items-center justify-between px-6 shrink-0 z-10 relative'>
        <div className='flex items-center gap-6'>
          {location.pathname !== '/' && (
            <button
              onClick={() => handleNavigate('/')}
              className='hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg text-xs font-bold transition-all border border-gray-700 group'
            >
              <Home size={14} className='group-hover:text-neon-blue' />
              <span>HOME</span>
            </button>
          )}

          <div className='flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-full border border-gray-800'>
            <div
              className={`w-2.5 h-2.5 rounded-full ${status === SystemStatus.RUNNING ? 'bg-neon-green animate-pulse-fast' : 'bg-red-500'}`}
            />
            <span
              className={`font-mono text-sm font-bold ${status === SystemStatus.RUNNING ? 'text-neon-green' : 'text-red-500'}`}
            >
              {status === SystemStatus.RUNNING ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
            </span>
          </div>

          <div className='hidden xl:flex items-center gap-3 font-mono text-sm pl-4 border-l border-gray-800 ml-4 h-10'>
            <AnalogClock size={32} />
            <div className='flex flex-col justify-center leading-tight'>
              <span className='text-gray-300 font-bold'>
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </span>
              <span
                className={`text-[10px] ${metrics.timeOffset > 500 ? 'text-red-500 font-bold' : 'text-green-500/70'}`}
              >
                Offset: +{metrics.timeOffset.toFixed(0)}ms
              </span>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <LanguageSwitcher />

            {/* Exchange Health Meter */}
            <div
              className='hidden md:flex flex-col items-end mr-4 group relative cursor-help'
              title={metrics.apiWeight > 80 ? 'Warning: High API Load' : 'API Load Normal'}
            >
              <div className='flex items-center gap-2 text-xs font-mono text-gray-400'>
                <Wifi
                  size={12}
                  className={metrics.ping > 100 ? 'text-neon-red' : 'text-gray-500'}
                />
                <span className={metrics.ping > 100 ? 'text-red-400' : ''}>
                  API PING: {metrics.ping}ms
                </span>
              </div>
              <div className='w-24 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden relative'>
                <div
                  className={`h-full transition-all duration-300 ${metrics.apiWeight > 80 ? 'bg-neon-red shadow-[0_0_8px_#ff003c]' : 'bg-blue-500'}`}
                  style={{ width: `${metrics.apiWeight}%` }}
                />
              </div>
            </div>

            {/* Profile Manager */}
            <div className='relative'>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className='hidden xl:flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded text-xs font-mono cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700'
              >
                <Save size={14} />
                <span>PRESET MANAGER</span>
                <ChevronDown size={12} />
              </button>

              {showProfileMenu && (
                <div className='absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded shadow-xl z-50'>
                  <div className='p-2 border-b border-gray-800'>
                    <button
                      onClick={savePreset}
                      className='w-full flex items-center gap-2 px-2 py-1.5 text-xs text-neon-blue hover:bg-gray-800 rounded transition-colors'
                    >
                      <Upload size={12} /> Save Current as...
                    </button>
                  </div>
                  <div className='max-h-48 overflow-y-auto p-2 space-y-1'>
                    {presets.length === 0 ? (
                      <div className='text-[10px] text-gray-600 px-2 italic'>No saved presets</div>
                    ) : (
                      presets.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => loadPreset(p)}
                          className='w-full text-left px-2 py-1.5 text-xs text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors flex items-center gap-2'
                        >
                          <Download size={12} className='text-gray-500' />
                          {p.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className='h-6 w-px bg-gray-800 mx-2' />

            <button
              onClick={toggleSound}
              className='p-2 text-gray-400 hover:text-white transition-colors'
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className='p-2 text-gray-400 hover:text-white transition-colors animate-spin-slow'
            >
              <Settings size={20} />
            </button>

            <button
              onClick={() => toggleSystem(!!userSettings.apiKey)}
              className={`
                            ml-4 px-6 py-2 rounded font-bold font-mono text-sm flex items-center gap-2 transition-all
                            ${
                              status === SystemStatus.RUNNING
                                ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white'
                                : 'bg-neon-green/10 text-neon-green border border-neon-green/50 hover:bg-neon-green hover:text-black'
                            }
                        `}
            >
              {status === SystemStatus.RUNNING ? (
                <>
                  <Square size={14} fill='currentColor' /> STOP
                </>
              ) : (
                <>
                  <Play size={14} fill='currentColor' /> START
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={userSettings}
        onSave={(s) => {
          setUserSettings(s);
          addLog('INFO', 'API Credentials updated locally.');
        }}
      />
    </>
  );
};

export default Header;
