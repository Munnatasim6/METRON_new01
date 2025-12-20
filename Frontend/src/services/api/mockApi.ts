import { LogEntry, Position, SystemStatus } from '../../types';

// Helper to generate random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const MockApi = {
  fetchMetrics: (prevMetrics: any) => {
    const baseline = 40;
    const pull = (baseline - prevMetrics.apiWeight) * 0.1;
    const noise = (Math.random() - 0.5) * 4;
    const spike = Math.random() > 0.98 ? Math.random() * 35 + 10 : 0;

    let newWeight = prevMetrics.apiWeight + pull + noise + spike;
    newWeight = Math.min(100, Math.max(5, newWeight));

    return {
      timeOffset: Math.max(0, prevMetrics.timeOffset + (Math.random() * 10 - 5)),
      apiWeight: newWeight,
      ping: Math.floor(20 + Math.random() * 30),
      buyPressure: Math.min(100, Math.max(0, prevMetrics.buyPressure + (Math.random() * 10 - 5))),
    };
  },

  generateLog: (): LogEntry | null => {
    if (Math.random() > 0.8) {
      const msgs = [
        'Scanning L2 depth...',
        'Weight decay applied',
        'Heartbeat sync OK',
        'Latency check: 12ms',
        'Model inference: 4ms',
      ];
      return {
        id: generateId(),
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        type: 'INFO',
        message: msgs[Math.floor(Math.random() * msgs.length)],
      };
    }
    return null;
  },

  generateTrade: (
    activePositions: Position[],
    assets: Record<string, boolean>,
  ): Position | null => {
    if (Math.random() > 0.92 && activePositions.length < 8) {
      const coins = Object.keys(assets).filter((k) => assets[k]);
      if (coins.length > 0) {
        const coin = coins[Math.floor(Math.random() * coins.length)];
        const side = Math.random() > 0.5 ? 'LONG' : 'SHORT';
        return {
          id: generateId(),
          pair: `${coin}-USDT`,
          side: side as 'LONG' | 'SHORT',
          size: Number((Math.random() * 2).toFixed(3)),
          pnl: 0,
          pnlHistory: [0],
          entryPrice: 50000 + Math.random() * 1000,
        };
      }
    }
    return null;
  },

  updatePositions: (positions: Position[]): Position[] => {
    return positions.map((p) => {
      const fluctuation = Math.random() * 10 - 4;
      const newPnL = p.pnl + fluctuation;
      const history = p.pnlHistory || [0];
      const newHistory = [...history, newPnL].slice(-20);

      return {
        ...p,
        pnl: newPnL,
        pnlHistory: newHistory,
      };
    });
  },
};
