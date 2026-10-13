import type { SfxName } from "@/game/types";

type Note = [freq: number, dur: number, type?: OscillatorType, vol?: number];

const SONS: Record<SfxName, Note[]> = {
  clique: [[660, 0.06]],
  comer: [[392, 0.09], [330, 0.09], [392, 0.09], [330, 0.09]],
  feliz: [[523, 0.1, "triangle"], [659, 0.1, "triangle"], [784, 0.16, "triangle"]],
  banho: [[880, 0.05, "sine"], [1100, 0.05, "sine"], [900, 0.05, "sine"], [1200, 0.05, "sine"], [1000, 0.08, "sine"]],
  nivel: [[523, 0.12, "triangle"], [659, 0.12, "triangle"], [784, 0.12, "triangle"], [1047, 0.3, "triangle"]],
  erro: [[200, 0.18, "sawtooth", 0.05]],
  moeda: [[988, 0.07], [1319, 0.18]],
  ai: [[300, 0.12, "sawtooth", 0.05], [200, 0.2, "sawtooth", 0.05]],
  dormir: [[440, 0.25, "sine"], [349, 0.25, "sine"], [262, 0.4, "sine"]]
};

let ctx: AudioContext | null = null;
let muted = false;

export const sfx = {
  setMuted(value: boolean) { muted = value; },
  play(name: SfxName) {
    if (muted || typeof window === "undefined") return;
    try {
      ctx = ctx ?? new AudioContext();
      let t = ctx.currentTime;
      for (const [freq, dur, type = "square", vol = 0.06] of SONS[name]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur);
        t += dur * 0.9;
      }
    } catch { /* navegador sem áudio */ }
  }
};
