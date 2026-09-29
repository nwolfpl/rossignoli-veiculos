"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { Panel } from "@/components/admin/Panel";
import { isTrackingConfigured } from "@/lib/supabase";
import { currentEmail, isAdminEmail, signOut } from "@/services/insightsRepository";

type State =
  | { status: "verificando" }
  | { status: "deslogado" }
  | { status: "sem-permissao"; email: string }
  | { status: "dentro"; email: string };

/**
 * Decide o que a rota /admin mostra. A sessão fica guardada pelo SDK do Supabase,
 * então recarregar a página não pede senha de novo.
 */
export function AdminArea() {
  const [state, setState] = useState<State>({ status: "verificando" });

  useEffect(() => {
    currentEmail()
      .then((email) => {
        if (!email) return setState({ status: "deslogado" });
        setState(
          isAdminEmail(email)
            ? { status: "dentro", email }
            : { status: "sem-permissao", email },
        );
      })
      .catch(() => setState({ status: "deslogado" }));
  }, []);

  if (!isTrackingConfigured) {
    return (
      <div className="stage flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-fumaca bg-asfalto/70 p-6 text-center">
          <h1 className="font-display text-xl font-extrabold tracking-tight text-white">
            Rastreamento não configurado
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-cromo/70">
            Copie <code className="font-mono text-brand-500">.env.example</code> para{" "}
            <code className="font-mono text-brand-500">.env.local</code> e recompile o
            site para ligar o painel.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "verificando") {
    return (
      <div className="stage flex min-h-screen items-center justify-center">
        <p className="label text-cromo/50">Verificando acesso…</p>
      </div>
    );
  }

  if (state.status === "deslogado") {
    return (
      <LoginForm
        onSuccess={(email) =>
          setState(
            isAdminEmail(email)
              ? { status: "dentro", email }
              : { status: "sem-permissao", email },
          )
        }
      />
    );
  }

  if (state.status === "sem-permissao") {
    return (
      <div className="stage flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-fumaca bg-asfalto/70 p-6 text-center">
          <h1 className="font-display text-xl font-extrabold tracking-tight text-white">
            Esta conta não é administradora
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-cromo/70">
            <span className="font-mono text-xs">{state.email}</span> está logada, mas o
            painel é restrito ao administrador do site.
          </p>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              setState({ status: "deslogado" });
            }}
            className="label mt-6 rounded-md border border-fumaca px-4 py-2.5 text-cromo transition hover:border-cromo hover:text-white"
          >
            Sair e entrar com outra conta
          </button>
        </div>
      </div>
    );
  }

  return <Panel email={state.email} onSignOut={() => setState({ status: "deslogado" })} />;
}
