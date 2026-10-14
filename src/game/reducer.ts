import { advance, bathe, buyItem, equipItem, feed, newGame, pet, playResult, vape } from "./logic";
import type { GameAction, GameState } from "./types";

/** Reducer puro: toda mudança de estado do jogo passa por aqui. */
export function gameReducer(s: GameState, a: GameAction): GameState {
  switch (a.type) {
    case "tick": return advance(s, a.now);
    case "feed": return feed(s, a.food);
    case "bath": return bathe(s);
    case "sleep": return { ...s, dormindo: a.value };
    case "pet": return pet(s);
    case "play": return playResult(s, a.points);
    case "vape": return vape(s);
    case "buy": return buyItem(s, a.item);
    case "equip": return equipItem(s, a.slot, a.id);
    case "seen": return { ...s, visto: true };
    case "toggleMute": return { ...s, mudo: !s.mudo };
    case "reset": return { ...newGame(), visto: true, mudo: s.mudo };  }
}
