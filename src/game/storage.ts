import { SAVE_KEY } from "./constants";
import { advance, newGame, offlineMinutes } from "./logic";
import type { GameState } from "./types";

export function saveGame(s: GameState) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch { /* sem armazenamento */ }
}

/** Carrega o jogo salvo e já aplica o tempo que passou enquanto estava fechado. (Só no navegador!) */
export function loadGame(now = Date.now()): { state: GameState; offline: number } {
  let saved: GameState = newGame(now);
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) saved = { ...saved, ...JSON.parse(raw) };
  } catch { /* save corrompido: começa do zero */ }
  return { state: advance(saved, now), offline: offlineMinutes(saved, now) };
}
