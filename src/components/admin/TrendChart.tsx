"use client";

import { useMemo, useState } from "react";
import type { DailyPoint } from "@/lib/insights";
import { formatDay } from "@/lib/insights";
import { Card, Empty, LegendKey, SERIES, formatCount } from "@/components/admin/primitives";

/** Três contagens do mesmo tipo, então um eixo só — nunca dois eixos y. */
const LINES = [
  { key: "sessoes", label: "Visitas", color: SERIES.sessoes },
  { key: "anuncios", label: "Anúncios abertos", color: SERIES.anuncios },
  { key: "contatos", label: "Pedidos de contato", color: SERIES.contatos },
] as const;

const W = 720;
const H = 230;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

/** Teto redondo: 0 / 5 / 10 / 20 / 50 lê melhor que 0 / 7 / 14. */
function niceMax(value: number): number {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) {
    const candidate = step * magnitude;
    if (candidate >= value) return candidate;
  }
  return 10 * magnitude;
}

export function TrendChart({ points }: { points: DailyPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const max = useMemo(
    () =>
      niceMax(
        Math.max(...points.flatMap((p) => [p.sessoes, p.anuncios, p.contatos]), 1),
      ),
    [points],
  );

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (index: number) =>
    PAD.left + (points.length <= 1 ? plotW / 2 : (index / (points.length - 1)) * plotW);
  const y = (value: number) => PAD.top + plotH - (value / max) * plotH;

  const ticks = [0, max / 2, max];
  // Umas seis datas no eixo: mais que isso vira borrão em 90 dias.
  const labelEvery = Math.max(1, Math.ceil(points.length / 6));

  const totalNoPeriodo = points.reduce((sum, p) => sum + p.sessoes, 0);

  if (points.length === 0 || totalNoPeriodo === 0) {
    return (
      <Card title="Movimento do site" hint="Visitas, anúncios abertos e pedidos de contato por dia.">
        <Empty>Nenhuma visita registrada ainda neste período.</Empty>
      </Card>
    );
  }

  const active = hover != null ? points[hover] : null;

  // Rótulo na ponta da linha só quando há espaço: empilhar rótulo colado detacha
  // o número da sua linha e vira ruído.
  const ends = LINES.map((line) => ({
    line,
    value: points[points.length - 1][line.key],
    y: y(points[points.length - 1][line.key]),
  }));
  const labelled = new Set(
    ends
      .filter((end) =>
        ends.every((other) => other === end || Math.abs(other.y - end.y) >= 15),
      )
      .map((end) => end.line.key),
  );

  return (
    <Card
      title="Movimento do site"
      hint="Visitas, anúncios abertos e pedidos de contato por dia."
      action={
        <button
          type="button"
          onClick={() => setShowTable((open) => !open)}
          className="label shrink-0 rounded-md border border-ink-200 px-3 py-2 text-ink-500 transition hover:border-ink-900 hover:text-ink-900"
        >
          {showTable ? "Ver gráfico" : "Ver tabela"}
        </button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2">
        {LINES.map((line) => (
          <LegendKey key={line.key} color={line.color} label={line.label} />
        ))}
      </div>

      {showTable ? (
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-ink-200 text-left">
                <th className="label py-2 font-normal text-ink-400">Dia</th>
                {LINES.map((line) => (
                  <th key={line.key} className="label py-2 text-right font-normal text-ink-400">
                    {line.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...points].reverse().map((point) => (
                <tr key={point.dia} className="border-b border-ink-100">
                  <td className="tnum py-2 font-mono text-xs text-ink-500">
                    {formatDay(point.dia)}
                  </td>
                  {LINES.map((line) => (
                    <td key={line.key} className="tnum py-2 text-right font-mono text-xs">
                      {point[line.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label={`Movimento do site por dia. ${LINES.map((l) => l.label).join(", ")}.`}
            onMouseLeave={() => setHover(null)}
          >
            {/* Grade em fio sólido de 1px, recuada: referência, não conteúdo. */}
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke="#e4e3df"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 8}
                  y={y(tick) + 4}
                  textAnchor="end"
                  className="fill-ink-400 font-mono"
                  fontSize={10}
                >
                  {Math.round(tick)}
                </text>
              </g>
            ))}

            {points.map((point, index) =>
              index % labelEvery === 0 || index === points.length - 1 ? (
                <text
                  key={point.dia}
                  x={x(index)}
                  y={H - 8}
                  textAnchor="middle"
                  className="fill-ink-400 font-mono"
                  fontSize={10}
                >
                  {formatDay(point.dia)}
                </text>
              ) : null,
            )}

            {hover != null && (
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={PAD.top}
                y2={PAD.top + plotH}
                stroke="#99a1ad"
                strokeWidth={1}
              />
            )}

            {LINES.map((line) => (
              <polyline
                key={line.key}
                points={points.map((point, index) => `${x(index)},${y(point[line.key])}`).join(" ")}
                fill="none"
                stroke={line.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Marcador final com anel na cor da superfície, para não sumir num cruzamento. */}
            {ends.map((end) => (
              <g key={end.line.key}>
                <circle
                  cx={x(points.length - 1)}
                  cy={end.y}
                  r={4}
                  fill={end.line.color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
                {labelled.has(end.line.key) && end.value > 0 && (
                  <text
                    x={x(points.length - 1) - 10}
                    y={end.y - 8}
                    textAnchor="end"
                    className="fill-ink-700 font-mono"
                    fontSize={10}
                  >
                    {end.value}
                  </text>
                )}
              </g>
            ))}

            {hover != null &&
              LINES.map((line) => (
                <circle
                  key={line.key}
                  cx={x(hover)}
                  cy={y(points[hover][line.key])}
                  r={4}
                  fill={line.color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}

            {/* Faixas de captura largas: o alvo do mouse é maior que a marca. */}
            {points.map((point, index) => (
              <rect
                key={point.dia}
                x={x(index) - plotW / Math.max(points.length - 1, 1) / 2}
                y={PAD.top}
                width={plotW / Math.max(points.length - 1, 1)}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(index)}
              />
            ))}
          </svg>

          {active && (
            <div
              className="pointer-events-none absolute top-0 z-10 w-max -translate-x-1/2 rounded-lg border border-ink-200 bg-white p-3 shadow-lg"
              style={{ left: `${(x(hover as number) / W) * 100}%` }}
            >
              <p className="label mb-2 text-ink-400">{formatDay(active.dia)}</p>
              <ul className="space-y-1">
                {LINES.map((line) => (
                  <li key={line.key} className="flex items-center gap-2 text-xs text-ink-700">
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full"
                      style={{ background: line.color }}
                    />
                    <span className="mr-2">{line.label}</span>
                    <span className="tnum ml-auto font-mono font-medium">
                      {formatCount(active[line.key])}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
