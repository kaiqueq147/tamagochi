"use client";

import { Alignment, Fit, Layout, RuntimeLoader, useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { useEffect, useImperativeHandle, useState, type Ref } from "react";
import { MOOD_ID } from "@/game/constants";
import type { Mood, PurinTrigger } from "@/game/types";
import { BASE_PATH, asset } from "@/utils";

// o .wasm do Rive fica em /public/vendor (copiado no `npm install`) — funciona offline
RuntimeLoader.setWasmUrl(`${BASE_PATH}/vendor/rive.wasm`);

const STATE_MACHINE = "Purin";

export interface PurinHandle {
  fire: (t: PurinTrigger) => void;
}

/** Emojis das roupinhas equipadas em cada espaço do Purin */
export type Gear = Partial<Record<"cabeca" | "rosto" | "pescoco", string>>;

interface Props {
  mood: Mood;
  gear?: Gear;
  ref?: Ref<PurinHandle>;
  onPet?: () => void;
}

/**
 * O Purin animado. Toda a animação vive em `public/assets/purin.riv` (state machine "Purin"):
 *  - input numérico `humor` escolhe a expressão
 *  - triggers `comer`, `banho`, `carinho`, `pular` disparam animações pontuais
 * Se o Rive falhar por qualquer motivo, mostramos a imagem estática com uma animação CSS.
 */
export function Purin({ mood, gear, ref, onPet }: Props) {
  const [failed, setFailed] = useState(false);

  const { rive, RiveComponent } = useRive({
    src: asset("purin.riv"),
    stateMachine: STATE_MACHINE,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter }),
    onLoadError: () => setFailed(true)
  });

  const humor = useStateMachineInput(rive, STATE_MACHINE, "humor", 0);
  const comer = useStateMachineInput(rive, STATE_MACHINE, "comer");
  const banho = useStateMachineInput(rive, STATE_MACHINE, "banho");
  const carinho = useStateMachineInput(rive, STATE_MACHINE, "carinho");
  const pular = useStateMachineInput(rive, STATE_MACHINE, "pular");

  useEffect(() => {
    if (humor) humor.value = MOOD_ID[mood];
  }, [humor, mood]);

  useImperativeHandle(
    ref,
    () => ({
      fire(t) {
        ({ comer, banho, carinho, pular })[t]?.fire();
      }
    }),
    [comer, banho, carinho, pular]
  );

  return (
    <button type="button" className={`purin purin--${mood}`} onClick={onPet} aria-label="Fazer carinho no Purin">
      {failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="purin__fallback" src={asset("purin-base.png")} alt="Pompompurin" draggable={false} />
      ) : (
        <RiveComponent className="purin__rive" />
      )}
      {gear && (
        <span className="gear" aria-hidden>
          {gear.pescoco && <span className="gear__item gear__item--pescoco">{gear.pescoco}</span>}
          {gear.rosto && <span className="gear__item gear__item--rosto">{gear.rosto}</span>}
          {gear.cabeca && <span className="gear__item gear__item--cabeca">{gear.cabeca}</span>}
        </span>
      )}
    </button>
  );
}
