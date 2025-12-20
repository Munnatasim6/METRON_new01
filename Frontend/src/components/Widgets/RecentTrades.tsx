// Frontend/src/components/Widgets/RecentTrades.tsx
import React from 'react';

interface Trade {
    id: number;
    price: number;
    amount: number;
    side: 'buy' | 'sell';
    time: string;
}

interface Props {
    data: Trade[];
}

const RecentTrades: React.FC<Props> = ({ data }) => {
    // ডাটা না থাকলে লোডিং দেখাবে
    if (!data || data.length === 0) {
        return <div style={{ color: '#787b86', padding: '10px', fontSize: '12px' }}>Waiting for trades...</div>;
    }

    return (
        <div style={{ background: '#1e222d', padding: '10px', borderRadius: '8px', height: '100%', border: '1px solid #2a2e39', overflow: 'hidden' }}>
            <h4 style={{ color: '#d1d4dc', fontSize: '12px', margin: '0 0 8px 0' }}>⚡ Recent Trades</h4>

            {/* হেডার */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '10px', color: '#5d606b', marginBottom: '5px' }}>
                <span>Price</span>
                <span style={{ textAlign: 'center' }}>Amount</span>
                <span style={{ textAlign: 'right' }}>Time</span>
            </div>

            {/* ট্রেড লিস্ট */}
            <div style={{ overflowY: 'auto', height: 'calc(100% - 30px)', scrollbarWidth: 'none' }}>
                {data.map((trade) => (
                    <div key={trade.id} style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                        fontSize: '11px', marginBottom: '3px',
                        animation: 'fadeIn 0.2s ease-in'
                    }}>
                        <span style={{ color: trade.side === 'buy' ? '#00c853' : '#ff3d00', fontWeight: 'bold' }}>
                            {trade.price}
                        </span>
                        <span style={{ textAlign: 'center', color: '#d1d4dc' }}>{trade.amount}</span>
                        <span style={{ textAlign: 'right', color: '#787b86' }}>{trade.time}</span>
                    </div>
                ))}
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};

export default RecentTrades;
