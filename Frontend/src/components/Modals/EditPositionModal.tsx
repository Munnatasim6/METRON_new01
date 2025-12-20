import React, { useState, useEffect } from 'react';
import { X, Save, Layers } from 'lucide-react';
import { Position } from '../../types';

interface EditPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position | null;
  onSave: (id: string, newSize: number) => void;
}

const EditPositionModal: React.FC<EditPositionModalProps> = ({
  isOpen,
  onClose,
  position,
  onSave,
}) => {
  const [size, setSize] = useState<number>(0);

  useEffect(() => {
    if (position) {
      setSize(position.size);
    }
  }, [position]);

  if (!isOpen || !position) return null;

  const handleSave = () => {
    onSave(position.id, size);
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm'>
      <div className='bg-gray-900 border border-gray-700 w-full max-w-sm rounded-lg shadow-2xl p-6 relative animate-fade-in-up'>
        <button onClick={onClose} className='absolute top-4 right-4 text-gray-400 hover:text-white'>
          <X size={20} />
        </button>

        <h2 className='text-lg font-bold mb-6 flex items-center gap-2 text-white'>
          <Layers size={20} className='text-neon-blue' />
          Edit Position
        </h2>

        <div className='space-y-4'>
          <div className='bg-gray-800 p-3 rounded border border-gray-700'>
            <div className='flex justify-between text-xs text-gray-400 mb-1 font-mono'>
              <span>PAIR</span>
              <span>SIDE</span>
            </div>
            <div className='flex justify-between font-bold font-mono text-white'>
              <span>{position.pair}</span>
              <span className={position.side === 'LONG' ? 'text-green-500' : 'text-red-500'}>
                {position.side}
              </span>
            </div>
          </div>

          <div>
            <label className='block text-xs font-mono text-gray-400 mb-1'>
              POSITION SIZE (UNITS)
            </label>
            <input
              type='number'
              step='0.01'
              value={size}
              onChange={(e) => setSize(parseFloat(e.target.value))}
              className='w-full bg-gray-950 border border-gray-800 text-white px-3 py-2 rounded focus:border-neon-blue focus:outline-none font-mono text-sm'
            />
          </div>
        </div>

        <div className='mt-8 flex justify-end gap-2'>
          <button
            onClick={onClose}
            className='px-4 py-2 rounded text-gray-400 hover:text-white font-mono text-sm'
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            className='bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue border border-neon-blue/50 px-6 py-2 rounded flex items-center gap-2 transition-colors font-bold text-sm'
          >
            <Save size={16} />
            SAVE POSITION
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPositionModal;
