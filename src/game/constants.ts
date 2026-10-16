import type { IconName } from "@/components/Icon";
import type { Food, Mood, ShopItem, Slot, StatKey } from "./types";

export const SAVE_KEY = "purin-emilly-v1";

export const STATS: { key: StatKey; icon: IconName; label: string }[] = [
  { key: "fome", icon: "pudding", label: "Fome" },
  { key: "feliz", icon: "heart", label: "Felicidade" },
  { key: "energia", icon: "bolt", label: "Energia" },
  { key: "higiene", icon: "drops", label: "Higiene" }
];

export const FOODS: Food[] = [
  { id: "pudim", nome: "Pudim do Purin", emoji: "🍮", preco: 0, fome: 22, feliz: 4, desc: "Grátis e o preferido dele!" },
  { id: "morango", nome: "Morango", emoji: "🍓", preco: 4, fome: 12, feliz: 9, desc: "Docinho e fresquinho" },
  { id: "cookie", nome: "Cookie", emoji: "🍪", preco: 6, fome: 18, feliz: 12, desc: "Crocante e gostoso" },
  { id: "bolo", nome: "Fatia de bolo", emoji: "🍰", preco: 9, fome: 32, feliz: 16, desc: "Uma festa na boca!" },
  { id: "sorvete", nome: "Sorvete", emoji: "🍦", preco: 5, fome: 14, feliz: 12, desc: "Geladinho e cremoso" },
  { id: "donut", nome: "Donut", emoji: "🍩", preco: 7, fome: 20, feliz: 14, desc: "Com cobertura rosa" },
  { id: "cupcake", nome: "Cupcake", emoji: "🧁", preco: 8, fome: 26, feliz: 15, desc: "Fofinho e doce" }
];

export const SLOT_LABEL: Record<Slot, string> = {
  cabeca: "Chapéus",
  rosto: "Óculos",
  pescoco: "Pescoço",
  parede: "Papel de parede",
  piso: "Piso",
  enfeite: "Enfeites"
};

/** Item que vale quando nada foi escolhido (grátis, sempre disponível) */
export const DEFAULT_ITEM: Partial<Record<Slot, string>> = { parede: "creme", piso: "piso-madeira" };

/** Slots que aparecem em cada aba da loja */
export const SHOP_TABS: { id: string; label: string; slots: Slot[] }[] = [
  { id: "roupas", label: "👗 Roupinhas", slots: ["cabeca", "rosto", "pescoco"] },
  { id: "quarto", label: "🏠 Quarto", slots: ["parede", "piso", "enfeite"] }
];

/** Catálogo da loja. `parede` usa o id como classe CSS (`wall--<id>`). */
export const SHOP: ShopItem[] = [
  { id: "coroa", slot: "cabeca", nome: "Coroinha", emoji: "👑", preco: 30 },
  { id: "flor", slot: "cabeca", nome: "Florzinha", emoji: "🌸", preco: 12 },
  { id: "cartola", slot: "cabeca", nome: "Cartola", emoji: "🎩", preco: 25 },
  { id: "estrela", slot: "cabeca", nome: "Estrelinha", emoji: "⭐", preco: 15 },
  { id: "palha", slot: "cabeca", nome: "Chapéu de palha", emoji: "👒", preco: 18 },
  { id: "bone", slot: "cabeca", nome: "Boné", emoji: "🧢", preco: 16 },
  { id: "capelo", slot: "cabeca", nome: "Capelo", emoji: "🎓", preco: 22 },
  { id: "girassol", slot: "cabeca", nome: "Girassol", emoji: "🌻", preco: 14 },
  { id: "moranguinho", slot: "cabeca", nome: "Moranguinho", emoji: "🍓", preco: 12 },
  { id: "borboleta", slot: "cabeca", nome: "Borboleta", emoji: "🦋", preco: 16 },

  { id: "oculos", slot: "rosto", nome: "Óculos", emoji: "👓", preco: 10 },
  { id: "solar", slot: "rosto", nome: "Óculos escuros", emoji: "🕶️", preco: 15 },
  { id: "mergulho", slot: "rosto", nome: "Óculos de natação", emoji: "🥽", preco: 18 },
  { id: "mascara", slot: "rosto", nome: "Máscara de festa", emoji: "🎭", preco: 22 },

  { id: "laco", slot: "pescoco", nome: "Laço", emoji: "🎀", preco: 8 },
  { id: "cachecol", slot: "pescoco", nome: "Cachecol", emoji: "🧣", preco: 14 },
  { id: "sino", slot: "pescoco", nome: "Sininho", emoji: "🔔", preco: 10 },
  { id: "colar", slot: "pescoco", nome: "Colar de coração", emoji: "💛", preco: 20 },
  { id: "flores", slot: "pescoco", nome: "Colar de flores", emoji: "🌺", preco: 16 },
  { id: "medalha", slot: "pescoco", nome: "Medalha", emoji: "🏅", preco: 18 },
  // não existe emoji de esmeralda: usamos 💎 e o CSS (`.item--esmeralda`) pinta de verde
  { id: "esmeralda", slot: "pescoco", nome: "Esmeralda", emoji: "💎", preco: 35 },

  { id: "creme", slot: "parede", nome: "Creme (padrão)", emoji: "🟨", preco: 0 },
  { id: "rosa", slot: "parede", nome: "Rosinha", emoji: "🌷", preco: 20 },
  { id: "menta", slot: "parede", nome: "Menta", emoji: "🍃", preco: 20 },
  { id: "lavanda", slot: "parede", nome: "Lavanda", emoji: "💜", preco: 20 },
  { id: "limao", slot: "parede", nome: "Limãozinho", emoji: "🍋", preco: 20 },
  { id: "ceu", slot: "parede", nome: "Céu de nuvens", emoji: "☁️", preco: 25 },
  { id: "coracao", slot: "parede", nome: "Coraçõezinhos", emoji: "💕", preco: 28 },
  { id: "xadrez", slot: "parede", nome: "Piquenique", emoji: "🧺", preco: 25 },
  { id: "noite", slot: "parede", nome: "Céu estrelado", emoji: "🌌", preco: 30 },

  { id: "piso-madeira", slot: "piso", nome: "Madeira (padrão)", emoji: "🟫", preco: 0 },
  { id: "piso-rosa", slot: "piso", nome: "Rosinha", emoji: "🌸", preco: 15 },
  { id: "piso-grama", slot: "piso", nome: "Gramado", emoji: "🌿", preco: 20 },
  { id: "piso-xadrez", slot: "piso", nome: "Xadrez", emoji: "🏁", preco: 22 },
  { id: "piso-azulejo", slot: "piso", nome: "Azulejo", emoji: "🟦", preco: 22 },

  { id: "planta", slot: "enfeite", nome: "Plantinha", emoji: "🪴", preco: 15 },
  { id: "ursinho", slot: "enfeite", nome: "Ursinho", emoji: "🧸", preco: 20 },
  { id: "arco-iris", slot: "enfeite", nome: "Arco-íris", emoji: "🌈", preco: 25 },
  { id: "balao", slot: "enfeite", nome: "Balão", emoji: "🎈", preco: 12 },
  { id: "abajur", slot: "enfeite", nome: "Abajur", emoji: "💡", preco: 22 },
  { id: "relogio", slot: "enfeite", nome: "Relógio", emoji: "🕰️", preco: 20 },
  { id: "patinho", slot: "enfeite", nome: "Patinho", emoji: "🦆", preco: 15 },
  { id: "cupcake", slot: "enfeite", nome: "Cupcake", emoji: "🧁", preco: 18 },
  { id: "pudim-gigante", slot: "enfeite", nome: "Pudim gigante", emoji: "🍮", preco: 40 }
];

export const SHOP_BY_ID: Record<string, ShopItem> = Object.fromEntries(SHOP.map((i) => [i.id, i]));

/** Variação por minuto de cada atributo */
export const RATE = {
  acordado: { fome: -2.0, feliz: -1.4, energia: -1.0, higiene: -1.2 },
  dormindo: { fome: -0.7, feliz: -0.3, energia: +7.0, higiene: -0.4 }
} as const;

/** Número enviado ao input `humor` da state machine do Rive */
export const MOOD_ID: Record<Mood, number> = {
  ok: 0, happy: 1, sad: 2, hungry: 3, dirty: 4, tired: 5, sleeping: 6
};

/** Texto curtinho que mostra como o Purin está se sentindo */
export const MOOD_LABEL: Record<Mood, string> = {
  ok: "Tranquilo",
  happy: "Feliz",
  sad: "Tristinho",
  hungry: "Com fome",
  dirty: "Sujinho",
  tired: "Cansado",
  sleeping: "Dormindo"
};

/** Quanto de amor cada ação rende */
export const LOVE = { feed: 1, bath: 1, pet: 0.5, play: 2, gift: 1, perLevel: 10 } as const;

/** Duração total da animação de tragar + soltar fumaça (ms). A última nuvem termina em ~6s. */
export const VAPE_MS = 6200;

export const MINIGAME = { duration: 40, lives: 3, minEnergy: 20, minFood: 10 } as const;

/** Offline: no máximo 8h, e o tempo passa na metade da velocidade */
export const OFFLINE = { maxMinutes: 8 * 60, factor: 0.5, thresholdMinutes: 2 } as const;
