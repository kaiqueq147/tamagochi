"use client";

import { useMemo, useRef, useState } from "react";
import { CONFIG } from "@/config/config";
import { SHOP_BY_ID } from "@/game/constants";
import type { Slot } from "@/game/types";
import { useFx } from "@/hooks/useFx";
import { useGame, type Feedback } from "@/hooks/useGame";
import { useMounted } from "@/hooks/useMounted";
import { useSpeech } from "@/hooks/useSpeech";
import { ActionBar } from "./ActionBar";
import { FoodMenu } from "./FoodMenu";
import { Gallery } from "./Gallery";
import { Shop } from "./Shop";
import { Hud } from "./Hud";
import { Letter } from "./Letter";
import { MiniGame } from "./MiniGame";
import { Purin, type PurinHandle } from "./Purin";
import { Room } from "./Room";
import { Welcome } from "./Welcome";

/** Porta de entrada: o jogo usa localStorage e Rive, então só monta no navegador. */
export function Game() {
  const mounted = useMounted();
  if (!mounted) return <div className="loading">🍮</div>;
  return <GameScreen />;
}

type Panel = null | "food" | "play" | "letter" | "shop" | "photos";

function GameScreen() {
  const { speech, say } = useSpeech();
  const { items, burst } = useFx();
  const purin = useRef<PurinHandle>(null);
  const [panel, setPanel] = useState<Panel>(null);

  const feedback = useMemo<Feedback>(
    () => ({ say, burst, trigger: (t) => purin.current?.fire(t) }),
    [say, burst]
  );
  const { state, mood, level, progress, actions } = useGame(feedback);

  const close = () => setPanel(null);
  const openPhotos = () => CONFIG.photos.length > 0 && setPanel("photos");

  const worn = (slot: Slot) => SHOP_BY_ID[state.equipado[slot] ?? ""];
  const gear = { cabeca: worn("cabeca")?.emoji, rosto: worn("rosto")?.emoji, pescoco: worn("pescoco")?.emoji };

  return (
    <main className="app">
      <Hud state={state} level={level} progress={progress} onMute={actions.toggleMute} onLetter={() => setPanel("letter")} onPhotos={openPhotos} />

      <Room mood={mood} speech={speech} fx={items} wallpaper={worn("parede")?.id} ornament={worn("enfeite")?.emoji} onPhotos={openPhotos}>
        <Purin ref={purin} mood={mood} gear={gear} onPet={actions.pet} />
      </Room>

      <ActionBar
        sleeping={state.dormindo}
        onFeed={() => actions.openFood() && setPanel("food")}
        onBath={actions.bath}
        onSleep={actions.toggleSleep}
        onPlay={() => actions.openGame() && setPanel("play")}
        onShop={() => setPanel("shop")}
      />

      <footer className="footer">
        Te amo momo{` `}💛{" "}
        <button type="button" className="link" onClick={() => confirm("Começar um novo Purin? O progresso atual será apagado.") && actions.reset()}>
          recomeçar
        </button>
      </footer>

      {panel === "food" && (
        <FoodMenu
          coins={state.moedas}
          onClose={close}
          onPick={(food) => { close(); actions.feed(food); }}
        />
      )}
      {panel === "play" && <MiniGame onFinish={actions.finishGame} onClose={close} />}
      {panel === "letter" && <Letter onClose={close} />}
      {panel === "photos" && <Gallery onClose={close} />}
      {panel === "shop" && <Shop state={state} onBuy={actions.buy} onEquip={actions.equip} onClose={close} />}
      {!state.visto && <Welcome onStart={actions.start} />}
    </main>
  );
}
