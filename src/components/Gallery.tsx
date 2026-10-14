"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_PHOTOS } from "@/game/photos";
import type { AddResult, GalleryPhoto } from "@/hooks/usePhotos";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

interface GalleryProps {
  photos: GalleryPhoto[];
  busy: boolean;
  onAdd: (files: File[]) => Promise<AddResult>;
  onRemove: (id: number) => Promise<void>;
  onCaption: (id: number, caption: string) => Promise<void>;
  onClose: () => void;
}

export function Gallery({ photos, busy, onAdd, onRemove, onCaption, onClose }: GalleryProps) {
  const [i, setI] = useState(0);
  const [notice, setNotice] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const prevCount = useRef(photos.length);

  // ao adicionar fotos, mostra a última; ao apagar, segura o índice dentro da lista
  useEffect(() => {
    if (photos.length > prevCount.current) setI(photos.length - 1);
    else setI((n) => Math.min(n, Math.max(0, photos.length - 1)));
    prevCount.current = photos.length;
  }, [photos.length]);

  const cur = photos[i];
  const go = (d: number) => setI((n) => (n + d + photos.length) % photos.length);

  async function pick(files: FileList | null) {
    if (!files?.length) return;
    const res = await onAdd(Array.from(files));
    if (input.current) input.current.value = ""; // permite escolher o mesmo arquivo de novo
    setNotice(
      res.full ? `Limite de ${MAX_PHOTOS} fotos atingido 📸`
      : res.failed ? `${res.failed} arquivo(s) não puderam ser abertos (use JPG, PNG ou WebP).`
      : ""
    );
  }

  return (
    <Modal title="Nossas fotos 📷" onClose={onClose}>
      {cur ? (
        <figure className="gallery">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={cur.key} className="gallery__img" src={cur.src} alt={cur.caption || "Foto"} />
          {cur.id !== undefined ? (
            <input
              key={cur.key}
              className="gallery__caption"
              defaultValue={cur.caption}
              placeholder="Escreva uma legenda…"
              maxLength={80}
              onBlur={(e) => e.target.value !== cur.caption && onCaption(cur.id!, e.target.value.trim())}
            />
          ) : (
            <figcaption>{cur.caption}</figcaption>
          )}
        </figure>
      ) : (
        <p className="gallery__empty">
          Ainda não tem fotos por aqui 💛<br />Adicione as suas fotos favoritas e elas aparecem neste porta-retrato!
        </p>
      )}

      {photos.length > 1 && (
        <div className="gallery__nav">
          <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label="Foto anterior"><Icon name="prev" size={20} /></button>
          <span>{i + 1} / {photos.length}</span>
          <button type="button" className="icon-btn" onClick={() => go(1)} aria-label="Próxima foto"><Icon name="next" size={20} /></button>
        </div>
      )}

      {notice && <p className="gallery__notice">{notice}</p>}

      <div className="gallery__actions">
        <label className={busy ? "btn btn--disabled" : "btn"}>
          <Icon name="plus" size={18} />
          {busy ? "Salvando…" : "Adicionar fotos"}
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={busy}
            onChange={(e) => pick(e.target.files)}
          />
        </label>
        {cur?.id !== undefined && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => confirm("Apagar esta foto?") && onRemove(cur.id!)}
          >
            <Icon name="trash" size={18} />
            Apagar
          </button>
        )}
      </div>
    </Modal>
  );
}
