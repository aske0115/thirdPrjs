/** Small original synthesized sound palette. Call enable() from a user gesture. */
export function createAudio() {
  let context = null;
  let muted = false;
  let master = null;
  const lastPlayed = new Map();

  function enable() {
    try {
      const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioContextClass) return Promise.resolve(false);
      if (!context) {
        context = new AudioContextClass();
        master = context.createGain();
        master.gain.value = muted ? 0 : 0.24;
        master.connect(context.destination);
      }
      if (context.state === 'suspended') return context.resume().then(() => true).catch(() => false);
      return Promise.resolve(context.state === 'running');
    } catch (_) { return Promise.resolve(false); }
  }

  function tone(time, frequency, duration, type = 'sine', volume = 0.3, endFrequency = frequency) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), time + duration);
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(volume, time + 0.008);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(envelope);
    envelope.connect(master);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.01);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }

  function play(name) {
    if (muted || !context || context.state !== 'running') return;
    const now = context.currentTime;
    const cooldown = name === 'hit' ? 0.09 : name === 'collect' ? 0.07 : 0.04;
    if (now - (lastPlayed.get(name) ?? -Infinity) < cooldown) return;
    lastPlayed.set(name, now);
    try {
      switch (name) {
        case 'hit': tone(now, 180, 0.07, 'triangle', 0.32, 85); tone(now, 620, 0.035, 'square', 0.04, 300); break;
        case 'kill': tone(now, 380, 0.09, 'triangle', 0.22, 510); tone(now + 0.07, 620, 0.18, 'sine', 0.25, 850); break;
        case 'skill': tone(now, 180, 0.2, 'sawtooth', 0.10, 700); tone(now + 0.08, 740, 0.15, 'sine', 0.17, 1100); break;
        case 'hurt': tone(now, 250, 0.16, 'triangle', 0.28, 110); break;
        case 'collect': tone(now, 780, 0.08, 'sine', 0.23, 1100); break;
        case 'shop': tone(now, 520, 0.1, 'triangle', 0.19); tone(now + 0.09, 780, 0.16, 'sine', 0.18); break;
        case 'sale': tone(now, 880, 0.09, 'sine', 0.2); tone(now + 0.07, 1175, 0.2, 'sine', 0.19); break;
        case 'quest': tone(now, 523, 0.12, 'triangle', 0.2); tone(now + 0.1, 659, 0.12, 'triangle', 0.2); tone(now + 0.2, 784, 0.24, 'sine', 0.22); break;
        case 'return': tone(now, 659, 0.12, 'sine', 0.18); tone(now + 0.1, 523, 0.2, 'sine', 0.18); break;
      }
    } catch (_) { /* Audio is optional; gameplay must continue. */ }
  }

  function setMuted(value) {
    muted = Boolean(value);
    if (master && context) {
      try { master.gain.setTargetAtTime(muted ? 0 : 0.24, context.currentTime, 0.015); } catch (_) { /* Audio remains optional. */ }
    }
  }
  return { enable, play, setMuted };
}
