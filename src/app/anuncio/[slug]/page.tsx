import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/ContactForm";
import { Gallery } from "@/components/Gallery";
import { PriceScale } from "@/components/PriceScale";
import { Reveal } from "@/components/Reveal";
import { VehicleCard } from "@/components/VehicleCard";
import { formatKm, formatPrice, formatYear } from "@/lib/format";
import { SITE, whatsappLink } from "@/lib/site";
import { vehicleRepository } from "@/services/vehicleRepository";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return vehicleRepository.all().map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = vehicleRepository.getBySlug(slug);
  if (!vehicle) return { title: "Anúncio não encontrado" };

  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${formatYear(vehicle.year, vehicle.modelYear)}`;
  return {
    title,
    description: `${title} com ${formatKm(vehicle.mileage)} por ${formatPrice(vehicle.price)} em ${vehicle.city} - ${vehicle.state}.`,
    alternates: { canonical: `/anuncio/${vehicle.slug}` },
  };
}

const SAFETY_TIPS = [
  "Veja o carro pessoalmente e leve seu mecânico de confiança.",
  "Confira a documentação e o histórico antes de fechar.",
  "Não faça pagamento antecipado sem inspecionar o veículo.",
];

export default async function AnuncioPage({ params }: Params) {
  const { slug } = await params;
  const vehicle = vehicleRepository.getBySlug(slug);
  if (!vehicle) notFound();

  const related = vehicleRepository.getRelated(vehicle, 3);
  const range = vehicleRepository.priceRange(vehicle.body);
  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.version}`;
  const contactMessage = `Olá! Tenho interesse no ${title} ${vehicle.year} anunciado por ${formatPrice(vehicle.price)}.`;

  const specs: [string, string][] = [
    ["Marca", vehicle.brand],
    ["Modelo", vehicle.model],
    ["Versão", vehicle.version],
    ["Ano", formatYear(vehicle.year, vehicle.modelYear)],
    ["Quilometragem", formatKm(vehicle.mileage)],
    ["Potência", `${vehicle.power} cv`],
    ["Combustível", vehicle.fuel],
    ["Câmbio", vehicle.transmission],
    ["Carroceria", vehicle.body],
    ["Cor", vehicle.color],
    ["Portas", String(vehicle.doors)],
    ["Local", `${vehicle.city} - ${vehicle.state}`],
  ];

  return (
    <div className="pb-24 lg:pb-0">
      {/* Palco do anúncio */}
      <section className="stage border-b border-fumaca">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
          <nav aria-label="Você está em" className="mb-6 font-mono text-[11px] text-cromo/50">
            <Link href="/" className="transition hover:text-white">
              Início
            </Link>
            <span className="px-2">/</span>
            <Link href="/carros" className="transition hover:text-white">
              Estoque
            </Link>
            <span className="px-2">/</span>
            <span className="text-cromo/80">{title}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <Gallery vehicle={vehicle} />

            <aside>
              <div className="rounded-xl border border-fumaca bg-grafite p-6">
                {vehicle.highlighted && (
                  <p className="label mb-4 text-brand-500">Destaque do pátio</p>
                )}
                <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-white">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <p className="mt-1 text-sm text-cromo/70">{vehicle.version}</p>

                <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-fumaca py-5">
                  {[
                    ["Ano", formatYear(vehicle.year, vehicle.modelYear)],
                    ["Km", vehicle.mileage.toLocaleString("pt-BR")],
                    ["Câmbio", vehicle.transmission],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="label text-cromo/45">{label}</dt>
                      <dd className="tnum mt-1.5 text-sm text-white">{value}</dd>
                    </div>
                  ))}
                </dl>

                <p className="tnum mt-6 font-display text-4xl font-extrabold tracking-tight text-white">
                  {formatPrice(vehicle.price)}
                </p>
                <p className="label mt-2 text-cromo/50">
                  {vehicle.city} · {vehicle.state}
                </p>

                <a
                  href={whatsappLink(contactMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 block rounded-md bg-brand-500 py-4 text-center font-display text-sm font-bold uppercase tracking-wider text-asfalto transition hover:bg-brand-400"
                >
                  Tenho interesse
                </a>
                <p className="mt-3 text-center font-mono text-[11px] text-cromo/45">
                  {SITE.hours}
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-fumaca p-6">
                <p className="label text-cromo/45">Vendido por</p>
                <p className="mt-3 font-display text-base font-bold text-white">{SITE.name}</p>
                <p className="mt-1 text-sm text-cromo/60">Loja em {SITE.city}</p>
                <p className="mt-4 font-mono text-[11px] text-cromo/45">
                  Anúncio publicado em{" "}
                  {new Date(vehicle.publishedAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 py-14 lg:grid-cols-[1fr_340px]">
          <div className="space-y-14">
            <Reveal>
              <section>
                <h2 className="font-display text-xl font-extrabold tracking-tight">
                  Sobre este carro
                </h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-ink-500">
                  {vehicle.description}
                </p>
              </section>
            </Reveal>

            <Reveal>
              <section>
                <h2 className="font-display text-xl font-extrabold tracking-tight">
                  Ficha técnica
                </h2>
                <dl className="mt-5 grid gap-x-10 sm:grid-cols-2">
                  {specs.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-baseline justify-between gap-4 border-b border-ink-100 py-3"
                    >
                      <dt className="label text-ink-400">{label}</dt>
                      <dd className="tnum text-sm font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </Reveal>

            <Reveal>
              <section>
                <h2 className="font-display text-xl font-extrabold tracking-tight">
                  Equipamentos
                </h2>
                <ul className="mt-5 grid gap-y-3 sm:grid-cols-2">
                  {vehicle.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-ink-700">
                      <span aria-hidden className="text-brand-500">
                        —
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>

            <Reveal>
              <section className="rounded-xl bg-neblina p-6 sm:p-8">
                <h2 className="font-display text-lg font-extrabold tracking-tight">
                  Compre com segurança
                </h2>
                <ul className="mt-4 space-y-3">
                  {SAFETY_TIPS.map((tip) => (
                    <li key={tip} className="flex gap-3 text-sm text-ink-500">
                      <span aria-hidden className="text-ink-400">
                        —
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          </div>

          <aside className="space-y-8">
            <Reveal>
              <div className="rounded-xl border border-ink-200 p-6">
                <PriceScale
                  price={vehicle.price}
                  min={range.min}
                  max={range.max}
                  segment={vehicle.body}
                />
                <p className="mt-5 text-xs leading-relaxed text-ink-400">
                  Comparação feita apenas entre os carros deste estoque — não é avaliação de
                  mercado.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-xl border border-ink-200 p-6">
                <h2 className="font-display text-base font-extrabold tracking-tight">
                  Falar sobre este carro
                </h2>
                <p className="mb-5 mt-2 text-xs text-ink-400">
                  Respondemos em horário comercial.
                </p>
                <ContactForm vehicle={vehicle} />
              </div>
            </Reveal>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="border-t border-ink-100 py-14">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              Parecidos com este
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <Reveal key={item.id} delay={index * 70}>
                  <VehicleCard vehicle={item} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Barra fixa no mobile */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t border-fumaca bg-asfalto px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <p className="label truncate text-cromo/50">{vehicle.model}</p>
          <p className="tnum font-display text-lg font-extrabold leading-tight text-white">
            {formatPrice(vehicle.price)}
          </p>
        </div>
        <a
          href={whatsappLink(contactMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto rounded-md bg-brand-500 px-5 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-asfalto"
        >
          Tenho interesse
        </a>
      </div>
    </div>
  );
}
