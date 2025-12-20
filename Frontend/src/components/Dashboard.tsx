import React, { useEffect, useState } from 'react';
import SentimentWidget from './Widgets/SentimentWidget';
import RecentTrades from './Widgets/RecentTrades';
import ArbitrageMonitor from './Widgets/ArbitrageMonitor';
import TradingChart from './Widgets/TradingChart';
import OrderBook from './Widgets/OrderBook';
import { socketService } from '../services/api/socketService';

// ইম্প্রুভমেন্ট ৩: Type Definitions (Interface)
interface SentimentData {
    verdict: string;
    score: number;
    symbol: string;
    signal?: string;
    confidence?: number;
}

interface Trade {
    id: string;
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

const Dashboard = () => {
    // Type Safe States
    const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
    const [arbitrageData, setArbitrageData] = useState<ArbitrageData[]>([]);
    const [recentTradesData, setRecentTradesData] = useState<Trade[]>([]);
    const [currentStrategy, setCurrentStrategy] = useState<string>("Loading...");

    const [socketStatus, setSocketStatus] = useState<string>("Connecting...");
    const [isLoading, setIsLoading] = useState(true);

    // Initial Fetch (শুধুমাত্র পেজ লোডের সময় একবার)
    const fetchInitialData = async () => {
        try {
            // স্ট্র্যাটেজি এবং ইনিশিয়াল আরবিট্রেজ স্ন্যাপশট
            const [strategyRes, arbitrageRes] = await Promise.all([
                fetch('http://localhost:8000/api/strategy'),
                fetch('http://localhost:8000/api/arbitrage?symbol=BTC/USDT')
            ]);

            if (strategyRes.ok) {
                const sData = await strategyRes.json();
                setCurrentStrategy(sData.strategy.toUpperCase());
            }
            if (arbitrageRes.ok) {
                const aData = await arbitrageRes.json();
                setArbitrageData(aData.data);
            }
        } catch (error) {
            console.error("Initial Fetch Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
        socketService.connect();
        setSocketStatus("Live Socket 🟢");

        const unsubscribe = socketService.subscribe((data: any) => {
            // ১. সেন্টিমেন্ট আপডেট
            if (data.type === 'SENTIMENT') {
                setSentimentData(data.payload as SentimentData);
            }

            // ২. ট্রেড আপডেট
            if (data.type === 'TRADES') {
                setRecentTradesData(data.payload as Trade[]);
            }

            // ৩. আরবিট্রেজ আপডেট (ইম্প্রুভমেন্ট ৪: সকেট থেকে রিসিভ)
            if (data.type === 'ARBITRAGE') {
                setArbitrageData(data.payload as ArbitrageData[]);
            }
        });

        return () => {
            unsubscribe();
            socketService.disconnect();
            setSocketStatus("Disconnected 🔴");
        };
    }, []);

    // নোট: আমরা setInterval পোলিং রিমুভ করে দিয়েছি কারণ এখন সকেটেই সব ডাটা আসছে।

    return (
        <div style={{ padding: '20px', background: '#131722', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#d1d4dc', margin: 0, fontSize: '18px' }}>🚀 Metron Hybrid Dashboard (Pro)</h2>
                <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
                    {isLoading ? (
                        <span style={{ color: '#ffb300' }}>● Initializing...</span>
                    ) : (
                        <span style={{ color: '#00c853' }}>● {socketStatus}</span>
                    )}
                </div>
            </div>

            {/* Main Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '75% 24%', gap: '1%', marginBottom: '20px' }}>
                <div style={{ height: '500px' }}>
                    <TradingChart symbol="BTCUSDT" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '500px' }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <OrderBook />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <RecentTrades data={recentTradesData} />
                    </div>
                </div>
            </div>

            {/* Analysis Widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <SentimentWidget data={sentimentData} />

                {/* সকেট থেকে পাওয়া আরবিট্রেজ ডাটা */}
                <ArbitrageMonitor data={arbitrageData} />

                {/* System Info */}
                <div style={{ background: '#1e222d', borderRadius: '8px', padding: '15px', border: '1px solid #2a2e39', color: '#787b86', fontSize: '12px' }}>
                    <h4 style={{ color: '#d1d4dc', marginBottom: '10px' }}>System Health</h4>
                    <p style={{ margin: '5px 0' }}>Core: <span style={{ color: '#00c853' }}>Python Async Engine</span></p>
                    <p style={{ margin: '5px 0' }}>Arb Rate: <span style={{ color: '#2962ff' }}>~10s (Optimized)</span></p>
                    <p style={{ margin: '5px 0' }}>Strategy: <span style={{ color: '#ffb300', fontWeight: 'bold' }}>{currentStrategy}</span></p>
                    <div style={{ marginTop: '10px', padding: '8px', background: '#2a2e39', borderRadius: '4px', borderLeft: '3px solid #00e676' }}>
                        Status: <strong>Fully Real-time & Type Safe</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
