"use client";

import { useState } from "react";
import { CONFIG } from "@/config/config";
import { photo } from "@/utils";
import { Modal } from "./Modal";

export function Gallery({ onClose }: { onClose: () => void }) {
  const photos = CONFIG.photos;
  const [i, setI] = useState(0);
  const cur = photos[i];
  if (!cur) return null;

  const go = (d: number) => setI((n) => (n + d + photos.length) % photos.length);

  return (
    <Modal title="Nossas fotinhas 📷" onClose={onClose}>
      <figure className="gallery">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={cur.file} className="gallery__img" src={photo(cur.file)} alt={cur.caption} />
        <figcaption>{cur.caption}</figcaption>
      </figure>
      {photos.length > 1 && (
        <div className="gallery__nav">
          <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label="Foto anterior">‹</button>
          <span>{i + 1} / {photos.length}</span>
          <button type="button" className="icon-btn" onClick={() => go(1)} aria-label="Próxima foto">›</button>
        </div>
      )}
    </Modal>
  );
}
