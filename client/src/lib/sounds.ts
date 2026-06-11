'use client';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export const sounds = {
  click: () => playTone(800, 0.1, 'sine', 0.2),
  select: () => playTone(600, 0.15, 'triangle', 0.25),
  reveal: () => {
    playTone(400, 0.1, 'sine', 0.3);
    setTimeout(() => playTone(600, 0.15, 'sine', 0.3), 100);
  },
  runs: (runs: number) => {
    playTone(500 + runs * 50, 0.2, 'sine', 0.35);
    if (runs >= 4) {
      setTimeout(() => playTone(700, 0.3, 'square', 0.3), 150);
    }
  },
  out: () => {
    playTone(200, 0.1, 'sawtooth', 0.4);
    setTimeout(() => playTone(150, 0.3, 'sawtooth', 0.4), 100);
    setTimeout(() => playTone(100, 0.4, 'sawtooth', 0.3), 250);
  },
  victory: () => {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.3, 'sine', 0.35), i * 150);
    });
  },
  toss: () => playTone(300, 0.5, 'triangle', 0.3),
  wicket: () => playTone(180, 0.5, 'sawtooth', 0.5),
};
