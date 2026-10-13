import { CONFIG } from "@/config/config";
import { Modal } from "./Modal";

function daysTogether(start: string): number | null {
  if (!start) return null;
  const t = new Date(`${start}T00:00:00`).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
}

export function Letter({ onClose }: { onClose: () => void }) {
  const days = daysTogether(CONFIG.startDate);
  return (
    <Modal title={CONFIG.letterTitle} onClose={onClose}>
      <div className="letter">
        {CONFIG.letter.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {days !== null && <p className="letter__days">💛 {days} dias juntos 💛</p>}
        <p className="letter__sign">— {CONFIG.from}</p>
      </div>
    </Modal>
  );
}
