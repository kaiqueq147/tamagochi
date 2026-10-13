import type { Food, Mood, StatKey } from "./types";

export const SAVE_KEY = "purin-emilly-v1";

export const STATS: { key: StatKey; icon: string; label: string }[] = [
  { key: "fome", icon: "🍮", label: "Fome" },
  { key: "feliz", icon: "💗", label: "Felicidade" },
  { key: "energia", icon: "⚡", label: "Energia" },
  { key: "higiene", icon: "🫧", label: "Higiene" }
];

export const FOODS: Food[] = [
  { id: "pudim", nome: "Pudim do Purin", emoji: "🍮", preco: 0, fome: 22, feliz: 4, desc: "Grátis e o preferido dele!" },
  { id: "morango", nome: "Morango", emoji: "🍓", preco: 4, fome: 12, feliz: 9, desc: "Docinho e fresquinho" },
  { id: "cookie", nome: "Cookie", emoji: "🍪", preco: 6, fome: 18, feliz: 12, desc: "Crocante e gostoso" },
  { id: "bolo", nome: "Fatia de bolo", emoji: "🍰", preco: 9, fome: 32, feliz: 16, desc: "Uma festa na boca!" }
];

/** Variação por minuto de cada atributo */
export const RATE = {
  acordado: { fome: -2.0, feliz: -1.4, energia: -1.0, higiene: -1.2 },
  dormindo: { fome: -0.7, feliz: -0.3, energia: +7.0, higiene: -0.4 }
} as const;

/** Número enviado ao input `humor` da state machine do Rive */
export const MOOD_ID: Record<Mood, number> = {
  ok: 0, happy: 1, sad: 2, hungry: 3, dirty: 4, tired: 5, sleeping: 6
};

/** Quanto de amor cada ação rende */
export const LOVE = { feed: 1, bath: 1, pet: 0.5, play: 2, perLevel: 10 } as const;

export const MINIGAME = { duration: 40, lives: 3, minEnergy: 20, minFood: 10 } as const;

/** Offline: no máximo 8h, e o tempo passa na metade da velocidade */
export const OFFLINE = { maxMinutes: 8 * 60, factor: 0.5, thresholdMinutes: 2 } as const;
