/** Small original synthesized sound palette. Call enable() from a user gesture. */
export function createAudio() {
  let context = null;
  let muted = false;
  let master = null;
  let noiseBuffer = null;
  let voices = 0;
  const maxVoices = 20;
  const lastPlayed = new Map();

  function enable() {
    try {
      const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioContextClass) return Promise.resolve(false);
      if (!context) {
        context = new AudioContextClass();
        master = context.createGain();
        master.gain.value = muted ? 0 : 0.24;
        const limiter = context.createDynamicsCompressor();
        limiter.threshold.value = -10;
        limiter.knee.value = 8;
        limiter.ratio.value = 8;
        master.connect(limiter);
        limiter.connect(context.destination);
      }
      if (context.state === 'suspended') return context.resume().then(() => true).catch(() => false);
      return Promise.resolve(context.state === 'running');
    } catch (_) { return Promise.resolve(false); }
  }

  function tone(time, frequency, duration, type = 'sine', volume = 0.3, endFrequency = frequency) {
    if (voices >= maxVoices) return;
    voices += 1;
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
    oscillator.onended = () => { voices -= 1; oscillator.disconnect(); envelope.disconnect(); };
  }

  function noise(time, duration, volume, frequency) {
    if (voices >= maxVoices) return;
    if (!noiseBuffer) {
      noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.3), context.sampleRate);
      const samples = noiseBuffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    }
    voices += 1;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    source.buffer = noiseBuffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(frequency, time);
    filter.frequency.exponentialRampToValueAtTime(frequency * 0.55, time + duration);
    filter.Q.value = 0.7;
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(volume, time + 0.004);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.connect(filter); filter.connect(envelope); envelope.connect(master);
    source.start(time); source.stop(time + duration + 0.01);
    source.onended = () => { voices -= 1; source.disconnect(); filter.disconnect(); envelope.disconnect(); };
  }

  function play(name) {
    if (muted || !context || context.state !== 'running') return;
    const now = context.currentTime;
    const cooldown = name === 'hit' ? 0.09 : name === 'collect' ? 0.07 : 0.04;
    if (now - (lastPlayed.get(name) ?? -Infinity) < cooldown) return;
    lastPlayed.set(name, now);
    try {
      switch (name) {
        case 'hit': noise(now, 0.055, 0.42, 2400); tone(now, 560, 0.07, 'triangle', 0.35, 220); tone(now, 1100, 0.035, 'square', 0.08, 700); break;
        case 'kill': noise(now, 0.075, 0.30, 1800); tone(now, 480, 0.09, 'triangle', 0.28, 700); tone(now + 0.06, 880, 0.16, 'sine', 0.24, 1100); break;
        case 'skill': noise(now, 0.14, 0.25, 3000); tone(now, 380, 0.18, 'sawtooth', 0.10, 760); tone(now + 0.08, 850, 0.15, 'sine', 0.17, 1200); break;
        case 'hurt': tone(now, 250, 0.16, 'triangle', 0.28, 110); break;
        case 'collect': tone(now, 880, 0.07, 'triangle', 0.20, 1150); tone(now + 0.05, 1320, 0.12, 'sine', 0.14); break;
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
