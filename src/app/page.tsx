import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { SearchBox } from "@/components/SearchBox";
import { VehicleCard } from "@/components/VehicleCard";
import { BodyIcon, VehicleMedia } from "@/components/VehiclePhoto";
import type { Body } from "@/domain/types";
import { averagePriceByBody } from "@/lib/filters";
import { formatPrice, formatYear } from "@/lib/format";
import { SITE } from "@/lib/site";
import { vehicleRepository } from "@/services/vehicleRepository";

const CATEGORIES: { body: Body; description: string }[] = [
  { body: "Hatch", description: "Econômico para o dia a dia" },
  { body: "Sedã", description: "Conforto e porta-malas" },
  { body: "SUV", description: "Espaço e posição alta" },
  { body: "Picape", description: "Trabalho e estrada" },
];

const PROCESS = [
  {
    title: "Cada carro entra avaliado",
    description:
      "Só anunciamos o que passou pela nossa conferência de mecânica, documentação e histórico.",
  },
  {
    title: "Você vê tudo antes de vir",
    description:
      "Preço, quilometragem, versão e opcionais ficam no anúncio. Nada de “consulte o valor”.",
  },
  {
    title: "Test-drive e transferência",
    description:
      "Marque um horário, traga seu mecânico e acompanhe a transferência com a gente até o fim.",
  },
];

export default function HomePage() {
  const vehicles = vehicleRepository.all();
  const highlighted = vehicleRepository.getHighlighted(6);
  const brands = vehicleRepository.listBrands();
  const averages = averagePriceByBody(vehicles);
  // O destaque do hero é o carro mais caro entre os selecionados — é o que carrega a cena.
  const hero = [...highlighted].sort((a, b) => b.price - a.price)[0];

  const prices = vehicles.map((vehicle) => vehicle.price);
  const cities = new Set(vehicles.map((vehicle) => vehicle.city));

  const stats = [
    { value: String(vehicles.length), label: "carros no estoque" },
    { value: formatPrice(Math.min(...prices)), label: "a partir de" },
    { value: String(brands.length), label: "marcas" },
    { value: String(cities.size), label: "cidades no Sul de Minas" },
  ];

  return (
    <>
      {/* HERO — o carro no palco */}
      <section className="stage relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 lg:pb-20 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="label rise text-brand-500">
                {SITE.name} — {SITE.city}
              </p>
              <h1
                className="rise mt-5 font-display text-4xl font-extrabold leading-[0.98] tracking-tight text-white sm:text-5xl lg:text-6xl"
                style={{ animationDelay: "80ms" }}
              >
                Seu próximo carro
                <span className="block text-brand-500">sob a luz certa.</span>
              </h1>
              <p
                className="rise mt-6 max-w-md text-base leading-relaxed text-cromo/75"
                style={{ animationDelay: "160ms" }}
              >
                {vehicles.length} seminovos revisados, com preço, quilometragem e opcionais
                abertos desde o primeiro clique.
              </p>
            </div>

            <div className="lg:col-span-7">
              <Link
                href={`/anuncio/${hero.slug}`}
                className="group relative block overflow-hidden rounded-xl border border-fumaca bg-asfalto"
                aria-label={`Ver anúncio do ${hero.brand} ${hero.model} ${hero.version}`}
              >
                <div className="sweep relative">
                  <VehicleMedia
                    vehicle={hero}
                    variant="stage"
                    priority
                    className="aspect-[16/10] w-full"
                  />
                </div>

                {/* véu escuro: mantém título e preço legíveis sobre a foto */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 hidden h-2/5 bg-gradient-to-b from-asfalto/85 to-transparent lg:block"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-asfalto/90 via-asfalto/40 to-transparent lg:block"
                />

                <div className="p-5 lg:absolute lg:left-5 lg:top-5 lg:p-0">
                  <p className="label text-brand-500">Destaque do pátio</p>
                  <p className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
                    {hero.brand} {hero.model}
                  </p>
                  <p className="text-sm text-cromo/70">{hero.version}</p>
                </div>

                <div className="flex items-end justify-between gap-4 px-5 pb-5 lg:absolute lg:inset-x-5 lg:bottom-5 lg:p-0">
                  <dl className="flex gap-5 font-mono text-[11px] uppercase tracking-wider text-cromo/60">
                    <div>
                      <dt>Ano</dt>
                      <dd className="tnum mt-1 text-sm text-white">
                        {formatYear(hero.year, hero.modelYear)}
                      </dd>
                    </div>
                    <div>
                      <dt>Km</dt>
                      <dd className="tnum mt-1 text-sm text-white">
                        {hero.mileage.toLocaleString("pt-BR")}
                      </dd>
                    </div>
                    <div className="hidden sm:block">
                      <dt>Câmbio</dt>
                      <dd className="mt-1 text-sm text-white">{hero.transmission}</dd>
                    </div>
                  </dl>
                  <p className="tnum font-display text-2xl font-extrabold text-white sm:text-3xl">
                    {formatPrice(hero.price)}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="rise mt-10" style={{ animationDelay: "240ms" }}>
            <SearchBox brands={brands} />
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-fumaca pt-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="label text-cromo/50">{stat.label}</dt>
                <dd className="tnum mt-2 font-display text-2xl font-bold text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* DESTAQUES */}
      <section id="destaques" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label text-brand-600">No pátio agora</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Selecionados desta semana
              </h2>
            </div>
            <Link
              href="/carros"
              className="font-display text-sm font-bold uppercase tracking-wider text-brand-600 transition hover:text-brand-700"
            >
              Ver os {vehicles.length} carros →
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlighted.map((vehicle, index) => (
            <Reveal key={vehicle.id} delay={index * 70}>
              <VehicleCard vehicle={vehicle} averagePrice={averages.get(vehicle.body)} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section id="categorias" className="bg-neblina py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="label text-brand-600">Por carroceria</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Comece pelo formato que combina com sua rotina
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category, index) => {
              const list = vehicles.filter((vehicle) => vehicle.body === category.body);
              const from = list.length ? Math.min(...list.map((item) => item.price)) : 0;

              return (
                <Reveal key={category.body} delay={index * 70}>
                  <Link
                    href={`/carros?body=${encodeURIComponent(category.body)}`}
                    className="group flex h-full flex-col justify-between overflow-hidden rounded-xl bg-asfalto p-5 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(13,15,18,0.8)]"
                  >
                    <div>
                      <p className="font-display text-xl font-bold text-white">
                        {category.body}
                      </p>
                      <p className="mt-1 text-sm text-cromo/60">{category.description}</p>
                    </div>

                    <BodyIcon
                      body={category.body}
                      className="my-7 h-20 w-full text-cromo/25 transition duration-300 group-hover:text-brand-500"
                    />

                    <p className="label whitespace-nowrap text-cromo/50">
                      {list.length} {list.length === 1 ? "carro" : "carros"}
                      {from > 0 && (
                        <span className="text-cromo/70"> · de {formatPrice(from)}</span>
                      )}
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROCESSO */}
      <section id="processo" className="bg-asfalto py-16 text-cromo lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="label text-brand-500">Como compramos e vendemos</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              O carro chega até você já conferido
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {PROCESS.map((step, index) => (
              <Reveal key={step.title} delay={index * 90}>
                <div className="ticks h-3 text-fumaca" aria-hidden />
                <h3 className="mt-5 font-display text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cromo/70">{step.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <Reveal>
          <div className="flex flex-col items-start gap-6 rounded-xl border border-ink-200 p-8 sm:flex-row sm:items-center sm:justify-between lg:p-12">
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Quer vender o seu?
              </h2>
              <p className="mt-2 max-w-md text-sm text-ink-500">
                Avaliamos seu carro no mesmo dia e, se fechar, o dinheiro sai na hora. Também
                aceitamos na troca por qualquer veículo do estoque.
              </p>
            </div>
            <Link
              href="/carros"
              className="shrink-0 rounded-md bg-asfalto px-7 py-4 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-grafite"
            >
              Ver carros para troca
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
