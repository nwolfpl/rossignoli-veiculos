"use client";

import { useEffect, useRef } from "react";
import type { Vehicle } from "@/domain/types";
import { track } from "@/services/analyticsClient";

/**
 * Marca a visualização de um anúncio. A página do anúncio é um Server Component,
 * então o registro precisa de um componente cliente mínimo — só isso é enviado
 * ao navegador, nada da página muda.
 */
export function TrackVehicleView({ vehicle }: { vehicle: Vehicle }) {
  const registrado = useRef<string | null>(null);

  useEffect(() => {
    if (registrado.current === vehicle.id) return;
    registrado.current = vehicle.id;

    track("anuncio_visto", {
      vehicle: {
        id: vehicle.id,
        slug: vehicle.slug,
        titulo: `${vehicle.brand} ${vehicle.model} ${vehicle.version}`,
      },
      valor: vehicle.price,
      detalhes: {
        marca: vehicle.brand,
        modelo: vehicle.model,
        ano: vehicle.year,
        km: vehicle.mileage,
        carroceria: vehicle.body,
        cambio: vehicle.transmission,
        combustivel: vehicle.fuel,
      },
    });
  }, [vehicle]);

  return null;
}
