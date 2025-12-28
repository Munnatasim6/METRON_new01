import React, { useState, useEffect } from 'react';
import DashboardPanel from '../components/Panels/DashboardPanel';
import { useAppStore } from '../store/useAppStore';
import { useSettingsStore } from '../store/useSettingsStore';
import SEO from '../components/common/SEO';
import { socketService } from '../services/api/socketService';

// --- Dashboard Widgets Imports ---
import SentimentWidget from '../components/Widgets/SentimentWidget';
import ArbitrageMonitor from '../components/Widgets/ArbitrageMonitor';
import RecentTrades from '../components/Widgets/RecentTrades'; // Still used to duplicate/verify logic? Actually we import it to pass type maybe, but mainly to pass data. Wait, we don't render it directly anymore.

// --- Interfaces for Type Safety ---
interface SentimentData {
  verdict: string;
  score: number;
  symbol: string;
  signal?: string;
  confidence?: number;
  color: string;
  summary: { buy: number; sell: number; neutral: number };
  details: { name: string; signal: string }[];
}

interface Trade {
  id: number;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  time: string;
}

interface ArbitrageData {
  exchange: string;
  price: number;
  logo: string;
}

const MonitorPage: React.FC = () => {
  const {
    metrics,
    positions,
    logs,
    logFilter,
    setLogFilter,
    clearLogs,
    closePosition,
    closeAllPositions,
    updatePositionSize,
  } = useAppStore();

  const { riskConfig } = useSettingsStore();

  // --- State Management ---
  const [exchanges, setExchanges] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [selectedExchange, setSelectedExchange] = useState<string>('binance');
  const [selectedPair, setSelectedPair] = useState<string>('BTC/USDT');
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);

  // --- Dashboard Logic States ---
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [arbitrageData, setArbitrageData] = useState<ArbitrageData[]>([]);
  const [recentTradesData, setRecentTradesData] = useState<Trade[]>([]);
  const [currentStrategy, setCurrentStrategy] = useState<string>("Loading...");
  const [socketStatus, setSocketStatus] = useState<string>("Connecting...");


  // 1. Load Exchanges
  useEffect(() => {
    fetch('http://localhost:8000/api/exchanges')
      .then((res) => res.json())
      .then((data) => setExchanges(Array.isArray(data) ? data : data.exchanges || []))
      .catch((err) => console.error('Exchange load failed', err));
  }, []);

  // 2. Load Market Pairs
  useEffect(() => {
    if (!selectedExchange) return;
    setIsLoadingMarkets(true);
    setMarkets([]); // Clear previous
    fetch(`http://localhost:8000/api/markets?exchange=${selectedExchange}`)
      .then((res) => res.json())
      .then((data) => {
        setMarkets(Array.isArray(data) ? data : data.markets || []);
        setIsLoadingMarkets(false);
      })
      .catch((err) => {
        console.error('Market load failed', err);
        setIsLoadingMarkets(false);
      });
  }, [selectedExchange]);

  // 3. Initial Dashboard Data Fetch (Strategy & Arbitrage)
  const fetchInitialDashboardData = async () => {
    try {
      const [strategyRes, arbitrageRes] = await Promise.all([
        fetch('http://localhost:8000/api/strategy'),
        fetch(`http://localhost:8000/api/arbitrage?symbol=${selectedPair.replace('/', '')}`) // Dynamic Pair
      ]);

      if (strategyRes.ok) {
        const sData = await strategyRes.json();
        // Backend returns "current_mode"
        setCurrentStrategy(sData.current_mode ? sData.current_mode.toUpperCase() : "UNKNOWN");
      }
      if (arbitrageRes.ok) {
        const aData = await arbitrageRes.json();
        // Backend returns direct list
        setArbitrageData(Array.isArray(aData) ? aData : aData.data || []);
      }
    } catch (error) {
      console.error("Initial Dashboard Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchInitialDashboardData();
  }, [selectedPair]); // Refetch when pair changes

  // 4. Unified WebSocket Connection
  useEffect(() => {
    socketService.connect();
    setSocketStatus("Live Socket 🟢");

    const unsubscribe = socketService.subscribe((data: any) => {
      // Monitor Page Logic
      if (data.price) {
        setLatestPrice(data.price);
      }

      // Dashboard Logic
      if (data.type === 'SENTIMENT') {
        setSentimentData(data.payload as SentimentData);
      }
      if (data.type === 'TRADES') {
        setRecentTradesData(data.payload as Trade[]);
      }
      if (data.type === 'ARBITRAGE') {
        setArbitrageData(data.payload as ArbitrageData[]);
      }
    });

    // Initial Subscription
    const subscribeInit = () => {
      if (socketService['socket']?.readyState === WebSocket.OPEN) {
        socketService.send({ type: 'SUBSCRIBE', exchange: selectedExchange, pair: selectedPair });
      } else {
        setTimeout(subscribeInit, 500);
      }
    };
    subscribeInit();

    return () => {
      unsubscribe();
      // Only disconnect if we are leaving the page entirely, but React 18 strict mode might trigger this. 
      // socketService.disconnect(); 
      // For now, let's keep the connection logic as is from MonitorPage.
    };
  }, []);

  // Update subscription when pair changes
  useEffect(() => {
    if (socketService['socket']?.readyState === WebSocket.OPEN) {
      socketService.send({
        type: 'SUBSCRIBE',
        exchange: selectedExchange,
        pair: selectedPair
      });
    }
    setLatestPrice(null);
  }, [selectedExchange, selectedPair]);


  const handleExchangeChange = (newExchange: string) => {
    setSelectedExchange(newExchange);
    // Logic to select default pair or keep existing if valid could go here
    setLatestPrice(null);
  };

  const handlePairChange = (newPair: string) => {
    setSelectedPair(newPair);
  };

  return (
    <>
      <SEO title="Live Monitor" description="Real-time system monitoring and trading dashboard" />

      {/* Existing Monitor Panel (Top Control Bar & Widgets) */}
      <DashboardPanel
        metrics={metrics}
        positions={positions}
        riskConfig={riskConfig}
        logs={logs}
        logFilter={logFilter}
        setLogFilter={setLogFilter}
        clearLogs={clearLogs}
        onClosePosition={closePosition}
        onCloseAllPositions={closeAllPositions}
        onEditPosition={(pos) => {
          const newSize = prompt(`Update size for ${pos.pair}`, pos.size.toString());
          if (newSize) {
            const size = parseFloat(newSize);
            if (!isNaN(size)) updatePositionSize(pos.id, size);
          }
        }}
        exchanges={exchanges}
        markets={markets}
        selectedExchange={selectedExchange}
        onExchangeChange={handleExchangeChange}
        selectedPair={selectedPair}
        onPairChange={handlePairChange}
        latestPrice={latestPrice}
        isLoadingMarkets={isLoadingMarkets}
        recentTradesData={recentTradesData}
        sentimentData={sentimentData}
        arbitrageData={arbitrageData}
        currentStrategy={currentStrategy}
      />
    </>
  );
};

export default MonitorPage;
