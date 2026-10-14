import { asset } from "@/utils";

/** Nuvenzinhas da fumaça: deslocamento (dx, dy), tamanho final e atraso, em % da largura do Purin. */
const SMOKE = [
  { dx: -6, dy: -14, s: 2.2, d: 0 },
  { dx: 4, dy: -18, s: 2.6, d: 0.15 },
  { dx: -14, dy: -22, s: 2.8, d: 0.3 },
  { dx: 10, dy: -24, s: 2.4, d: 0.45 },
  { dx: -4, dy: -30, s: 3.2, d: 0.6 },
  { dx: 16, dy: -28, s: 2.6, d: 0.75 },
  { dx: -18, dy: -32, s: 3.0, d: 0.9 },
  { dx: 2, dy: -38, s: 3.6, d: 1.05 }
];

/**
 * Animação do Purin tragando: o vape (vape.svg) sobe até a boca, acende o LED
 * e depois ele solta a fumaça. Tudo em CSS; dura ~5s (veja `.vape` no globals.css).
 */
export function Vape() {
  return (
    <span className="vape" aria-hidden>
      <span className="vape__device">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("vape.svg")} alt="" draggable={false} />
        <span className="vape__led" />
      </span>
      {SMOKE.map((c, i) => (
        <span
          key={i}
          className="vape__smoke"
          style={{
            ["--dx" as string]: `${c.dx}cqw`,
            ["--dy" as string]: `${c.dy}cqw`,
            ["--s" as string]: c.s,
            animationDelay: `${2.2 + c.d}s`
          }}
        />
      ))}
    </span>
  );
}
