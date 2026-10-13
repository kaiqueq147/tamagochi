# Purin & Emilly 💛

Um Tamagotchi do Pompompurin feito em **Next.js (App Router) + React + TypeScript**, com a animação em **Rive**.

## Como rodar

```bash
npm install     # também copia o rive.wasm para public/vendor
npm run dev     # http://localhost:3000
npm run build   # gera o site estático na pasta out/
```

Para publicar em subpasta (ex.: GitHub Pages), defina `NEXT_PUBLIC_BASE_PATH=/nome-do-repo` antes do `npm run build`.

## Personalizar

Edite `src/config/config.ts`: nome dela, seu nome, data de início do namoro e o texto da carta.

## Estrutura

```
src/
  app/            layout, página e CSS global
  components/     Game (entrada "use client"), Purin (Rive), Hud, Room, ActionBar, MiniGame, ...
  hooks/          useGame (cérebro), useSpeech, useFx, useMounted
  game/           lógica pura: logic, reducer, storage, messages, constants, types
  audio/          efeitos sonoros (WebAudio)
tools/
  prep-image.py   limpa a imagem base do Purin (remove fundo branco)
  build-riv.cjs   gera public/assets/purin.riv (state machine "Purin")
  e2e.cjs         teste de fumaça no Edge headless (npm run build antes)
```

## Rive

`public/assets/purin.riv` tem a state machine **Purin**:

- `humor` (número): 0 normal, 1 feliz, 2 triste, 3 fome, 4 sujo, 5 cansado, 6 dormindo
- triggers: `comer`, `banho`, `carinho`, `pular`

Para regenerar: `python tools/prep-image.py sua-imagem.png` e depois `npm run riv`.
Se o Rive não carregar, o jogo mostra a imagem estática como fallback.

> Pompompurin é um personagem da Sanrio. Este projeto é um presente pessoal, sem fins comerciais.
