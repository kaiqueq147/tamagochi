/**
 * Fotos enviadas pelo usuário ficam no IndexedDB do navegador (o localStorage é pequeno demais).
 * Nada sai do aparelho: não existe servidor.
 */
const DB_NAME = "purin-emilly";
const STORE = "photos";

export const MAX_PHOTOS = 60;

export interface StoredPhoto {
  id: number;
  blob: Blob;
  caption: string;
  added: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export const listPhotos = () => run<StoredPhoto[]>("readonly", (s) => s.getAll());

export const addPhoto = (blob: Blob, caption = "") =>
  run("readwrite", (s) => s.add({ blob, caption, added: Date.now() }));

export const removePhoto = (id: number) => run("readwrite", (s) => s.delete(id));

export async function setPhotoCaption(id: number, caption: string) {
  const cur = await run<StoredPhoto | undefined>("readonly", (s) => s.get(id));
  if (cur) await run("readwrite", (s) => s.put({ ...cur, caption }));
}

/** Reduz a foto (lado maior = `max` px) e converte para JPEG, para ocupar pouco espaço. */
export async function shrinkImage(file: File, max = 1280, quality = 0.85): Promise<Blob> {
  const bmp = await createImageBitmap(file); // já respeita a rotação do celular (EXIF)
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas indisponível");
  ctx.fillStyle = "#fff"; // PNG com transparência vira fundo branco
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("falha ao converter"))), "image/jpeg", quality)
  );
}
