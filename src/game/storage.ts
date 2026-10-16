import { SAVE_KEY } from "./constants";
import { advance, newGame, offlineMinutes } from "./logic";
import type { GameState } from "./types";

export function saveGame(s: GameState) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch { /* sem armazenamento */ }
}

/** Itens que mudaram de id: quem já tinha o antigo continua com o novo. */
const RENAMED: Record<string, string> = { diamante: "esmeralda" };

function migrate(s: GameState): GameState {
  const rename = (id: string) => RENAMED[id] ?? id;
  return {
    ...s,
    itens: s.itens.map(rename),
    equipado: Object.fromEntries(Object.entries(s.equipado).map(([slot, id]) => [slot, rename(id as string)]))
  };
}

/** Carrega o jogo salvo e já aplica o tempo que passou enquanto estava fechado. (Só no navegador!) */
export function loadGame(now = Date.now()): { state: GameState; offline: number } {
  let saved: GameState = newGame(now);
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) saved = migrate({ ...saved, ...JSON.parse(raw) });
  } catch { /* save corrompido: começa do zero */ }
  return { state: advance(saved, now), offline: offlineMinutes(saved, now) };
}
