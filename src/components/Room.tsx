import type { ReactNode } from "react";
import type { FxItem } from "@/hooks/useFx";
import type { Speech } from "@/hooks/useSpeech";
import { MOOD_LABEL } from "@/game/constants";
import type { Mood } from "@/game/types";

interface RoomProps {
  mood: Mood;
  speech: Speech | null;
  fx: FxItem[];
  /** id do papel de parede equipado */
  wallpaper?: string;
  /** emoji do enfeite equipado */
  ornament?: string;
  /** foto que aparece no porta-retrato (vazio = porta-retrato com "+") */
  cover?: string;
  onPhotos: () => void;
  children: ReactNode;
}

/** O quartinho: fundo, porta-retrato, balão de fala, efeitos e o Purin (children). */
export function Room({ mood, speech, fx, wallpaper, ornament, cover, onPhotos, children }: RoomProps) {
  return (
    <section className={`room room--${mood} wall--${wallpaper ?? "creme"}`} aria-live="polite">
      <div className="room__window" aria-hidden />
      <div className="room__floor" aria-hidden />
      {mood === "sleeping" && <div className="room__zzz" aria-hidden>💤</div>}

      <button type="button" className="frame" onClick={onPhotos} aria-label={cover ? "Ver fotos" : "Adicionar fotos"}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" draggable={false} />
        ) : (
          <span className="frame__plus">＋</span>
        )}
      </button>
      {ornament && <div className="room__ornament" aria-hidden>{ornament}</div>}

      {speech && (
        <p key={speech.id} className="bubble">
          {speech.text}
        </p>
      )}

      <div className="room__rug" aria-hidden />
      <div className="room__purin">{children}</div>
      <span className={`mood-chip mood-chip--${mood}`}>{MOOD_LABEL[mood]}</span>

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
