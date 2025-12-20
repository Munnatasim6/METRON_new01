import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';

interface PlaceholderPanelProps {
  moduleId: string;
}

const PlaceholderPanel: React.FC<PlaceholderPanelProps> = ({ moduleId }) => {
  return (
    <div className='h-full w-full flex flex-col items-center justify-center p-8 text-center space-y-6 animate-fade-in'>
      <div className='p-6 bg-gray-900 rounded-full border-2 border-gray-800 shadow-[0_0_30px_rgba(55,65,81,0.2)]'>
        <Construction size={64} className='text-gray-600' />
      </div>

      <div className='space-y-2'>
        <h2 className='text-3xl font-bold text-white font-mono uppercase tracking-wider'>
          MODULE: {moduleId.replace('_', ' ')}
        </h2>
        <p className='text-gray-500 max-w-md mx-auto'>
          This advanced module is currently initialized in the navigation registry but the UI
          component is under development.
        </p>
      </div>

      <div className='p-4 bg-gray-900/50 border border-gray-800 rounded-lg text-left max-w-sm w-full font-mono text-xs text-gray-400'>
        <div className='flex justify-between border-b border-gray-800 pb-2 mb-2'>
          <span>Status</span>
          <span className='text-yellow-500'>PENDING_IMPLEMENTATION</span>
        </div>
        <div className='flex justify-between'>
          <span>Registry ID</span>
          <span className='text-white'>{moduleId}</span>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPanel;
