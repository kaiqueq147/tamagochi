import { CONFIG } from "@/config/config";
import { asset } from "@/utils";

export function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="overlay overlay--welcome">
      <div className="welcome">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="welcome__img" src={asset("purin-base.png")} alt="Pompompurin" draggable={false} />
        <h2>Oi, {CONFIG.partner}! 💛</h2>
        <p>
          O Pompompurin estava te esperando. Cuide dele com muito carinho: dê comida, banho,
          brinque e deixe ele dormir.
        </p>
        <button type="button" className="btn" onClick={onStart}>Conhecer o Purin 🍮</button>
      </div>
    </div>
  );
}
