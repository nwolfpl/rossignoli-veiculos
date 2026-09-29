import type { EventName, EventVehicle } from "@/domain/analytics";
import { describeSession, getSessionId, getVisitorId, isNewSession } from "@/lib/visitor";

/**
 * Escrita do rastreamento. Fala com a API REST do Supabase por fetch puro, sem o
 * SDK: a vitrine não precisa carregar o cliente inteiro só para dar um POST, e o
 * `keepalive` do fetch nativo é o que garante que o último evento sai mesmo com
 * a aba fechando. O SDK entra apenas no painel, onde há login e leitura.
 *
 * Nada aqui pode quebrar o site. Toda falha é silenciosa por decisão: perder um
 * evento é aceitável, travar a navegação de um cliente não é.
 */
const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Eventos acumulam por um instante antes de ir em lote, para não virar um POST por clique. */
const FLUSH_DELAY = 1200;
const MAX_BATCH = 40;

/** Intenção de compra vai na hora: se o visitante fechar a aba, o dado não pode sumir. */
const IMMEDIATE: EventName[] = ["whatsapp_clique", "lead_enviado", "sessao_inicio"];

type Row = {
  sessao_id: string;
  visitante_id: string;
  nome: string;
  caminho: string | null;
  veiculo_id: string | null;
  veiculo_slug: string | null;
  veiculo_titulo: string | null;
  valor: number | null;
  detalhes: Record<string, unknown>;
};

let queue: Row[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let started = false;

const enabled = () => Boolean(URL_BASE && KEY) && typeof window !== "undefined";

/** Devolve false em vez de lançar: quem chama decide se a falha importa. */
async function post(table: string, rows: unknown[], keepalive = false): Promise<boolean> {
  if (!enabled() || rows.length === 0) return false;
  try {
    const response = await fetch(`${URL_BASE}/rest/v1/${table}`, {
      method: "POST",
      keepalive,
      headers: {
        apikey: KEY as string,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(rows),
    });
    return response.ok;
  } catch {
    // Offline, bloqueado por extensão ou rede caindo.
    return false;
  }
}

export function flush(keepalive = false) {
  if (queue.length === 0) return;
  const batch = queue;
  queue = [];
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  void post("rv_eventos", batch, keepalive);
}

function schedule() {
  if (queue.length >= MAX_BATCH) {
    flush();
    return;
  }
  timer ??= setTimeout(() => {
    timer = null;
    flush();
  }, FLUSH_DELAY);
}

export interface TrackPayload {
  /** Contexto do carro, quando o evento nasce dentro de um anúncio ou card. */
  vehicle?: EventVehicle;
  /** Número que dá sentido ao evento: preço, parcela, profundidade de rolagem. */
  valor?: number;
  /** Qualquer detalhe extra. Vai em jsonb, então aceita forma livre. */
  detalhes?: Record<string, unknown>;
  /** Força o envio imediato, sem esperar o lote. */
  agora?: boolean;
}

/** Registra um evento. Seguro de chamar em qualquer lugar, inclusive no servidor (vira no-op). */
export function track(name: EventName, payload: TrackPayload = {}) {
  if (!enabled()) return;

  queue.push({
    sessao_id: getSessionId(),
    visitante_id: getVisitorId(),
    nome: name,
    caminho: window.location.pathname,
    veiculo_id: payload.vehicle?.id ?? null,
    veiculo_slug: payload.vehicle?.slug ?? null,
    veiculo_titulo: payload.vehicle?.titulo ?? null,
    valor: payload.valor ?? null,
    detalhes: payload.detalhes ?? {},
  });

  if (payload.agora || IMMEDIATE.includes(name)) flush();
  else schedule();
}

/**
 * Abre a sessão. Chamado uma vez pelo Tracker; a checagem de aba nova mora no
 * sessionStorage, então recarregar a página não cria sessão duplicada.
 */
export function startSession() {
  if (!enabled() || started) return;
  started = true;

  const novaAba = isNewSession();
  // Ler o id materializa a chave no storage, então precisa vir depois da checagem.
  const id = getSessionId();
  if (!novaAba) return;

  void post("rv_sessoes", [
    { id, visitante_id: getVisitorId(), ...describeSession() },
  ]);
  track("sessao_inicio");
}

export interface LeadInput {
  nome: string;
  telefone: string;
  mensagem: string;
  vehicle?: EventVehicle;
}

/**
 * Grava o lead na tabela própria e deixa a marca na trilha de eventos.
 * Lança quando não conseguiu gravar — o formulário diz ao cliente que a mensagem
 * foi recebida, então essa afirmação precisa ser verdadeira.
 */
export async function saveLead(lead: LeadInput) {
  if (!enabled()) {
    throw new Error("Rastreamento não configurado: o lead não foi gravado.");
  }
  const ok = await post(
    "rv_leads",
    [
      {
        sessao_id: getSessionId(),
        visitante_id: getVisitorId(),
        caminho: window.location.pathname,
        veiculo_id: lead.vehicle?.id ?? null,
        veiculo_slug: lead.vehicle?.slug ?? null,
        veiculo_titulo: lead.vehicle?.titulo ?? null,
        nome: lead.nome.slice(0, 160),
        telefone: lead.telefone.slice(0, 40),
        mensagem: lead.mensagem.slice(0, 2000) || null,
      },
    ],
    true,
  );
  if (!ok) throw new Error("Não foi possível gravar o lead.");
  track("lead_enviado", { vehicle: lead.vehicle });
}
