"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PERIOD_LABELS,
  type InsightsData,
  type PeriodDays,
  type TrackedLead,
} from "@/domain/analytics";
import { SessionExplorer } from "@/components/admin/SessionExplorer";
import { TrendChart } from "@/components/admin/TrendChart";
import {
  BarList,
  Card,
  Empty,
  Funnel,
  StatTile,
  formatCount,
  formatPercent,
} from "@/components/admin/primitives";
import { formatPrice } from "@/lib/format";
import {
  buildDaily,
  buildEmptyFilters,
  buildFunnel,
  buildKpis,
  buildSearches,
  buildSessions,
  buildSimulator,
  buildVehicles,
  countBy,
  formatDuration,
} from "@/lib/insights";
import { fetchInsights, signOut } from "@/services/insightsRepository";

const TABS = ["Visão geral", "Carros", "Buscas", "Visitas", "Contatos"] as const;
type Tab = (typeof TABS)[number];

const PERIODS: PeriodDays[] = [1, 7, 30, 90];

/** CSV para levar os dados para a planilha — o painel não precisa prever toda pergunta. */
function downloadCsv(name: string, rows: readonly object[]) {
  if (rows.length === 0) return;
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const cell = (row: object, header: string) => (row as Record<string, unknown>)[header];
  const escape = (value: unknown) => {
    const text =
      value === null || value === undefined
        ? ""
        : typeof value === "object"
          ? JSON.stringify(value)
          : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escape(cell(row, header))).join(",")),
  ].join("\n");

  // BOM para o Excel em português abrir os acentos corretamente.
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function LeadsTable({ leads }: { leads: TrackedLead[] }) {
  if (leads.length === 0) {
    return <Empty>Nenhum contato pelo formulário neste período.</Empty>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-ink-200 text-left">
            {["Quando", "Nome", "Telefone", "Carro", "Mensagem"].map((head) => (
              <th key={head} className="label py-2 pr-4 font-normal text-ink-400">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-ink-100 align-top">
              <td className="tnum py-3 pr-4 font-mono text-xs text-ink-500">
                {new Date(lead.criadoEm).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="py-3 pr-4 font-medium">{lead.nome}</td>
              <td className="tnum py-3 pr-4 font-mono text-xs">{lead.telefone}</td>
              <td className="py-3 pr-4 text-xs text-ink-500">{lead.veiculoTitulo ?? "—"}</td>
              <td className="max-w-xs py-3 text-xs text-ink-500">{lead.mensagem ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Panel({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [period, setPeriod] = useState<PeriodDays>(7);
  const [tab, setTab] = useState<Tab>("Visão geral");
  const [reloadKey, setReloadKey] = useState(0);

  /**
   * O estado guarda qual recorte ele representa. Assim "carregando" é derivado da
   * comparação com o recorte pedido, em vez de um setState no corpo do efeito —
   * que causaria render em cascata a cada troca de período.
   */
  const token = `${period}:${reloadKey}`;
  const [state, setState] = useState<{
    token: string;
    data?: InsightsData;
    error?: string;
  }>({ token: "" });

  useEffect(() => {
    let active = true;
    fetchInsights(period)
      .then((result) => {
        if (active) setState({ token, data: result });
      })
      .catch((cause: Error) => {
        if (active) setState({ token, error: cause.message });
      });
    return () => {
      active = false;
    };
    // token embute period e reloadKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loading = state.token !== token;
  // Os dados anteriores continuam na tela enquanto o novo período carrega.
  const data = state.data ?? null;
  const error = state.token === token ? (state.error ?? null) : null;

  const view = useMemo(() => {
    if (!data) return null;
    return {
      kpis: buildKpis(data),
      daily: buildDaily(data, period),
      funnel: buildFunnel(data),
      vehicles: buildVehicles(data),
      searches: buildSearches(data),
      emptyFilters: buildEmptyFilters(data),
      simulator: buildSimulator(data),
      sessions: buildSessions(data),
      origins: countBy(data.sessions, (session) => session.origem),
      devices: countBy(data.sessions, (session) => session.dispositivo),
      systems: countBy(data.sessions, (session) => session.sistema),
      pages: countBy(
        data.events.filter((event) => event.nome === "pagina_vista"),
        (event) => event.caminho,
      ),
      ctas: countBy(
        data.events.filter((event) => event.nome === "whatsapp_clique"),
        (event) => (event.detalhes.origem as string) ?? null,
      ),
    };
  }, [data, period]);

  const handleSignOut = async () => {
    await signOut();
    onSignOut();
  };

  return (
    <div className="min-h-screen bg-neblina">
      <header className="stage border-b border-fumaca">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-6 sm:px-6">
          <div>
            <p className="label text-brand-500">Painel do administrador</p>
            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white">
              Comportamento dos visitantes
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden font-mono text-[11px] text-cromo/60 sm:block">{email}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="label rounded-md border border-fumaca px-3 py-2 text-cromo transition hover:border-cromo hover:text-white"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Controles em uma faixa só, acima do conteúdo. */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex rounded-md border border-ink-200 bg-white p-1">
            {PERIODS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPeriod(option)}
                aria-pressed={period === option}
                className={`label rounded px-3 py-2 transition ${
                  period === option
                    ? "bg-asfalto text-white"
                    : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {PERIOD_LABELS[option]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="label rounded-md border border-ink-200 bg-white px-3 py-2.5 text-ink-500 transition hover:border-ink-900 hover:text-ink-900"
          >
            Atualizar
          </button>

          {data && (
            <div className="ml-auto flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadCsv("eventos", data.events)}
                className="label rounded-md border border-ink-200 bg-white px-3 py-2.5 text-ink-500 transition hover:border-ink-900 hover:text-ink-900"
              >
                Baixar eventos
              </button>
              <button
                type="button"
                onClick={() => downloadCsv("contatos", data.leads)}
                className="label rounded-md border border-ink-200 bg-white px-3 py-2.5 text-ink-500 transition hover:border-ink-900 hover:text-ink-900"
              >
                Baixar contatos
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Não foi possível carregar os dados.</p>
            <p className="mt-1 font-mono text-xs">{error}</p>
          </div>
        )}

        {data?.truncado && (
          <p className="mb-6 rounded-xl border border-ink-200 bg-white p-4 text-xs text-ink-500">
            O período passou do limite de 20 mil eventos por consulta, então os números
            estão parciais. Use um período mais curto para ver tudo.
          </p>
        )}

        {loading && !view ? (
          <Card>
            <Empty>Carregando…</Empty>
          </Card>
        ) : !view ? (
          <Card>
            <Empty>Sem dados para mostrar.</Empty>
          </Card>
        ) : (
          <>
            <nav className="mb-6 flex flex-wrap gap-2">
              {TABS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTab(option)}
                  aria-current={tab === option}
                  className={`rounded-md px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wider transition ${
                    tab === option
                      ? "bg-brand-500 text-asfalto"
                      : "border border-ink-200 bg-white text-ink-500 hover:text-ink-900"
                  }`}
                >
                  {option}
                </button>
              ))}
            </nav>

            {tab === "Visão geral" && (
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <StatTile
                    label="Visitantes"
                    value={formatCount(view.kpis.visitantes)}
                    hint="Pessoas distintas, contadas pelo código anônimo do navegador."
                  />
                  <StatTile label="Visitas" value={formatCount(view.kpis.sessoes)} />
                  <StatTile
                    label="Anúncios abertos"
                    value={formatCount(view.kpis.anuncios)}
                    hint={`${formatCount(view.kpis.paginas)} páginas vistas no total.`}
                  />
                  <StatTile
                    label="Pedidos de contato"
                    value={formatCount(view.kpis.contatos + view.kpis.leads)}
                    hint={`${view.kpis.contatos} no WhatsApp · ${view.kpis.leads} pelo formulário`}
                    tone="destaque"
                  />
                  <StatTile
                    label="Taxa de contato"
                    value={formatPercent(view.kpis.conversao)}
                    hint="Visitas que terminaram em WhatsApp ou formulário."
                  />
                  <StatTile
                    label="Tempo por visita"
                    value={formatDuration(view.kpis.duracaoMediana)}
                    hint="Mediana, que não se deixa distorcer por uma aba esquecida aberta."
                  />
                  <StatTile
                    label="Saíram na primeira página"
                    value={formatPercent(view.kpis.rejeicao)}
                  />
                  <StatTile
                    label="Simulações de parcela"
                    value={formatCount(view.simulator.ajustes)}
                  />
                </div>

                <TrendChart points={view.daily} />

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card
                    title="Do primeiro clique ao contato"
                    hint="Quantas visitas chegaram a cada etapa."
                  >
                    <Funnel steps={view.funnel} />
                  </Card>
                  <Card title="De onde vieram" hint="Origem declarada na UTM ou o site que linkou.">
                    <BarList rows={view.origins} />
                  </Card>
                  <Card title="Em que aparelho">
                    <BarList rows={view.devices} limit={4} />
                  </Card>
                  <Card title="Páginas mais vistas">
                    <BarList rows={view.pages} />
                  </Card>
                </div>
              </div>
            )}

            {tab === "Carros" && (
              <div className="space-y-6">
                <Card
                  title="Interesse por carro"
                  hint="Ordenado por interesse: cada pedido de contato pesa mais que uma visualização."
                >
                  {view.vehicles.length === 0 ? (
                    <Empty>Nenhum anúncio visitado no período.</Empty>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-sm">
                        <thead>
                          <tr className="border-b border-ink-200 text-left">
                            <th className="label py-2 pr-4 font-normal text-ink-400">Carro</th>
                            {["Aberturas", "Cliques no card", "Fotos", "Simulações", "WhatsApp", "Formulário"].map(
                              (head) => (
                                <th
                                  key={head}
                                  className="label py-2 pr-4 text-right font-normal text-ink-400"
                                >
                                  {head}
                                </th>
                              ),
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {view.vehicles.map((row) => (
                            <tr key={row.id} className="border-b border-ink-100">
                              <td className="py-3 pr-4 font-medium">{row.titulo}</td>
                              {[
                                row.visualizacoes,
                                row.cliquesCard,
                                row.fotos,
                                row.simulacoes,
                                row.whatsapp,
                                row.leads,
                              ].map((value, index) => (
                                <td
                                  key={index}
                                  className="tnum py-3 pr-4 text-right font-mono text-xs"
                                >
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>

                <Card title="Onde o WhatsApp é clicado" hint="Qual botão do site realmente trabalha.">
                  <BarList rows={view.ctas} />
                </Card>
              </div>
            )}

            {tab === "Buscas" && (
              <div className="space-y-6">
                <Card
                  title="Filtros que não acharam carro"
                  hint="Demanda que o estoque não atendeu. É a lista mais útil para decidir a próxima compra."
                >
                  {view.emptyFilters.length === 0 ? (
                    <Empty>Nenhuma busca terminou sem resultado. Bom sinal.</Empty>
                  ) : (
                    <BarList
                      rows={view.emptyFilters.map((row) => ({
                        rotulo: row.descricao,
                        total: row.vezes,
                      }))}
                      limit={12}
                    />
                  )}
                </Card>

                <Card title="O que digitaram na busca">
                  {view.searches.length === 0 ? (
                    <Empty>Ninguém digitou nada na busca no período.</Empty>
                  ) : (
                    <BarList
                      rows={view.searches.map((row) => ({
                        rotulo: row.termo,
                        total: row.vezes,
                        detalhe: row.semResultado
                          ? `${row.semResultado} sem resultado`
                          : undefined,
                      }))}
                      limit={12}
                    />
                  )}
                </Card>

                <Card
                  title="O que o visitante consegue pagar"
                  hint="Vindo do simulador de parcela do anúncio."
                >
                  {view.simulator.ajustes === 0 ? (
                    <Empty>Ninguém mexeu no simulador no período.</Empty>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-3">
                      <StatTile
                        label="Entrada média"
                        value={`${Math.round(view.simulator.entradaMediaPercentual)}%`}
                      />
                      <StatTile
                        label="Parcela mediana"
                        value={formatPrice(view.simulator.parcelaMediana)}
                      />
                      <StatTile
                        label="Prazo preferido"
                        value={
                          view.simulator.prazoPreferido
                            ? `${view.simulator.prazoPreferido}x`
                            : "—"
                        }
                      />
                    </div>
                  )}
                </Card>
              </div>
            )}

            {tab === "Visitas" && <SessionExplorer sessions={view.sessions} />}

            {tab === "Contatos" && (
              <Card
                title="Contatos recebidos"
                hint="Enviados pelo formulário do anúncio. Contém dado pessoal — trate com cuidado."
              >
                <LeadsTable leads={data?.leads ?? []} />
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
