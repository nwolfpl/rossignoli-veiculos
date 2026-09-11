"use client";

import { useState } from "react";
import {
  DEFAULT_DOWN_RATE,
  DEFAULT_TERM,
  EXAMPLE_MONTHLY_RATE,
  TERM_OPTIONS,
  simulate,
} from "@/lib/finance";
import { formatPrice } from "@/lib/format";
import { SITE, whatsappLink } from "@/lib/site";

export function FinanceSimulator({
  price,
  vehicleTitle,
}: {
  price: number;
  vehicleTitle: string;
}) {
  const [down, setDown] = useState(Math.round(price * DEFAULT_DOWN_RATE));
  const [months, setMonths] = useState(DEFAULT_TERM);
  const [rate, setRate] = useState(Number((EXAMPLE_MONTHLY_RATE * 100).toFixed(2)));

  const result = simulate(price, down, months, rate / 100);
  const downPercent = Math.round((down / price) * 100);

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-6">
      <h2 className="font-display text-base font-extrabold tracking-tight">
        Simule a parcela
      </h2>
      <p className="mt-1 text-xs text-ink-400">
        Cálculo ilustrativo em parcelas fixas. A taxa real depende do banco e do seu
        perfil.
      </p>

      <div className="mt-5 space-y-5">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="entrada" className="label text-ink-400">
              Entrada
            </label>
            <span className="tnum font-mono text-xs text-ink-500">
              {formatPrice(down)} · {downPercent}%
            </span>
          </div>
          <input
            id="entrada"
            type="range"
            min={0}
            max={Math.round(price * 0.8)}
            step={500}
            value={down}
            onChange={(event) => setDown(Number(event.target.value))}
            className="mt-3 w-full accent-brand-500"
          />
        </div>

        <div>
          <p className="label mb-2 text-ink-400">Parcelas</p>
          <div className="flex flex-wrap gap-2">
            {TERM_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMonths(option)}
                aria-pressed={months === option}
                className={`tnum rounded-md border px-3 py-2 font-mono text-xs transition ${
                  months === option
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-ink-200 text-ink-500 hover:border-ink-400"
                }`}
              >
                {option}x
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="taxa" className="label mb-2 block text-ink-400">
            Taxa de juros ao mês
          </label>
          <div className="flex items-center gap-2">
            <input
              id="taxa"
              type="number"
              min={0}
              max={10}
              step={0.01}
              value={rate}
              onChange={(event) => setRate(Number(event.target.value) || 0)}
              className="tnum h-10 w-24 rounded-md border border-ink-200 px-3 font-mono text-sm outline-none focus:border-ink-900"
            />
            <span className="font-mono text-xs text-ink-400">% a.m.</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-neblina p-5">
        <p className="label text-ink-400">Parcela estimada</p>
        <p className="tnum mt-2 font-display text-3xl font-extrabold tracking-tight">
          {formatPrice(result.installment)}
          <span className="ml-1 text-base font-bold text-ink-400">/mês</span>
        </p>

        <dl className="mt-4 space-y-1.5 font-mono text-[11px] text-ink-500">
          <div className="flex justify-between">
            <dt>Valor financiado</dt>
            <dd className="tnum">{formatPrice(result.financed)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Total com juros</dt>
            <dd className="tnum">{formatPrice(result.total)}</dd>
          </div>
        </dl>
      </div>

      <a
        href={whatsappLink(
          `Olá! Quero simular o financiamento do ${vehicleTitle}: entrada de ${formatPrice(down)} em ${months} vezes.`,
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block rounded-md border border-ink-900 py-3 text-center font-display text-sm font-bold uppercase tracking-wider transition hover:bg-ink-900 hover:text-white"
      >
        Fazer proposta real
      </a>
      <p className="mt-3 text-center font-mono text-[10px] leading-relaxed text-ink-400">
        Simulação sem valor de oferta. {SITE.name} não é instituição financeira.
      </p>
    </div>
  );
}
