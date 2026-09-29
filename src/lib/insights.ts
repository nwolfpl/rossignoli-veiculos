import {
  BACKGROUND_EVENTS,
  CONVERSION_EVENTS,
  type InsightsData,
  type TrackedEvent,
  type TrackedSession,
} from "@/domain/analytics";

/**
 * Leitura dos números. Tudo aqui é função pura sobre os eventos já carregados:
 * mesma decisão do resto do projeto (regra de negócio fora da UI), e permite
 * recalcular qualquer recorte no navegador sem uma nova ida ao banco.
 */

/** Dia local em ISO curto. O banco guarda UTC; o dono da loja pensa no fuso dele. */
export const dayKey = (iso: string) => {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

export const formatDay = (key: string) => {
  const [, month, day] = key.split("-");
  return `${day}/${month}`;
};

export const formatDuration = (seconds: number) => {
  if (seconds <= 0) return "0s";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return rest ? `${minutes}min ${rest}s` : `${minutes}min`;
};

const isConversion = (event: TrackedEvent) =>
  CONVERSION_EVENTS.includes(event.nome as never);

export const isBackground = (event: TrackedEvent) =>
  BACKGROUND_EVENTS.includes(event.nome as never);

export interface Kpis {
  visitantes: number;
  sessoes: number;
  paginas: number;
  anuncios: number;
  contatos: number;
  leads: number;
  /** Sessões com WhatsApp ou formulário, sobre o total de sessões. */
  conversao: number;
  duracaoMediana: number;
  /** Sessões que viram uma página só e saíram. */
  rejeicao: number;
}

export function buildKpis({ sessions, events, leads }: InsightsData): Kpis {
  const bySession = groupBy(events, (event) => event.sessaoId);
  const sessoes = Math.max(sessions.length, bySession.size);
  const converteram = new Set(events.filter(isConversion).map((e) => e.sessaoId));

  const duracoes: number[] = [];
  let umaPagina = 0;
  for (const [, list] of bySession) {
    duracoes.push(sessionDuration(list));
    if (list.filter((e) => e.nome === "pagina_vista").length <= 1) umaPagina += 1;
  }

  return {
    visitantes: new Set([
      ...sessions.map((s) => s.visitanteId),
      ...events.map((e) => e.visitanteId),
    ]).size,
    sessoes,
    paginas: events.filter((e) => e.nome === "pagina_vista").length,
    anuncios: events.filter((e) => e.nome === "anuncio_visto").length,
    contatos: events.filter((e) => e.nome === "whatsapp_clique").length,
    leads: leads.length,
    conversao: sessoes ? converteram.size / sessoes : 0,
    duracaoMediana: median(duracoes),
    rejeicao: bySession.size ? umaPagina / bySession.size : 0,
  };
}

/** Duração pela distância entre o primeiro e o último evento — é o que o pulso sustenta. */
export function sessionDuration(events: TrackedEvent[]): number {
  if (events.length < 2) return 0;
  const times = events.map((event) => new Date(event.criadoEm).getTime());
  return (Math.max(...times) - Math.min(...times)) / 1000;
}

export interface DailyPoint {
  dia: string;
  sessoes: number;
  anuncios: number;
  contatos: number;
}

/** Série diária contínua: dias sem visita aparecem como zero, não como buraco. */
export function buildDaily(data: InsightsData, days: number): DailyPoint[] {
  const base = new Map<string, DailyPoint>();
  const today = new Date();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = dayKey(date.toISOString());
    base.set(key, { dia: key, sessoes: 0, anuncios: 0, contatos: 0 });
  }

  const sessionDays = new Map<string, Set<string>>();
  for (const event of data.events) {
    const key = dayKey(event.criadoEm);
    const point = base.get(key);
    if (!point) continue;

    if (!sessionDays.has(key)) sessionDays.set(key, new Set());
    sessionDays.get(key)!.add(event.sessaoId);

    if (event.nome === "anuncio_visto") point.anuncios += 1;
    if (event.nome === "whatsapp_clique" || event.nome === "lead_enviado") {
      point.contatos += 1;
    }
  }

  for (const [key, set] of sessionDays) {
    const point = base.get(key);
    if (point) point.sessoes = set.size;
  }

  return [...base.values()];
}

export interface FunnelStep {
  rotulo: string;
  sessoes: number;
  /** Proporção sobre o topo do funil. */
  parte: number;
}

/**
 * Funil por sessão, não por evento: o que interessa é quantas visitas avançaram,
 * não quantos cliques houve.
 */
export function buildFunnel({ events }: InsightsData): FunnelStep[] {
  const has = (names: string[]) =>
    new Set(events.filter((e) => names.includes(e.nome)).map((e) => e.sessaoId));

  const entrou = new Set(events.map((e) => e.sessaoId));
  const buscou = has(["busca", "filtro", "categoria_clique", "ordenacao"]);
  const anuncio = has(["anuncio_visto"]);
  const contato = has(["whatsapp_clique", "lead_enviado"]);
  const topo = entrou.size || 1;

  return [
    { rotulo: "Entrou no site", sessoes: entrou.size, parte: 1 },
    { rotulo: "Buscou ou filtrou", sessoes: buscou.size, parte: buscou.size / topo },
    { rotulo: "Abriu um anúncio", sessoes: anuncio.size, parte: anuncio.size / topo },
    { rotulo: "Pediu contato", sessoes: contato.size, parte: contato.size / topo },
  ];
}

export interface VehicleInsight {
  id: string;
  titulo: string;
  slug: string | null;
  visualizacoes: number;
  cliquesCard: number;
  whatsapp: number;
  leads: number;
  simulacoes: number;
  fotos: number;
}

/** Ranking de interesse por carro — a pergunta mais direta do dono da loja. */
export function buildVehicles({ events, leads }: InsightsData): VehicleInsight[] {
  const map = new Map<string, VehicleInsight>();

  const reach = (id: string, titulo: string | null, slug: string | null) => {
    const current = map.get(id) ?? {
      id,
      titulo: titulo ?? id,
      slug,
      visualizacoes: 0,
      cliquesCard: 0,
      whatsapp: 0,
      leads: 0,
      simulacoes: 0,
      fotos: 0,
    };
    if (titulo && current.titulo === id) current.titulo = titulo;
    if (slug && !current.slug) current.slug = slug;
    map.set(id, current);
    return current;
  };

  for (const event of events) {
    // O clique no card conhece o slug antes do id; o anúncio aberto traz os dois.
    const id = event.veiculoId ?? event.veiculoSlug;
    if (!id) continue;
    const row = reach(id, event.veiculoTitulo, event.veiculoSlug);

    if (event.nome === "anuncio_visto") row.visualizacoes += 1;
    if (event.nome === "card_clique") row.cliquesCard += 1;
    if (event.nome === "whatsapp_clique") row.whatsapp += 1;
    if (event.nome === "simulador_ajustou") row.simulacoes += 1;
    if (event.nome === "galeria_abriu" || event.nome === "galeria_navegou") row.fotos += 1;
  }

  for (const lead of leads) {
    const id = lead.veiculoId ?? lead.veiculoSlug;
    if (!id) continue;
    reach(id, lead.veiculoTitulo, lead.veiculoSlug).leads += 1;
  }

  return [...map.values()].sort(
    (a, b) =>
      b.visualizacoes + b.whatsapp * 3 + b.leads * 5 -
      (a.visualizacoes + a.whatsapp * 3 + a.leads * 5),
  );
}

export interface SearchInsight {
  termo: string;
  vezes: number;
  /** Quantas dessas buscas não devolveram carro nenhum. */
  semResultado: number;
}

/**
 * Buscas digitadas e combinações de filtro. As que devolvem zero são as mais
 * valiosas: é demanda que o estoque não atende.
 */
export function buildSearches({ events }: InsightsData): SearchInsight[] {
  const map = new Map<string, SearchInsight>();

  const add = (termo: string, zero: boolean) => {
    const key = termo.toLowerCase().trim();
    if (!key) return;
    const row = map.get(key) ?? { termo: key, vezes: 0, semResultado: 0 };
    row.vezes += 1;
    if (zero) row.semResultado += 1;
    map.set(key, row);
  };

  for (const event of events) {
    if (event.nome === "busca") {
      const termo = event.detalhes.termo;
      if (typeof termo === "string") add(termo, false);
    }
    if (event.nome === "filtro") {
      const termo = event.detalhes.q;
      if (typeof termo === "string") add(termo, event.valor === 0);
    }
  }

  return [...map.values()].sort((a, b) => b.semResultado - a.semResultado || b.vezes - a.vezes);
}

export interface FilterCombo {
  descricao: string;
  vezes: number;
  resultados: number;
}

/** Combinações de filtro que terminaram sem carro nenhum no estoque. */
export function buildEmptyFilters({ events }: InsightsData): FilterCombo[] {
  const map = new Map<string, FilterCombo>();
  const ignore = new Set(["resultados", "filtros_ativos", "sort"]);

  for (const event of events) {
    if (event.nome !== "filtro" || event.valor !== 0) continue;
    const parts = Object.entries(event.detalhes)
      .filter(([key, value]) => !ignore.has(key) && value !== null && value !== "")
      .map(([key, value]) => `${FILTER_LABELS[key] ?? key}: ${value}`)
      .sort();
    if (parts.length === 0) continue;
    const descricao = parts.join(" · ");
    const row = map.get(descricao) ?? { descricao, vezes: 0, resultados: 0 };
    row.vezes += 1;
    map.set(descricao, row);
  }

  return [...map.values()].sort((a, b) => b.vezes - a.vezes);
}

const FILTER_LABELS: Record<string, string> = {
  q: "texto",
  brand: "marca",
  body: "carroceria",
  transmission: "câmbio",
  fuel: "combustível",
  minPrice: "preço mín",
  maxPrice: "preço máx",
  minYear: "ano desde",
  maxMileage: "km até",
};

export interface SimulatorInsight {
  ajustes: number;
  entradaMediaPercentual: number;
  parcelaMediana: number;
  prazoPreferido: number | null;
}

/**
 * O que o visitante consegue pagar. Sai do simulador e é a informação que mais
 * ajuda a decidir preço e política de entrada.
 */
export function buildSimulator({ events }: InsightsData): SimulatorInsight {
  const rows = events.filter((event) => event.nome === "simulador_ajustou");
  const entradas: number[] = [];
  const parcelas: number[] = [];
  const prazos = new Map<number, number>();

  for (const row of rows) {
    const entrada = row.detalhes.entrada_percentual;
    if (typeof entrada === "number") entradas.push(entrada);
    if (typeof row.valor === "number") parcelas.push(row.valor);
    const prazo = row.detalhes.parcelas;
    if (typeof prazo === "number") prazos.set(prazo, (prazos.get(prazo) ?? 0) + 1);
  }

  const prazoPreferido =
    [...prazos.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    ajustes: rows.length,
    entradaMediaPercentual: entradas.length
      ? entradas.reduce((sum, value) => sum + value, 0) / entradas.length
      : 0,
    parcelaMediana: median(parcelas),
    prazoPreferido,
  };
}

export interface SessionSummary {
  id: string;
  session: TrackedSession | null;
  visitanteId: string;
  inicio: string;
  fim: string;
  duracao: number;
  paginas: number;
  anuncios: number;
  converteu: boolean;
  eventos: TrackedEvent[];
}

/** Uma linha por visita, da mais recente para a mais antiga. É a lista de rastreabilidade. */
export function buildSessions({ sessions, events }: InsightsData): SessionSummary[] {
  const byId = new Map(sessions.map((session) => [session.id, session]));
  const grouped = groupBy(events, (event) => event.sessaoId);
  const rows: SessionSummary[] = [];

  for (const [id, list] of grouped) {
    const ordered = [...list].sort(
      (a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime(),
    );
    rows.push({
      id,
      session: byId.get(id) ?? null,
      visitanteId: ordered[0].visitanteId,
      inicio: ordered[0].criadoEm,
      fim: ordered[ordered.length - 1].criadoEm,
      duracao: sessionDuration(ordered),
      paginas: ordered.filter((event) => event.nome === "pagina_vista").length,
      anuncios: new Set(
        ordered.filter((e) => e.nome === "anuncio_visto").map((e) => e.veiculoId),
      ).size,
      converteu: ordered.some(isConversion),
      eventos: ordered,
    });
  }

  return rows.sort((a, b) => new Date(b.fim).getTime() - new Date(a.fim).getTime());
}

export interface Counted {
  rotulo: string;
  total: number;
}

/** Contagem genérica ordenada — alimenta origem, dispositivo, página e CTA. */
export function countBy<T>(items: T[], pick: (item: T) => string | null | undefined): Counted[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = pick(item);
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([rotulo, total]) => ({ rotulo, total }))
    .sort((a, b) => b.total - a.total);
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const value = key(item);
    const list = map.get(value);
    if (list) list.push(item);
    else map.set(value, [item]);
  }
  return map;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
