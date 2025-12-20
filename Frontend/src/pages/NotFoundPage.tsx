import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import SEO from '../components/common/SEO';

const NotFoundPage: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-center h-full w-full bg-gray-950 text-gray-300'>
      <SEO title='404 Not Found' description='Page not found' />
      <div className='bg-red-500/10 p-6 rounded-full mb-6'>
        <AlertTriangle size={64} className='text-red-500' />
      </div>

      <h1 className='text-4xl font-bold text-white mb-2 tracking-tighter'>404</h1>
      <h2 className='text-xl font-mono text-gray-400 mb-8 border-b border-gray-800 pb-4'>
        PAGE NOT FOUND
      </h2>

      <p className='text-gray-500 max-w-md text-center mb-8'>
        The page you are looking for does not exist or has been moved. Please verify the URL or
        return to the dashboard.
      </p>

      <Link
        to='/'
        className='flex items-center gap-2 px-6 py-3 bg-neon-blue/10 text-neon-blue border border-neon-blue/50 hover:bg-neon-blue hover:text-black rounded-lg transition-all duration-300 font-bold tracking-wide'
      >
        <Home size={18} />
        RETURN HOME
      </Link>

      <div className='mt-12 flex flex-col items-center gap-2 text-xs font-mono text-gray-700'>
        <span>ERROR_CODE: PAGE_MISSING</span>
        <span>SYSTEM_STATUS: ONLINE</span>
      </div>
    </div>
  );
};

export default NotFoundPage;
