import React, { useState, useEffect } from 'react';

interface BacktestResult {
    symbol: string;
    strategy: string;
    total_trades: number;
    win_rate: number;
    final_balance: number;
    net_profit: number;
    report_file?: string;
}

const StrategyCommand: React.FC = () => {
    // --- States ---
    const [currentMode, setCurrentMode] = useState("Loading...");
    const [availableModes, setAvailableModes] = useState<string[]>([]);

    // Risk Config
    const [riskPct, setRiskPct] = useState(2.0);
    const [isPaperTrading, setIsPaperTrading] = useState(true);

    // Backtest
    const [btSymbol, setBtSymbol] = useState("BTC/USDT");
    const [btTimeframe, setBtTimeframe] = useState("1h");
    const [isBacktesting, setIsBacktesting] = useState(false);
    const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

    // Logs
    const [commandLogs, setCommandLogs] = useState<string[]>(["System Initialized... Waiting for Strategy Command..."]);

    // --- Actions ---

    // 1. Initial Load
    useEffect(() => {
        fetchStrategy();
    }, []);

    const fetchStrategy = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/strategy');
            const data = await res.json();
            setCurrentMode(data.current_mode);
            setAvailableModes(data.available_modes || []);
            addLog(`Fetched Strategy: ${data.current_mode}`);
        } catch (e) {
            addLog("Error fetching strategy.");
        }
    };

    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString();
        setCommandLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 9)]);
    };

    // 2. Change Strategy Mode
    const handleModeChange = async (mode: string) => {
        try {
            addLog(`Switching to ${mode}...`);
            const res = await fetch('http://localhost:8000/api/strategy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setCurrentMode(data.current_mode);
                addLog(`✅ Strategy Switched to ${data.current_mode}`);
            }
        } catch (e) {
            addLog("❌ Failed to switch strategy.");
        }
    };

    // 3. Update Risk Config
    const saveRiskConfig = async () => {
        try {
            addLog(`Updating Risk Config: ${riskPct}% | Paper: ${isPaperTrading}`);
            const res = await fetch('http://localhost:8000/api/config/trading', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ risk_percentage: riskPct, paper_trading: isPaperTrading })
            });
            const data = await res.json();
            if (data.status === 'success') {
                addLog("✅ Configuration Saved.");
            }
        } catch (e) {
            addLog("❌ Failed to save config.");
        }
    };

    // 4. Run Backtest
    const runBacktest = async () => {
        setIsBacktesting(true);
        setBacktestResult(null);
        addLog(`🚀 Running Backtest for ${btSymbol} (${btTimeframe})...`);

        try {
            const res = await fetch('http://localhost:8000/api/backtest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exchange: 'binance',
                    symbol: btSymbol,
                    timeframe: btTimeframe,
                    limit: 1000,
                    strategy: currentMode
                })
            });
            const result = await res.json();
            setBacktestResult(result);
            addLog(`📝 Backtest Complete: Win Rate ${result.win_rate.toFixed(1)}%`);
        } catch (e) {
            addLog("❌ Backtest Failed.");
        } finally {
            setIsBacktesting(false);
        }
    };

    // 5. System Halt
    const handleHalt = async () => {
        const confirm = window.confirm("Are you sure you want to STOP the system?");
        if (!confirm) return;

        try {
            await fetch('http://localhost:8000/api/system/stop', { method: 'POST' });
            addLog("🛑 SYSTEM HALTED BY USER.");
            alert("System Stopped.");
        } catch (e) {
            addLog("❌ Failed to Halt.");
        }
    };

    // --- Styles ---
    const cardStyle = { background: '#1e222d', padding: '20px', borderRadius: '12px', marginBottom: '20px' };
    const h2Style = { color: '#d1d4dc', borderBottom: '1px solid #2a2e39', paddingBottom: '10px', marginBottom: '15px' };
    const btnStyle = (active: boolean) => ({
        padding: '10px 15px', margin: '5px', borderRadius: '6px', cursor: 'pointer',
        border: 'none', background: active ? '#2962ff' : '#2a2e39', color: '#fff', fontWeight: 'bold' as 'bold'
    });

    return (
        <div style={{ padding: '20px', color: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ color: '#2962ff', marginBottom: '30px' }}>🚀 Strategy Command Center</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

                {/* Left Column */}
                <div>
                    {/* 1. Strategy Deck */}
                    <div style={cardStyle}>
                        <h2 style={h2Style}>🎴 Strategy Deck (Current: <span style={{ color: '#00e676' }}>{currentMode}</span>)</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {availableModes.map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => handleModeChange(mode)}
                                    style={btnStyle(currentMode === mode)}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Backtest Lab */}
                    <div style={cardStyle}>
                        <h2 style={h2Style}>🧪 Rapid Backtest Lab</h2>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <input
                                value={btSymbol} onChange={(e) => setBtSymbol(e.target.value)}
                                style={{ background: '#2a2e39', border: 'none', color: '#fff', padding: '10px', borderRadius: '4px' }}
                            />
                            <select
                                value={btTimeframe} onChange={(e) => setBtTimeframe(e.target.value)}
                                style={{ background: '#2a2e39', border: 'none', color: '#fff', padding: '10px', borderRadius: '4px' }}
                            >
                                <option value="1m">1 Minute</option>
                                <option value="5m">5 Minutes</option>
                                <option value="15m">15 Minutes</option>
                                <option value="1h">1 Hour</option>
                                <option value="4h">4 Hour</option>
                            </select>
                            <button onClick={runBacktest} style={{ ...btnStyle(true), background: '#7c4dff' }}>
                                {isBacktesting ? 'Running...' : 'Run Simulation'}
                            </button>
                        </div>

                        {backtestResult && (
                            <div style={{ background: '#2a2e39', padding: '15px', borderRadius: '8px' }}>
                                <h3>📊 Result for {backtestResult.strategy} on {backtestResult.symbol}</h3>
                                <p>Total Trades: {backtestResult.total_trades}</p>
                                <p>Win Rate: <span style={{ color: backtestResult.win_rate > 50 ? '#00e676' : '#ff5252' }}>{backtestResult.win_rate.toFixed(1)}%</span></p>
                                <p>Net Profit: <span style={{ color: backtestResult.net_profit > 0 ? '#00e676' : '#ff5252' }}>${backtestResult.net_profit.toFixed(2)}</span> (Base $1000)</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    {/* 2. Risk Panel */}
                    <div style={cardStyle}>
                        <h2 style={h2Style}>💰 Risk & Capital</h2>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Risk Per Trade: {riskPct}%</label>
                            <input
                                type="range" min="1" max="10" step="0.5"
                                value={riskPct} onChange={(e) => setRiskPct(parseFloat(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Mode:</span>
                            <button
                                onClick={() => setIsPaperTrading(!isPaperTrading)}
                                style={{
                                    background: isPaperTrading ? '#ffab00' : '#ff5252',
                                    border: 'none', padding: '10px', borderRadius: '4px', color: '#000', fontWeight: 'bold', width: '150px'
                                }}
                            >
                                {isPaperTrading ? '📝 Paper Trading' : '🚨 REAL TRADING'}
                            </button>
                        </div>
                        <button onClick={saveRiskConfig} style={{ ...btnStyle(true), width: '100%' }}>Save Configuration</button>
                    </div>

                    {/* 3. Safety Guard */}
                    <div style={{ ...cardStyle, border: '1px solid #ff5252' }}>
                        <h2 style={{ ...h2Style, color: '#ff5252', borderBottomColor: '#ff5252' }}>🛡️ Safety Guard</h2>
                        <p style={{ fontSize: '12px', color: '#aaa' }}>Emergency Stop will cancel all active orders and stop the bot service.</p>
                        <button onClick={handleHalt} style={{ width: '100%', padding: '15px', background: '#d50000', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
                            🛑 HALT SYSTEM
                        </button>
                    </div>

                    {/* 5. Live Log */}
                    <div style={cardStyle}>
                        <h2 style={h2Style}>📜 Command Log</h2>
                        <div style={{ height: '200px', overflowY: 'auto', fontSize: '12px', color: '#aaa', fontFamily: 'monospace' }}>
                            {commandLogs.map((log, i) => (
                                <div key={i} style={{ borderBottom: '1px solid #333', padding: '4px 0' }}>{log}</div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StrategyCommand;
