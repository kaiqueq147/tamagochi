import { LOVE, OFFLINE, RATE } from "./constants";
import type { Food, GameState, Mood, ShopItem, Slot } from "./types";

export const clamp = (v: number, a = 0, b = 100) => Math.min(b, Math.max(a, v));

export function newGame(now = Date.now()): GameState {
  return {
    fome: 70, feliz: 80, energia: 90, higiene: 90,
    moedas: 10, amor: 0, itens: [], equipado: {},
    dormindo: false, visto: false, mudo: false,
    criado: now, ultimo: now
  };
}

/* ------------------------------ tempo ------------------------------ */

/** Aplica `minutos` de passagem de tempo (funciona dormindo ou acordado). */
export function applyMinutes(s: GameState, minutos: number): GameState {
  const r = s.dormindo ? RATE.dormindo : RATE.acordado;
  const next = {
    ...s,
    fome: clamp(s.fome + r.fome * minutos),
    feliz: clamp(s.feliz + r.feliz * minutos),
    energia: clamp(s.energia + r.energia * minutos),
    higiene: clamp(s.higiene + r.higiene * minutos)
  };
  // com fome ou sujo, a felicidade cai mais rápido
  if (!next.dormindo && (next.fome < 25 || next.higiene < 25)) next.feliz = clamp(next.feliz - 0.8 * minutos);
  // acorda sozinho quando a energia enche
  if (next.dormindo && next.energia >= 100) next.dormindo = false;
  return next;
}

/** Usa o tempo real: funciona com a aba em segundo plano ou com o jogo fechado. */
export function advance(s: GameState, now: number): GameState {
  let min = (now - s.ultimo) / 60000;
  if (min <= 0) return { ...s, ultimo: now };
  if (min > OFFLINE.thresholdMinutes) min = Math.min(min, OFFLINE.maxMinutes) * OFFLINE.factor;
  return { ...applyMinutes(s, min), ultimo: now };
}

/** Quantos minutos (já suavizados) passaram desde a última vez que o jogo foi aberto. */
export function offlineMinutes(s: GameState, now: number): number {
  const min = (now - s.ultimo) / 60000;
  return min > OFFLINE.thresholdMinutes ? Math.min(min, OFFLINE.maxMinutes) * OFFLINE.factor : 0;
}

/* ------------------------------ humor ------------------------------ */

export function getMood(s: GameState): Mood {
  if (s.dormindo) return "sleeping";
  if (s.higiene < 25) return "dirty";
  if (s.fome < 25) return "hungry";
  if (s.feliz < 25) return "sad";
  if (s.energia < 20) return "tired";
  const media = (s.fome + s.feliz + s.energia + s.higiene) / 4;
  return media > 65 ? "happy" : "ok";
}

/* ------------------------------ amor ------------------------------- */

export const loveLevel = (s: GameState) => 1 + Math.floor(s.amor / LOVE.perLevel);
export const loveProgress = (s: GameState) => (s.amor % LOVE.perLevel) / LOVE.perLevel;

/* ------------------------------ ações ------------------------------ */

export const isFull = (s: GameState) => s.fome >= 95;
export const isClean = (s: GameState) => s.higiene >= 95;

export function feed(s: GameState, f: Food): GameState {
  return {
    ...s,
    moedas: s.moedas - f.preco,
    fome: clamp(s.fome + f.fome),
    feliz: clamp(s.feliz + f.feliz),
    higiene: clamp(s.higiene - 3),
    amor: s.amor + LOVE.feed
  };
}

export const bathe = (s: GameState): GameState => ({
  ...s, higiene: clamp(s.higiene + 65), feliz: clamp(s.feliz + 4), amor: s.amor + LOVE.bath
});

export const vape = (s: GameState): GameState => ({
  ...s, feliz: clamp(s.feliz + 4), higiene: clamp(s.higiene - 3)
});

export const pet = (s: GameState): GameState => ({
  ...s, feliz: clamp(s.feliz + 4), amor: s.amor + LOVE.pet
});

/* ------------------------------ loja ------------------------------- */

export const owns = (s: GameState, item: ShopItem) => item.preco === 0 || s.itens.includes(item.id);

/** Compra e já coloca o item no Purin / quarto. */
export function buyItem(s: GameState, item: ShopItem): GameState {
  if (owns(s, item) || s.moedas < item.preco) return s;
  return {
    ...s,
    moedas: s.moedas - item.preco,
    itens: [...s.itens, item.id],
    equipado: { ...s.equipado, [item.slot]: item.id },
    feliz: clamp(s.feliz + 6),
    amor: s.amor + LOVE.gift
  };
}

/** `id = null` tira o item daquele espaço. */
export function equipItem(s: GameState, slot: Slot, id: string | null): GameState {
  const equipado = { ...s.equipado };
  if (id === null) delete equipado[slot];
  else equipado[slot] = id;
  return { ...s, equipado };
}

export const coinsFor = (points: number) => Math.ceil(points * 0.8);

export function playResult(s: GameState, points: number): GameState {
  return {
    ...s,
    moedas: s.moedas + coinsFor(points),
    feliz: clamp(s.feliz + 12 + points * 1.2),
    energia: clamp(s.energia - 15),
    fome: clamp(s.fome - 8),
    higiene: clamp(s.higiene - 6),
    amor: s.amor + LOVE.play
  };
}
