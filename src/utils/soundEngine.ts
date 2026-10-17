// BEACON-19 Pure Web Audio API Synthesizer Engine
// Zero external audio files, 100% offline synthesized acoustic telemetry

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // 1. playSonarPing: Subtle radar click/ping when selecting sectors or recalculating routes
  public playSonarPing(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1240, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // 2. playHordeAlert: Low-frequency tactical klaxon when a zombie horde spawns on the active route
  public playHordeAlert(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Two pulsed sawtooth waves with a slight detune for sinister tactical grit
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(140, now);
      osc1.frequency.linearRampToValueAtTime(90, now + 0.4);
      osc2.frequency.setValueAtTime(144, now);
      osc2.frequency.linearRampToValueAtTime(94, now + 0.4);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);

      // Repeat second pulse
      setTimeout(() => {
        if (this.isMuted) return;
        const c2 = this.getAudioContext();
        if (!c2) return;
        const t2 = c2.currentTime;
        const o3 = c2.createOscillator();
        const g2 = c2.createGain();
        o3.type = 'sawtooth';
        o3.frequency.setValueAtTime(160, t2);
        o3.frequency.linearRampToValueAtTime(80, t2 + 0.35);
        g2.gain.setValueAtTime(0.2, t2);
        g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.4);
        o3.connect(g2);
        g2.connect(c2.destination);
        o3.start(t2);
        o3.stop(t2 + 0.45);
      }, 240);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // 3. playSupplyPickup: Crisp dual-tone confirmation chime when scavenging supplies
  public playSupplyPickup(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [587.33, 880.0, 1174.66]; // D5, A5, D6 triumphant scavenge chord
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.28);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // 4. playAcousticModemSync: Authentic 1.2-second multi-frequency FSK data modem chirp
  public playAcousticModemSync(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 3;

      // Authentic Bell 103 / FSK carrier burst: 1200Hz, 2200Hz, 1600Hz high-speed bursts
      const frequencies = [
        1200, 2200, 1200, 2200, 1400, 1800, 2200, 1200, 
        2400, 1750, 1950, 1250, 2300, 1500, 2100, 1300,
        1850, 2400, 1200, 2200, 1600, 2000, 1200, 2200
      ];

      const stepTime = 1.2 / frequencies.length;
      osc.type = 'square';
      osc.frequency.setValueAtTime(frequencies[0], now);

      frequencies.forEach((f, i) => {
        osc.frequency.setValueAtTime(f, now + i * stepTime);
      });

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.setValueAtTime(0.14, now + 1.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }
}

export const soundEngine = new SoundEngine();
