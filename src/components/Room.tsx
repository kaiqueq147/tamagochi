import type { ReactNode } from "react";
import { CONFIG } from "@/config/config";
import type { FxItem } from "@/hooks/useFx";
import type { Speech } from "@/hooks/useSpeech";
import type { Mood } from "@/game/types";
import { photo } from "@/utils";

interface RoomProps {
  mood: Mood;
  speech: Speech | null;
  fx: FxItem[];
  /** id do papel de parede equipado */
  wallpaper?: string;
  /** emoji do enfeite equipado */
  ornament?: string;
  onPhotos: () => void;
  children: ReactNode;
}

/** O quartinho: fundo, porta-retrato, balão de fala, efeitos e o Purin (children). */
export function Room({ mood, speech, fx, wallpaper, ornament, onPhotos, children }: RoomProps) {
  const first = CONFIG.photos[0];
  return (
    <section className={`room room--${mood} wall--${wallpaper ?? "creme"}`} aria-live="polite">
      <div className="room__window" aria-hidden />
      <div className="room__floor" aria-hidden />
      {mood === "sleeping" && <div className="room__zzz" aria-hidden>💤</div>}

      {first && (
        <button type="button" className="frame" onClick={onPhotos} aria-label="Ver fotos">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo(first.file)} alt="" draggable={false} />
        </button>
      )}
      {ornament && <div className="room__ornament" aria-hidden>{ornament}</div>}

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
