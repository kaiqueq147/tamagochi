import { FOODS } from "@/game/constants";
import type { Food } from "@/game/types";
import { Modal } from "./Modal";

interface FoodMenuProps {
  coins: number;
  onPick: (food: Food) => void;
  onClose: () => void;
}

export function FoodMenu({ coins, onPick, onClose }: FoodMenuProps) {
  return (
    <Modal title={`O que o Purin vai comer? (🪙 ${coins})`} onClose={onClose}>
      <ul className="foods">
        {FOODS.map((f) => {
          const cant = f.preco > coins;
          return (
            <li key={f.id}>
              <button type="button" className="food" disabled={cant} onClick={() => onPick(f)}>
                <span className="food__emoji">{f.emoji}</span>
                <span className="food__info">
                  <strong>{f.nome}</strong>
                  <small>{f.desc}</small>
                </span>
                <span className="food__price">{f.preco === 0 ? "Grátis" : `🪙 ${f.preco}`}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
