type Props = {
  /** "mark" é só o monograma; "full" traz o lockup com assinatura. */
  variant?: "mark" | "full";
  className?: string;
  withTagline?: boolean;
};

const ORANGE = "orange-grad";
const CHROME = "chrome-grad";

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-${ORANGE}`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stopColor="#ffb23d" />
        <stop offset="42%" stopColor="#f97a16" />
        <stop offset="100%" stopColor="#e0480a" />
      </linearGradient>
      <linearGradient id={`${id}-${CHROME}`} x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="45%" stopColor="#d7dce2" />
        <stop offset="62%" stopColor="#9aa3ae" />
        <stop offset="100%" stopColor="#e6eaef" />
      </linearGradient>
    </defs>
  );
}

/**
 * Marca da Rossignoli Veículos: monograma RV em laranja e cromo,
 * desenhado em SVG para ficar nítido em qualquer tamanho e nos dois fundos.
 */
export function Logo({ variant = "full", className, withTagline = false }: Props) {
  const id = variant;

  if (variant === "mark") {
    return (
      <svg viewBox="0 0 120 100" className={className} role="img" aria-label="Rossignoli Veículos">
        <Defs id={id} />
        <text
          x="4"
          y="82"
          fontFamily="var(--font-display)"
          fontSize="96"
          fontWeight="800"
          fontStyle="italic"
          fill={`url(#${id}-${ORANGE})`}
        >
          R
        </text>
        <text
          x="52"
          y="82"
          fontFamily="var(--font-display)"
          fontSize="96"
          fontWeight="800"
          fontStyle="italic"
          fill={`url(#${id}-${CHROME})`}
        >
          V
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 300 150"
      className={className}
      role="img"
      aria-label="Rossignoli Veículos — qualidade em movimento"
    >
      <Defs id={id} />

      <g>
        <text
          x="88"
          y="76"
          fontFamily="var(--font-display)"
          fontSize="86"
          fontWeight="800"
          fontStyle="italic"
          fill={`url(#${id}-${ORANGE})`}
        >
          R
        </text>
        <text
          x="134"
          y="76"
          fontFamily="var(--font-display)"
          fontSize="86"
          fontWeight="800"
          fontStyle="italic"
          fill={`url(#${id}-${CHROME})`}
        >
          V
        </text>
      </g>

      <text
        x="150"
        y="112"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="34"
        fontWeight="800"
        fontStyle="italic"
        letterSpacing="1"
        fill={`url(#${id}-${CHROME})`}
      >
        ROSSIGNOLI
      </text>

      <g>
        <rect x="42" y="126" width="42" height="3" fill="#f97a16" />
        <text
          x="150"
          y="132"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="17"
          fontWeight="700"
          letterSpacing="7"
          fill="#f97a16"
        >
          VEÍCULOS
        </text>
        <rect x="216" y="126" width="42" height="3" fill="#f97a16" />
      </g>

      {withTagline && (
        <text
          x="150"
          y="148"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="9"
          letterSpacing="4"
          fill="#c9ced6"
          opacity="0.75"
        >
          QUALIDADE EM MOVIMENTO
        </text>
      )}
    </svg>
  );
}
