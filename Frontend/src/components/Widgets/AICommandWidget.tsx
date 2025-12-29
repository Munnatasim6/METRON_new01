import React from 'react';

interface AIProps {
    sentiment: number;  // -100 থেকে +100
    confidence: number; // 0 থেকে 100
    signal: string;     // BUY, SELL, NEUTRAL
    isActive: boolean;  // মোড অন আছে কিনা
}

const AICommandWidget: React.FC<AIProps> = ({ sentiment, confidence, signal, isActive }) => {
    if (!isActive) return null; // হাইব্রিড মোড বন্ধ থাকলে এই উইজেট অদৃশ্য থাকবে

    // ডায়নামিক কালার লজিক
    const sentimentColor = sentiment > 20 ? 'text-green-400' : sentiment < -20 ? 'text-red-400' : 'text-gray-400';
    const signalBadgeColor = signal === 'BUY' ? 'bg-green-900 text-green-300 border-green-700' :
        signal === 'SELL' ? 'bg-red-900 text-red-300 border-red-700' :
            'bg-gray-700 text-gray-300 border-gray-600';

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 w-full shadow-lg animate-fade-in relative overflow-hidden">
            {/* ব্যাকগ্রাউন্ড ইফেক্ট */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 opacity-5 rounded-full blur-2xl"></div>

            {/* হেডার */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🧠</span>
                    <h3 className="text-blue-100 font-bold text-lg tracking-wide">Hybrid Neural Core</h3>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-bold border ${signalBadgeColor} transition-all`}>
                    SIGNAL: {signal}
                </span>
            </div>

            {/* ১. ভোটিং স্কোর মিটার (Sentiment) */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase font-semibold">
                    <span>Bearish Council</span>
                    <span>Voting Power</span>
                    <span>Bullish Council</span>
                </div>

                <div className="relative w-full h-3 bg-gray-900 rounded-full overflow-hidden shadow-inner border border-gray-700">
                    {/* সেন্ট্রাল লাইন */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white opacity-20 z-10"></div>

                    {/* ডায়নামিক বার */}
                    <div
                        className={`h-full transition-all duration-700 ease-out ${sentiment >= 0 ? 'bg-gradient-to-r from-green-600 to-green-400' : 'bg-gradient-to-l from-red-600 to-red-400'}`}
                        style={{
                            width: `${Math.abs(sentiment)}%`,
                            marginLeft: sentiment >= 0 ? '50%' : `${50 - Math.abs(sentiment)}%`
                        }}
                    ></div>
                </div>

                <div className={`text-center mt-2 font-mono font-bold text-lg ${sentimentColor}`}>
                    {sentiment > 0 ? '+' : ''}{sentiment.toFixed(1)}
                </div>
            </div>

            {/* ২. এআই কনফিডেন্স বার (Confidence) */}
            <div>
                <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase font-semibold">
                    <span>AI Certainty</span>
                    <span className="text-blue-400">{confidence.toFixed(1)}%</span>
                </div>

                <div className="w-full bg-gray-900 h-4 rounded-full overflow-hidden border border-gray-700 shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 transition-all duration-1000 ease-in-out relative"
                        style={{ width: `${confidence}%` }}
                    >
                        {/* শাইনিং ইফেক্ট */}
                        <div className="absolute top-0 right-0 bottom-0 w-full bg-white opacity-10 animate-pulse"></div>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-center">
                <p className="text-[10px] text-gray-600">
                    Scanning 70+ Indicators • Ensemble Random Forest Model v1.0
                </p>
            </div>
        </div>
    );
};

export default AICommandWidget;
