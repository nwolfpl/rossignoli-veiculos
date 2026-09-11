import type { ReactNode } from "react";

type Tone = "neutral" | "brand" | "success" | "info";

const TONES: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-700",
  brand: "bg-brand-50 text-brand-700",
  success: "bg-verde/10 text-verde",
  info: "bg-azul/10 text-azul",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
