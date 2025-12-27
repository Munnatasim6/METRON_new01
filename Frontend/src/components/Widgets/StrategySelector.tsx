import React, { useState } from 'react';

const StrategySelector = () => {
    const [mode, setMode] = useState('Balanced');
    const [statusMsg, setStatusMsg] = useState('');

    const handleModeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMode = e.target.value;
        setMode(newMode);
        setStatusMsg('Synced ✅');
        setTimeout(() => setStatusMsg(''), 2000);
    };

    return (
        <div style={{ background: '#1e222d', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ color: '#d1d4dc', margin: 0, fontSize: '14px' }}>🛡️ Strategy Manager</h4>
                <span style={{ fontSize: '10px', color: '#00e676' }}>{statusMsg}</span>
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
                <option value="Conservative">🛡️ Conservative</option>
                <option value="Balanced">⚖️ Balanced</option>
                <option value="Aggressive">🚀 Aggressive</option>
            </select>
        </div>
    );
};

export default StrategySelector;
