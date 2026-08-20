/**
 * Procedural Ignition Sequence score via Web Audio API.
 * No asset files — stays Cloudflare-bundle-friendly.
 *
 * Prime during the login/signup click (before await) so the context
 * stays unlocked after the async auth call; then start() schedules the score.
 */

type IgnitionAudioHandle = {
  stop: () => void;
};

const SCORE_SECONDS = 5;

declare global {
  interface Window {
    __bbIgnitionAudioCtx?: AudioContext;
    __bbIgnitionAudioPlaying?: boolean;
  }
}

function getAC(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!window.__bbIgnitionAudioCtx || window.__bbIgnitionAudioCtx.state === "closed") {
    window.__bbIgnitionAudioCtx = new Ctx();
  }
  return window.__bbIgnitionAudioCtx;
}

/** Call synchronously inside the user-gesture handler (start of submit). */
export function primeIgnitionAudio(): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = getAC();
  if (!ctx) return;
  void ctx.resume();
}

function tone(
  ctx: AudioContext,
  {
    type = "sine",
    freq,
    freqEnd,
    t,
    dur,
    gain = 0.08,
    attack = 0.01,
    release = 0.12,
  }: {
    type?: OscillatorType;
    freq: number;
    freqEnd?: number;
    t: number;
    dur: number;
    gain?: number;
    attack?: number;
    release?: number;
  },
  dest: AudioNode,
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t + dur);
  }
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, attack + release));
  osc.connect(g);
  g.connect(dest);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noiseBurst(
  ctx: AudioContext,
  {
    t,
    dur,
    gain = 0.04,
    bandFreq = 800,
  }: { t: number; dur: number; gain?: number; bandFreq?: number },
  dest: AudioNode,
) {
  const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = bandFreq;
  filter.Q.value = 0.7;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(dest);
  src.start(t);
  src.stop(t + dur + 0.02);
}

/**
 * Schedule the 5s ignition score. Safe to call more than once — only one plays.
 * Returns a stop handle (fade out + mark idle).
 */
export function startIgnitionAudio(): IgnitionAudioHandle {
  const noop = { stop: () => undefined };

  if (typeof window === "undefined") return noop;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return noop;
  if (window.__bbIgnitionAudioPlaying) return noop;

  const ctx = getAC();
  if (!ctx) return noop;

  window.__bbIgnitionAudioPlaying = true;
  const master = ctx.createGain();
  master.gain.value = 0.85;
  master.connect(ctx.destination);

  let cancelled = false;

  void ctx.resume().then(() => {
    if (cancelled || ctx.state === "closed") return;
    const t0 = ctx.currentTime + 0.04;

    // Ambient low pad under the forge
    tone(
      ctx,
      { type: "sine", freq: 55, freqEnd: 48, t: t0, dur: SCORE_SECONDS - 0.2, gain: 0.045, attack: 0.35, release: 0.8 },
      master,
    );
    tone(
      ctx,
      { type: "triangle", freq: 110, freqEnd: 98, t: t0 + 0.15, dur: SCORE_SECONDS - 0.4, gain: 0.018, attack: 0.5, release: 0.6 },
      master,
    );

    // Void — amber ignition spark
    noiseBurst(ctx, { t: t0 + 0.05, dur: 0.18, gain: 0.055, bandFreq: 2400 }, master);
    tone(
      ctx,
      { type: "sine", freq: 880, freqEnd: 220, t: t0 + 0.05, dur: 0.55, gain: 0.07, attack: 0.005, release: 0.4 },
      master,
    );

    // Forge — uprights plant (metallic thunks)
    noiseBurst(ctx, { t: t0 + 0.85, dur: 0.09, gain: 0.06, bandFreq: 420 }, master);
    tone(
      ctx,
      { type: "square", freq: 140, freqEnd: 70, t: t0 + 0.85, dur: 0.22, gain: 0.035, attack: 0.004, release: 0.15 },
      master,
    );
    noiseBurst(ctx, { t: t0 + 1.05, dur: 0.09, gain: 0.055, bandFreq: 480 }, master);
    tone(
      ctx,
      { type: "square", freq: 160, freqEnd: 75, t: t0 + 1.05, dur: 0.22, gain: 0.032, attack: 0.004, release: 0.15 },
      master,
    );

    // Bar load — rising energy sweep
    tone(
      ctx,
      { type: "sawtooth", freq: 180, freqEnd: 520, t: t0 + 1.45, dur: 0.55, gain: 0.028, attack: 0.04, release: 0.2 },
      master,
    );
    noiseBurst(ctx, { t: t0 + 1.45, dur: 0.35, gain: 0.03, bandFreq: 1600 }, master);

    // Plate snaps
    noiseBurst(ctx, { t: t0 + 2.0, dur: 0.07, gain: 0.07, bandFreq: 1800 }, master);
    tone(
      ctx,
      { type: "triangle", freq: 640, freqEnd: 320, t: t0 + 2.0, dur: 0.14, gain: 0.05, attack: 0.002, release: 0.1 },
      master,
    );
    noiseBurst(ctx, { t: t0 + 2.15, dur: 0.07, gain: 0.065, bandFreq: 2000 }, master);
    tone(
      ctx,
      { type: "triangle", freq: 720, freqEnd: 360, t: t0 + 2.15, dur: 0.14, gain: 0.048, attack: 0.002, release: 0.1 },
      master,
    );

    // Lock — soft chime as wordmark settles
    tone(
      ctx,
      { type: "sine", freq: 523.25, t: t0 + 2.75, dur: 0.55, gain: 0.055, attack: 0.01, release: 0.4 },
      master,
    );
    tone(
      ctx,
      { type: "sine", freq: 659.25, t: t0 + 2.88, dur: 0.6, gain: 0.04, attack: 0.01, release: 0.45 },
      master,
    );
    tone(
      ctx,
      { type: "sine", freq: 783.99, t: t0 + 3.02, dur: 0.7, gain: 0.032, attack: 0.01, release: 0.5 },
      master,
    );

    // Scan shimmer
    noiseBurst(ctx, { t: t0 + 3.35, dur: 0.45, gain: 0.025, bandFreq: 3200 }, master);
    tone(
      ctx,
      { type: "sine", freq: 1200, freqEnd: 400, t: t0 + 3.35, dur: 0.5, gain: 0.02, attack: 0.02, release: 0.25 },
      master,
    );

    // Unlock wipe — airy resolve
    tone(
      ctx,
      { type: "sine", freq: 196, freqEnd: 392, t: t0 + 4.05, dur: 0.7, gain: 0.05, attack: 0.05, release: 0.4 },
      master,
    );
    tone(
      ctx,
      { type: "triangle", freq: 392, freqEnd: 784, t: t0 + 4.15, dur: 0.65, gain: 0.028, attack: 0.06, release: 0.35 },
      master,
    );
    noiseBurst(ctx, { t: t0 + 4.1, dur: 0.4, gain: 0.035, bandFreq: 900 }, master);
  });

  return {
    stop: () => {
      cancelled = true;
      try {
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      } catch {
        // ignore
      }
      window.__bbIgnitionAudioPlaying = false;
      window.setTimeout(() => {
        try {
          master.disconnect();
        } catch {
          // ignore
        }
      }, 180);
    },
  };
}

export function stopIgnitionAudio(): void {
  window.__bbIgnitionAudioPlaying = false;
  const ctx = window.__bbIgnitionAudioCtx;
  if (!ctx || ctx.state === "closed") return;
  void ctx.close().finally(() => {
    window.__bbIgnitionAudioCtx = undefined;
  });
}
