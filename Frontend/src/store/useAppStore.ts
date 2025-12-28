import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SystemStatus, LogEntry, Position } from '../types';
import { MockApi } from '../services/api/mockApi';
import { playSound } from '../services/soundService';

interface AppState {
  status: SystemStatus;
  metrics: {
    timeOffset: number;
    apiWeight: number;
    ping: number;
    buyPressure: number;
  };
  positions: Position[];
  logs: LogEntry[];
  logFilter: 'ALL' | 'INFO' | 'TRADE' | 'ERROR';
  soundEnabled: boolean;

  // Actions
  setStatus: (status: SystemStatus) => void;
  toggleSystem: (hasApiKey: boolean) => void;
  addLog: (type: LogEntry['type'], message: string) => void;
  setLogFilter: (filter: 'ALL' | 'INFO' | 'TRADE' | 'ERROR') => void;
  clearLogs: () => void;
  toggleSound: () => void;

  // Position Actions
  closePosition: (id: string) => void;
  closeAllPositions: () => void;
  updatePositionSize: (id: string, newSize: number) => void;
  updateMetrics: (newMetrics: Partial<AppState['metrics']>) => void;

  // Simulation Loop Tick
  tick: (riskConfig: any) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      status: SystemStatus.STOPPED,
      metrics: { timeOffset: 12, apiWeight: 45, ping: 32, buyPressure: 52 },
      positions: [],
      logs: [],
      logFilter: 'ALL',
      soundEnabled: true,

      setStatus: (status) => set({ status }),

      toggleSystem: (hasApiKey) => {
        const { status, addLog, soundEnabled } = get();
        if (status === SystemStatus.STOPPED) {
          // if (!hasApiKey) {
          //   return;
          // }
          set({ status: SystemStatus.RUNNING });
          addLog('INFO', 'System Engine Started. Strategies initialized.');
          if (soundEnabled) playSound('click');
        } else {
          set({ status: SystemStatus.STOPPED });
          addLog('INFO', 'System Engine Stopped by User.');
          if (soundEnabled) playSound('click');
        }
      },

      addLog: (type, message) => {
        const newLog: LogEntry = {
          id: Math.random().toString(36),
          timestamp: new Date().toLocaleTimeString([], { hour12: false }),
          type,
          message,
        };
        set((state) => ({ logs: [...state.logs, newLog].slice(-200) }));
      },

      setLogFilter: (logFilter) => set({ logFilter }),
      clearLogs: () => set({ logs: [] }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      closePosition: (id) => {
        const { positions, addLog, soundEnabled } = get();
        const pos = positions.find((p) => p.id === id);
        if (pos) {
          set((state) => ({ positions: state.positions.filter((p) => p.id !== id) }));
          addLog('TRADE', `Closed ${pos.pair} PnL: $${pos.pnl.toFixed(2)}`);
          if (soundEnabled) playSound('click');
        }
      },

      closeAllPositions: () => {
        const { positions, addLog, soundEnabled } = get();
        if (positions.length === 0) return;
        set({ positions: [] });
        addLog('TRADE', 'Closed ALL active positions');
        if (soundEnabled) playSound('click');
      },

      updatePositionSize: (id, newSize) => {
        const { addLog, soundEnabled } = get();
        set((state) => ({
          positions: state.positions.map((p) => (p.id === id ? { ...p, size: newSize } : p)),
        }));
        addLog('INFO', `Position ${id} resized to ${newSize}`);
        if (soundEnabled) playSound('click');
      },

      updateMetrics: (newMetrics) =>
        set((state) => ({ metrics: { ...state.metrics, ...newMetrics } })),

      tick: (riskConfig) => {
        const { status, metrics, positions, addLog, soundEnabled } = get();

        // Always update random metrics
        const newMetrics = MockApi.fetchMetrics(metrics);

        if (status === SystemStatus.STOPPED) {
          set({ metrics: newMetrics });
          return;
        }

        // Generate random logs
        const randomLog = MockApi.generateLog();
        if (randomLog) {
          set((state) => ({ logs: [...state.logs, randomLog].slice(-200) }));
        }

        // Generate trades
        const newTrade = MockApi.generateTrade(positions, riskConfig.assets);
        let currentPositions = [...positions];
        if (newTrade) {
          currentPositions.push(newTrade);
          addLog(
            'TRADE',
            `Opened ${newTrade.side} on ${newTrade.pair} @ ${newTrade.entryPrice.toFixed(2)}`,
          );
          if (soundEnabled) playSound('trade');
        }

        // Update PnL
        currentPositions = MockApi.updatePositions(currentPositions);

        set({
          metrics: newMetrics,
          positions: currentPositions,
        });
      },
    }),
    {
      name: 'metron-app-state',
      partialize: (state) => ({
        // We only persist these fields. Metrics are transient.
        status: state.status,
        positions: state.positions,
        logs: state.logs,
        logFilter: state.logFilter,
        soundEnabled: state.soundEnabled,
      }),
    },
  ),
);
