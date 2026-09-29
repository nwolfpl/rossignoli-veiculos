import type { Device } from "@/domain/analytics";

/**
 * Identidade do visitante. Duas chaves, com propósitos diferentes:
 *
 * - `visitanteId` vive em localStorage e sobrevive a fechar o navegador. É o que
 *   permite ver que a mesma pessoa voltou três dias depois.
 * - `sessaoId` vive em sessionStorage, ou seja, morre com a aba. É o que agrupa
 *   os eventos de uma visita só.
 *
 * Nenhum dos dois é derivado de dado pessoal: são UUIDs aleatórios.
 */
const VISITOR_KEY = "rv-visitante";
const SESSION_KEY = "rv-sessao";

const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : // Fallback para navegadores antigos: suficiente para agrupar eventos.
      `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 14)}-4000-8000-${Math.random().toString(16).slice(2, 14)}`;

/** Storage pode lançar (janela privada, cookies bloqueados). Nesses casos o id é só da memória. */
function readOrCreate(store: "local" | "session", key: string): string {
  try {
    const storage = store === "local" ? window.localStorage : window.sessionStorage;
    const existing = storage.getItem(key);
    if (existing) return existing;
    const created = uuid();
    storage.setItem(key, created);
    return created;
  } catch {
    return uuid();
  }
}

let visitorId: string | null = null;
let sessionId: string | null = null;

export function getVisitorId(): string {
  visitorId ??= readOrCreate("local", VISITOR_KEY);
  return visitorId;
}

export function getSessionId(): string {
  sessionId ??= readOrCreate("session", SESSION_KEY);
  return sessionId;
}

/** True na primeira chamada de cada aba — usada para registrar a sessão uma única vez. */
export function isNewSession(): boolean {
  try {
    return !window.sessionStorage.getItem(SESSION_KEY);
  } catch {
    return true;
  }
}

function detectDevice(): Device {
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return "mobile";
  return "desktop";
}

/** Navegador e sistema por assinatura no user agent — ordem importa, Chrome aparece dentro do UA do Edge. */
function detectBrowser(ua: string): string {
  const pairs: [string, RegExp][] = [
    ["Edge", /Edg\//],
    ["Opera", /OPR\//],
    ["Samsung Internet", /SamsungBrowser/],
    ["Chrome", /Chrome\//],
    ["Firefox", /Firefox\//],
    ["Safari", /Safari\//],
  ];
  return pairs.find(([, re]) => re.test(ua))?.[0] ?? "Outro";
}

function detectOs(ua: string): string {
  const pairs: [string, RegExp][] = [
    ["Android", /Android/],
    ["iOS", /iPhone|iPad|iPod/],
    ["Windows", /Windows/],
    ["macOS", /Mac OS X|Macintosh/],
    ["Linux", /Linux/],
  ];
  return pairs.find(([, re]) => re.test(ua))?.[0] ?? "Outro";
}

/** Host do referrer, ignorando navegação interna do próprio site. */
function externalReferrer(): string | null {
  if (!document.referrer) return null;
  try {
    const host = new URL(document.referrer).hostname;
    return host === window.location.hostname ? null : host;
  } catch {
    return null;
  }
}

/**
 * De onde a visita veio, em uma palavra legível: utm_source quando existe,
 * senão o site que linkou, senão "direto".
 */
export function describeOrigin(utmSource: string | null, referrerHost: string | null): string {
  if (utmSource) return utmSource;
  if (!referrerHost) return "direto";
  const known: [string, RegExp][] = [
    ["Google", /google\./],
    ["Instagram", /instagram\./],
    ["Facebook", /facebook\.|fb\./],
    ["WhatsApp", /whatsapp|wa\.me/],
    ["Bing", /bing\./],
    ["OLX", /olx\./],
    ["Webmotors", /webmotors\./],
  ];
  return known.find(([, re]) => re.test(referrerHost))?.[0] ?? referrerHost;
}

/** Retrato do visitante no momento em que a sessão começa. */
export function describeSession() {
  const ua = navigator.userAgent;
  const params = new URLSearchParams(window.location.search);
  const referrerHost = externalReferrer();
  const utmSource = params.get("utm_source");

  return {
    primeira_pagina: window.location.pathname,
    referencia: document.referrer ? document.referrer.slice(0, 500) : null,
    origem: describeOrigin(utmSource, referrerHost),
    utm_source: utmSource,
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content"),
    dispositivo: detectDevice(),
    navegador: detectBrowser(ua),
    sistema: detectOs(ua),
    idioma: navigator.language ?? null,
    tela: `${window.screen.width}x${window.screen.height}`,
    fuso: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
    user_agent: ua.slice(0, 500),
  };
}
