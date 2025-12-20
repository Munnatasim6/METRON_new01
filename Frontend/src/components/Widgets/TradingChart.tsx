import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, IChartApi, ISeriesApi } from 'lightweight-charts';

interface TradingChartProps {
    symbol: string; // e.g., "BTC/USDT"
}

interface MarketStats {
    high: string;
    low: string;
    vol: string;
    change: string;
    changeRaw: number;
}

export const TradingChart: React.FC<TradingChartProps> = ({ symbol = 'BTC/USDT' }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    // Use refs to store chart instances to avoid re-creating them on every render or effect trigger
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    const [stats, setStats] = useState<MarketStats>({
        high: '--',
        low: '--',
        vol: '--',
        change: '--%',
        changeRaw: 0
    });

    // Convert "BTC/USDT" -> "btcusdt" for Binance WebSocket
    const formattedSymbol = symbol.replace('/', '').toLowerCase();

    useEffect(() => {
        // Return if container ref is not available
        if (!chartContainerRef.current) return;

        // 1. Chart Creation
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: {
                background: { type: ColorType.Solid, color: '#131722' }, // Dark Theme
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: '#2a2e39' },
                horzLines: { color: '#2a2e39' },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: '#485c7b',
            },
            timeScale: {
                borderColor: '#485c7b',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const candleSeries = chart.addCandlestickSeries({
            upColor: '#00c853',
            downColor: '#ff3d00',
            borderVisible: false,   // Optimized for cleaner look as per suggestion
            wickUpColor: '#00c853',
            wickDownColor: '#ff3d00',
        });

        // Store references
        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;

        // 2. Load Historical Data
        const loadHistorical = async () => {
            try {
                // Binance API for historical klines
                const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${formattedSymbol.toUpperCase()}&interval=1m&limit=100`);
                const data = await res.json();

                // Map to lightweight-charts format
                const history = data.map((d: any) => ({
                    time: d[0] / 1000,
                    open: parseFloat(d[1]),
                    high: parseFloat(d[2]),
                    low: parseFloat(d[3]),
                    close: parseFloat(d[4]),
                }));

                candleSeries.setData(history);
            } catch (err) {
                console.error('Failed to load historical data', err);
            }
        };
        loadHistorical();

        // 3. WebSocket Connection
        // Stream format: <symbol>@ticker / <symbol>@kline_<interval>
        const wsUrl = `wss://stream.binance.com:9443/ws/${formattedSymbol}@ticker/${formattedSymbol}@kline_1m`;
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.e === '24hrTicker') {
                // Ticker update (High, Low, Vol, Change)
                setStats({
                    high: parseFloat(data.h).toFixed(2),
                    low: parseFloat(data.l).toFixed(2),
                    vol: parseFloat(data.v).toFixed(2),
                    change: parseFloat(data.P).toFixed(2),
                    changeRaw: parseFloat(data.P)
                });
            } else if (data.e === 'kline') {
                // Kline/Candle update
                const k = data.k;
                const candleData = {
                    time: k.t / 1000,
                    open: parseFloat(k.o),
                    high: parseFloat(k.h),
                    low: parseFloat(k.l),
                    close: parseFloat(k.c),
                };
                candleSeries.update(candleData);
            }
        };

        // 4. Responsive Handlers
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        // 5. Cleanup Function (Critical for React/React-Router)
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove(); // Destroys the chart instance
            ws.close();     // Closes the WebSocket connection
        };

    }, [formattedSymbol]); // Re-run effect when symbol changes

    return (
        <div className="flex flex-col w-full">
            {/* Market Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#1e222d] p-4 rounded-lg mb-4 shadow-sm">
                <div className="flex flex-col items-center border-r border-[#2a2e39] last:border-r-0">
                    <span className="text-[10px] md:text-xs text-[#787b86] mb-1">24h High</span>
                    <span className="text-sm md:text-base font-bold text-[#d1d4dc]">${stats.high}</span>
                </div>
                <div className="flex flex-col items-center border-r border-[#2a2e39] last:border-r-0">
                    <span className="text-[10px] md:text-xs text-[#787b86] mb-1">24h Low</span>
                    <span className="text-sm md:text-base font-bold text-[#d1d4dc]">${stats.low}</span>
                </div>
                <div className="flex flex-col items-center border-r border-[#2a2e39] last:border-r-0">
                    <span className="text-[10px] md:text-xs text-[#787b86] mb-1">24h Vol</span>
                    <span className="text-sm md:text-base font-bold text-[#d1d4dc]">{stats.vol}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] md:text-xs text-[#787b86] mb-1">24h Change</span>
                    <span className={`text-sm md:text-base font-bold ${stats.changeRaw > 0 ? 'text-[#00c853]' : stats.changeRaw < 0 ? 'text-[#ff3d00]' : 'text-[#d1d4dc]'}`}>
                        {stats.change}%
                    </span>
                </div>
            </div>

            {/* Chart Container */}
            <div
                ref={chartContainerRef}
                className="w-full h-[400px] border border-[#2a2e39] rounded-lg overflow-hidden relative"
                style={{ position: 'relative', width: '100%' }}
            />
        </div>
    );
};

export default TradingChart;
