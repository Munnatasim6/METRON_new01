import React from 'react';

interface LogoProps {
  className?: string;
  collapsed?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', collapsed = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* --- LOGO ICON (Circuit Graph M) --- */}
      <div className='relative flex items-center justify-center w-12 h-12 bg-gray-900 rounded-lg border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)] group-hover:scale-105 transition-transform duration-300 overflow-hidden shrink-0'>
        {/* Glass reflection effect */}
        <div className='absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30 z-20'></div>

        {/* Circuit Background Grid */}
        <div
          className='absolute inset-0 opacity-20 z-0'
          style={{
            backgroundImage:
              'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)',
            backgroundSize: '4px 4px',
          }}
        ></div>

        {/* The 'M' Circuit Shape */}
        <svg
          width='32'
          height='32'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='relative z-10 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]'
        >
          {/* Outer Glow Line */}
          <path
            d='M2 17L7 8L12 14L20 4'
            stroke='#22c55e'
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='opacity-50 blur-[2px]'
          />

          {/* Inner Core Line (White/Green) */}
          <path
            d='M2 17L7 8L12 14L20 4'
            stroke='#ffffff'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />

          {/* Parallel Circuit Line for 'M' effect */}
          <path
            d='M6 19L10 11'
            stroke='#4ade80'
            strokeWidth='1'
            strokeLinecap='round'
            className='opacity-80'
          />
          <path
            d='M14 16L18 8'
            stroke='#4ade80'
            strokeWidth='1'
            strokeLinecap='round'
            className='opacity-80'
          />

          {/* Arrow Head */}
          <path
            d='M16 4H20V8'
            stroke='#ffffff'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />

          {/* Circuit Nodes/Dots */}
          <circle cx='2' cy='17' r='1.5' fill='#22c55e' stroke='#000' strokeWidth='0.5' />
          <circle cx='7' cy='8' r='1.5' fill='#22c55e' stroke='#000' strokeWidth='0.5' />
          <circle cx='12' cy='14' r='1.5' fill='#22c55e' stroke='#000' strokeWidth='0.5' />
          <circle cx='20' cy='4' r='1' fill='#fff' className='animate-pulse' />
        </svg>
      </div>

      {/* --- LOGO TEXT --- */}
      {!collapsed && (
        <div className='flex flex-col justify-center h-10'>
          <span className='font-black text-2xl tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-200 to-cyan-400 font-mono filter drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]'>
            METRON
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
