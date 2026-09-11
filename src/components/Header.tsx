import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SITE, whatsappLink } from "@/lib/site";

const NAV = [
  { href: "/carros", label: "Estoque" },
  { href: "/#categorias", label: "Categorias" },
  { href: "/#processo", label: "Como compramos" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-fumaca bg-asfalto/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Rossignoli Veículos, início"
        >
          <Logo variant="mark" priority className="h-9 w-auto" />
          <span className="hidden leading-none sm:block">
            <span className="block font-display text-[15px] font-extrabold italic tracking-tight text-white">
              ROSSIGNOLI
            </span>
            <span className="mt-1 block font-display text-[9px] font-bold tracking-[0.42em] text-brand-500">
              VEÍCULOS
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-7 text-sm text-cromo md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href="/carros"
            className="rounded-md px-3 py-2 text-sm text-cromo transition hover:text-white md:hidden"
          >
            Estoque
          </Link>
          <a
            href={whatsappLink(`Olá! Vim pelo site da ${SITE.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-asfalto transition hover:bg-brand-400"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
