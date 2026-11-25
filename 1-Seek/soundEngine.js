class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.compressor = null;
    this.noiseBuffer = null;

    this.enabled = true;
    this.volume = 0.6;
    this.stepTimerMs = 0;
    this.stepIndex = 0;

    // Gamme D mineur (synthwave / arcade spatial)
    this.bassPatternHz = [73.42, 73.42, 87.31, 73.42, 98.0, 110.0, 87.31, 65.41];
    this.arpPatternHz = [293.66, 349.23, 440.0, 523.25, 587.33, 523.25, 440.0, 349.23];
    this.intenseArpHz = [440.0, 523.25, 587.33, 659.25, 698.46, 659.25, 587.33, 523.25];
  }

  init() {
    if (this.ctx) {
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    this.ctx = new AudioCtx();

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -16;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 6;
    this.compressor.attack.value = 0.005;
    this.compressor.release.value = 0.15;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.enabled ? this.volume : 0;

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.65;

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 1.0;

    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);

    this.noiseBuffer = this.createNoiseBuffer(0.45);
  }

  createNoiseBuffer(durationSec) {
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * durationSec);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  unlock() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    this.applyMasterGain();
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (this.enabled) {
      this.unlock();
    }
    this.applyMasterGain();
  }

  toggleEnabled() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  applyMasterGain() {
    if (!this.ctx || !this.masterGain) {
      return;
    }
    const targetGain = this.enabled ? this.volume : 0;
    this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.02);
  }

  computePan(x, canvasWidth) {
    if (!canvasWidth || canvasWidth <= 0) {
      return 0;
    }
    return Math.max(-1, Math.min(1, (x / canvasWidth) * 2 - 1));
  }

  playTargetDeath(x, canvasWidth, targetRadius = 40) {
    if (!this.enabled || this.volume <= 0) {
      return;
    }
    this.unlock();
    if (!this.ctx || this.ctx.state !== "running") {
      return;
    }

    const now = this.ctx.currentTime;
    const panValue = this.computePan(x, canvasWidth);

    const panner = this.ctx.createStereoPanner();
    panner.pan.setValueAtTime(panValue, now);
    panner.connect(this.sfxGain);

    // Couche 1 : explosion / éclatement filtré (bruit blanc)
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.Q.setValueAtTime(1.4, now);
    noiseFilter.frequency.setValueAtTime(1700, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(150, now + 0.32);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.7, now + 0.012);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(panner);

    noiseSource.start(now);
    noiseSource.stop(now + 0.36);

    // Couche 2 : chute rapide / agonie synthétisée (adaptée au rayon)
    const sizeFactor = Math.max(0.6, Math.min(1.4, 55 / Math.max(15, targetRadius)));
    const startFreq = 460 * sizeFactor;
    const endFreq = 58 * sizeFactor;

    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.3);

    const oscFilter = this.ctx.createBiquadFilter();
    oscFilter.type = "lowpass";
    oscFilter.frequency.setValueAtTime(1500, now);
    oscFilter.frequency.exponentialRampToValueAtTime(190, now + 0.3);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.001, now);
    oscGain.gain.linearRampToValueAtTime(0.38, now + 0.015);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(oscFilter);
    oscFilter.connect(oscGain);
    oscGain.connect(panner);

    osc.start(now);
    osc.stop(now + 0.34);

    osc.onended = () => {
      noiseSource.disconnect();
      noiseFilter.disconnect();
      noiseGain.disconnect();
      osc.disconnect();
      oscFilter.disconnect();
      oscGain.disconnect();
      panner.disconnect();
    };
  }

  playWaveStart(waveNumber) {
    if (!this.enabled || this.volume <= 0) {
      return;
    }
    this.unlock();
    if (!this.ctx || this.ctx.state !== "running") {
      return;
    }

    const now = this.ctx.currentTime;
    const transpose = Math.min(1.5, 1 + (waveNumber - 1) * 0.05);
    const notes = [293.66, 440.0, 587.33];

    notes.forEach((freq, idx) => {
      const start = now + idx * 0.075;
      const osc = this.ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq * transpose, start);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.24, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.24);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(start);
      osc.stop(start + 0.26);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }

  updateMusic(state) {
    if (!this.enabled || this.volume <= 0) {
      return;
    }
    if (!this.ctx || this.ctx.state !== "running") {
      return;
    }

    const dtMs = Math.min(typeof state.dtMs === "number" ? state.dtMs : 16.67, 100);
    const targetCount = state.targetCount || 0;
    const referenceCount = Math.max(2, state.referenceCount || 6);
    const isAction = (state.chasingCount || 0) > 0 || (state.fleeingCount || 0) > 0;
    const waveBoost = Math.min(0.25, ((state.wave || 1) - 1) * 0.05);

    // Tension : augmente quand le nombre de cibles diminue
    const tension =
      targetCount > 0
        ? 1 - Math.max(0, Math.min(1, (targetCount - 1) / (referenceCount - 1)))
        : 0;

    // Tempo adaptatif (BPM) : 96 BPM au calme -> jusqu'à 168 BPM en fin de vague / poursuite
    const bpm = 96 + tension * 46 + (isAction ? 18 : 0) + waveBoost * 40;
    const stepIntervalMs = (60 / bpm / 2) * 1000; // Croches (2 steps par temps)

    this.stepTimerMs += dtMs;
    if (this.stepTimerMs >= stepIntervalMs) {
      this.stepTimerMs %= stepIntervalMs;
      this.playMusicStep(this.stepIndex, tension, isAction, targetCount > 0);
      this.stepIndex = (this.stepIndex + 1) % 16;
    }
  }

  playMusicStep(step, tension, isAction, hasTargets) {
    const now = this.ctx.currentTime;
    const bassFreq = this.bassPatternHz[step % this.bassPatternHz.length];

    // 1. Kick sourd sur les temps forts (0, 4, 8, 12) + accent quand l'action monte
    if (step % 4 === 0 || (isAction && tension > 0.5 && step % 4 === 2)) {
      this.triggerKick(now, 0.28 + tension * 0.12);
    }

    // 2. Ligne de basse synthwave bien audible (harmoniques filtrées passe-bas)
    if (hasTargets || step % 2 === 0) {
      const bassLevel = step % 2 === 0 ? 0.28 : 0.18;
      this.triggerBassNote(now, bassFreq, bassLevel, tension, isAction);
    }

    // 3. Arpège spatial adaptatif (plus présent et brillant en poursuite ou forte tension)
    const playArp = isAction || tension > 0.35 || step % 2 === 0;
    if (playArp) {
      const pattern = isAction ? this.intenseArpHz : this.arpPatternHz;
      const arpFreq = pattern[step % pattern.length];
      const pan = step % 2 === 0 ? -0.35 : 0.35;
      const arpLevel = isAction ? 0.14 : 0.08 + tension * 0.04;
      this.triggerArpNote(now, arpFreq, arpLevel, pan, tension, isAction);
    }

    // 4. Hi-hat léger sur les contre-temps lorsque la poursuite est active
    if (isAction && step % 2 === 1) {
      this.triggerHiHat(now, 0.07 + tension * 0.04);
    }
  }

  triggerKick(now, level) {
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.exponentialRampToValueAtTime(46, now + 0.11);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(level, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + 0.16);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  triggerBassNote(now, freq, level, tension, isAction) {
    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.setValueAtTime(3.0, now);
    const peakCutoff = 520 + tension * 500 + (isAction ? 350 : 0);
    filter.frequency.setValueAtTime(peakCutoff, now);
    filter.frequency.exponentialRampToValueAtTime(180 + tension * 120, now + 0.16);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(level, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + 0.2);
    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  triggerArpNote(now, freq, level, pan, tension, isAction) {
    const osc = this.ctx.createOscillator();
    osc.type = isAction ? "sawtooth" : "triangle";
    osc.frequency.setValueAtTime(freq, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200 + tension * 1400 + (isAction ? 800 : 0), now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(level, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    const panner = this.ctx.createStereoPanner();
    panner.pan.setValueAtTime(pan, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + 0.18);
    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
      panner.disconnect();
    };
  }

  triggerHiHat(now, level) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(6500, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(level, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    src.start(now);
    src.stop(now + 0.05);
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }
}
