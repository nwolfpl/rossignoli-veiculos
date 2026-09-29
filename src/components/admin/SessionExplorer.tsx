"use client";

import { useMemo, useState } from "react";
import { EVENT_LABELS, type EventName, type TrackedEvent } from "@/domain/analytics";
import { formatDuration, isBackground, type SessionSummary } from "@/lib/insights";
import { Card, Empty } from "@/components/admin/primitives";

/**
 * A parte de rastreabilidade: cada visita virada do avesso, na ordem em que
 * aconteceu. É aqui que se responde "o que essa pessoa fez antes de desistir".
 */

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const label = (name: string) => EVENT_LABELS[name as EventName] ?? name;

/** Detalhes do evento em uma linha legível, sem despejar JSON cru na tela. */
function describeDetails(event: TrackedEvent): string {
  const parts: string[] = [];

  if (event.veiculoTitulo) parts.push(event.veiculoTitulo);
  else if (event.veiculoSlug) parts.push(event.veiculoSlug);

  for (const [key, value] of Object.entries(event.detalhes)) {
    if (value === null || value === "" || value === undefined) continue;
    if (key === "titulo") continue;
    parts.push(`${key.replace(/_/g, " ")}: ${value}`);
  }

  if (event.valor != null && !parts.some((part) => part.includes("parcela"))) {
    const sufixo = event.nome === "rolagem" ? "%" : "";
    parts.push(`valor: ${event.valor}${sufixo}`);
  }

  return parts.join(" · ");
}

function Timeline({ session }: { session: SessionSummary }) {
  const [showBackground, setShowBackground] = useState(false);
  const start = new Date(session.inicio).getTime();

  const events = showBackground
    ? session.eventos
    : session.eventos.filter((event) => !isBackground(event));

  return (
    <div className="mt-5 border-t border-ink-100 pt-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="label text-ink-400">
          {events.length} {events.length === 1 ? "passo" : "passos"} nesta visita
        </p>
        <button
          type="button"
          onClick={() => setShowBackground((open) => !open)}
          className="label rounded-md border border-ink-200 px-3 py-1.5 text-ink-500 transition hover:border-ink-900 hover:text-ink-900"
        >
          {showBackground ? "Esconder rolagem e tempo" : "Mostrar rolagem e tempo"}
        </button>
      </div>

      <ol className="space-y-0">
        {events.map((event, index) => {
          const offset = Math.round((new Date(event.criadoEm).getTime() - start) / 1000);
          const details = describeDetails(event);
          return (
            <li key={event.id} className="flex gap-4">
              {/* Trilho vertical: a linha do tempo desenhada, não só listada. */}
              <div className="flex flex-col items-center">
                <span
                  aria-hidden
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    event.nome === "whatsapp_clique" || event.nome === "lead_enviado"
                      ? "bg-verde"
                      : "bg-brand-600"
                  }`}
                />
                {index < events.length - 1 && (
                  <span aria-hidden className="w-px flex-1 bg-ink-200" />
                )}
              </div>

              <div className="min-w-0 flex-1 pb-5">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-medium text-ink-900">{label(event.nome)}</span>
                  <span className="tnum font-mono text-[11px] text-ink-400">
                    {time(event.criadoEm)} · +{formatDuration(offset)}
                  </span>
                </p>
                {event.caminho && (
                  <p className="truncate font-mono text-[11px] text-ink-500">{event.caminho}</p>
                )}
                {details && (
                  <p className="mt-1 break-words text-xs leading-relaxed text-ink-500">{details}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function SessionExplorer({ sessions }: { sessions: SessionSummary[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [term, setTerm] = useState("");
  const [onlyConverted, setOnlyConverted] = useState(false);

  /** Quantas visitas cada visitante já fez no período — revela quem voltou. */
  const visits = useMemo(() => {
    const map = new Map<string, number>();
    for (const session of sessions) {
      map.set(session.visitanteId, (map.get(session.visitanteId) ?? 0) + 1);
    }
    return map;
  }, [sessions]);

  const filtered = useMemo(() => {
    const clean = term.trim().toLowerCase();
    return sessions.filter((session) => {
      if (onlyConverted && !session.converteu) return false;
      if (!clean) return true;
      const haystack = [
        session.session?.origem,
        session.session?.dispositivo,
        session.session?.navegador,
        session.session?.sistema,
        session.visitanteId,
        session.id,
        ...session.eventos.map((event) => `${event.veiculoTitulo ?? ""} ${event.caminho ?? ""}`),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(clean);
    });
  }, [sessions, term, onlyConverted, ]);

  return (
    <Card
      title="Visitas, uma por uma"
      hint="Clique em uma visita para ver a sequência exata de passos. Visitante é um código anônimo, estável entre visitas — dá para ver quem voltou."
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Filtrar por carro, origem, dispositivo ou código"
          className="h-10 min-w-0 flex-1 rounded-md border border-ink-200 px-3 text-sm outline-none transition focus:border-ink-900"
        />
        <button
          type="button"
          onClick={() => setOnlyConverted((open) => !open)}
          aria-pressed={onlyConverted}
          className={`label rounded-md border px-3 py-2.5 transition ${
            onlyConverted
              ? "border-verde bg-emerald-50 text-emerald-800"
              : "border-ink-200 text-ink-500 hover:border-ink-900 hover:text-ink-900"
          }`}
        >
          Só quem pediu contato
        </button>
      </div>

      {filtered.length === 0 ? (
        <Empty>Nenhuma visita com esse recorte.</Empty>
      ) : (
        <ul className="divide-y divide-ink-100">
          {filtered.slice(0, 80).map((session) => {
            const open = openId === session.id;
            const retorno = visits.get(session.visitanteId) ?? 1;
            return (
              <li key={session.id} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : session.id)}
                  aria-expanded={open}
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-1.5 text-left"
                >
                  <span className="tnum font-mono text-xs text-ink-500">
                    {dateTime(session.inicio)}
                  </span>
                  <span className="text-sm text-ink-900">
                    {session.session?.origem ?? "origem desconhecida"}
                  </span>
                  <span className="label text-ink-400">
                    {session.session?.dispositivo ?? "?"}
                  </span>
                  <span className="tnum font-mono text-xs text-ink-400">
                    {session.paginas} pág · {formatDuration(session.duracao)}
                    {session.anuncios > 0 && ` · ${session.anuncios} anúncio(s)`}
                  </span>
                  {retorno > 1 && (
                    <span className="label rounded bg-ink-100 px-2 py-1 text-ink-500">
                      {retorno}ª visita
                    </span>
                  )}
                  {session.converteu && (
                    <span className="label rounded bg-emerald-50 px-2 py-1 text-emerald-800">
                      pediu contato
                    </span>
                  )}
                  <span aria-hidden className="ml-auto text-ink-400">
                    {open ? "−" : "+"}
                  </span>
                </button>

                {open && <Timeline session={session} />}
              </li>
            );
          })}
        </ul>
      )}

      {filtered.length > 80 && (
        <p className="mt-4 text-xs text-ink-400">
          Mostrando as 80 visitas mais recentes de {filtered.length}. Use o filtro para
          chegar nas outras.
        </p>
      )}
    </Card>
  );
}
