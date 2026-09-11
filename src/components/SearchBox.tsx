"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const PRICE_OPTIONS = [
  { value: "", label: "Qualquer valor" },
  { value: "50000", label: "até R$ 50.000" },
  { value: "80000", label: "até R$ 80.000" },
  { value: "120000", label: "até R$ 120.000" },
  { value: "200000", label: "até R$ 200.000" },
];

const fieldClass =
  "h-12 w-full rounded-md border border-fumaca bg-grafite px-3 text-sm text-white outline-none transition placeholder:text-cromo/40 focus:border-brand-500";

/** Console de busca do hero — etiquetas em mono, como um painel. */
export function SearchBox({ brands }: { brands: string[] }) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [brand, setBrand] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (term.trim()) params.set("q", term.trim());
    if (brand) params.set("brand", brand);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/carros${params.size ? `?${params}` : ""}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-lg border border-fumaca bg-asfalto/80 p-4 backdrop-blur sm:grid-cols-[1.5fr_1fr_1fr_auto] sm:items-end"
    >
      <div>
        <label htmlFor="busca" className="label mb-2 block text-cromo/60">
          Busca
        </label>
        <input
          id="busca"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Onix, SUV automático, Hilux…"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="marca" className="label mb-2 block text-cromo/60">
          Marca
        </label>
        <select
          id="marca"
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
          className={fieldClass}
        >
          <option value="">Todas</option>
          {brands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="preco" className="label mb-2 block text-cromo/60">
          Preço
        </label>
        <select
          id="preco"
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          className={fieldClass}
        >
          {PRICE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="h-12 rounded-md bg-brand-500 px-7 font-display text-sm font-bold uppercase tracking-wider text-asfalto transition hover:bg-brand-400"
      >
        Ver carros
      </button>
    </form>
  );
}
