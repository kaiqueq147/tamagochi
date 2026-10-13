export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Prefixo quando o site é publicado em subpasta (ex.: GitHub Pages). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Caminho de arquivos da pasta `public/assets` (funciona em qualquer hospedagem). */
export const asset = (file: string) => `${BASE_PATH}/assets/${file}`;
