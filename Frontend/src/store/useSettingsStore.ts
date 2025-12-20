import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HardwareConfig, StrategyConfig, RiskConfig, UserSettings, StrategyPreset } from '../types';

interface SettingsState {
  hardwareConfig: HardwareConfig;
  strategyConfig: StrategyConfig;
  riskConfig: RiskConfig;
  userSettings: UserSettings;
  presets: StrategyPreset[];

  setHardwareConfig: (config: HardwareConfig) => void;
  setStrategyConfig: (config: StrategyConfig) => void;
  setRiskConfig: (config: RiskConfig) => void;
  setUserSettings: (settings: UserSettings) => void;
  addPreset: (preset: StrategyPreset) => void;
}

const DEFAULT_HARDWARE: HardwareConfig = { ramLimit: 10, cpuPriority: 'Balanced', threads: 1 };
const DEFAULT_STRATEGY: StrategyConfig = {
  model: 'Nano-LSTM',
  marketDepth: 20,
  liveTraining: true,
  confidence: 85,
};
const DEFAULT_RISK: RiskConfig = {
  dailyLossLimit: 2.5,
  assets: { BTC: true, ETH: true, SOL: false, BNB: false },
  sizingMode: 'Dynamic',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hardwareConfig: DEFAULT_HARDWARE,
      strategyConfig: DEFAULT_STRATEGY,
      riskConfig: DEFAULT_RISK,
      userSettings: { apiKey: '', apiSecret: '' },
      presets: [],

      setHardwareConfig: (config) => set({ hardwareConfig: config }),
      setStrategyConfig: (config) => set({ strategyConfig: config }),
      setRiskConfig: (config) => set({ riskConfig: config }),
      setUserSettings: (settings) => set({ userSettings: settings }),
      addPreset: (preset) => set((state) => ({ presets: [...state.presets, preset] })),
    }),
    {
      name: 'metron-settings', // name of the item in the storage (must be unique)
    },
  ),
);
