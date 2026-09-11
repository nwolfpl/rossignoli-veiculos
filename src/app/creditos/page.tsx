import type { Metadata } from "next";
import Link from "next/link";
import { VEHICLE_PHOTOS } from "@/data/photos";
import { vehicleRepository } from "@/services/vehicleRepository";

export const metadata: Metadata = {
  title: "Créditos das fotos",
  description:
    "Autoria e licença das fotos usadas nos anúncios deste protótipo, vindas do Wikimedia Commons.",
};

export default function CreditosPage() {
  const vehicles = vehicleRepository.all();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="label text-brand-600">Imagens</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
        Créditos das fotos
      </h1>
      <p className="mt-4 leading-relaxed text-ink-500">
        As fotos dos anúncios vêm do{" "}
        <a
          href="https://commons.wikimedia.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          Wikimedia Commons
        </a>{" "}
        e são usadas sob licença livre, com crédito ao autor. Elas mostram o modelo
        anunciado — e não o exemplar específico que está no pátio.
      </p>

      <div className="mt-10 space-y-8">
        {vehicles.map((vehicle) => {
          const credits = VEHICLE_PHOTOS[vehicle.id] ?? [];
          if (credits.length === 0) return null;

          return (
            <section key={vehicle.id} className="border-t border-ink-100 pt-6">
              <h2 className="font-display text-base font-bold tracking-tight">
                <Link href={`/anuncio/${vehicle.slug}`} className="hover:text-brand-600">
                  {vehicle.brand} {vehicle.model} {vehicle.version}
                </Link>
              </h2>
              <ul className="mt-3 space-y-2">
                {credits.map((credit) => (
                  <li key={credit.file} className="font-mono text-[12px] leading-relaxed text-ink-500">
                    {credit.author} · {credit.license} ·{" "}
                    <a
                      href={credit.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-ink-900"
                    >
                      {credit.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
