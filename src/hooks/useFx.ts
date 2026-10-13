import { useCallback, useRef, useState } from "react";
import { pick, rand } from "@/utils";

export interface FxItem {
  id: number;
  emoji: string;
  left: number;
  top: number;
  delay: number;
  rotate: number;
  fall: boolean;
}

/** Emojis flutuando sobre o quarto (corações, bolhas, comida caindo...). */
export function useFx() {
  const [items, setItems] = useState<FxItem[]>([]);
  const counter = useRef(0);

  const burst = useCallback((emoji: string | string[], count = 5, fall = false) => {
    const lista = Array.isArray(emoji) ? emoji : [emoji];
    const novos: FxItem[] = Array.from({ length: count }, (_, i) => ({
      id: ++counter.current,
      emoji: pick(lista),
      left: rand(25, 75),
      top: fall ? rand(5, 25) : rand(35, 62),
      delay: i * 0.12,
      rotate: rand(-30, 30),
      fall
    }));
    setItems((prev) => [...prev, ...novos]);
    const ids = new Set(novos.map((n) => n.id));
    window.setTimeout(() => setItems((prev) => prev.filter((p) => !ids.has(p.id))), 2400 + count * 120);
  }, []);

  return { items, burst };
}
