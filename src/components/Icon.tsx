import type { ReactNode } from "react";

export type IconName =
  | "pudding" | "heart" | "bolt" | "drops"
  | "bath" | "moon" | "sun" | "gamepad" | "bag" | "cloud"
  | "coin" | "letter" | "camera" | "sound" | "mute"
  | "close" | "prev" | "next" | "plus" | "trash";

const INK = "#5a3416";

/** Ícones próprios (mesmo traço marrom do Purin), em vez de emojis que mudam de aparelho para aparelho. */
const ICONS: Record<IconName, ReactNode> = {
  pudding: (
    <>
      <path d="M5.2 10.5h13.6l-1.5 7.7a2.2 2.2 0 0 1-2.1 1.8H8.8a2.2 2.2 0 0 1-2.1-1.8z" fill="#ffd96b" />
      <path d="M5.2 10.5C5.2 7.7 8.2 6 12 6s6.8 1.700 6.800 4.500z" fill="#c8731f" />
      <path d="M9 10.500v2.200M13 10.500v3M16 10.500v1.600" stroke="#c8731f" strokeWidth="1.800" />
      <circle cx="12" cy="4.300" r="1.700" fill="#e8405f" />
    </>
  ),
  heart: <path d="M12 20.200S4.800 15.800 4.800 10a4.100 4.100 0 0 1 7.200-2.600A4.100 4.100 0 0 1 19.200 10c0 5.800-7.200 10.200-7.200 10.200z" fill="#ff7fa1" />,
  bolt: <path d="M13.500 3 5.500 13.200h5.700l-1 7.800 8.300-10.700h-5.800z" fill="#ffd23f" />,
  drops: (
    <>
      <circle cx="9.500" cy="14.500" r="5.500" fill="#bfe9ff" />
      <circle cx="17" cy="8" r="3.200" fill="#bfe9ff" />
      <circle cx="18" cy="16.500" r="2.200" fill="#bfe9ff" />
      <path d="M7 12.500a3 3 0 0 1 2.500-1.700" stroke="#fff" strokeWidth="1.800" />
    </>
  ),
  bath: (
    <>
      <path d="M3.500 12.500h17v2a5 5 0 0 1-5 5h-7a5 5 0 0 1-5-5z" fill="#bfe9ff" />
      <path d="M7 19.500 6 21.500M17 19.500l1 2" />
      <circle cx="8" cy="8" r="2.200" fill="#fff" />
      <circle cx="13" cy="6" r="1.500" fill="#fff" />
      <circle cx="16.500" cy="9" r="1.100" fill="#fff" />
    </>
  ),
  moon: (
    <>
      <path d="M19.500 14.800A8 8 0 0 1 9.200 4.500a8 8 0 1 0 10.300 10.300z" fill="#ffd96b" />
      <path d="M16 4.500v3M14.500 6h3" strokeWidth="1.500" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.200" fill="#ffd23f" />
      <path d="M12 3.500v2M12 18.500v2M3.500 12h2M18.500 12h2M6 6l1.400 1.400M16.600 16.600 18 18M6 18l1.400-1.400M16.600 7.400 18 6" />
    </>
  ),
  gamepad: (
    <>
      <path d="M7 8h10a4.500 4.500 0 0 1 4.400 5.500l-.7 3.200a2.500 2.500 0 0 1-4.300.9L15 16H9l-1.400 1.600a2.500 2.500 0 0 1-4.300-.9l-.7-3.200A4.500 4.500 0 0 1 7 8z" fill="#c3b1ff" />
      <path d="M8 10.500v3M6.500 12h3" />
      <circle cx="15.500" cy="11.200" r=".9" fill={INK} />
      <circle cx="17.800" cy="13" r=".9" fill={INK} />
    </>
  ),
  bag: (
    <>
      <path d="M5 8.500h14l-1 11a1.500 1.500 0 0 1-1.500 1.400h-9A1.500 1.500 0 0 1 6 19.500z" fill="#86dcc8" />
      <path d="M9 10.500V7a3 3 0 0 1 6 0v3.500" />
    </>
  ),
  cloud: (
    <>
      <path d="M7.500 18.500a4 4 0 0 1-.4-8 5.500 5.500 0 0 1 10.500 1.200 3.400 3.400 0 0 1-.6 6.800z" fill="#e9f6ff" />
      <path d="M9 14.500c1-.8 2-.8 3 0" strokeWidth="1.500" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="8.500" fill="#ffd23f" />
      <circle cx="12" cy="12" r="5.200" fill="none" stroke="#e0a000" strokeWidth="1.600" />
      <path d="M12 9.300v5.400M10.300 11.200h3.400" stroke="#e0a000" strokeWidth="1.500" />
    </>
  ),
  letter: (
    <>
      <rect x="3.500" y="6" width="17" height="12.500" rx="2.500" fill="#fff" />
      <path d="m4 7.500 8 6 8-6" />
      <path d="M12 17.200s-2.400-1.500-2.400-3.400a1.300 1.300 0 0 1 2.400-.7 1.300 1.300 0 0 1 2.400.7c0 1.900-2.400 3.400-2.400 3.400z" fill="#ff7fa1" strokeWidth="1.200" />
    </>
  ),
  camera: (
    <>
      <path d="M4.500 8h3l1.500-2h6l1.500 2h3a1.500 1.500 0 0 1 1.500 1.500v8a1.500 1.500 0 0 1-1.500 1.500h-15A1.500 1.500 0 0 1 3 17.500v-8A1.500 1.500 0 0 1 4.500 8z" fill="#ffc9d8" />
      <circle cx="12" cy="13" r="3.300" fill="#fff" />
    </>
  ),
  sound: (
    <>
      <path d="M4 10h3.500L12 6v12l-4.500-4H4z" fill="#ffd96b" />
      <path d="M15.500 9.500a3.500 3.500 0 0 1 0 5M18 7.500a6.500 6.500 0 0 1 0 9" />
    </>
  ),
  mute: (
    <>
      <path d="M4 10h3.500L12 6v12l-4.500-4H4z" fill="#e5d9c0" />
      <path d="m16 9.500 5 5M21 9.500l-5 5" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" strokeWidth="2.400" />,
  prev: <path d="m14.500 6-6 6 6 6" strokeWidth="2.600" />,
  next: <path d="m9.500 6 6 6-6 6" strokeWidth="2.600" />,
  plus: <path d="M12 5v14M5 12h14" strokeWidth="2.600" />,
  trash: (
    <>
      <path d="M5.500 7h13l-1 12.500a1.500 1.500 0 0 1-1.500 1.400H8a1.500 1.500 0 0 1-1.500-1.400z" fill="#ffd6dd" />
      <path d="M4 7h16M9.500 7V4.500h5V7M10 11v6M14 11v6" />
    </>
  )
};

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={INK}
      strokeWidth="1.800"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  );
}
