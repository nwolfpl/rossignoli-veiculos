import type { Metadata } from "next";
import { AdminArea } from "@/components/admin/AdminArea";

export const metadata: Metadata = {
  title: "Painel do administrador",
  description: "Área restrita de monitoramento do comportamento dos visitantes.",
  // Área interna: fora do Google e fora do sitemap.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * O site é exportado estático, então esta rota vira um HTML que carrega o painel
 * no navegador. Nada de dado sensível vem no HTML: tudo é buscado depois do
 * login, e o banco só responde para a conta do administrador.
 */
export default function AdminPage() {
  return <AdminArea />;
}
