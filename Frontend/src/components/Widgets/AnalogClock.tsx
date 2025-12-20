import React, { useEffect, useState } from 'react';

interface AnalogClockProps {
  size?: number;
}

const AnalogClock: React.FC<AnalogClockProps> = ({ size = 40 }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondDeg = (seconds / 60) * 360;
  const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;

  return (
    <div
      className='relative rounded-full bg-gray-900 border-2 border-gray-700 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] flex items-center justify-center'
      style={{ width: size, height: size }}
    >
      {/* Clock Face Markers (12, 3, 6, 9) */}
      {[0, 90, 180, 270].map((deg) => (
        <div
          key={deg}
          className='absolute bg-gray-500'
          style={{
            width: size > 30 ? 2 : 1,
            height: size > 30 ? 4 : 2,
            top: 2,
            left: '50%',
            transform: `translateX(-50%) rotate(${deg}deg)`,
            transformOrigin: `50% ${size / 2 - 2}px`,
          }}
        />
      ))}

      {/* Hour Hand */}
      <div
        className='absolute bg-gray-300 rounded-full origin-bottom'
        style={{
          width: size > 30 ? 2 : 1.5,
          height: '25%',
          bottom: '50%',
          left: '50%',
          transform: `translateX(-50%) rotate(${hourDeg}deg)`,
        }}
      />

      {/* Minute Hand */}
      <div
        className='absolute bg-gray-400 rounded-full origin-bottom'
        style={{
          width: 1.5,
          height: '35%',
          bottom: '50%',
          left: '50%',
          transform: `translateX(-50%) rotate(${minuteDeg}deg)`,
        }}
      />

      {/* Second Hand */}
      <div
        className='absolute bg-red-500 rounded-full origin-bottom'
        style={{
          width: 1,
          height: '40%',
          bottom: '50%',
          left: '50%',
          transform: `translateX(-50%) rotate(${secondDeg}deg)`,
        }}
      />

      {/* Center Dot */}
      <div className='absolute w-1.5 h-1.5 bg-gray-200 rounded-full z-10 border border-gray-900' />
    </div>
  );
};

export default AnalogClock;
