// Simple synth for sound effects to avoid external asset dependencies

const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

export const playSound = (type: 'trade' | 'alert' | 'click') => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  if (type === 'trade') {
    // High pitched coin sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } else if (type === 'alert') {
    // Error/Alert buzzer
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
  } else if (type === 'click') {
    // Simple UI click
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
  }
};
