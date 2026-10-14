import { CONFIG } from "@/config/config";
import { STATS } from "@/game/constants";
import type { GameState } from "@/game/types";
import { Icon } from "./Icon";

interface HudProps {
  state: GameState;
  level: number;
  progress: number;
  onMute: () => void;
  onLetter: () => void;
  onPhotos: () => void;
}

export function Hud({ state, level, progress, onMute, onLetter, onPhotos }: HudProps) {
  return (
    <header className="hud">
      <div className="hud__top">
        <h1 className="hud__title">
          Purin <span>&amp;</span> {CONFIG.partner}
        </h1>
        <div className="hud__buttons">
          <span className="coins" title="Moedas">
            <Icon name="coin" size={20} />
            <b>{state.moedas}</b>
          </span>
          <button type="button" className="icon-btn" onClick={onLetter} aria-label="Abrir carta"><Icon name="letter" size={22} /></button>
          <button type="button" className="icon-btn" onClick={onPhotos} aria-label="Fotos"><Icon name="camera" size={22} /></button>
          <button type="button" className="icon-btn" onClick={onMute} aria-label={state.mudo ? "Ligar som" : "Desligar som"}>
            <Icon name={state.mudo ? "mute" : "sound"} size={22} />
          </button>
        </div>
      </div>

      <div className="love" title="Nível de amor">
        <span className="love__badge" aria-label={`Nível de amor ${level}`}>
          <Icon name="heart" size={26} />
          <b>{level}</b>
        </span>
        <div className="love__bar">
          <span className="love__label">Amor</span>
          <div className="bar bar--love" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="bar__fill" style={{ width: `${Math.max(4, progress * 100)}%` }} />
          </div>
        </div>
      </div>

      <ul className="stats">
        {STATS.map((s) => {
          const v = Math.round(state[s.key]);
          return (
            <li key={s.key} className={`stat stat--${s.key}${v < 25 ? " stat--low" : ""}`}>
              <span className="stat__badge"><Icon name={s.icon} size={20} /></span>
              <div className="stat__body">
                <div className="stat__head">
                  <span>{s.label}</span>
                  <b>{v}</b>
                </div>
                <div className="bar" role="progressbar" aria-label={s.label} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
                  <div className="bar__fill" style={{ width: `${Math.max(v, 4)}%` }} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </header>
  );
}
