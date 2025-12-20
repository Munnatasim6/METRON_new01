import React, { useState, useEffect, useMemo } from 'react';

interface SmartCryptoSelectorProps {
    label: string;
    options: string[];
    selected: string;
    onSelect: (value: string) => void;
    storageKey: string; // ফেভারিট সেভ করার জন্য ইউনিক কি
}

const SmartCryptoSelector: React.FC<SmartCryptoSelectorProps> = ({
    label,
    options,
    selected,
    onSelect,
    storageKey
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // কম্পোনেন্ট লোড হওয়ার সময় ফেভারিট লিস্ট লোড হবে
    useEffect(() => {
        const savedFavs = localStorage.getItem(`fav_${storageKey}`);
        if (savedFavs) {
            setFavorites(JSON.parse(savedFavs));
        }
    }, [storageKey]);

    // ফেভারিট টগল ফাংশন
    const toggleFavorite = (item: string, e: React.MouseEvent) => {
        e.stopPropagation(); // যাতে ড্রপডাউন বন্ধ না হয়ে যায়
        let newFavs;
        if (favorites.includes(item)) {
            newFavs = favorites.filter(i => i !== item);
        } else {
            newFavs = [...favorites, item];
        }
        setFavorites(newFavs);
        localStorage.setItem(`fav_${storageKey}`, JSON.stringify(newFavs));
    };

    // ফিল্টারিং লজিক (Search + Favorites)
    // useMemo ব্যবহার করছি যাতে প্রতি রেন্ডারে ক্যালকুলেশন না হয় (i3 অপ্টিমাইজেশন)
    const filteredOptions = useMemo(() => {
        let result = options;

        if (showFavoritesOnly) {
            result = result.filter(opt => favorites.includes(opt));
        }

        if (searchTerm) {
            result = result.filter(opt =>
                opt.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // ফেভারিট আইটেমগুলোকে সবার উপরে রাখা
        return result.sort((a, b) => {
            const aFav = favorites.includes(a);
            const bFav = favorites.includes(b);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return 0;
        });
    }, [options, searchTerm, favorites, showFavoritesOnly]);

    return (
        <div className="flex flex-col space-y-2 relative z-50">
            <label className="text-sm font-semibold text-cyan-300">{label}</label>

            {/* সিলেক্ট বক্স (যা ক্লিক করলে লিস্ট ওপেন হবে) */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-700 text-white p-3 rounded border border-gray-600 hover:border-cyan-500 cursor-pointer flex justify-between items-center transition"
            >
                <span className="font-mono">{selected || "Select Pair..."}</span>
                <span className="text-xs text-gray-400">▼</span>
            </div>

            {/* ড্রপডাউন মেনু */}
            {isOpen && (
                <div className="absolute top-[80px] left-0 w-full bg-gray-800 border border-cyan-500/30 rounded shadow-2xl z-50 max-h-[400px] flex flex-col">

                    {/* সার্চ এবং ফিল্টার বার */}
                    <div className="p-2 border-b border-gray-700 bg-gray-800 sticky top-0 z-10 space-y-2">
                        <input
                            type="text"
                            placeholder="🔍 Search (e.g. BTC, ETH)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-cyan-500 outline-none text-sm"
                            autoFocus
                        />

                        {/* ফেভারিট ফিল্টার বাটন */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                className={`text-xs px-2 py-1 rounded border ${showFavoritesOnly ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300' : 'border-gray-600 text-gray-400'}`}
                            >
                                ★ Favorites Only
                            </button>
                            <span className="text-xs text-gray-500">{filteredOptions.length} pairs found</span>
                        </div>
                    </div>

                    {/* অপশন লিস্ট */}
                    <div className="overflow-y-auto flex-1 p-1 scrollbar-thin scrollbar-thumb-gray-600">
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">No pairs found</div>
                        ) : (
                            filteredOptions.slice(0, 100).map(option => ( // পারফরম্যান্সের জন্য প্রথম ১০০টি রেন্ডার করছি (ভার্চুয়ালাইজেশন ছাড়া)
                                <div
                                    key={option}
                                    onClick={() => {
                                        onSelect(option);
                                        setIsOpen(false);
                                        setSearchTerm(''); // সিলেক্ট করার পর সার্চ ক্লিয়ার
                                    }}
                                    className={`flex justify-between items-center p-2 hover:bg-gray-700 cursor-pointer rounded ${selected === option ? 'bg-cyan-900/30 text-cyan-400' : 'text-gray-300'}`}
                                >
                                    <span className="font-mono text-sm">{option}</span>

                                    {/* ফেভারিট স্টার */}
                                    <button
                                        onClick={(e) => toggleFavorite(option, e)}
                                        className={`text-lg focus:outline-none transition ${favorites.includes(option) ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-200'}`}
                                    >
                                        {favorites.includes(option) ? '★' : '☆'}
                                    </button>
                                </div>
                            ))
                        )}
                        {filteredOptions.length > 100 && (
                            <div className="p-2 text-center text-xs text-gray-500 italic border-t border-gray-700">
                                ...refine search to see more
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* বাইরে ক্লিক করলে বন্ধ করার জন্য একটি অদৃশ্য লেয়ার (Backdrop) */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default SmartCryptoSelector;
