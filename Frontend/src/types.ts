// Frontend/src/types.ts

export interface MarketData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;

  // --- New Backend Calculated Fields ---
  vwap?: number;
  smart_delta?: number;
  market_phase?: 'Accumulation' | 'Markup' | 'Distribution' | 'Markdown' | 'Consolidation';
  activity_score?: number;
  turnover?: number;

  // Key Indicators (Top 70 subset for display)
  rsi_14?: number;
  adx_14?: number;
  ema_50?: number;
  ema_200?: number;
  macd?: number;
  macdh?: number; // Histogram
  macds?: number; // Signal
  atr?: number;

  // Special
  gann_angle?: number;
  pivot_p?: number;
  fractal_top?: boolean;
  fractal_bottom?: boolean;
}

export interface SignalResponse {
  status: string;
  timeframe: string;
  current_phase: string;
  data: MarketData[];
}

export enum SystemStatus {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  TRAINING = 'TRAINING',
}

export interface Position {
  id: string;
  pair: string;
  side: 'LONG' | 'SHORT';
  size: number;
  pnl: number;
  pnlHistory: number[]; // Added for trend chart
  entryPrice: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'TRADE' | 'ERROR' | 'ALERT';
  message: string;
}

export interface HardwareConfig {
  ramLimit: number;
  cpuPriority: 'Eco' | 'Balanced' | 'High Perf';
  threads: number;
}

export interface StrategyConfig {
  model: 'Nano-LSTM' | 'Transformer-XL' | 'Deep-ConvNet' | 'Hybrid';
  marketDepth: number;
  liveTraining: boolean;
  confidence: number;
}

// Credentials & Advanced Secrets
export interface SecretConfig {
  // Exchange API
  binanceApiKey: string;
  binanceSecretKey: string;
  kucoinApiKey: string;
  kucoinSecretKey: string;
  kucoinPassphrase: string;

  // Notifications
  telegramBotToken: string;
  telegramChatId: string;
  discordWebhookUrl: string;
  telegramEnabled: boolean;
  discordEnabled: boolean;

  // Advanced Risk
  maxDailyDrawdown: number; // Hard stop %
  maxRiskPerTrade: number; // Max allowed risk %
}

export interface RiskConfig {
  dailyLossLimit: number;
  assets: {
    BTC: boolean;
    ETH: boolean;
    SOL: boolean;
    BNB: boolean;
  };
  sizingMode: 'Fixed' | 'Dynamic';
}

export interface UserSettings {
  apiKey: string;
  apiSecret: string;
}

export interface StrategyPreset {
  id: string;
  name: string;
  config: StrategyConfig;
}

export interface AppState {
  status: SystemStatus;
  metrics: {
    timeOffset: number;
    apiWeight: number;
    ping: number;
    buyPressure: number; // 0-100
  };
}

export interface AppModule {
  id: string;
  label: string;
  icon: any; // Lucide Icon Component
  desc: string;
  color: string;
}
