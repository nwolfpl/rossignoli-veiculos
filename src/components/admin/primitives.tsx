"use client";

import type { ReactNode } from "react";

/**
 * Peças do painel. As especificações vêm do guia de visualização de dados:
 * marca fina (até 24px), ponta arredondada em 4px e base reta, grade em fio de
 * 1px recuada, e texto sempre em token de tinta — nunca na cor da série.
 *
 * A paleta é a da própria marca, validada para daltonismo e contraste sobre
 * fundo claro: laranja #D65A0C, azul #3F6EA8, verde #2F9E6B.
 */
export const SERIES = {
  sessoes: "#D65A0C",
  anuncios: "#3F6EA8",
  contatos: "#2F9E6B",
} as const;

const compact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const plain = new Intl.NumberFormat("pt-BR");

/** Números grandes ficam compactos; até 10 mil o valor inteiro é mais informativo. */
export const formatCount = (value: number) =>
  value >= 10_000 ? compact.format(value) : plain.format(value);

export const formatPercent = (value: number) =>
  `${(value * 100).toFixed(value >= 0.1 ? 0 : 1)}%`;

export function Card({
  title,
  hint,
  children,
  action,
}: {
  title?: string;
  hint?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-ink-200 bg-white p-5 sm:p-6">
      {(title || action) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="font-display text-base font-extrabold tracking-tight">{title}</h2>
            )}
            {hint && <p className="mt-1 text-xs leading-relaxed text-ink-400">{hint}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/**
 * Bloco de número. O valor usa figuras proporcionais, não tabulares: `tnum` é
 * para colunas que precisam alinhar, e num número de display deixa o texto solto.
 */
export function StatTile({
  label,
  value,
  hint,
  tone = "neutro",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutro" | "destaque";
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        tone === "destaque" ? "border-brand-200 bg-brand-50" : "border-ink-200 bg-white"
      }`}
    >
      <p className="label text-ink-400">{label}</p>
      <p className="mt-2 font-sans text-2xl font-semibold leading-none text-ink-900">{value}</p>
      {hint && <p className="mt-2 text-[11px] leading-snug text-ink-400">{hint}</p>}
    </div>
  );
}

export interface BarRow {
  rotulo: string;
  total: number;
  /** Texto à direita, quando o número bruto não conta a história inteira. */
  detalhe?: string;
}

/**
 * Lista de barras horizontais. Uma série só, então hue sequencial e sem legenda:
 * o título do cartão já diz o que está medido. O valor vive em coluna própria à
 * direita — assim nenhum rótulo é cortado por uma barra curta.
 */
export function BarList({
  rows,
  limit = 8,
  empty = "Sem dados no período.",
}: {
  rows: BarRow[];
  limit?: number;
  empty?: string;
}) {
  const visible = rows.slice(0, limit);
  const max = Math.max(...visible.map((row) => row.total), 1);

  if (visible.length === 0) return <Empty>{empty}</Empty>;

  return (
    <ul className="space-y-3">
      {visible.map((row) => (
        <li key={row.rotulo} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5">
          <p className="truncate text-sm text-ink-700" title={row.rotulo}>
            {row.rotulo}
          </p>
          <p className="tnum font-mono text-xs text-ink-500">
            {formatCount(row.total)}
            {row.detalhe && <span className="ml-2 text-ink-400">{row.detalhe}</span>}
          </p>
          <div className="col-span-2 h-1.5 rounded-sm bg-ink-100">
            <div
              className="h-full rounded-r-[4px] bg-brand-600"
              style={{ width: `${Math.max((row.total / max) * 100, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Funil por sessão. Mesma hue em toda a escada: a queda é o dado, não a cor. */
export function Funnel({
  steps,
}: {
  steps: { rotulo: string; sessoes: number; parte: number }[];
}) {
  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li key={step.rotulo}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm text-ink-700">
              <span className="label mr-2 text-ink-400">{index + 1}</span>
              {step.rotulo}
            </p>
            <p className="tnum font-mono text-xs text-ink-500">
              {formatCount(step.sessoes)}
              <span className="ml-2 text-ink-400">{formatPercent(step.parte)}</span>
            </p>
          </div>
          <div className="mt-2 h-2.5 rounded-sm bg-ink-100">
            <div
              className="h-full rounded-r-[4px] bg-brand-600"
              style={{ width: `${Math.max(step.parte * 100, 1.5)}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-ink-200 px-4 py-10 text-center text-sm text-ink-400">
      {children}
    </p>
  );
}

/** Chave de identidade da série: o ponto colorido ao lado do texto, nunca o texto colorido. */
export function LegendKey({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-xs text-ink-500">
      <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
