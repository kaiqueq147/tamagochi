import { CONFIG } from "@/config/config";
import { STATS } from "@/game/constants";
import type { GameState } from "@/game/types";

interface HudProps {
  state: GameState;
  level: number;
  progress: number;
  onMute: () => void;
  onLetter: () => void;
}

export function Hud({ state, level, progress, onMute, onLetter }: HudProps) {
  return (
    <header className="hud">
      <div className="hud__top">
        <h1 className="hud__title">
          Purin <span>&amp;</span> {CONFIG.partner}
        </h1>
        <div className="hud__buttons">
          <span className="coins" title="Moedas">🪙 {state.moedas}</span>
          <button type="button" className="icon-btn" onClick={onLetter} aria-label="Abrir carta">💌</button>
          <button type="button" className="icon-btn" onClick={onMute} aria-label={state.mudo ? "Ligar som" : "Desligar som"}>
            {state.mudo ? "🔇" : "🔊"}
          </button>
        </div>
      </div>

      <div className="love" title="Nível de amor">
        <span className="love__label">💛 Amor nv. {level}</span>
        <div className="bar"><div className="bar__fill bar__fill--love" style={{ width: `${progress * 100}%` }} /></div>
      </div>

      <ul className="stats">
        {STATS.map((s) => {
          const v = Math.round(state[s.key]);
          return (
            <li key={s.key} className={v < 25 ? "stat stat--low" : "stat"}>
              <span className="stat__icon" aria-hidden>{s.icon}</span>
              <div className="bar" role="progressbar" aria-label={s.label} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
                <div className="bar__fill" style={{ width: `${v}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </header>
  );
}
