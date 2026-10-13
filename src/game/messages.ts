import type { Mood } from "./types";

/** Frases carinhosas: o Purin fala bastante delas quando está bem. */
export function buildLoveMessages(p: string): string[] {
  return [
    `${p}, você é a pessoa mais especial do mundo! 💛`,
    `Seu sorriso deixa o meu dia mais doce que pudim, ${p}`,
    `Eu tenho muita sorte de ter você, ${p}`,
    `${p}, você ilumina tudo por onde passa`,
    `Sabia que você é o motivo do meu sorriso?`,
    `Ninguém cuida tão bem quanto você, ${p}`,
    `${p}, o seu abraço é o melhor lugar do mundo`,
    `Você é linda por dentro e por fora, ${p}`,
    `Com você, até um dia comum vira especial`,
    `${p}, você é o meu pudim favorito`,
    `O mundo é mais bonito com você nele, ${p}`,
    `Obrigado por existir, ${p}`,
    `${p}, você merece todo o carinho do universo `,
    `Quem ama você é a pessoa mais sortuda do mundo `,
    `Você me faz sentir quentinho por dentro 😏 ${p}`,
    `${p}, você é doce, linda e incrível`,
    `Se eu pudesse, te dava um pudim gigante todo dia e café `,
    `Cada momento com você é um presente, ${p}`,
    `${p}, você é amada hoje e sempre`,
    `Seu coração é a coisa mais linda que eu já vi`
  ];
}

/** Falas do Purin por humor. Recebe o nome dela para personalizar. */
export function buildMessages(p: string): Record<Mood, string[]> {
  const amor = buildLoveMessages(p);
  return {
    happy: [
      ...amor,
      "Quero um abraço! 🤗",
      "Pompompurin feliz! ✨",
      `Eu amo ficar com você, ${p}!`
    ],
    ok: [
      `Oi, ${p}! O que vamos fazer hoje?`,
      "Hmm... que tal um pudim? 🍮",
      "Brinca comigo? 🎮",
      ...amor.slice(0, 8)
    ],
    hungry: [
      `${p}, estou com muita fome 🍮`,
      "Minha barriguinha está roncando 😢",
      "Será que tem pudim por aí?",
      `Mesmo com fome, eu lembro que você é especial, ${p}`
    ],
    sad: [
      `${p}, estou tristinho... me dá carinho? 🥺`,
      "Preciso de um abraço",
      "Vamos brincar? Por favor",
      `Perto de você eu sempre melhoro, ${p}! 💛`
    ],
    dirty: [
      "Eu estou fedidinho... preciso de banho",
      `${p}, me ajuda a ficar limpinho?`
    ],
    tired: [
      "Que soninho... 😴",
      `Posso tirar uma sonequinha, ${p}?`,
      `Sonhei com você, ${p}💭`
    ],
    sleeping: [
      "Zzz... com você... Zzz...",
      "Zzz... pudim... Zzz...",
      `Zzz... ${p} é a pessoa mais especial... Zzz... 💛`
    ]
  };
}
