/** Vocabulário único de opcionais — usado no filtro, no anúncio e na publicação. */
export const FEATURE_CATALOG = [
  "Ar-condicionado",
  "Ar-condicionado digital",
  "Direção hidráulica",
  "Direção elétrica",
  "Vidros elétricos",
  "Travas elétricas",
  "Airbag duplo",
  "Freios ABS",
  "Computador de bordo",
  "Central multimídia",
  "Câmera de ré",
  "Sensor de estacionamento",
  "Rodas de liga leve",
  "Piloto automático",
  "Controle de estabilidade",
  "Bancos em couro",
  "Faróis de LED",
  "Teto solar",
  "Tração 4x4",
  "Capota marítima",
  "Start-stop",
  "Chave presencial",
] as const;

export type Feature = (typeof FEATURE_CATALOG)[number];

/** Opcionais mais usados na busca — atalhos no painel de filtros. */
export const POPULAR_FEATURES: Feature[] = [
  "Central multimídia",
  "Câmera de ré",
  "Sensor de estacionamento",
  "Piloto automático",
  "Bancos em couro",
  "Teto solar",
];

const BASIC: Feature[] = [
  "Ar-condicionado",
  "Direção hidráulica",
  "Vidros elétricos",
  "Travas elétricas",
  "Airbag duplo",
  "Freios ABS",
];

const FULL: Feature[] = [
  "Ar-condicionado",
  "Direção elétrica",
  "Vidros elétricos",
  "Travas elétricas",
  "Airbag duplo",
  "Freios ABS",
  "Computador de bordo",
  "Central multimídia",
  "Rodas de liga leve",
  "Sensor de estacionamento",
];

const PREMIUM: Feature[] = [
  ...FULL,
  "Ar-condicionado digital",
  "Câmera de ré",
  "Piloto automático",
  "Controle de estabilidade",
  "Faróis de LED",
];

const PACKS = { basico: BASIC, completo: FULL, premium: PREMIUM };

/** Monta a lista de opcionais de um veículo a partir de um pacote + extras. */
export const pack = (
  level: keyof typeof PACKS,
  extras: Feature[] = [],
): string[] => [...new Set([...PACKS[level], ...extras])];
