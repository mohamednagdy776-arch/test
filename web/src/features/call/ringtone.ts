/**
 * Tiny WebAudio ringtone/ringback generator — no audio assets to ship or serve.
 *
 * Synthesises a softly-enveloped tone pattern on a loop until `stop()`. Two
 * presets: `incoming` (callee's phone ringing) and `outgoing` (caller's
 * ringback). Each "beep" gets a short attack/release ramp so it never clicks.
 */

type Pattern = { freqs: number[]; onMs: number; offMs: number; volume: number };

const PATTERNS: Record<'incoming' | 'outgoing', Pattern> = {
  // Callee side: a warmer two-note chime that loops fairly quickly.
  incoming: { freqs: [523.25, 659.25], onMs: 850, offMs: 550, volume: 0.16 },
  // Caller side: classic ringback — one ring, longer silence.
  outgoing: { freqs: [440, 480], onMs: 1000, offMs: 2200, volume: 0.1 },
};

export class Ringtone {
  private ctx: AudioContext | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private stopped = true;

  /** Start (or restart) looping the given tone. Safe to call repeatedly. */
  start(type: 'incoming' | 'outgoing') {
    this.stop();
    this.stopped = false;
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    // Autoplay policy: the user just clicked Call / opened the app, so resuming
    // here is allowed. If it's blocked we simply stay silent.
    void this.ctx.resume?.().catch(() => { /* ignore */ });

    const pattern = PATTERNS[type];
    const loop = () => {
      if (this.stopped || !this.ctx) return;
      this.beep(pattern);
      this.timer = setTimeout(loop, pattern.onMs + pattern.offMs);
    };
    loop();
  }

  private beep({ freqs, onMs, volume }: Pattern) {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = onMs / 1000;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.04);
    gain.gain.setValueAtTime(volume, now + Math.max(dur - 0.06, 0.05));
    gain.gain.linearRampToValueAtTime(0, now + dur);
    for (const f of freqs) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    }
  }

  /** Stop the loop and release the audio context. Safe to call multiple times. */
  stop() {
    this.stopped = true;
    if (this.timer != null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.ctx) {
      void this.ctx.close().catch(() => { /* already closed */ });
      this.ctx = null;
    }
  }
}
