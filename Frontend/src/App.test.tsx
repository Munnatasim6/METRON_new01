import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { describe, it, expect, vi } from 'vitest';

// Mock dependencies
vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
    init: vi.fn(),
  },
}));

vi.mock('./services/analytics', () => ({
  default: {
    capture: vi.fn(),
  },
  initAnalytics: vi.fn(),
  logPageView: vi.fn(),
}));

describe('App Component', () => {
  it('renders without crashing', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    // You might want to check for a specific element that shows up on the dashboard
    // const linkElement = await screen.findByText(/METRON/i);
    // expect(linkElement).toBeInTheDocument();
  });
});
