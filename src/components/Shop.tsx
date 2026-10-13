"use client";

import { useState } from "react";
import { SHOP, SHOP_TABS, SLOT_LABEL } from "@/game/constants";
import { owns } from "@/game/logic";
import type { GameState, ShopItem, Slot } from "@/game/types";
import { Modal } from "./Modal";

interface ShopProps {
  state: GameState;
  onBuy: (item: ShopItem) => void;
  onEquip: (slot: Slot, id: string | null) => void;
  onClose: () => void;
}

export function Shop({ state, onBuy, onEquip, onClose }: ShopProps) {
  const [tab, setTab] = useState(SHOP_TABS[0].id);
  const current = SHOP_TABS.find((t) => t.id === tab) ?? SHOP_TABS[0];

  return (
    <Modal title={`Lojinha 🛍️ (🪙 ${state.moedas})`} onClose={onClose}>
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
          <ul className="foods">
            {SHOP.filter((i) => i.slot === slot).map((item) => {
              const have = owns(state, item);
              // papel de parede sem escolha = creme (padrão)
              const on = state.equipado[slot] === item.id || (slot === "parede" && item.id === "creme" && !state.equipado.parede);
              const cant = !have && item.preco > state.moedas;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={on ? "food food--on" : "food"}
                    disabled={cant}
                    onClick={() => {
                      if (!have) onBuy(item);
                      else if (on) onEquip(slot, slot === "parede" ? "creme" : null);
                      else onEquip(slot, item.id);
                    }}
                  >
                    <span className="food__emoji">{item.emoji}</span>
                    <span className="food__info">
                      <strong>{item.nome}</strong>
                    </span>
                    <span className="food__price">
                      {!have ? `🪙 ${item.preco}` : on ? (slot === "parede" ? "Em uso ✓" : "Tirar") : "Usar"}
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
