import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIG } from "@/config/config";
import { MAX_PHOTOS, addPhoto, listPhotos, removePhoto, setPhotoCaption, shrinkImage } from "@/game/photos";
import { photo } from "@/utils";

export interface GalleryPhoto {
  key: string;
  src: string;
  caption: string;
  /** só as fotos enviadas pelo usuário têm id (e podem ser apagadas/editadas) */
  id?: number;
}

export interface AddResult {
  added: number;
  failed: number;
  full: boolean;
}

/** Fotos fixas do config + fotos enviadas pelo usuário (guardadas no IndexedDB). */
export function usePhotos() {
  const [uploaded, setUploaded] = useState<GalleryPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const urls = useRef<string[]>([]);

  const revokeAll = () => {
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = [];
  };

  const refresh = useCallback(async () => {
    try {
      const rows = (await listPhotos()).sort((a, b) => a.added - b.added);
      revokeAll();
      setUploaded(
        rows.map((r) => {
          const src = URL.createObjectURL(r.blob);
          urls.current.push(src);
          return { key: `u${r.id}`, id: r.id, src, caption: r.caption };
        })
      );
    } catch {
      /* navegador sem IndexedDB (ex.: aba anônima antiga): só as fotos fixas */
    }
  }, []);

  useEffect(() => {
    refresh();
    return revokeAll;
  }, [refresh]);

  const add = useCallback(
    async (files: File[]): Promise<AddResult> => {
      setBusy(true);
      let added = 0, failed = 0, full = false;
      let count = uploaded.length;
      for (const file of files) {
        if (count >= MAX_PHOTOS) { full = true; break; }
        try {
          await addPhoto(await shrinkImage(file));
          added++; count++;
        } catch {
          failed++;
        }
      }
      if (added) {
        await refresh();
        // pede ao navegador para não apagar as fotos quando faltar espaço
        navigator.storage?.persist?.().catch(() => {});
      }
      setBusy(false);
      return { added, failed, full };
    },
    [uploaded.length, refresh]
  );

  const remove = useCallback(async (id: number) => {
    await removePhoto(id);
    await refresh();
  }, [refresh]);

  const setCaption = useCallback(async (id: number, caption: string) => {
    setUploaded((list) => list.map((p) => (p.id === id ? { ...p, caption } : p)));
    await setPhotoCaption(id, caption);
  }, []);

  const builtin: GalleryPhoto[] = CONFIG.photos.map((p) => ({ key: `b${p.file}`, src: photo(p.file), caption: p.caption }));

  return { photos: [...builtin, ...uploaded], busy, add, remove, setCaption };
}
