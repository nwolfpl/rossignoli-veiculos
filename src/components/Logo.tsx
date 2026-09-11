import Image from "next/image";
import { asset } from "@/lib/site";

type Props = {
  /** "mark" é só o monograma RV; "full" traz o lockup completo com assinatura. */
  variant?: "mark" | "full";
  className?: string;
  priority?: boolean;
};

const SOURCES = {
  mark: { src: "/logo-rv.png", width: 420, height: 224 },
  full: { src: "/logo.png", width: 900, height: 726 },
} as const;

/**
 * Marca da Rossignoli Veículos. Os arquivos vêm do logo original, com o fundo
 * removido — por isso são usados sobre as faixas escuras do site.
 */
export function Logo({ variant = "full", className, priority = false }: Props) {
  const source = SOURCES[variant];

  return (
    <Image
      src={asset(source.src)}
      alt="Rossignoli Veículos"
      width={source.width}
      height={source.height}
      priority={priority}
      unoptimized
      className={className}
    />
  );
}
