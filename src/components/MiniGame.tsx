"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "@/audio/sfx";
import { MINIGAME } from "@/game/constants";
import { coinsFor } from "@/game/logic";
import { asset, pick, rand } from "@/utils";
import { Modal } from "./Modal";

interface Drop {
  id: number;
  emoji: string;
  x: number; // % da largura
  y: number; // % da altura
  speed: number; // % por segundo
  bad: boolean;
  worth: number;
}

const GOOD = ["🍮", "🍮", "🍓", "🍪"];
const HEARTS = "💛";
const BAD = "🥒";

interface Props {
  onFinish: (points: number) => number;
  onClose: () => void;
}

/** Mini-game: mova o Purin e pegue as guloseimas. Picles tira uma vida! */
export function MiniGame({ onFinish, onClose }: Props) {
  const arena = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"intro" | "playing" | "over">("intro");
  const [view, setView] = useState({ score: 0, lives: MINIGAME.lives as number, time: MINIGAME.duration as number });
  const [drops, setDrops] = useState<Drop[]>([]);
  const [px, setPx] = useState(50);
  const [earned, setEarned] = useState(0);

  const game = useRef({ score: 0, lives: MINIGAME.lives as number, time: MINIGAME.duration as number, px: 50, drops: [] as Drop[], next: 0, spawn: 0, id: 0 });
  const keys = useRef({ left: false, right: false });

  const start = () => {
    game.current = { score: 0, lives: MINIGAME.lives, time: MINIGAME.duration, px: 50, drops: [], next: 0, spawn: 0, id: 0 };
    setView({ score: 0, lives: MINIGAME.lives, time: MINIGAME.duration });
    setDrops([]);
    setPx(50);
    setPhase("playing");
  };

  const finish = useCallback(() => {
    setEarned(onFinish(game.current.score));
    setPhase("over");
  }, [onFinish]);

  /* controles: ponteiro + setas */
  const moveTo = (clientX: number) => {
    const r = arena.current?.getBoundingClientRect();
    if (!r) return;
    game.current.px = Math.min(92, Math.max(8, ((clientX - r.left) / r.width) * 100));
  };

  useEffect(() => {
    const set = (v: boolean) => (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = v;
      if (e.key === "ArrowRight" || e.key === "d") keys.current.right = v;
    };
    const down = set(true), up = set(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  /* loop do jogo */
  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = game.current;

      g.time -= dt;
      if (keys.current.left) g.px = Math.max(8, g.px - 85 * dt);
      if (keys.current.right) g.px = Math.min(92, g.px + 85 * dt);

      g.spawn -= dt;
      if (g.spawn <= 0) {
        const bad = Math.random() < 0.22;
        const heart = !bad && Math.random() < 0.1;
        g.drops.push({
          id: ++g.id,
          emoji: bad ? BAD : heart ? HEARTS : pick(GOOD),
          x: rand(8, 92),
          y: -8,
          speed: rand(38, 62) + (MINIGAME.duration - g.time) * 0.6,
          bad,
          worth: heart ? 2 : 1
        });
        g.spawn = rand(0.45, 0.85);
      }

      const keep: Drop[] = [];
      for (const d of g.drops) {
        d.y += d.speed * dt;
        const caught = d.y >= 78 && d.y <= 96 && Math.abs(d.x - g.px) < 12;
        if (caught) {
          if (d.bad) { g.lives -= 1; sfx.play("ai"); }
          else { g.score += d.worth; sfx.play("moeda"); }
        } else if (d.y < 108) keep.push(d);
      }
      g.drops = keep;

      setDrops(keep.map((d) => ({ ...d })));
      setPx(g.px);
      setView({ score: g.score, lives: g.lives, time: Math.max(0, g.time) });

      if (g.time <= 0 || g.lives <= 0) { finish(); return; }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, finish]);

  return (
    <Modal title="Pega-pega do Purin 🎮" onClose={onClose}>
      <div className="mg">
        <div className="mg__hud">
          <span>⭐ {view.score}</span>
          <span>{"❤️".repeat(Math.max(0, view.lives))}{"🖤".repeat(Math.max(0, MINIGAME.lives - view.lives))}</span>
          <span>⏱️ {Math.ceil(view.time)}s</span>
        </div>

        <div
          ref={arena}
          className="mg__arena"
          onPointerMove={(e) => phase === "playing" && moveTo(e.clientX)}
          onPointerDown={(e) => phase === "playing" && moveTo(e.clientX)}
        >
          {drops.map((d) => (
            <span key={d.id} className="mg__drop" style={{ left: `${d.x}%`, top: `${d.y}%` }}>{d.emoji}</span>
          ))}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="mg__purin" style={{ left: `${px}%` }} src={asset("purin-base.png")} alt="" draggable={false} />

          {phase === "intro" && (
            <div className="mg__cover">
              <p>Arraste (ou use ← →) para pegar 🍮🍓🍪💛.<br />Cuidado com o picles 🥒!</p>
              <button type="button" className="btn" onClick={start}>Começar!</button>
            </div>
          )}
          {phase === "over" && (
            <div className="mg__cover">
              <p>
                <strong>{view.score} pontos!</strong><br />
                Você ganhou 🪙 {earned || coinsFor(view.score)}
              </p>
              <div className="mg__row">
                <button type="button" className="btn" onClick={start}>Jogar de novo</button>
                <button type="button" className="btn btn--ghost" onClick={onClose}>Voltar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
