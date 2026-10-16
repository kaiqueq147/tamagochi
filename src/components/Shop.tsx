"use client";

import { useState } from "react";
import { DEFAULT_ITEM, SHOP, SHOP_TABS, SLOT_LABEL } from "@/game/constants";
import { owns } from "@/game/logic";
import type { GameState, ShopItem, Slot } from "@/game/types";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

interface ShopProps {
  state: GameState;
  onBuy: (item: ShopItem) => void;
  onEquip: (slot: Slot, id: string | null) => void;
  onClose: () => void;
}

/** Miniatura do item: amostra de cor para parede/piso, emoji para o resto. */
function Preview({ item }: { item: ShopItem }) {
  if (item.slot === "parede") return <span className={`swatch wall--${item.id}`} />;
  if (item.slot === "piso") return <span className={`swatch swatch--floor floor--${item.id}`} />;
  return <span className={`card__emoji item--${item.id}`}>{item.emoji}</span>;
}

export function Shop({ state, onBuy, onEquip, onClose }: ShopProps) {
  const [tab, setTab] = useState(SHOP_TABS[0].id);
  const current = SHOP_TABS.find((t) => t.id === tab) ?? SHOP_TABS[0];

  const total = SHOP.filter((i) => i.preco > 0).length;
  const have = SHOP.filter((i) => i.preco > 0 && owns(state, i)).length;

  return (
    <Modal title="Lojinha" onClose={onClose}>
      <div className="shop__top">
        <span className="coins coins--lg">
          <Icon name="coin" size={22} />
          <b>{state.moedas}</b>
        </span>
        <div className="shop__progress" title="Itens da coleção">
          <span>Coleção {have}/{total}</span>
          <div className="bar bar--love">
            <div className="bar__fill" style={{ width: `${Math.max(4, (have / total) * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {SHOP_TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={t.id === tab} className={t.id === tab ? "tab tab--on" : "tab"} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {current.slots.map((slot) => (
        <section key={slot} className="shop__group">
          <h3>{SLOT_LABEL[slot]}</h3>
          <ul className="cards">
            {SHOP.filter((i) => i.slot === slot).map((item) => {
              const owned = owns(state, item);
              const def = DEFAULT_ITEM[slot];
              // espaços com item padrão (parede, piso): sem escolha = padrão
              const on = (state.equipado[slot] ?? def) === item.id;
              const locked = !owned && item.preco > state.moedas;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`card${on ? " card--on" : ""}${owned ? " card--owned" : ""}${locked ? " card--locked" : ""}`}
                    disabled={locked}
                    onClick={() => {
                      if (!owned) onBuy(item);
                      else if (on) {
                        // tirar = voltar ao padrão (parede/piso) ou ficar sem nada (roupinhas/enfeites)
                        if (!def) onEquip(slot, null);
                        else if (item.id !== def) onEquip(slot, def);
                      } else onEquip(slot, item.id);
                    }}
                    aria-pressed={on}
                  >
                    {on && <span className="card__check" aria-hidden>✓</span>}
                    <span className="card__preview"><Preview item={item} /></span>
                    <span className="card__name">{item.nome}</span>
                    <span className="card__action">
                      {!owned ? (
                        <>
                          <Icon name="coin" size={16} />
                          {item.preco}
                        </>
                      ) : on ? (
                        def && item.id === def ? "Em uso" : "Tirar"
                      ) : (
                        "Usar"
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Modal>
  );
}
