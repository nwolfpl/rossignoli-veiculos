"use client";

import { useState, type FormEvent } from "react";
import type { Vehicle } from "@/domain/types";
import { whatsappLink } from "@/lib/site";
import { saveLead } from "@/services/analyticsClient";

/**
 * O formulário agora grava o contato de verdade: o lead vai para o banco e
 * aparece no painel em /admin. O WhatsApp segue como canal de resposta.
 */
export function ContactForm({ vehicle }: { vehicle: Vehicle }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.version}`;
  const message = `Olá! Tenho interesse no ${title} ${vehicle.year}.`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    setFailed(false);

    try {
      await saveLead({
        nome: String(form.get("nome") ?? ""),
        telefone: String(form.get("telefone") ?? ""),
        mensagem: String(form.get("mensagem") ?? ""),
        vehicle: { id: vehicle.id, slug: vehicle.slug, titulo: title },
      });
      setSent(true);
    } catch {
      // Rede fora ou rastreamento não configurado: o visitante não pode ficar sem saída.
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <p className="font-semibold">Mensagem recebida!</p>
        <p className="mt-1">
          Respondemos em horário comercial. Para falar agora, use o WhatsApp acima.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="lead-nome" className="mb-1.5 block text-xs font-semibold text-ink-700">
          Nome
        </label>
        <input
          id="lead-nome"
          name="nome"
          required
          maxLength={160}
          autoComplete="name"
          className="h-11 w-full rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-ink-400"
        />
      </div>
      <div>
        <label htmlFor="lead-tel" className="mb-1.5 block text-xs font-semibold text-ink-700">
          Telefone
        </label>
        <input
          id="lead-tel"
          name="telefone"
          type="tel"
          required
          maxLength={40}
          autoComplete="tel"
          placeholder="(35) 90000-0000"
          className="h-11 w-full rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-ink-400"
        />
      </div>
      <div>
        <label htmlFor="lead-msg" className="mb-1.5 block text-xs font-semibold text-ink-700">
          Mensagem
        </label>
        <textarea
          id="lead-msg"
          name="mensagem"
          rows={3}
          maxLength={2000}
          defaultValue={message}
          className="w-full rounded-lg border border-ink-200 p-3 text-sm outline-none focus:border-ink-400"
        />
      </div>

      {failed && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          Não conseguimos registrar agora. Fale com a gente pelo WhatsApp abaixo.
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-lg bg-ink-900 py-3 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60"
      >
        {sending ? "Enviando…" : "Enviar mensagem"}
      </button>
      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        data-track-origem="formulário do anúncio"
        className="block text-center text-xs text-ink-500 underline-offset-2 hover:underline"
      >
        Prefiro falar pelo WhatsApp
      </a>
    </form>
  );
}
