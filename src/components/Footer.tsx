import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer id="contato" className="mt-24 bg-asfalto text-cromo">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Logo variant="full" withTagline className="h-32 w-auto" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-cromo/70">{SITE.tagline}</p>
          </div>

          <div>
            <p className="label text-cromo/50">Contato</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>{SITE.phoneLabel}</li>
              <li>{SITE.email}</li>
              <li>{SITE.city}</li>
              <li className="text-cromo/60">{SITE.hours}</li>
            </ul>
          </div>

          <div>
            <p className="label text-cromo/50">Navegação</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/carros" className="transition hover:text-white">
                  Estoque completo
                </Link>
              </li>
              <li>
                <Link href="/#destaques" className="transition hover:text-white">
                  Destaques
                </Link>
              </li>
              <li>
                <Link href="/#categorias" className="transition hover:text-white">
                  Categorias
                </Link>
              </li>
              <li>
                <Link href="/#processo" className="transition hover:text-white">
                  Como compramos
                </Link>
              </li>
              <li>
                <Link href="/creditos" className="transition hover:text-white">
                  Créditos das fotos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="ticks mt-14 h-3 text-fumaca" aria-hidden />

        <p className="mt-6 text-xs text-cromo/45">
          Protótipo em desenvolvimento — veículos, preços e contatos são fictícios. As fotos mostram o modelo anunciado e têm crédito em /creditos.
        </p>
      </div>
    </footer>
  );
}
