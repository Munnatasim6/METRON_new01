import React, { useState } from 'react';
import { X, Save, Key, ShieldAlert } from 'lucide-react';
import { UserSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [apiSecret, setApiSecret] = useState(settings.apiSecret);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ apiKey, apiSecret });
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm'>
      <div className='bg-gray-900 border border-gray-700 w-full max-w-md rounded-lg shadow-2xl p-6 relative'>
        <button onClick={onClose} className='absolute top-4 right-4 text-gray-400 hover:text-white'>
          <X size={20} />
        </button>

        <h2 className='text-xl font-bold mb-6 flex items-center gap-2 text-neon-blue'>
          <Key size={20} />
          API Configuration
        </h2>

        <div className='space-y-4'>
          <div>
            <label className='block text-xs font-mono text-gray-400 mb-1'>EXCHANGE API KEY</label>
            <input
              type='text'
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className='w-full bg-gray-950 border border-gray-800 text-white px-3 py-2 rounded focus:border-neon-blue focus:outline-none font-mono text-sm'
              placeholder='Enter your API Key'
            />
          </div>
          <div>
            <label className='block text-xs font-mono text-gray-400 mb-1'>API SECRET</label>
            <input
              type='password'
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className='w-full bg-gray-950 border border-gray-800 text-white px-3 py-2 rounded focus:border-neon-blue focus:outline-none font-mono text-sm'
              placeholder='••••••••••••••••••••'
            />
          </div>

          <div className='bg-red-500/10 border border-red-500/30 p-3 rounded flex items-start gap-3 mt-4'>
            <ShieldAlert size={20} className='text-red-500 mt-0.5' />
            <p className='text-xs text-red-200'>
              Security Warning: Keys are stored locally in your browser's LocalStorage. Ensure this
              machine is secure.
            </p>
          </div>
        </div>

        <div className='mt-8 flex justify-end'>
          <button
            onClick={handleSave}
            className='bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue border border-neon-blue/50 px-6 py-2 rounded flex items-center gap-2 transition-colors font-bold text-sm'
          >
            <Save size={16} />
            SAVE CREDENTIALS
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
