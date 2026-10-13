// Copia o rive.wasm (motor de animação) para public/vendor, assim o jogo não depende de CDN.
// Roda automaticamente em: npm install / npm run dev / npm run build
import { createRequire } from "node:module";
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
try {
  const reactCanvas = dirname(require.resolve("@rive-app/react-canvas/package.json"));
  const canvasPkg = require.resolve("@rive-app/canvas/package.json", { paths: [reactCanvas] });
  const src = join(dirname(canvasPkg), "rive.wasm");
  if (!existsSync(src)) throw new Error("rive.wasm não encontrado em " + src);
  mkdirSync("public/vendor", { recursive: true });
  copyFileSync(src, join("public/vendor", "rive.wasm"));
  console.log("rive.wasm copiado para public/vendor");
} catch (e) {
  console.warn("Aviso: não foi possível copiar o rive.wasm (" + e.message + "). O Rive usará o CDN padrão.");
}
