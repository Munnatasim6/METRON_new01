import React from 'react';

interface ArbitrageData {
    exchange: string;
    price: number;
    logo?: string;
}

interface Props {
    data: ArbitrageData[] | null;
}

const ArbitrageMonitor: React.FC<Props> = ({ data }) => {
    // ডাটা না থাকলে লোডিং দেখাবে
    if (!data || data.length === 0) {
        return (
            <div style={{ background: '#1e222d', padding: '15px', borderRadius: '8px', color: '#787b86', textAlign: 'center', fontSize: '12px' }}>
                Loading Arbitrage Data...
            </div>
        );
    }

    // সবচেয়ে কম দাম খুঁজে বের করা (Base Price)
    const minPrice = Math.min(...data.map(p => p.price));

    return (
        <div style={{ background: '#1e222d', padding: '12px', borderRadius: '8px', border: '1px solid #2a2e39' }}>
            <h4 style={{ color: '#d1d4dc', fontSize: '12px', margin: '0 0 10px 0' }}>⚖️ Arbitrage Monitor (Live)</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    {data.map((ex, i) => {
                        const diff = ex.price - minPrice;
                        const percent = ((diff / minPrice) * 100).toFixed(2);
                        const isBest = ex.price === minPrice;
                        
                        return (
                            <tr key={i} style={{ borderBottom: '1px solid #2a2e39' }}>
                                <td style={{ padding: '6px 0', color: '#9db2bd', fontSize: '11px' }}>
                                    {ex.logo || '🌐'} {ex.exchange}
                                </td>
                                <td style={{ textAlign: 'right', color: '#fff', fontSize: '12px' }}>
                                    ${ex.price.toLocaleString()}
                                </td>
                                <td style={{ textAlign: 'right', fontSize: '10px' }}>
                                    {isBest ? 
                                        <span style={{ color: '#00c853', background: '#003300', padding: '2px 4px', borderRadius: '3px' }}>BEST BUY</span> : 
                                        <span style={{ color: '#ff3d00' }}>+{percent}%</span>
                                    }
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ArbitrageMonitor;
