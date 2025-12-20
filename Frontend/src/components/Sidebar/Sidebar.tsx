import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../Logo';
import { APP_MODULES } from '../../constants';
import { useAppStore } from '../../store/useAppStore';
import { playSound } from '../../services/soundService';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { soundEnabled } = useAppStore();

  const handleNavigate = (path: string) => {
    navigate(path);
    if (soundEnabled) playSound('click');
  };

  const currentTabId = location.pathname.substring(1) || 'dashboard';

  return (
    <aside className='w-20 lg:w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between shrink-0'>
      <div>
        {/* BRAND HEADER */}
        <div
          onClick={() => handleNavigate('/')}
          className='h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors group'
          title='Return to Dashboard'
        >
          <Logo collapsed={false} className='hidden lg:flex' />
          <Logo collapsed={true} className='flex lg:hidden' />
        </div>

        <nav className='mt-4 space-y-2 px-2 overflow-y-auto max-h-[calc(100vh-180px)] custom-scrollbar'>
          {APP_MODULES.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id === 'dashboard' ? '/' : `/${item.id}`)}
              className={`
                                w-full flex items-center p-3 rounded-lg transition-all duration-200 group
                                ${
                                  currentTabId === item.id ||
                                  (item.id === 'dashboard' && location.pathname === '/')
                                    ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/50 shadow-[0_0_15px_rgba(0,243,255,0.1)]'
                                    : 'hover:bg-gray-800 text-gray-500 hover:text-white'
                                }
                            `}
            >
              <item.icon size={20} className={currentTabId === item.id ? 'animate-pulse' : ''} />
              <span className='hidden lg:block ml-3 font-mono text-sm font-bold'>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className='p-4 border-t border-gray-800'>
        <div className='hidden lg:flex flex-col space-y-2 text-xs text-gray-600 font-mono'>
          <div className='flex justify-between'>
            <span>Ver:</span>
            <span>v2.2.0-Refactor</span>
          </div>
          <div className='flex justify-between'>
            <span>Build:</span>
            <span>Stable</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
