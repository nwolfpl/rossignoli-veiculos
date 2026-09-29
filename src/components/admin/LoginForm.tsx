"use client";

import { useState, type FormEvent } from "react";
import { Logo } from "@/components/Logo";
import { signIn } from "@/services/insightsRepository";

/**
 * Porta do painel. O campo aceita o apelido "gustavo", que o repositório traduz
 * para o e-mail do login real — o atalho é de digitação, não de segurança: a
 * senha é conferida pelo Supabase e os dados só saem do banco para essa conta.
 */
export function LoginForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [identity, setIdentity] = useState("gustavo");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const email = await signIn(identity, password);
      onSuccess(email ?? identity);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Falha no login.";
      setError(
        /invalid login credentials/i.test(message)
          ? "Usuário ou senha incorretos."
          : message,
      );
    } finally {
      setBusy(false);
    }
  };

  const field =
    "h-12 w-full rounded-md border border-fumaca bg-grafite px-3 text-sm text-white outline-none transition placeholder:text-cromo/40 focus:border-brand-500";

  return (
    <div className="stage flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Logo variant="mark" className="mx-auto h-12 w-auto" />
        <h1 className="mt-8 text-center font-display text-2xl font-extrabold tracking-tight text-white">
          Painel do administrador
        </h1>
        <p className="mt-2 text-center text-sm text-cromo/60">
          Acesso restrito ao administrador do site.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-xl border border-fumaca bg-asfalto/70 p-6 backdrop-blur"
        >
          <div>
            <label htmlFor="admin-id" className="label mb-2 block text-cromo/60">
              Usuário
            </label>
            <input
              id="admin-id"
              value={identity}
              onChange={(event) => setIdentity(event.target.value)}
              autoComplete="username"
              required
              className={field}
            />
          </div>

          <div>
            <label htmlFor="admin-senha" className="label mb-2 block text-cromo/60">
              Senha
            </label>
            <input
              id="admin-senha"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className={field}
            />
          </div>

          {error && (
            <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="h-12 w-full rounded-md bg-brand-500 font-display text-sm font-bold uppercase tracking-wider text-asfalto transition hover:bg-brand-400 disabled:opacity-60"
          >
            {busy ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
