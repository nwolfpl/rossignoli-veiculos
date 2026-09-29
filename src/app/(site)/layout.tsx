import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Tracker } from "@/components/Tracker";

/**
 * Moldura do site público. O painel em /admin fica fora deste grupo de rotas de
 * propósito: sem cabeçalho de loja, sem rodapé e, principalmente, sem o Tracker
 * — a navegação do administrador não pode entrar nos números dos visitantes.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Tracker />
    </>
  );
}
