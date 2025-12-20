import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/common/PageTransition';
import { useAppStore } from '../store/useAppStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { SystemStatus } from '../types';
import { playSound } from '../services/soundService';
import { socketService } from '../services/api/socketService';

const MainLayout: React.FC = () => {
  const location = useLocation();
  // Store State for Global Effects
  const { status, soundEnabled, addLog, updateMetrics } = useAppStore();
  const { riskConfig } = useSettingsStore();

  // Simulation Loop (Global)
  // WebSocket Connection & Live Data
  useEffect(() => {
    // ১. কানেকশন শুরু
    socketService.connect();

    // ২. লাইভ ডেটা রিসিভ
    socketService.subscribe((marketData) => {
      // Zustand স্টোর আপডেট (Price & Ping)
      updateMetrics({
        apiWeight: 100,
        buyPressure: Math.random() * 100, // আপাতত র‍্যান্ডম, পরে লজিক বসাব
        ping: Math.floor(Math.random() * 15) + 5,
      });

      // লগ প্যানেলে লাইভ প্রাইস দেখানো (Test এর জন্য)
      if (Math.random() > 0.9) {
        addLog('INFO', `BTC Live: $${marketData.price}`);
      }
    });
  }, []);

  // Global Keydown (Kill Switch)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'Escape') {
        if (status !== SystemStatus.STOPPED) {
          useAppStore.getState().setStatus(SystemStatus.STOPPED);
          addLog('ALERT', 'EMERGENCY KILL SWITCH ACTIVATED');
          if (soundEnabled) playSound('alert');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, soundEnabled]);

  return (
    <div className='flex h-screen w-screen overflow-hidden bg-gray-950 text-gray-300 font-sans selection:bg-neon-blue selection:text-black'>
      <Sidebar />

      <main className='flex-1 flex flex-col min-w-0'>
        <Header />

        {/* --- DYNAMIC CONTENT AREA --- */}
        <div className='flex-1 p-6 overflow-auto'>
          <ErrorBoundary>
            <AnimatePresence mode='wait'>
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
