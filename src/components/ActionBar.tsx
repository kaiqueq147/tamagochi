import type { GameState } from "@/game/types";
import { Icon, type IconName } from "./Icon";

interface ActionBarProps {
  state: GameState;
  onFeed: () => void;
  onBath: () => void;
  onSleep: () => void;
  onPlay: () => void;
  onShop: () => void;
  onVape: () => void;
}

/** Vibra de leve no celular (quando o aparelho suporta). */
const tap = (fn: () => void) => () => {
  navigator.vibrate?.(8);
  fn();
};

export function ActionBar({ state, onFeed, onBath, onSleep, onPlay, onShop, onVape }: ActionBarProps) {
  const sleeping = state.dormindo;
  const items: { icon: IconName; label: string; color: string; onClick: () => void; hint?: boolean; dim?: boolean }[] = [
    { icon: "pudding", label: "Comer", color: "#ffe29a", onClick: onFeed, hint: !sleeping && state.fome < 40, dim: sleeping },
    { icon: "bath", label: "Banho", color: "#cdeeff", onClick: onBath, hint: !sleeping && state.higiene < 40, dim: sleeping },
    { icon: sleeping ? "sun" : "moon", label: sleeping ? "Acordar" : "Dormir", color: "#e0d6ff", onClick: onSleep, hint: !sleeping && state.energia < 30 },
    { icon: "gamepad", label: "Brincar", color: "#ffd0e0", onClick: onPlay, hint: !sleeping && state.feliz < 40, dim: sleeping },
    { icon: "bag", label: "Loja", color: "#c9f2e6", onClick: onShop },
    { icon: "cloud", label: "Vape", color: "#e6f3fb", onClick: onVape, dim: sleeping }
  ];

  return (
    <nav className="actions" aria-label="Ações">
      {items.map((a) => (
        <button
          key={a.label}
          type="button"
          className={`action${a.hint ? " action--hint" : ""}${a.dim ? " action--dim" : ""}`}
          onClick={tap(a.onClick)}
        >
          <span className="action__icon" style={{ background: a.color }}>
            <Icon name={a.icon} size={26} />
          </span>
          <span className="action__label">{a.label}</span>
        </button>
      ))}
    </nav>
  );
}
