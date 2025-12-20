import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      host: true, // এটি অত্যন্ত জরুরি ডকারের জন্য
      port: 5173,
      watch: {
        usePolling: true, // উইন্ডোজ এ ফাইল চেঞ্জ ডিটেকশনের জন্য জরুরি
      },
      proxy: {
        '/api': {
          target: 'http://backend:8000', // ডকার নেটওয়ার্কের নাম ব্যবহার করা হয়েছে
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'Metron HFT',
          short_name: 'Metron',
          description: 'Advanced High Frequency Trading Dashboard',
          theme_color: '#030712',
          icons: [
            {
              src: 'icon-192.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
            },
            {
              src: 'icon-512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
            },
          ],
        },
      }),
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
