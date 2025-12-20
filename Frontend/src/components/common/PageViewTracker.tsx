import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import posthog from '../../services/analytics';

const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    posthog.capture('$pageview');
  }, [location]);

  return null; // This component handles side-effects only
};

export default PageViewTracker;
