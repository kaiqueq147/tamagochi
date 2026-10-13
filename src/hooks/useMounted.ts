import { useEffect, useState } from "react";

/** `true` só depois que o componente montou no navegador (evita diferença entre servidor e cliente). */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
