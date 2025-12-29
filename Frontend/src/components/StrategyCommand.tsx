import React from 'react';
import { useAppStore } from '../store/useAppStore'; // স্টোর থেকে গ্লোবাল ডাটা
import StrategySelector from './Widgets/StrategySelector'; // ধাপ ১ এর সিলেক্টর
import AICommandWidget from './Widgets/AICommandWidget';   // ধাপ ২ এর উইজেট

const StrategyCommand: React.FC = () => {
    // ১. অ্যাপের গ্লোবাল স্টেট থেকে ডাটা আনা
    const { marketData, currentStrategy, setStrategy } = useAppStore();

    // ২. সেফটি লজিক: ডাটা না থাকলে যেন ক্র্যাশ না করে (Default Values)
    const analysis = marketData?.analysis || {};
    const aiData = analysis.ai_data || { vote: 0, confidence: 0 };
    const tradeSignal = analysis.trade_signal || "NEUTRAL";

    // ৩. হাইব্রিড মোড অ্যাক্টিভ কিনা চেক করা
    const isHybridActive = currentStrategy === 'Hybrid AI (Ensemble)';

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white font-sans">

            {/* হেডার সেকশন */}
            <header className="mb-8 border-b border-gray-800 pb-4">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    🚀 Strategy Command Center
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                    Manage algorithms, monitor AI signals, and control execution logic.
                </p>
            </header>

            {/* মেইন গ্রিড লেআউট (Future Proof Grid System) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* বাম পাশ: কন্ট্রোল প্যানেল (Size: 4 columns) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* স্ট্র্যাটেজি সিলেক্টর কার্ড */}
                    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg">
                        <h2 className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-4">
                            Active Strategy Module
                        </h2>
                        <StrategySelector
                            current={currentStrategy}
                            onChange={setStrategy}
                        />
                        <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-700 text-xs text-gray-400">
                            Selected: <span className="text-blue-400 font-semibold">{currentStrategy}</span>
                        </div>
                    </div>

                    {/* স্ট্যাটাস কার্ড (Placeholder for future stats) */}
                    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg">
                        <h2 className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-3">System Health</h2>
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-400">Connection</span>
                            <span className="text-green-400">● Stable</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Latency</span>
                            <span className="text-gray-300">45ms</span>
                        </div>
                    </div>
                </div>

                {/* ডান পাশ: ভিজ্যুয়ালাইজেশন এরিয়া (Size: 8 columns) */}
                <div className="lg:col-span-8">

                    {/* AI উইজেট এরিয়া */}
                    <div className="h-full">
                        {isHybridActive ? (
                            // মোড অন থাকলে উইজেট দেখাবে
                            <AICommandWidget
                                isActive={true}
                                sentiment={aiData.vote}
                                confidence={aiData.confidence}
                                signal={tradeSignal}
                            />
                        ) : (
                            // মোড অফ থাকলে একটি সুন্দর "স্ট্যান্ডবাই" মেসেজ দেখাবে
                            <div className="h-64 flex flex-col items-center justify-center bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-700">
                                <span className="text-4xl mb-3 opacity-50">🤖</span>
                                <h3 className="text-xl font-semibold text-gray-400">Neural Engine Standby</h3>
                                <p className="text-gray-500 text-sm mt-2">
                                    Select "Hybrid AI" from the left panel to activate deep analysis.
                                </p>
                            </div>
                        )}

                        {/* ফিউচার এক্সপ্যানশন জোন: এখানে পরে চার্ট বা লগ বসানো যাবে */}
                        {isHybridActive && (
                            <div className="mt-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Live Analysis Log</h4>
                                <div className="font-mono text-xs text-green-400/80">
                                    {`> Processing 70 indicators... OK`}<br />
                                    {`> Connecting to Random Forest Model... OK`}<br />
                                    {`> Waiting for next candle...`}
                                </div>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default StrategyCommand;
