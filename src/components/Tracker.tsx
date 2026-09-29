"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { EventName } from "@/domain/analytics";
import { Suspense, useEffect, useRef } from "react";
import { flush, startSession, track } from "@/services/analyticsClient";

/** Marcos de rolagem, em porcentagem. Cada um dispara uma vez por página. */
const SCROLL_MARKS = [25, 50, 75, 100];
const PULSE_INTERVAL = 30_000;
/** Depois disso a aba provavelmente ficou aberta esquecida — para de pulsar. */
const PULSE_LIMIT = 20 * 60_000;

/** Rótulo legível para o clique, na falta de um data-track-origem explícito. */
function describeLink(anchor: HTMLAnchorElement): string {
  const marked = anchor.closest<HTMLElement>("[data-track-origem]");
  if (marked?.dataset.trackOrigem) return marked.dataset.trackOrigem;
  const text = anchor.textContent?.trim().replace(/\s+/g, " ").slice(0, 60);
  return text || "sem rótulo";
}

/**
 * Motor do rastreamento. Fica no layout, então vale para todas as páginas, e faz
 * o que dá para fazer sem tocar em cada componente: pageview a cada troca de
 * rota, profundidade de rolagem, tempo na página e cliques em links (WhatsApp,
 * telefone, cards de carro, links externos) por delegação de evento no document.
 *
 * O que exige semântica — busca, filtro, simulador, lead — é instrumentado no
 * próprio componente, com track().
 */
function TrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reached = useRef<Set<number>>(new Set());
  // Preenchido no efeito de pageview: ler o relógio durante o render é impuro.
  const enteredAt = useRef(0);
  const maxScroll = useRef(0);
  const lastView = useRef<string | null>(null);

  // Abre a sessão uma vez por aba.
  useEffect(() => {
    startSession();
  }, []);

  // Pageview a cada rota. A query entra nos detalhes porque no /carros ela É a intenção.
  useEffect(() => {
    reached.current = new Set();
    enteredAt.current = Date.now();
    maxScroll.current = 0;

    const query = searchParams.toString();
    const view = `${pathname}?${query}`;
    if (lastView.current === view) return;
    lastView.current = view;

    // O título só é aplicado depois deste efeito; adiar um tique o captura.
    const timer = setTimeout(() => {
      track("pagina_vista", {
        detalhes: {
          ...(document.title ? { titulo: document.title } : {}),
          ...(query ? { query } : {}),
        },
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Rolagem, tempo na página e saída.
  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const percent =
        scrollable <= 0 ? 100 : Math.round((window.scrollY / scrollable) * 100);
      const depth = Math.min(100, Math.max(0, percent));
      maxScroll.current = Math.max(maxScroll.current, depth);

      for (const mark of SCROLL_MARKS) {
        if (depth >= mark && !reached.current.has(mark)) {
          reached.current.add(mark);
          track("rolagem", { valor: mark });
        }
      }
    };

    const pulse = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const seconds = Math.round((Date.now() - enteredAt.current) / 1000);
      if (seconds * 1000 > PULSE_LIMIT) return;
      track("pulso", { valor: seconds });
    }, PULSE_INTERVAL);

    // pagehide cobre o caso que o unload não cobre no Safari e no mobile.
    const onLeave = () => {
      track("saida_pagina", {
        valor: Math.round((Date.now() - enteredAt.current) / 1000),
        detalhes: { rolagem_maxima: maxScroll.current },
      });
      flush(true);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush(true);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    onScroll();

    return () => {
      clearInterval(pulse);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pathname]);

  // Cliques em links, por delegação — pega o site todo sem instrumentar cada CTA.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      const origem = describeLink(anchor as HTMLAnchorElement);

      // data-track-evento no link (ou num pai) manda o nome do evento pelo HTML,
      // o que evita transformar Server Component em cliente só para um clique.
      const marcado = anchor.closest<HTMLElement>("[data-track-evento]");
      if (marcado?.dataset.trackEvento) {
        track(marcado.dataset.trackEvento as EventName, {
          detalhes: { origem, destino: href },
        });
        return;
      }

      if (href.includes("wa.me") || href.includes("api.whatsapp.com")) {
        track("whatsapp_clique", { detalhes: { origem } });
        return;
      }

      if (href.startsWith("tel:") || href.startsWith("mailto:")) {
        track("contato_clique", {
          detalhes: { origem, canal: href.startsWith("tel:") ? "telefone" : "email" },
        });
        return;
      }

      const anuncio = href.match(/\/anuncio\/([^/?#]+)/);
      if (anuncio) {
        track("card_clique", { vehicle: { slug: anuncio[1] }, detalhes: { origem } });
        return;
      }

      if (/^https?:\/\//.test(href)) {
        try {
          const target = new URL(href);
          if (target.hostname !== window.location.hostname) {
            track("link_externo", { detalhes: { destino: target.hostname, origem } });
          }
        } catch {
          // href malformado: não vale registrar.
        }
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}

/**
 * useSearchParams precisa de fronteira de Suspense para a página poder ser
 * pré-renderizada — o site é exportado estático, então isso não é opcional.
 */
export function Tracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
