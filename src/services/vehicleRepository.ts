import { VEHICLES } from "@/data/vehicles";
import type { Vehicle, VehicleQuery } from "@/domain/types";
import { applyFilters, sortVehicles } from "@/lib/filters";

/**
 * Contrato de acesso a dados. A UI depende apenas desta interface, então
 * trocar o mock por uma API HTTP não exige mudança nos componentes.
 */
export interface VehicleRepository {
  search(query: VehicleQuery): Vehicle[];
  getBySlug(slug: string): Vehicle | undefined;
  getHighlighted(limit?: number): Vehicle[];
  /** Carro do palco da home: o marcado como showcase, ou o destaque mais caro. */
  getShowcase(): Vehicle;
  getRelated(vehicle: Vehicle, limit?: number): Vehicle[];
  listBrands(): string[];
  /** Faixa de preço de uma carroceria — alimenta a régua de preço do anúncio. */
  priceRange(body: Vehicle["body"]): { min: number; max: number };
  all(): Vehicle[];
}

export const vehicleRepository: VehicleRepository = {
  search: (query) => sortVehicles(applyFilters(VEHICLES, query), query.sort),

  getBySlug: (slug) => VEHICLES.find((vehicle) => vehicle.slug === slug),

  getHighlighted: (limit = 6) =>
    sortVehicles(
      VEHICLES.filter((vehicle) => vehicle.highlighted),
      "relevancia",
    ).slice(0, limit),

  getShowcase: () =>
    VEHICLES.find((vehicle) => vehicle.showcase) ??
    [...VEHICLES]
      .filter((vehicle) => vehicle.highlighted)
      .sort((a, b) => b.price - a.price)[0],

  getRelated: (vehicle, limit = 3) =>
    VEHICLES.filter(
      (candidate) =>
        candidate.id !== vehicle.id &&
        (candidate.body === vehicle.body || candidate.brand === vehicle.brand),
    )
      .sort(
        (a, b) =>
          Math.abs(a.price - vehicle.price) - Math.abs(b.price - vehicle.price),
      )
      .slice(0, limit),

  listBrands: () => [...new Set(VEHICLES.map((vehicle) => vehicle.brand))].sort(),

  priceRange: (body) => {
    const prices = VEHICLES.filter((vehicle) => vehicle.body === body).map(
      (vehicle) => vehicle.price,
    );
    return prices.length
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : { min: 0, max: 0 };
  },

  all: () => VEHICLES,
};
