import { formatPrice } from "@/lib/format";

type Props = {
  price: number;
  min: number;
  max: number;
  segment: string;
};

/**
 * Régua de odômetro mostrando onde o preço deste carro cai dentro da faixa
 * do mesmo tipo de carroceria — calculada só com o estoque do protótipo.
 */
export function PriceScale({ price, min, max, segment }: Props) {
  const span = Math.max(1, max - min);
  const position = Math.min(100, Math.max(0, ((price - min) / span) * 100));

  return (
    <div>
      <p className="label text-ink-400">Faixa de {segment} no estoque</p>

      <div className="relative mt-4 h-8">
        <div className="ticks absolute inset-x-0 top-3 h-3 text-ink-200" aria-hidden />
        <div
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${position}%` }}
        >
          <span className="tnum font-mono text-[11px] font-medium text-brand-600">
            este carro
          </span>
          <span className="mt-1 h-6 w-0.5 bg-brand-500" />
        </div>
      </div>

      <div className="tnum mt-1 flex justify-between font-mono text-[11px] text-ink-400">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  );
}
