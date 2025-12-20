import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'bn' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className='flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-xs font-mono text-neon-blue'
      title='Switch Language'
    >
      <Languages size={14} />
      {i18n.language === 'en' ? 'EN' : 'BN'}
    </button>
  );
};

export default LanguageSwitcher;
