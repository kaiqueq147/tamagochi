import type { ReactNode } from "react";
import type { FxItem } from "@/hooks/useFx";
import type { Speech } from "@/hooks/useSpeech";
import type { Mood } from "@/game/types";

interface RoomProps {
  mood: Mood;
  speech: Speech | null;
  fx: FxItem[];
  children: ReactNode;
}

/** O quartinho: fundo, balão de fala, efeitos e o Purin (children). */
export function Room({ mood, speech, fx, children }: RoomProps) {
  return (
    <section className={`room room--${mood}`} aria-live="polite">
      <div className="room__window" aria-hidden />
      <div className="room__floor" aria-hidden />
      {mood === "sleeping" && <div className="room__zzz" aria-hidden>💤</div>}

      {speech && (
        <p key={speech.id} className="bubble">
          {speech.text}
        </p>
      )}

      <div className="room__purin">{children}</div>

      <div className="fx" aria-hidden>
        {fx.map((f) => (
          <span
            key={f.id}
            className={f.fall ? "fx__item fx__item--fall" : "fx__item"}
            style={{ left: `${f.left}%`, top: `${f.top}%`, animationDelay: `${f.delay}s`, ["--rot" as string]: `${f.rotate}deg` }}
          >
            {f.emoji}
          </span>
        ))}
      </div>
    </section>
  );
}
