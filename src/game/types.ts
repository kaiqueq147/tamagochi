export type StatKey = "fome" | "feliz" | "energia" | "higiene";

export interface GameState {
  fome: number;
  feliz: number;
  energia: number;
  higiene: number;
  moedas: number;
  amor: number;
  dormindo: boolean;
  /** já viu a tela de boas-vindas */
  visto: boolean;
  mudo: boolean;
  /** ids dos itens da loja já comprados */
  itens: string[];
  /** item equipado em cada espaço (roupinha / decoração) */
  equipado: Partial<Record<Slot, string>>;
  criado: number;
  /** timestamp da última atualização do tempo */
  ultimo: number;
}

/** Onde cada item da loja é colocado */
export type Slot = "cabeca" | "rosto" | "pescoco" | "parede" | "enfeite";

export interface ShopItem {
  id: string;
  slot: Slot;
  nome: string;
  emoji: string;
  preco: number;
}

export type Mood = "ok" | "happy" | "sad" | "hungry" | "dirty" | "tired" | "sleeping";

/** Gatilhos (triggers) da state machine do Rive */
export type PurinTrigger = "comer" | "banho" | "carinho" | "pular";

export interface Food {
  id: string;
  nome: string;
  emoji: string;
  preco: number;
  fome: number;
  feliz: number;
  desc: string;
}

export type SfxName =
  | "clique" | "comer" | "feliz" | "banho" | "nivel" | "erro" | "moeda" | "ai" | "dormir"
  | "tragar" | "soprar";

/** Ações que mudam o estado do jogo (reducer puro). */
export type GameAction =
  | { type: "tick"; now: number }
  | { type: "feed"; food: Food }
  | { type: "bath" }
  | { type: "sleep"; value: boolean }
  | { type: "pet" }
  | { type: "play"; points: number }
  | { type: "vape" }
  | { type: "buy"; item: ShopItem }
  | { type: "equip"; slot: Slot; id: string | null }
  | { type: "seen" }
  | { type: "toggleMute" }
  | { type: "reset" };
