import { useCallback, useEffect, useRef, useState } from "react";

export interface Speech { id: number; text: string }

/** Balão de fala do Purin. Cada nova fala reinicia a animação (por causa do `id`). */
export function useSpeech() {
  const [speech, setSpeech] = useState<Speech | null>(null);
  const timer = useRef<number>(0);
  const counter = useRef(0);

  const say = useCallback((text: string, ms = 4200) => {
    window.clearTimeout(timer.current);
    setSpeech({ id: ++counter.current, text });
    timer.current = window.setTimeout(() => setSpeech(null), ms);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { speech, say };
}
