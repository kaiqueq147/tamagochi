/* =====================================================================
   🍮  PURIN & EMILLY — personalize o presente aqui!
   ===================================================================== */
export interface Photo {
  /** nome do arquivo dentro de public/photos (ex.: "nos-dois.jpg") */
  file: string;
  /** legenda que aparece embaixo da foto */
  caption: string;
}

export const CONFIG = {
  /**
   * Fotos de vocês. Coloque os arquivos em `public/photos` e liste aqui.
   * A primeira aparece no porta-retrato do quartinho. Troque o exemplo pelas suas!
   */
  photos: [
    { file: "foto1.jpg", caption: "Aqui vai uma foto nossa 💛" },
    { file: "foto2.jpg", caption: "Aqui vai uma foto nossa 💛" }
  ] as readonly Photo[],

  /** Nome dela */
  partner: "Emilly",
  /** Assinatura da carta (troque pelo seu nome!) */
  from: "Seu neguin",
  /** Data de início do namoro, ex.: "2024-02-14". Deixe "" para esconder o contador. */
  startDate: "",

  letterTitle: "Para a minha Emilly 💛",
  letter: [
    "Oi, meu amor",
    "Eu quis fazer algo diferente pra você, algo que lembrasse o seu carinho e o jeitinho fofo que você tem de cuidar de tudo que ama. O Pompompurin é só um pretexto no fundo eu queria te lembrar o quanto você é especial pra mim.",
    "Assim como o Purin, você deixa os meus dias mais doces, e muito mais felizes. Obrigado por existir na minha vida.",
    "Cuida bem dele mas cuida bem de você também. Eu te amo muito 💛"
  ]
} as const;
