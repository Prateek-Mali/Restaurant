let audioCtx;

export function playNewOrderChime() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();

    [880, 1175].forEach((freq, i) => {
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const startTime = audioCtx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  } catch {
    // Web Audio unavailable or blocked until the user interacts with the page — safe to ignore.
  }
}
