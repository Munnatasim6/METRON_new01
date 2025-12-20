import React, { useState } from 'react';

const StrategySelector = () => {
    const [mode, setMode] = useState('conservative');
    const [statusMsg, setStatusMsg] = useState(''); // স্ট্যাটাস দেখানোর জন্য

    const handleModeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMode = e.target.value;
        setMode(newMode);

        // ✅ ফিক্স: ব্যাকএন্ডে ডাটা পাঠানো হচ্ছে
        try {
            const response = await fetch('http://localhost:8000/api/strategy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ strategy: newMode }),
            });

            if (response.ok) {
                console.log(`Strategy Synced: ${newMode}`);
                setStatusMsg('Synced ✅');
                setTimeout(() => setStatusMsg(''), 2000);
            }
        } catch (error) {
            console.error("Failed to update strategy:", error);
            setStatusMsg('Error ❌');
        }
    };

    const getModeColor = () => {
        if (mode === 'aggressive') return '#ff3d00';
        if (mode === 'sniper') return '#00e5ff';
        return '#00c853';
    };

    return (
        <div style={{ background: '#1e222d', padding: '15px', borderRadius: '8px', marginBottom: '15px', borderLeft: `4px solid ${getModeColor()}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ color: '#d1d4dc', margin: 0, fontSize: '14px' }}>🛡️ Quick Strategy</h4>
                <span style={{ fontSize: '10px', color: getModeColor() }}>{statusMsg}</span>
            </div>

            <select
                value={mode}
                onChange={handleModeChange}
                style={{
                    width: '100%', padding: '8px', borderRadius: '4px',
                    background: '#2a2e39', color: '#fff', border: 'none', cursor: 'pointer',
                    outline: 'none'
                }}
            >
                <option value="conservative">🛡️ Conservative (Low Risk)</option>
                <option value="aggressive">🚀 Aggressive (High Profit)</option>
                <option value="sniper">🎯 Sniper (Perfect Entry)</option>
            </select>
            <p style={{ fontSize: '11px', color: '#787b86', marginTop: '5px' }}>
                Status: {mode === 'aggressive' ? 'High Risk allowed' : mode === 'sniper' ? 'Waiting for confirmation' : 'Safety First'}
            </p>
        </div>
    );
};

export default StrategySelector;
