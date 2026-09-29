import type {
  Device,
  InsightsData,
  TrackedEvent,
  TrackedLead,
  TrackedSession,
} from "@/domain/analytics";
import { getSupabase } from "@/lib/supabase";

/**
 * Leitura do rastreamento, usada só pelo painel. Aqui entra o SDK do Supabase,
 * porque precisamos de sessão de login persistente e refresh de token — coisas
 * que não valem o peso no site público.
 *
 * Quem autoriza é o banco: as políticas de RLS só devolvem linha para o e-mail
 * do admin. Se alguém abrir /admin sem login, as consultas voltam vazias.
 */

/**
 * O "ID gustavo" é um apelido de conveniência: por baixo, login de verdade por
 * e-mail. Aponta para a conta que já existe no Supabase — a mesma do painel de
 * locações — para não haver duas senhas para a mesma pessoa.
 */
const ALIASES: Record<string, string> = {
  gustavo: "gustavo@rossignolilocacoes.com.br",
};

/** Teto por consulta. Estourar significa que os números do período estão parciais. */
const ROW_LIMIT = 20_000;

/**
 * Espelho da lista que vive no banco, usado APENAS para dar uma mensagem clara a
 * quem logou com outra conta. Não é controle de acesso: quem barra é o RLS, e
 * mexer nisto no navegador não libera uma linha.
 */
const ADMIN_EMAILS = [
  "gustavo@rossignolilocacoes.com.br",
  "gustavo@rossignoliveiculos.com.br",
];

export const isAdminEmail = (email: string | null) =>
  Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase()));

export const resolveIdentity = (input: string): string => {
  const clean = input.trim().toLowerCase();
  return clean.includes("@") ? clean : (ALIASES[clean] ?? clean);
};

export class NotConfiguredError extends Error {
  constructor() {
    super("Supabase não configurado: defina as variáveis em .env.local.");
  }
}

function client() {
  const supabase = getSupabase();
  if (!supabase) throw new NotConfiguredError();
  return supabase;
}

export async function signIn(identity: string, password: string) {
  const { data, error } = await client().auth.signInWithPassword({
    email: resolveIdentity(identity),
    password,
  });
  if (error) throw error;
  return data.user?.email ?? null;
}

export async function signOut() {
  await client().auth.signOut();
}

/** E-mail do usuário logado, ou null. Não diz se ele é admin — isso o banco decide. */
export async function currentEmail(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.email ?? null;
}

const since = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

type EventRow = {
  id: number;
  sessao_id: string;
  visitante_id: string;
  criado_em: string;
  nome: string;
  caminho: string | null;
  veiculo_id: string | null;
  veiculo_slug: string | null;
  veiculo_titulo: string | null;
  valor: number | null;
  detalhes: Record<string, unknown> | null;
};

type SessionRow = {
  id: string;
  visitante_id: string;
  iniciada_em: string;
  primeira_pagina: string | null;
  referencia: string | null;
  origem: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  dispositivo: string | null;
  navegador: string | null;
  sistema: string | null;
  idioma: string | null;
  tela: string | null;
  fuso: string | null;
};

type LeadRow = {
  id: string;
  sessao_id: string | null;
  visitante_id: string | null;
  criado_em: string;
  caminho: string | null;
  veiculo_id: string | null;
  veiculo_slug: string | null;
  veiculo_titulo: string | null;
  nome: string;
  telefone: string;
  mensagem: string | null;
};

const toEvent = (row: EventRow): TrackedEvent => ({
  id: row.id,
  sessaoId: row.sessao_id,
  visitanteId: row.visitante_id,
  criadoEm: row.criado_em,
  nome: row.nome,
  caminho: row.caminho,
  veiculoId: row.veiculo_id,
  veiculoSlug: row.veiculo_slug,
  veiculoTitulo: row.veiculo_titulo,
  valor: row.valor,
  detalhes: row.detalhes ?? {},
});

const toSession = (row: SessionRow): TrackedSession => ({
  id: row.id,
  visitanteId: row.visitante_id,
  iniciadaEm: row.iniciada_em,
  primeiraPagina: row.primeira_pagina,
  referencia: row.referencia,
  origem: row.origem,
  utmSource: row.utm_source,
  utmMedium: row.utm_medium,
  utmCampaign: row.utm_campaign,
  dispositivo: (row.dispositivo as Device | null) ?? null,
  navegador: row.navegador,
  sistema: row.sistema,
  idioma: row.idioma,
  tela: row.tela,
  fuso: row.fuso,
});

const toLead = (row: LeadRow): TrackedLead => ({
  id: row.id,
  sessaoId: row.sessao_id,
  visitanteId: row.visitante_id,
  criadoEm: row.criado_em,
  caminho: row.caminho,
  veiculoId: row.veiculo_id,
  veiculoSlug: row.veiculo_slug,
  veiculoTitulo: row.veiculo_titulo,
  nome: row.nome,
  telefone: row.telefone,
  mensagem: row.mensagem,
});

/** Carrega o período inteiro de uma vez; as agregações rodam no navegador. */
export async function fetchInsights(days: number): Promise<InsightsData> {
  const supabase = client();
  const from = since(days);

  const [events, sessions, leads] = await Promise.all([
    supabase
      .from("rv_eventos")
      .select("*")
      .gte("criado_em", from)
      .order("criado_em", { ascending: false })
      .limit(ROW_LIMIT),
    supabase
      .from("rv_sessoes")
      .select("*")
      .gte("iniciada_em", from)
      .order("iniciada_em", { ascending: false })
      .limit(ROW_LIMIT),
    supabase
      .from("rv_leads")
      .select("*")
      .gte("criado_em", from)
      .order("criado_em", { ascending: false })
      .limit(ROW_LIMIT),
  ]);

  for (const result of [events, sessions, leads]) {
    if (result.error) throw result.error;
  }

  return {
    events: ((events.data ?? []) as EventRow[]).map(toEvent),
    sessions: ((sessions.data ?? []) as SessionRow[]).map(toSession),
    leads: ((leads.data ?? []) as LeadRow[]).map(toLead),
    truncado: (events.data?.length ?? 0) >= ROW_LIMIT,
  };
}
