
import React, { useState, useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import {
    Play,
    Pause,
    RotateCcw,
    Settings,
    TrendingUp,
    Activity,
    DollarSign,
    PieChart,
    BarChart,
    Download,
    Filter,
    Zap,
} from 'lucide-react';
import axios from 'axios';

interface MetricCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    icon: React.ReactNode;
    color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, subValue, icon, color }) => (
    <div className={`bg-gray-900/50 border border-${color}-500/30 p-4 rounded-xl flex items-center justify-between`}>
        <div>
            <p className='text-xs text-gray-400 font-mono mb-1 uppercase'>{label}</p>
            <p className={`text-xl font-bold text-${color}-400 font-mono`}>{value}</p>
            {subValue && <p className='text-[10px] text-gray-500 font-mono'>{subValue}</p>}
        </div>
        <div className={`p-2 bg-${color}-500/10 rounded-lg text-${color}-500`}>{icon}</div>
    </div>
);

const SimulationLab: React.FC = () => {
    // --- STATE ---
    const [config, setConfig] = useState({
        symbol: 'BTC/USDT',
        timeframe: '1h',
        strategy: 'Balanced',
        balance: 1000,
        fee: 0.1,
        slippage: 0.05,
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(100); // ms per candle
    const [playbackIndex, setPlaybackIndex] = useState(0);

    // --- REFS ---
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const equitySeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

    // --- API CALL ---
    const runSimulation = async () => {
        setLoading(true);
        setResult(null);
        setIsPlaying(false);
        setPlaybackIndex(0);

        try {
            const response = await axios.post('http://localhost:8000/api/backtest', {
                exchange: 'binance',
                symbol: config.symbol,
                timeframe: config.timeframe,
                limit: 1000,
                strategy: config.strategy,
                initial_balance: config.balance,
                fee_percent: config.fee,
                slippage_percent: config.slippage
            });
            setResult(response.data);
            // Auto-start playback setup
            setPlaybackIndex(0);
        } catch (error) {
            console.error("Simulation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- CHART INITIALIZATION ---
    useEffect(() => {
        if (chartContainerRef.current) {
            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: '#0b0f19' },
                    textColor: '#9ca3af',
                },
                grid: {
                    vertLines: { color: '#1f2937' },
                    horzLines: { color: '#1f2937' }
                },
                width: chartContainerRef.current.clientWidth,
                height: 400,
                timeScale: {
                    timeVisible: true,
                    secondsVisible: false,
                }
            });

            const candleSeries = chart.addCandlestickSeries({
                upColor: '#10b981',
                downColor: '#ef4444',
                borderUpColor: '#10b981',
                borderDownColor: '#ef4444',
                wickUpColor: '#10b981',
                wickDownColor: '#ef4444',
            });

            // Secondary Series for Equity Curve (Overlay)
            // Note: Ideally equity should be on a separate pane or axis, but for simplicity overlaying with scale margins
            // Or we can assume this chart is just Price for now.

            chartRef.current = chart;
            candleSeriesRef.current = candleSeries;

            const handleResize = () => {
                if (chartContainerRef.current) {
                    chart.applyOptions({ width: chartContainerRef.current.clientWidth });
                }
            };

            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
                chart.remove();
            };
        }
    }, []);

    // --- PLAYBACK ENGINE ---
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && result && result.candles && playbackIndex < result.candles.length) {
            interval = setInterval(() => {
                setPlaybackIndex((prev) => {
                    if (prev >= result.candles.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, playbackSpeed);
        }

        return () => clearInterval(interval);
    }, [isPlaying, result, playbackIndex, playbackSpeed]);

    // --- CHART UPDATE ON PLAYBACK ---
    useEffect(() => {
        if (result && candleSeriesRef.current && chartRef.current) {
            // Show candles up to current index
            const visibleCandles = result.candles.slice(0, playbackIndex + 1).map((c: any) => ({
                time: c.timestamp / 1000,
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close
            }));

            candleSeriesRef.current.setData(visibleCandles);

            // Auto scroll if playing
            if (isPlaying) {
                const lastIndex = visibleCandles.length - 1;
                // Keeping the latest candle visible
                // chartRef.current.timeScale().scrollToPosition(0, false); 
                // Using logical range is better but complex. Simpler is fitContent initially or user scrolls.
                // We can use scrollToRealTime if dates match.
            }

            // Markers for trades (Basic implementation: checking if a trade exit timestamp matches current candle)
            // Optimally we'd pre-calculate markers list
        }
    }, [playbackIndex, result]);

    // --- HELPER FOR MARKERS (Optional, expensive to calc every render) ---
    useEffect(() => {
        if (result && result.trades && candleSeriesRef.current) {
            const markers: any[] = [];
            result.trades.forEach((trade: any) => {
                // Only show markers for past trades relative to playback
                // Ideally map trade times to timestamps
                // For now, let's just show ALL markers at the end or filter by time.
                // Logic simplified for this version.
            });
            // candleSeriesRef.current.setMarkers(markers);
        }
    }, [result]);


    return (
        <div className='flex h-full gap-4'>
            {/* LEFT CONTROL PANEL */}
            <div className='w-80 bg-gray-900/80 border-r border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar backdrop-blur-sm'>

                {/* CONFIG FORM */}
                <div className='space-y-4'>
                    <div className='flex items-center gap-2 text-neon-blue mb-2'>
                        <Settings size={18} />
                        <h3 className='font-bold font-mono'>CONFIGURATION</h3>
                    </div>

                    <div className='space-y-1'>
                        <label className='text-xs text-gray-500 font-mono'>Symbol</label>
                        <select
                            value={config.symbol}
                            onChange={(e) => setConfig({ ...config, symbol: e.target.value })}
                            className='w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm text-white focus:border-neon-blue focus:outline-none'
                        >
                            <option value="BTC/USDT">BTC/USDT</option>
                            <option value="ETH/USDT">ETH/USDT</option>
                            <option value="SOL/USDT">SOL/USDT</option>
                            <option value="BNB/USDT">BNB/USDT</option>
                        </select>
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                        <div className='space-y-1'>
                            <label className='text-xs text-gray-500 font-mono'>Timeframe</label>
                            <select
                                value={config.timeframe}
                                onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
                                className='w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm text-white focus:border-neon-blue focus:outline-none'
                            >
                                <option value="1m">1m</option>
                                <option value="5m">5m</option>
                                <option value="15m">15m</option>
                                <option value="1h">1h</option>
                                <option value="4h">4h</option>
                            </select>
                        </div>
                        <div className='space-y-1'>
                            <label className='text-xs text-gray-500 font-mono'>Initial Balance</label>
                            <input
                                type="number"
                                value={config.balance}
                                onChange={(e) => setConfig({ ...config, balance: parseFloat(e.target.value) })}
                                className='w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm text-white focus:border-neon-blue focus:outline-none'
                            />
                        </div>
                    </div>

                    <div className='space-y-1'>
                        <label className='text-xs text-gray-500 font-mono'>Strategy Mode</label>
                        <select
                            value={config.strategy}
                            onChange={(e) => setConfig({ ...config, strategy: e.target.value })}
                            className='w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm text-yellow-500 font-bold focus:border-yellow-500 focus:outline-none'
                        >
                            <option value="Conservative">Conservative (Safe)</option>
                            <option value="Balanced">Balanced (Medium)</option>
                            <option value="Aggressive">Aggressive (Risky)</option>
                            <option value="Scalper Pro">Scalper Pro (Fast)</option>
                            <option value="Trend Surfer">Trend Surfer (Swing)</option>
                        </select>
                    </div>

                    {/* ADVANCED SETTINGS TOGGLE (ALWAYS VISIBLE FOR NOW) */}
                    <div className='p-3 bg-gray-950 rounded border border-gray-800 space-y-3'>
                        <div className='flex items-center gap-2 text-xs font-bold text-gray-400'>
                            <Filter size={12} /> REALITY CONSTRAINTS
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                            <div className='space-y-1'>
                                <label className='text-[10px] text-gray-600 font-mono'>Taker Fee (%)</label>
                                <input
                                    type="number" step="0.01"
                                    value={config.fee}
                                    onChange={(e) => setConfig({ ...config, fee: parseFloat(e.target.value) })}
                                    className='w-full bg-black/50 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none'
                                />
                            </div>
                            <div className='space-y-1'>
                                <label className='text-[10px] text-gray-600 font-mono'>Slippage (%)</label>
                                <input
                                    type="number" step="0.01"
                                    value={config.slippage}
                                    onChange={(e) => setConfig({ ...config, slippage: parseFloat(e.target.value) })}
                                    className='w-full bg-black/50 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none'
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={runSimulation}
                        disabled={loading}
                        className='w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {loading ? (
                            <span className='animate-pulse'>INITIALIZING...</span>
                        ) : (
                            <>
                                <Zap size={18} fill="currentColor" /> RUN SIMULATION
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* RIGHT DISPLAY PANEL */}
            <div className='flex-1 flex flex-col gap-4 overflow-hidden p-6 pl-0'>

                {/* METRICS ROW */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0'>
                    <MetricCard
                        label="Total Gain"
                        value={result ? `${result.metrics.net_profit > 0 ? '+' : ''}${result.metrics.net_profit}$` : '---'}
                        subValue={result ? `${((result.metrics.net_profit / config.balance) * 100).toFixed(2)}% ROI` : 'waiting for results...'}
                        icon={<DollarSign size={20} />}
                        color={result?.metrics?.net_profit >= 0 ? 'green' : 'red'}
                    />
                    <MetricCard
                        label="Win Rate"
                        value={result ? `${result.metrics.win_rate}%` : '---'}
                        subValue={result ? `${result.metrics.total_trades} Trades Executed` : undefined}
                        icon={<PieChart size={20} />}
                        color="blue"
                    />
                    <MetricCard
                        label="Max Drawdown"
                        value={result ? `${result.metrics.max_drawdown}%` : '---'}
                        icon={<TrendingUp size={20} className="rotate-180" />}
                        color="orange"
                    />
                    <MetricCard
                        label="Sharpe Ratio"
                        value={result ? result.metrics.sharpe_ratio : '---'}
                        icon={<Activity size={20} />}
                        color="purple"
                    />
                </div>

                {/* VISUAL REPLAY CHART */}
                <div className='flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col relative shadow-2xl'>
                    <div className='p-3 border-b border-gray-800 flex justify-between items-center bg-gray-950/50'>
                        <div className='flex items-center gap-2 text-xs font-mono font-bold text-gray-400'>
                            <BarChart size={14} /> VISUAL REPLAY DECK
                        </div>

                        {/* PLAYBACK CONTROLS */}
                        <div className='flex items-center gap-2'>
                            <select
                                value={playbackSpeed}
                                onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
                                className='bg-gray-800 text-[10px] text-white rounded px-2 py-1 border border-gray-700 outline-none'
                            >
                                <option value="500">0.5x</option>
                                <option value="100">1x</option>
                                <option value="50">2x</option>
                                <option value="10">10x</option>
                            </select>

                            <button
                                onClick={() => {
                                    if (!result) return;
                                    setPlaybackIndex(0);
                                    setIsPlaying(true);
                                }}
                                className='p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors'
                                title="Restart"
                            >
                                <RotateCcw size={16} />
                            </button>

                            <button
                                onClick={() => {
                                    if (!result) return;
                                    setIsPlaying(!isPlaying);
                                }}
                                className={`p-1.5 rounded transition-all ${isPlaying ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'}`}
                            >
                                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                            </button>
                        </div>
                    </div>

                    <div ref={chartContainerRef} className='flex-1 w-full relative group'>
                        {!result && !loading && (
                            <div className='absolute inset-0 flex items-center justify-center text-gray-600 font-mono text-sm z-10'>
                                Press "RUN SIMULATION" to load market data
                            </div>
                        )}
                        {loading && (
                            <div className='absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-sm'>
                                <div className='flex flex-col items-center gap-3'>
                                    <div className='w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin'></div>
                                    <span className='text-neon-blue font-mono text-xs animate-pulse'>Crunching Numbers...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* EQUITY & LOGS (Placeholder for V2) */}
                {/* We can add a second small chart here for Equity Curve if requested later */}
            </div>
        </div>
    );
};

export default SimulationLab;
