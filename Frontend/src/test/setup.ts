import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Audio API
window.AudioContext = class {
  createOscillator() {
    return {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 0 },
      type: 'sine',
    };
  }
  createGain() {
    return {
      connect: vi.fn(),
      gain: { value: 0, linearRampToValueAtTime: vi.fn() },
    };
  }
  get destination() {
    return {};
  }
} as any;
