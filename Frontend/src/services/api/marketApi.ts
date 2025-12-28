// Frontend/src/services/api/marketApi.ts

const API_BASE_URL = 'http://localhost:8000'; // আপনার ব্যাকএন্ড পোর্ট অনুযায়ী

export const fetchMarketAnalysis = async (timeframe: string = '1H') => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/market-status?timeframe=${timeframe}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        return result; // Returns { status, timeframe, current_phase, data: [...] }
    } catch (error) {
        console.error("Failed to fetch market analysis:", error);
        return null;
    }
};
