import React from 'react';

interface OrderFlowMeterProps {
  buyPressure: number; // 0 - 100
}

const OrderFlowMeter: React.FC<OrderFlowMeterProps> = ({ buyPressure }) => {
  const sellPressure = 100 - buyPressure;

  return (
    <div className='h-full w-full flex flex-col items-center justify-center p-4 bg-gray-900 rounded-lg border border-gray-800'>
      <h3 className='text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase'>
        Order Flow Imbalance
      </h3>
      <div className='w-full flex justify-between text-xs mb-1 font-mono'>
        <span className='text-red-500 font-bold'>{sellPressure.toFixed(1)}% SELL</span>
        <span className='text-green-500 font-bold'>{buyPressure.toFixed(1)}% BUY</span>
      </div>
      <div className='w-full h-6 bg-gray-800 rounded-full overflow-hidden relative flex'>
        <div
          className='h-full bg-red-600 transition-all duration-300 ease-out'
          style={{ width: `${sellPressure}%` }}
        />
        <div
          className='h-full bg-green-500 transition-all duration-300 ease-out'
          style={{ width: `${buyPressure}%` }}
        />
        {/* Center Marker */}
        <div className='absolute top-0 bottom-0 left-1/2 w-0.5 bg-white z-10 opacity-50'></div>
      </div>
      <div className='mt-2 text-[10px] text-gray-500 font-mono'>Market Depth Delta (L2)</div>
    </div>
  );
};

export default OrderFlowMeter;
