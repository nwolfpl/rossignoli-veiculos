import Link from "next/link";
import { Badge } from "@/components/Badge";
import { VehicleMedia } from "@/components/VehiclePhoto";
import type { Vehicle } from "@/domain/types";
import { DEFAULT_TERM, showcaseInstallment } from "@/lib/finance";
import { daysSince, formatKm, formatPrice, formatYear } from "@/lib/format";

type Props = {
  vehicle: Vehicle;
  /** Média de preço da mesma carroceria no estoque — base do selo de oportunidade. */
  averagePrice?: number;
};

export function VehicleCard({ vehicle, averagePrice }: Props) {
  const isNew = daysSince(vehicle.publishedAt) <= 10;
  const belowAverage = averagePrice != null && vehicle.price < averagePrice * 0.92;
  const age = Math.max(1, new Date().getFullYear() - vehicle.modelYear);
  const lowMileage = vehicle.mileage < 60_000 && vehicle.mileage / age < 10_000;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-ink-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-ink-400/50 hover:shadow-[0_28px_60px_-34px_rgba(13,15,18,0.65)]">
      <div className="relative overflow-hidden bg-ink-100">
        <VehicleMedia
          vehicle={vehicle}
          className="aspect-[16/10] w-full transition duration-700 group-hover:scale-[1.04]"
        />
        {vehicle.highlighted && (
          <span className="label absolute left-4 top-4 rounded bg-asfalto/90 px-2.5 py-1.5 text-brand-500">
            Destaque
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-lg font-bold leading-tight tracking-tight">
            <Link href={`/anuncio/${vehicle.slug}`} className="before:absolute before:inset-0">
              {vehicle.brand} {vehicle.model}
            </Link>
          </h3>
          <p className="mt-1 truncate text-sm text-ink-500">{vehicle.version}</p>
        </div>

        <p className="tnum font-mono text-[12px] uppercase tracking-wider text-ink-500">
          {formatYear(vehicle.year, vehicle.modelYear)} · {formatKm(vehicle.mileage)} ·{" "}
          {vehicle.transmission}
        </p>

        <div>
          <p className="tnum font-display text-2xl font-extrabold leading-none tracking-tight">
            {DEFAULT_TERM}x de {formatPrice(showcaseInstallment(vehicle.price))}
          </p>
          <p className="tnum mt-1.5 font-mono text-[11px] text-ink-500">
            entrada 30% ·{" "}
            <span className="font-medium text-ink-700">
              {formatPrice(vehicle.price)} à vista
            </span>
          </p>
        </div>

        {(belowAverage || lowMileage || isNew) && (
          <div className="flex flex-wrap gap-1.5">
            {belowAverage && <Badge tone="success">Abaixo da média do estoque</Badge>}
            {lowMileage && <Badge tone="info">Pouco rodado</Badge>}
            {isNew && !belowAverage && !lowMileage && <Badge tone="brand">Novo no pátio</Badge>}
          </div>
        )}

        <p className="label mt-auto border-t border-ink-100 pt-4 text-ink-400">
          {vehicle.city} · {vehicle.state}
        </p>
      </div>
    </article>
  );
}
