import React from 'react';

// ডামি ডাটা (পরে সকেটের সাথে রিপ্লেস করবেন)
const asks = [
    { price: 98150, amount: 0.5 }, { price: 98140, amount: 1.2 }, { price: 98130, amount: 0.8 },
    { price: 98120, amount: 2.5 }, { price: 98110, amount: 0.1 }, { price: 98100, amount: 1.5 },
];
const bids = [
    { price: 98090, amount: 1.1 }, { price: 98080, amount: 0.4 }, { price: 98070, amount: 3.0 },
    { price: 98060, amount: 0.9 }, { price: 98050, amount: 1.2 }, { price: 98040, amount: 0.5 },
];

const OrderBook = () => {
    return (
        <div style={{ background: '#1e222d', padding: '10px', borderRadius: '8px', height: '100%' }}>
            <h4 style={{ color: '#d1d4dc', fontSize: '12px', margin: '0 0 10px 0' }}>📖 Order Book (BTC/USDT)</h4>

            {/* Asks (Sellers) - লাল */}
            <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
                {asks.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                        <span style={{ color: '#ff3d00' }}>{item.price.toFixed(2)}</span>
                        <span style={{ color: '#787b86' }}>{item.amount.toFixed(3)}</span>
                    </div>
                ))}
            </div>

            <div style={{ borderTop: '1px solid #2a2e39', borderBottom: '1px solid #2a2e39', margin: '5px 0', padding: '5px 0', textAlign: 'center', color: '#d1d4dc', fontSize: '14px', fontWeight: 'bold' }}>
                98,100.00
            </div>

            {/* Bids (Buyers) - সবুজ */}
            <div>
                {bids.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                        <span style={{ color: '#00c853' }}>{item.price.toFixed(2)}</span>
                        <span style={{ color: '#787b86' }}>{item.amount.toFixed(3)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderBook;
