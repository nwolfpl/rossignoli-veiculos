"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { VehicleCard } from "@/components/VehicleCard";
import { SORT_LABELS, type SortKey, type VehicleQuery } from "@/domain/types";
import { averagePriceByBody } from "@/lib/filters";
import { vehicleRepository } from "@/services/vehicleRepository";

type FieldOption = { value: string; label: string };

const FIELDS: {
  param: keyof VehicleQuery;
  label: string;
  options: FieldOption[];
}[] = [
  {
    param: "brand",
    label: "Marca",
    options: [
      { value: "", label: "Todas" },
      ...vehicleRepository.listBrands().map((brand) => ({ value: brand, label: brand })),
    ],
  },
  {
    param: "body",
    label: "Carroceria",
    options: [
      { value: "", label: "Todas" },
      { value: "Hatch", label: "Hatch" },
      { value: "Sedã", label: "Sedã" },
      { value: "SUV", label: "SUV" },
      { value: "Picape", label: "Picape" },
      { value: "Minivan", label: "Minivan" },
    ],
  },
  {
    param: "transmission",
    label: "Câmbio",
    options: [
      { value: "", label: "Todos" },
      { value: "Manual", label: "Manual" },
      { value: "Automático", label: "Automático" },
      { value: "CVT", label: "CVT" },
      { value: "Automatizado", label: "Automatizado" },
    ],
  },
  {
    param: "fuel",
    label: "Combustível",
    options: [
      { value: "", label: "Todos" },
      { value: "Flex", label: "Flex" },
      { value: "Gasolina", label: "Gasolina" },
      { value: "Diesel", label: "Diesel" },
      { value: "Híbrido", label: "Híbrido" },
      { value: "Elétrico", label: "Elétrico" },
    ],
  },
  {
    param: "minPrice",
    label: "Preço mínimo",
    options: [
      { value: "", label: "Sem mínimo" },
      { value: "40000", label: "R$ 40.000" },
      { value: "60000", label: "R$ 60.000" },
      { value: "90000", label: "R$ 90.000" },
      { value: "120000", label: "R$ 120.000" },
    ],
  },
  {
    param: "maxPrice",
    label: "Preço máximo",
    options: [
      { value: "", label: "Sem máximo" },
      { value: "50000", label: "R$ 50.000" },
      { value: "80000", label: "R$ 80.000" },
      { value: "120000", label: "R$ 120.000" },
      { value: "200000", label: "R$ 200.000" },
    ],
  },
  {
    param: "minYear",
    label: "Ano a partir de",
    options: [
      { value: "", label: "Qualquer ano" },
      { value: "2015", label: "2015" },
      { value: "2019", label: "2019" },
      { value: "2021", label: "2021" },
      { value: "2023", label: "2023" },
    ],
  },
  {
    param: "maxMileage",
    label: "Quilometragem até",
    options: [
      { value: "", label: "Qualquer km" },
      { value: "40000", label: "40.000 km" },
      { value: "60000", label: "60.000 km" },
      { value: "80000", label: "80.000 km" },
      { value: "120000", label: "120.000 km" },
    ],
  },
];

const NUMERIC_PARAMS = new Set(["minPrice", "maxPrice", "minYear", "maxMileage"]);

const buildQuery = (params: URLSearchParams): VehicleQuery => {
  const query: VehicleQuery = {};
  for (const field of FIELDS) {
    const raw = params.get(field.param);
    if (!raw) continue;
    if (NUMERIC_PARAMS.has(field.param)) {
      (query[field.param] as number) = Number(raw);
    } else {
      (query[field.param] as string) = raw;
    }
  }
  const q = params.get("q");
  if (q) query.q = q;
  const sort = params.get("sort") as SortKey | null;
  if (sort && sort in SORT_LABELS) query.sort = sort;
  return query;
};

export function VehicleBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const query = useMemo(() => buildQuery(searchParams), [searchParams]);
  const results = useMemo(() => vehicleRepository.search(query), [query]);
  const averages = useMemo(() => averagePriceByBody(vehicleRepository.all()), []);

  const activeCount = Object.keys(query).filter((key) => key !== "sort").length;

  const update = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    router.replace(`/carros${params.size ? `?${params}` : ""}`, { scroll: false });
  };

  const clearAll = () => router.replace("/carros", { scroll: false });

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <label htmlFor="filtro-q" className="label mb-2 block text-ink-400">
          Buscar
        </label>
        <input
          id="filtro-q"
          defaultValue={query.q ?? ""}
          onChange={(event) => update("q", event.target.value)}
          placeholder="Marca, modelo ou versão"
          className="h-11 w-full rounded-md border border-ink-200 px-3 text-sm outline-none transition focus:border-ink-900"
        />
      </div>

      {FIELDS.map((field) => (
        <div key={field.param}>
          <label htmlFor={`filtro-${field.param}`} className="label mb-2 block text-ink-400">
            {field.label}
          </label>
          <select
            id={`filtro-${field.param}`}
            value={String(query[field.param] ?? "")}
            onChange={(event) => update(field.param, event.target.value)}
            className="h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm outline-none transition focus:border-ink-900"
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="label w-full rounded-md border border-ink-200 py-3 text-ink-700 transition hover:border-ink-900 hover:text-ink-900"
        >
          Limpar filtros ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="stage border-b border-fumaca">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-10 sm:px-6">
          <div>
            <p className="label text-brand-500">Estoque completo</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {results.length}{" "}
              {results.length === 1 ? "carro disponível" : "carros disponíveis"}
            </h1>
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="label rounded-md border border-fumaca px-4 py-2.5 text-cromo transition hover:border-cromo hover:text-white"
            >
              Limpar {activeCount} {activeCount === 1 ? "filtro" : "filtros"}
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">{filterPanel}</div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-4">
              <p className="label text-ink-400">
                {results.length} {results.length === 1 ? "resultado" : "resultados"}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="label rounded-md border border-ink-200 px-4 py-2.5 lg:hidden"
                >
                  Filtros{activeCount > 0 ? ` (${activeCount})` : ""}
                </button>

                <label htmlFor="ordenar" className="sr-only">
                  Ordenar por
                </label>
                <select
                  id="ordenar"
                  value={query.sort ?? "relevancia"}
                  onChange={(event) => update("sort", event.target.value)}
                  className="h-10 rounded-md border border-ink-200 bg-white px-3 text-sm outline-none transition focus:border-ink-900"
                >
                  {Object.entries(SORT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {results.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    averagePrice={averages.get(vehicle.body)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-xl border border-dashed border-ink-200 px-6 py-20 text-center">
                <p className="font-display text-xl font-extrabold tracking-tight">
                  Nenhum carro com esses filtros
                </p>
                <p className="mx-auto mt-3 max-w-sm text-sm text-ink-500">
                  Tente ampliar a faixa de preço, o ano ou a quilometragem.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-7 rounded-md bg-asfalto px-6 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-grafite"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar filtros"
            onClick={() => setFiltersOpen(false)}
            className="absolute inset-0 bg-asfalto/60 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-2xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-lg font-extrabold tracking-tight">Filtros</p>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="label text-ink-400"
              >
                Fechar
              </button>
            </div>
            {filterPanel}
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="mt-6 w-full rounded-md bg-brand-500 py-4 font-display text-sm font-bold uppercase tracking-wider text-asfalto"
            >
              Ver {results.length} {results.length === 1 ? "carro" : "carros"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
