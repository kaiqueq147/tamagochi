import type { SfxName } from "@/game/types";

type Note = [freq: number, dur: number, type?: OscillatorType, vol?: number];

const SONS: Partial<Record<SfxName, Note[]>> = {
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

/** Sons de "ar": ruído filtrado que varia de frequência (começo, duração, freq. inicial/final, volume). */
const SOPROS: Partial<Record<SfxName, { delay: number; dur: number; from: number; to: number; vol: number }[]>> = {
  // tragar: chiado que vai ficando mais agudo, depois um "glub" de borbulha
  tragar: [{ delay: 0.5, dur: 1.5, from: 500, to: 2200, vol: 0.09 }],
  // soprar: sopro grave que se espalha
  soprar: [{ delay: 0, dur: 1.8, from: 2400, to: 700, vol: 0.1 }]
};

let ctx: AudioContext | null = null;
let muted = false;

function noise(c: AudioContext, start: number, dur: number, from: number, to: number, vol: number) {
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.9;
  filter.frequency.setValueAtTime(from, start);
  filter.frequency.exponentialRampToValueAtTime(to, start + dur);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(vol, start + dur * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(start);
}

export const sfx = {
  setMuted(value: boolean) { muted = value; },
  play(name: SfxName) {
    if (muted || typeof window === "undefined") return;
    try {
      ctx = ctx ?? new AudioContext();
      const now = ctx.currentTime;

      for (const s of SOPROS[name] ?? []) noise(ctx, now + s.delay, s.dur, s.from, s.to, s.vol);

      let t = now;
      for (const [freq, dur, type = "square", vol = 0.06] of SONS[name] ?? []) {
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
