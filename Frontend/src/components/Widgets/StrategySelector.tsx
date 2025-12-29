import React from 'react';

// স্ট্র্যাটেজি লিস্ট: ভবিষ্যতে এখানে আরও স্ট্র্যাটেজি যোগ করা যাবে
const strategies = [
    { id: 'Scalping', name: 'Scalping (RSI + BB)' },
    { id: 'Momentum', name: 'Momentum (MACD + EMA)' },
    { id: 'Conservative', name: 'Conservative' },
    { id: 'Balanced', name: 'Balanced' },
    { id: 'Aggressive', name: 'Aggressive' },
    // 👇 এই নতুন হাইব্রিড অপশনটি যোগ করা হলো
    { id: 'Hybrid AI (Ensemble)', name: '🤖 Hybrid AI (Voting + Neural Net)' },
];

interface Props {
    current: string;
    onChange: (id: string) => void;
}

const StrategySelector: React.FC<Props> = ({ current, onChange }) => {
    return (
        <select
            value={current}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
        >
            {strategies.map((s) => (
                <option key={s.id} value={s.id}>
                    {s.name}
                </option>
            ))}
        </select>
    );
};

export default StrategySelector;
