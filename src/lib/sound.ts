/**
 * Tiny Web Audio cues for set completion, rest end and achievement unlocks.
 * No dependencies; every call is guarded so unsupported browsers stay silent.
 */

type Cue = 'set' | 'rest' | 'unlock';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(ac: AudioContext, freq: number, startAt: number, dur: number, gainValue: number) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(gainValue, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(startAt);
  osc.stop(startAt + dur + 0.05);
}

export function playCue(cue: Cue, enabled = true): void {
  if (!enabled) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.01;
  try {
    if (cue === 'set') {
      tone(ac, 880, t, 0.12, 0.06);
    } else if (cue === 'rest') {
      tone(ac, 660, t, 0.12, 0.06);
      tone(ac, 990, t + 0.16, 0.18, 0.06);
    } else {
      tone(ac, 784, t, 0.14, 0.06);
      tone(ac, 988, t + 0.16, 0.14, 0.06);
      tone(ac, 1175, t + 0.32, 0.28, 0.06);
    }
  } catch {
    /* audio is a bonus, never a requirement */
  }
}
