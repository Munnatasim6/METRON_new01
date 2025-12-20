
import React, { useState } from 'react';

// ইন্টারফেস ডিফাইন করা হলো টাইপ সেফটির জন্য
interface SentimentData {
    verdict: string;
    color: string;
    summary: { buy: number; sell: number; neutral: number };
    details: { name: string; signal: string }[];
}

const SentimentWidget = ({ data }: { data: SentimentData }) => {
    const [showDetails, setShowDetails] = useState(false);

    // ডিফল্ট ডাটা হ্যান্ডলিং
    const safeData = data || {
        verdict: "ANALYZING...",
        color: "#787b86",
        summary: { buy: 0, sell: 0, neutral: 0 },
        details: []
    };

    return (
        <div style={{ background: '#1e222d', borderRadius: '8px', marginBottom: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', border: '1px solid #2a2e39' }}>

            {/* মেইন সামারি সেকশন */}
            <div
                onClick={() => setShowDetails(!showDetails)}
                style={{ padding: '15px', textAlign: 'center', cursor: 'pointer', borderBottom: showDetails ? '1px solid #2a2e39' : 'none' }}
            >
                <h4 style={{ color: '#d1d4dc', fontSize: '11px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Top 20 Indicators Consensus
                </h4>

                {/* ভারডিক্ট টেক্সট */}
                <div style={{ color: safeData.color, fontSize: '24px', fontWeight: '900', textShadow: `0 0 15px ${safeData.color}40` }}>
                    {safeData.verdict}
                </div>

                {/* ভোটিং বার গ্রাফ */}
                <div style={{ display: 'flex', height: '6px', width: '100%', marginTop: '10px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(safeData.summary.buy / 20) * 100}%`, background: '#00c853' }}></div>
                    <div style={{ width: `${(safeData.summary.neutral / 20) * 100}%`, background: '#ffb300' }}></div>
                    <div style={{ width: `${(safeData.summary.sell / 20) * 100}%`, background: '#ff3d00' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '5px', color: '#9db2bd' }}>
                    <span>Buy: {safeData.summary.buy}</span>
                    <span>Neutral: {safeData.summary.neutral}</span>
                    <span>Sell: {safeData.summary.sell}</span>
                </div>

                <div style={{ fontSize: '10px', color: '#5d606b', marginTop: '8px' }}>
                    {showDetails ? "▲ Hide 20 Indicators" : "▼ Show 20 Indicators"}
                </div>
            </div>

            {/* বিস্তারিত লিস্ট (টগল) */}
            {showDetails && (
                <div style={{ padding: '10px', background: '#131722', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <tbody>
                            {safeData.details.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #2a2e39' }}>
                                    <td style={{ color: '#9db2bd', padding: '6px 4px' }}>{item.name}</td>
                                    <td style={{
                                        textAlign: 'right', padding: '6px 4px', fontWeight: 'bold',
                                        color: item.signal === 'BUY' ? '#00c853' : item.signal === 'SELL' ? '#ff3d00' : '#ffb300'
                                    }}>
                                        {item.signal}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SentimentWidget;
