import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * O site é estático: não existe servidor para intermediar o banco. O navegador
 * fala direto com o Supabase usando a chave publishable, que é pública de
 * propósito — ela viaja no bundle. A proteção real está no Row Level Security:
 * com essa chave dá para inserir eventos e nada mais. Ler exige login de admin.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

/** Null quando as variáveis de ambiente não foram definidas — o site segue funcionando sem rastreamento. */
export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (!url || !key) return null;
  client ??= createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "rv-admin-auth",
    },
  });
  return client;
}

export const isTrackingConfigured = Boolean(url && key);
