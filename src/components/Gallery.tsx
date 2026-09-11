"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PHOTO_VIEWS,
  VIEW_LABELS,
  VehiclePhoto,
  type PhotoView,
} from "@/components/VehiclePhoto";
import type { Vehicle } from "@/domain/types";

export function Gallery({ vehicle }: { vehicle: Vehicle }) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const view: PhotoView = PHOTO_VIEWS[index];

  const move = useCallback(
    (delta: number) =>
      setIndex((current) => (current + delta + PHOTO_VIEWS.length) % PHOTO_VIEWS.length),
    [],
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
      <div className="group relative overflow-hidden rounded-xl border border-fumaca">
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="block w-full cursor-zoom-in"
          aria-label="Ampliar imagem"
        >
          <VehiclePhoto
            vehicle={vehicle}
            view={view}
            variant="stage"
            className="aspect-[16/10] w-full"
          />
        </button>

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

        <p className="label absolute bottom-4 right-4 rounded bg-asfalto/80 px-2.5 py-1.5 text-cromo/70">
          {index + 1}/{PHOTO_VIEWS.length} · imagem ilustrativa
        </p>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3">
        {PHOTO_VIEWS.map((item, itemIndex) => (
          <button
            key={item}
            type="button"
            onClick={() => setIndex(itemIndex)}
            aria-label={`Ver ${VIEW_LABELS[item]}`}
            aria-current={itemIndex === index}
            className={`overflow-hidden rounded-lg border transition ${
              itemIndex === index
                ? "border-brand-500"
                : "border-fumaca opacity-60 hover:opacity-100"
            }`}
          >
            <VehiclePhoto
              vehicle={vehicle}
              view={item}
              variant="stage"
              className="aspect-[16/10] w-full"
            />
          </button>
        ))}
      </div>

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
            className="absolute right-5 top-5 label rounded border border-fumaca px-3 py-2 text-cromo transition hover:text-white"
          >
            Fechar (esc)
          </button>
          <VehiclePhoto
            vehicle={vehicle}
            view={view}
            variant="stage"
            className="max-h-[80vh] w-full max-w-5xl rounded-xl"
          />
          <div className="absolute bottom-6 flex gap-3">
            {PHOTO_VIEWS.map((item, itemIndex) => (
              <button
                key={item}
                type="button"
                onClick={() => setIndex(itemIndex)}
                className={`label px-3 py-1.5 transition ${
                  itemIndex === index ? "text-brand-500" : "text-cromo/50 hover:text-cromo"
                }`}
              >
                {VIEW_LABELS[item]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
