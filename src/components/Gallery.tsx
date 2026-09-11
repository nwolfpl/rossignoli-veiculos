"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { VehicleMedia, slideCount } from "@/components/VehiclePhoto";
import { creditsFor } from "@/data/photos";
import type { Vehicle } from "@/domain/types";

export function Gallery({ vehicle }: { vehicle: Vehicle }) {
  const total = slideCount(vehicle);
  const credits = creditsFor(vehicle.id);
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const credit = credits[index];

  const move = useCallback(
    (delta: number) => setIndex((current) => (current + delta + total) % total),
    [total],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "Escape") setZoomed(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-fumaca bg-asfalto">
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="block w-full cursor-zoom-in"
          aria-label="Ampliar imagem"
        >
          <VehicleMedia
            vehicle={vehicle}
            index={index}
            variant="stage"
            priority
            className="aspect-[16/10] w-full"
          />
        </button>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Imagem anterior"
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-fumaca bg-asfalto/70 text-lg text-white backdrop-blur transition hover:bg-asfalto"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Próxima imagem"
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-fumaca bg-asfalto/70 text-lg text-white backdrop-blur transition hover:bg-asfalto"
            >
              ›
            </button>
          </>
        )}

        <p className="label absolute bottom-4 right-4 rounded bg-asfalto/85 px-2.5 py-1.5 text-cromo/70">
          {index + 1}/{total}
        </p>
      </div>

      {total > 1 && (
        <div className="mt-3 flex gap-3">
          {Array.from({ length: total }, (_, slide) => (
            <button
              key={slide}
              type="button"
              onClick={() => setIndex(slide)}
              aria-label={`Ver imagem ${slide + 1}`}
              aria-current={slide === index}
              className={`w-[23%] max-w-[150px] overflow-hidden rounded-lg border transition ${
                slide === index
                  ? "border-brand-500"
                  : "border-fumaca opacity-60 hover:opacity-100"
              }`}
            >
              <VehicleMedia
                vehicle={vehicle}
                index={slide}
                variant="stage"
                className="aspect-[16/10] w-full"
              />
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 font-mono text-[11px] leading-relaxed text-cromo/45">
        {credit ? (
          <>
            Foto do modelo: {credit.author} · {credit.license} ·{" "}
            <a
              href={credit.source}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition hover:text-cromo"
            >
              Wikimedia Commons
            </a>{" "}
            · <Link href="/creditos" className="underline underline-offset-2 hover:text-cromo">
              créditos
            </Link>
          </>
        ) : (
          "Imagem ilustrativa gerada para o protótipo."
        )}
      </p>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-asfalto/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Imagem ampliada — ${vehicle.brand} ${vehicle.model}`}
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            className="label absolute right-5 top-5 rounded border border-fumaca px-3 py-2 text-cromo transition hover:text-white"
          >
            Fechar (esc)
          </button>
          <VehicleMedia
            vehicle={vehicle}
            index={index}
            variant="stage"
            className="max-h-[82vh] w-auto max-w-5xl rounded-xl"
          />
          {total > 1 && (
            <div className="label absolute bottom-6 flex items-center gap-4 text-cromo/60">
              <button type="button" onClick={() => move(-1)} className="hover:text-white">
                anterior
              </button>
              <span className="text-cromo/40">
                {index + 1}/{total}
              </span>
              <button type="button" onClick={() => move(1)} className="hover:text-white">
                próxima
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
