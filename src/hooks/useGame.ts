import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { sfx } from "@/audio/sfx";
import { CONFIG } from "@/config/config";
import { MINIGAME, VAPE_MS } from "@/game/constants";
import { coinsFor, getMood, isClean, isFull, loveLevel, loveProgress, owns } from "@/game/logic";
import { buildLoveMessages, buildMessages } from "@/game/messages";
import { gameReducer } from "@/game/reducer";
import { loadGame, saveGame } from "@/game/storage";
import type { Food, GameAction, PurinTrigger, SfxName, ShopItem, Slot } from "@/game/types";
import { pick, wait } from "@/utils";

/** Tudo que o jogo "mostra" ao jogador além do estado: fala, efeitos e animação do Purin. */
export interface Feedback {
  say: (text: string, ms?: number) => void;
  burst: (emoji: string | string[], count?: number, fall?: boolean) => void;
  trigger: (t: PurinTrigger) => void;
  vape: () => void;
}

const P = CONFIG.partner;
const play = (n: SfxName) => sfx.play(n);

/**
 * Cérebro do jogo: guarda o estado (reducer), faz o tempo passar, salva no navegador
 * e expõe as ações que a interface pode chamar.
 * ⚠️ Usa localStorage: só monte este hook no navegador (veja `Game.tsx`).
 */
export function useGame(fb: Feedback) {
  const boot = useMemo(() => loadGame(), []);
  const [state, dispatch] = useReducer(gameReducer, boot.state);
  const messages = useMemo(() => buildMessages(P), []);
  const loveLines = useMemo(() => buildLoveMessages(P), []);

  // escolhe uma frase sem repetir a última que foi dita
  const vaping = useRef(false);
  const lastLine = useRef("");
  const pickFresh = useCallback((list: readonly string[]) => {
    const options = list.length > 1 ? list.filter((l) => l !== lastLine.current) : list;
    const line = pick(options);
    lastLine.current = line;
    return line;
  }, []);

  // sempre o estado mais recente, para as ações validarem sem depender de closures antigas
  const stateRef = useRef(state);
  const fbRef = useRef(fb);
  fbRef.current = fb;

  const commit = useCallback((action: GameAction) => {
    const prev = stateRef.current;
    const next = gameReducer(prev, action);
    stateRef.current = next;
    dispatch(action);
    if (loveLevel(next) > loveLevel(prev)) {
      const { say, burst, trigger } = fbRef.current;
      play("nivel");
      burst(["💛", "🎉", "✨", "💗"], 9);
      trigger("pular");
      say(`Nível de amor ${loveLevel(next)}! ${P}, você cuida tão bem de mim! 💛`, 5200);
    }
  }, []);

  useEffect(() => { stateRef.current = state; }, [state]);

  /* ---------- tempo, salvamento e som ---------- */
  useEffect(() => {
    const tick = () => commit({ type: "tick", now: Date.now() });
    const id = window.setInterval(tick, 1000);
    const onVisible = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearInterval(id); document.removeEventListener("visibilitychange", onVisible); };
  }, [commit]);

  useEffect(() => { saveGame(state); }, [state]);
  useEffect(() => { sfx.setMuted(state.mudo); }, [state.mudo]);

  /* ---------- boas-vindas ao voltar ---------- */
  useEffect(() => {
    if (!boot.state.visto) return;
    fbRef.current.say(
      boot.offline > 30 ? `${P}, que saudade Você demorou 🥺` : `Bem-vinda de volta, ${P}! 💛`,
      5000
    );
  }, [boot]);

  /* ---------- acordar sozinho ---------- */
  const manualWake = useRef(false);
  const wasSleeping = useRef(state.dormindo);
  useEffect(() => {
    if (wasSleeping.current && !state.dormindo) {
      if (manualWake.current) manualWake.current = false;
      else {
        fbRef.current.say(`Bom dia, ${P} ☀️`);
        fbRef.current.trigger("pular");
      }
    }
    wasSleeping.current = state.dormindo;
  }, [state.dormindo]);

  /* ---------- ações ---------- */
  const shh = useCallback(() => {
    fbRef.current.say("o Pompom está dormindo 😴", 2200);
    play("erro");
  }, []);

  const refuse = useCallback((text: string) => {
    fbRef.current.say(text);
    play("erro");
  }, []);

  const actions = useMemo(() => ({
    /** Pode abrir o menu de comida? */
    openFood(): boolean {
      if (stateRef.current.dormindo) { shh(); return false; }
      return true;
    },

    async feed(food: Food) {
      if (isFull(stateRef.current)) return refuse("Estou cheinho Não consigo comer mais ");
      const { say, burst, trigger } = fbRef.current;
      commit({ type: "feed", food });
      burst(food.emoji, 1, true);
      trigger("comer");
      play("comer");
      await wait(1300);
      burst(["💛", "✨"], 3);
      say(pick([`Hmm, delícia! Obrigado, ${P}! 😋`, "Que gostoso! 🍮", `${P} cuida tão bem de mim!`]));
    },

    async bath() {
      const s = stateRef.current;
      if (s.dormindo) return shh();
      if (isClean(s)) return refuse("Já estou limpinho e cheiroso ");
      const { say, burst, trigger } = fbRef.current;
      trigger("banho");
      burst(["🫧", "🛁", "🫧", "💦"], 10);
      play("banho");
      say("Hihi, que cócegas! 🫧", 2000);
      await wait(1800);
      commit({ type: "bath" });
      burst(["✨", "🌟"], 5);
      say(`Estou limpinho, ${P} Obrigado`);
    },

    /** Purin dá uma tragada no vape de morango gelado e solta a fumaça. */
    async vape() {
      if (stateRef.current.dormindo) return shh();
      if (vaping.current) return;
      vaping.current = true;
      try {
        const { say, burst, vape } = fbRef.current;
        vape();
        play("tragar");
        await wait(2200);
        play("soprar");
        commit({ type: "vape" });
        burst(["💨", "🍓", "❄️"], 4);
        say(pick([
          `... 💨, ${P}! 🍓❄️`,
          "Ahhh pod é melhor que kaique 😮‍💨🍓",
          `${P}, amo meu pod 💨`
        ]), 4200);
        // espera a animação terminar por completo antes de aceitar outra tragada
        await wait(VAPE_MS - 2200);
      } finally {
        // sempre libera, mesmo se algo falhar no meio (senão o botão "trava")
        vaping.current = false;
      }
    },

    toggleSleep() {
      const s = stateRef.current;
      const { say } = fbRef.current;
      if (s.dormindo) {
        manualWake.current = true;
        commit({ type: "sleep", value: false });
        say("Hmm... bom dia! ☀️");
        play("clique");
      } else if (s.energia > 90) {
        refuse("Ainda não estou com sono");
      } else {
        commit({ type: "sleep", value: true });
        play("dormir");
        say(`Boa noite ${P}... `, 2800);
      }
    },

    pet() {
      if (stateRef.current.dormindo) return shh();
      const { say, burst, trigger } = fbRef.current;
      commit({ type: "pet" });
      burst(["💛", "💗", "💕"], 4);
      trigger("carinho");
      play("feliz");
      // carinho sempre rende uma frase bonita
      say(pickFresh(loveLines));
    },

    /** Pode começar o mini-game? */
    openGame(): boolean {
      const s = stateRef.current;
      if (s.dormindo) { shh(); return false; }
      if (s.energia < MINIGAME.minEnergy) { refuse("Estou cansado demais pra brincar"); return false; }
      if (s.fome < MINIGAME.minFood) { refuse("Com a barriga vazia não consigo brincar"); return false; }
      return true;
    },

    /** Aplica o resultado do mini-game e devolve as moedas ganhas. */
    finishGame(points: number): number {
      commit({ type: "play", points });
      return coinsFor(points);
    },

    start() {
      commit({ type: "seen" });
      play("feliz");
      fbRef.current.burst(["💛", "🍮", "✨"], 8);
      fbRef.current.say(`Oi, ${P}! Que bom que você chegou`, 5000);
    },

    buy(item: ShopItem) {
      const s = stateRef.current;
      if (owns(s, item)) return;
      if (s.moedas < item.preco) return refuse(`Faltam moedas, ${P}! Brinque um pouquinho comigo 🪙`);
      const { say, burst, trigger } = fbRef.current;
      commit({ type: "buy", item });
      play("moeda");
      burst([item.emoji, "✨", "💛"], 6);
      trigger("pular");
      say(pick([
        `Que lindo! Obrigado, ${P}! ${item.emoji}💛`,
        `Amei o presente, ${P}! ${item.emoji}`,
        `Fiquei chique, né? ${item.emoji}✨`
      ]));
    },

    equip(slot: Slot, id: string | null) {
      commit({ type: "equip", slot, id });
      play("clique");
      if (id) {
        fbRef.current.burst(["✨"], 3);
        fbRef.current.trigger("pular");
      }
    },

    toggleMute() { commit({ type: "toggleMute" }); },

    reset() {
      commit({ type: "reset" });
      fbRef.current.say(`Um novo começo com você, ${P}`);
    },

    idleTalk() {
      fbRef.current.say(pickFresh(messages[getMood(stateRef.current)] ?? messages.ok), 5200);
    }
  }), [commit, loveLines, messages, pickFresh, refuse, shh]);

  /* ---------- o Purin puxa assunto de tempos em tempos ---------- */
  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        const s = stateRef.current;
        if (s.visto && !document.hidden) {
          actions.idleTalk();
          // quando está bem, às vezes solta um coraçãozinho junto
          if (!s.dormindo && Math.random() < 0.5) fbRef.current.burst(["💛", "💕"], 2);
        }
        schedule();
      }, 14000 + Math.random() * 10000);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [actions]);

  return {
    state,
    mood: getMood(state),
    level: loveLevel(state),
    progress: loveProgress(state),
    actions
  };
}
