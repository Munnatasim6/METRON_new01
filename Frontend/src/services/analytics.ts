import posthog from 'posthog-js';

const API_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_PLACEHOLDER_KEY_FOR_DEV_ONLY';
const API_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

export const initAnalytics = () => {
  if (import.meta.env.DEV) {
    console.log('Analytics initialized in DEV mode (Events logged to console)');
  }

  posthog.init(API_KEY, {
    api_host: API_HOST,
    debug: import.meta.env.DEV, // Enable debug mode in development
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.opt_out_capturing(); // Optional: Disable capturing in dev
    },
  });
};

export default posthog;
