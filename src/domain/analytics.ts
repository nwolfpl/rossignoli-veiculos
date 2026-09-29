/**
 * Vocabulário do rastreamento. Os nomes de evento são um union fechado para que
 * o painel e a instrumentação não saiam de sincronia — acrescentar um evento
 * aqui obriga a decidir como ele aparece no painel.
 */
export type EventName =
  | "sessao_inicio"
  | "pagina_vista"
  | "rolagem"
  | "pulso"
  | "saida_pagina"
  | "busca"
  | "filtro"
  | "ordenacao"
  | "filtros_limpos"
  | "categoria_clique"
  | "anuncio_visto"
  | "card_clique"
  | "galeria_abriu"
  | "galeria_navegou"
  | "simulador_ajustou"
  | "whatsapp_clique"
  | "lead_enviado"
  | "link_externo"
  | "contato_clique";

/** Rótulos em português para o painel. Um evento sem rótulo aparece com o nome cru. */
export const EVENT_LABELS: Record<EventName, string> = {
  sessao_inicio: "Entrou no site",
  pagina_vista: "Viu a página",
  rolagem: "Rolou a página",
  pulso: "Continuou na página",
  saida_pagina: "Saiu da página",
  busca: "Buscou",
  filtro: "Aplicou filtro",
  ordenacao: "Mudou a ordenação",
  filtros_limpos: "Limpou os filtros",
  categoria_clique: "Clicou na categoria",
  anuncio_visto: "Abriu o anúncio",
  card_clique: "Clicou no card do carro",
  galeria_abriu: "Abriu a galeria de fotos",
  galeria_navegou: "Passou as fotos",
  simulador_ajustou: "Mexeu no simulador",
  whatsapp_clique: "Clicou no WhatsApp",
  lead_enviado: "Enviou o formulário",
  link_externo: "Saiu para um link externo",
  contato_clique: "Clicou no telefone ou e-mail",
};

/** Eventos que valem como intenção de compra — alimentam a taxa de conversão. */
export const CONVERSION_EVENTS: EventName[] = ["whatsapp_clique", "lead_enviado"];

/** Ruído de fundo: úteis para medir tempo, atrapalham se aparecem na timeline. */
export const BACKGROUND_EVENTS: EventName[] = ["pulso", "rolagem", "saida_pagina"];

export type Device = "mobile" | "tablet" | "desktop";

/** Contexto do veículo, quando o evento acontece dentro de um anúncio ou card. */
export interface EventVehicle {
  id?: string;
  slug?: string;
  titulo?: string;
}

export interface TrackedEvent {
  id: number;
  sessaoId: string;
  visitanteId: string;
  criadoEm: string;
  nome: EventName | string;
  caminho: string | null;
  veiculoId: string | null;
  veiculoSlug: string | null;
  veiculoTitulo: string | null;
  valor: number | null;
  detalhes: Record<string, unknown>;
}

export interface TrackedSession {
  id: string;
  visitanteId: string;
  iniciadaEm: string;
  primeiraPagina: string | null;
  referencia: string | null;
  origem: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  dispositivo: Device | null;
  navegador: string | null;
  sistema: string | null;
  idioma: string | null;
  tela: string | null;
  fuso: string | null;
}

export interface TrackedLead {
  id: string;
  sessaoId: string | null;
  visitanteId: string | null;
  criadoEm: string;
  caminho: string | null;
  veiculoId: string | null;
  veiculoSlug: string | null;
  veiculoTitulo: string | null;
  nome: string;
  telefone: string;
  mensagem: string | null;
}

/** Tudo que o painel carrega de uma vez, para um período. */
export interface InsightsData {
  sessions: TrackedSession[];
  events: TrackedEvent[];
  leads: TrackedLead[];
  /** True quando o período estourou o limite de linhas e os números ficam parciais. */
  truncado: boolean;
}

export type PeriodDays = 1 | 7 | 30 | 90;

export const PERIOD_LABELS: Record<PeriodDays, string> = {
  1: "Hoje",
  7: "7 dias",
  30: "30 dias",
  90: "90 dias",
};
