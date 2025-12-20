import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-center h-full w-full bg-gray-950'>
      <div className='relative w-16 h-16'>
        <div className='absolute inset-0 border-4 border-gray-800 rounded-full'></div>
        <div className='absolute inset-0 border-4 border-neon-blue rounded-full border-t-transparent animate-spin'></div>
      </div>
      <span className='mt-4 font-mono text-sm text-neon-blue animate-pulse'>
        INITIALIZING SYSTEM...
      </span>
    </div>
  );
};

export default Loading;
