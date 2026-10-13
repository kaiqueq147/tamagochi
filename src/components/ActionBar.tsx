interface ActionBarProps {
  sleeping: boolean;
  onFeed: () => void;
  onBath: () => void;
  onSleep: () => void;
  onPlay: () => void;
  onShop: () => void;
}

export function ActionBar({ sleeping, onFeed, onBath, onSleep, onPlay, onShop }: ActionBarProps) {
  const items = [
    { icon: "🍮", label: "Comer", onClick: onFeed },
    { icon: "🛁", label: "Banho", onClick: onBath },
    { icon: sleeping ? "☀️" : "🌙", label: sleeping ? "Acordar" : "Dormir", onClick: onSleep },
    { icon: "🎮", label: "Brincar", onClick: onPlay },
    { icon: "🛍️", label: "Loja", onClick: onShop }
  ];
  return (
    <nav className="actions">
      {items.map((a) => (
        <button key={a.label} type="button" className="action" onClick={a.onClick}>
          <span className="action__icon" aria-hidden>{a.icon}</span>
          <span>{a.label}</span>
        </button>
      ))}
    </nav>
  );
}
