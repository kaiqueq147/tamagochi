import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Purin & Emilly 💛",
  description: "Um Tamagotchi do Pompompurin, feito com carinho para a Emilly."
};

export const viewport: Viewport = {
  themeColor: "#ffe9a8",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
