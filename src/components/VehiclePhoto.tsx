import Image from "next/image";
import type { Body, Vehicle } from "@/domain/types";
import { asset } from "@/lib/site";

export type PhotoView = "lateral" | "frente" | "painel" | "interior";
export type PhotoVariant = "studio" | "stage";

export const PHOTO_VIEWS: PhotoView[] = ["lateral", "frente", "painel", "interior"];

export const VIEW_LABELS: Record<PhotoView, string> = {
  lateral: "Lateral",
  frente: "Frente",
  painel: "Painel",
  interior: "Interior",
};

/** Silhuetas laterais por carroceria (viewBox 0 0 480 300). */
const SIDE_PATHS: Record<Body, string> = {
  Hatch:
    "M56,214 C56,186 58,168 70,160 L150,150 L196,118 C210,110 232,108 258,110 L322,118 C346,124 360,138 372,158 L410,166 C428,172 434,186 432,214 Z",
  Sedã: "M50,216 C50,188 54,170 66,162 L148,152 L198,120 C214,112 238,110 266,112 L316,120 C332,126 342,136 350,150 L426,162 C442,168 446,188 444,216 Z",
  SUV: "M48,218 C46,190 50,166 64,156 L132,148 L182,98 C190,90 202,88 216,88 L316,92 C334,96 346,108 354,126 L364,150 L424,158 C440,162 446,178 444,218 Z",
  Picape:
    "M50,218 C50,190 54,168 66,158 L136,146 L172,106 C184,96 208,94 234,96 L288,106 C300,112 306,124 308,140 L310,158 L436,158 C450,160 452,186 450,218 Z",
  Minivan:
    "M52,216 C52,182 56,160 68,150 L142,136 L180,100 C194,90 222,88 252,90 L336,102 C358,110 372,126 382,148 L420,158 C438,164 442,184 440,216 Z",
};

const GLASS_PATHS: Record<Body, string> = {
  Hatch:
    "M206,126 C218,118 238,116 258,118 L318,126 C330,134 340,144 346,152 L200,152 Z",
  Sedã: "M208,128 C220,120 240,118 262,120 L312,128 C324,134 332,142 338,150 L202,150 Z",
  SUV: "M196,100 C202,94 212,92 222,92 L312,96 C326,100 336,110 342,124 L348,140 L190,138 Z",
  Picape: "M182,114 C194,106 212,104 232,106 L284,114 C294,120 298,128 300,140 L178,140 Z",
  Minivan:
    "M190,108 C202,98 226,96 250,98 L332,110 C348,118 360,130 366,146 L184,146 Z",
};

const WHEELS: Record<Body, [number, number]> = {
  Hatch: [136, 352],
  Sedã: [132, 358],
  SUV: [134, 350],
  Picape: [128, 372],
  Minivan: [136, 358],
};

const SPOKES = [0, 72, 144, 216, 288];

const Wheel = ({ x }: { x: number }) => (
  <g>
    <circle cx={x} cy={214} r={34} fill="#0a0c0f" />
    <circle cx={x} cy={214} r={33} fill="none" stroke="#2a3038" strokeWidth="2" />
    <circle cx={x} cy={214} r={18} fill="#b9c0c9" />
    <circle cx={x} cy={214} r={18} fill="none" stroke="#7b848f" strokeWidth="1.5" />
    {SPOKES.map((angle) => (
      <rect
        key={angle}
        x={x - 1.6}
        y={200}
        width={3.2}
        height={14}
        rx={1.6}
        fill="#7b848f"
        transform={`rotate(${angle} ${x} 214)`}
      />
    ))}
    <circle cx={x} cy={214} r={5} fill="#5b6675" />
  </g>
);

/** Carro em vista lateral, com lataria iluminada, vidros e rodas. */
const SideCar = ({ vehicle, uid }: { vehicle: Vehicle; uid: string }) => {
  const [frontWheel, rearWheel] = WHEELS[vehicle.body];
  return (
    <g>
      <g clipPath={`url(#${uid}-clip)`}>
        <rect width="480" height="300" fill={`url(#${uid}-paint)`} />
        {/* luz do teto do showroom escorrendo pelo ombro da lataria */}
        <path
          d="M40,150 L460,128 L460,166 L40,190 Z"
          fill="#ffffff"
          opacity="0.16"
        />
        <ellipse cx="250" cy="140" rx="150" ry="34" fill="#ffffff" opacity="0.12" />
        {/* sombra na saia lateral */}
        <rect y="196" width="480" height="60" fill="#000000" opacity="0.22" />
        <path
          d="M60,186 L440,176 L440,184 L60,196 Z"
          fill="#ffffff"
          opacity="0.22"
        />
        {/* caixas de roda cavadas na lataria */}
        <circle cx={frontWheel} cy={214} r={41} fill="#0a0c0f" opacity="0.92" />
        <circle cx={rearWheel} cy={214} r={41} fill="#0a0c0f" opacity="0.92" />
      </g>

      <path
        d={SIDE_PATHS[vehicle.body]}
        fill="none"
        stroke="#000000"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />

      <path d={GLASS_PATHS[vehicle.body]} fill={`url(#${uid}-glass)`} />
      <path
        d={GLASS_PATHS[vehicle.body]}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.18"
        strokeWidth="1.5"
      />

      {/* faróis */}
      <ellipse cx="70" cy="172" rx="11" ry="6" fill="#fff6ec" opacity="0.85" />
      <ellipse cx="432" cy="174" rx="8" ry="5" fill="#ff5b4a" opacity="0.7" />

      <Wheel x={frontWheel} />
      <Wheel x={rearWheel} />
    </g>
  );
};

type Props = {
  vehicle: Vehicle;
  view?: PhotoView;
  variant?: PhotoVariant;
  className?: string;
};

/**
 * Ilustração vetorial do veículo — o protótipo não usa fotos de terceiros.
 * `stage` põe o carro no palco iluminado, com reflexo; `studio` é a versão
 * clara usada nos cards.
 */
export function VehiclePhoto({
  vehicle,
  view = "lateral",
  variant = "studio",
  className,
}: Props) {
  const uid = `p${vehicle.id}${view}${variant}`;
  const body = vehicle.colorHex;
  const onStage = variant === "stage";

  return (
    <svg
      viewBox="0 0 480 300"
      className={className}
      role="img"
      aria-label={`Ilustração ${VIEW_LABELS[view].toLowerCase()} — ${vehicle.brand} ${vehicle.model} ${vehicle.version}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <clipPath id={`${uid}-clip`}>
          <path d={SIDE_PATHS[vehicle.body]} />
        </clipPath>
        <linearGradient id={`${uid}-paint`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={body} stopOpacity="1" />
          <stop offset="55%" stopColor={body} stopOpacity="0.92" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#48566b" />
          <stop offset="45%" stopColor="#1d242e" />
          <stop offset="100%" stopColor="#10151b" />
        </linearGradient>
        <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${uid}-mask`}>
          <rect x="0" y="248" width="480" height="120" fill={`url(#${uid}-fade)`} />
        </mask>
      </defs>

      {onStage ? (
        <>
          <rect width="480" height="300" fill="#0d0f12" />
          <ellipse cx="240" cy="108" rx="250" ry="130" fill="#ff6a1a" opacity="0.07" />
          <ellipse cx="240" cy="252" rx="205" ry="44" fill="#c9ced6" opacity="0.14" />
        </>
      ) : (
        <>
          <rect width="480" height="300" fill="#e7eaee" />
          <ellipse cx="240" cy="90" rx="300" ry="180" fill="#ffffff" opacity="0.85" />
          <ellipse cx="240" cy="252" rx="220" ry="46" fill="#c9ced6" opacity="0.5" />
        </>
      )}

      {view === "lateral" && (
        <g transform={onStage ? "translate(240 152) scale(0.9) translate(-240 -160)" : undefined}>
          <ellipse
            cx="244"
            cy="250"
            rx="190"
            ry="14"
            fill="#000000"
            opacity={onStage ? "0.55" : "0.18"}
          />
          <g id={`${uid}-car`}>
            <SideCar vehicle={vehicle} uid={uid} />
          </g>
          <g mask={`url(#${uid}-mask)`} opacity={onStage ? "0.55" : "0.35"}>
            <use href={`#${uid}-car`} transform="translate(0, 496) scale(1, -1)" />
          </g>
        </g>
      )}

      {view === "frente" && (
        <g>
          <ellipse
            cx="240"
            cy="252"
            rx="150"
            ry="14"
            fill="#000000"
            opacity={onStage ? "0.5" : "0.16"}
          />
          <rect x="126" y="214" width="30" height="34" rx="8" fill="#0a0c0f" />
          <rect x="324" y="214" width="30" height="34" rx="8" fill="#0a0c0f" />
          <path
            d="M162,150 L186,106 C192,98 206,94 240,94 C274,94 288,98 294,106 L318,150 Z"
            fill={`url(#${uid}-paint)`}
          />
          <path
            d="M178,146 L196,114 C202,106 214,104 240,104 C266,104 278,106 284,114 L302,146 Z"
            fill={`url(#${uid}-glass)`}
          />
          <path
            d="M124,240 C118,208 124,178 136,164 C148,150 180,144 240,144 C300,144 332,150 344,164 C356,178 362,208 356,240 Z"
            fill={`url(#${uid}-paint)`}
            stroke="#000000"
            strokeOpacity="0.25"
            strokeWidth="1.5"
          />
          <path d="M136,166 C170,156 310,156 344,166 L344,176 C300,168 180,168 136,176 Z" fill="#ffffff" opacity="0.16" />
          <path d="M140,176 L198,183 L196,199 L142,193 Z" fill="#fff6ec" opacity="0.95" />
          <path d="M340,176 L282,183 L284,199 L338,193 Z" fill="#fff6ec" opacity="0.95" />
          <rect x="206" y="178" width="68" height="18" rx="5" fill="#0a0c0f" opacity="0.55" />
          <rect x="166" y="210" width="148" height="20" rx="7" fill="#0a0c0f" opacity="0.3" />
          <rect x="212" y="214" width="56" height="14" rx="3" fill="#f4f5f7" opacity="0.92" />
        </g>
      )}

      {view === "painel" && (
        <g>
          <rect width="480" height="300" fill="#12161b" />
          <rect y="132" width="480" height="168" fill="#191d23" />
          <rect y="126" width="480" height="14" fill="#0a0c0f" />
          <rect x="46" y="172" width="152" height="76" rx="16" fill="#0a0c0f" />
          <circle cx="122" cy="210" r="27" fill="none" stroke={body} strokeWidth="5" opacity="0.85" />
          <circle cx="122" cy="210" r="17" fill="none" stroke="#c9ced6" strokeWidth="2" opacity="0.4" />
          <rect x="236" y="170" width="186" height="86" rx="10" fill="#0a0c0f" />
          <rect x="252" y="186" width="154" height="10" rx="5" fill="#ff6a1a" opacity="0.9" />
          <rect x="252" y="206" width="112" height="8" rx="4" fill="#c9ced6" opacity="0.45" />
          <rect x="252" y="224" width="86" height="8" rx="4" fill="#c9ced6" opacity="0.28" />
          <rect x="252" y="242" width="64" height="8" rx="4" fill="#c9ced6" opacity="0.18" />
        </g>
      )}

      {view === "interior" && (
        <g>
          <rect width="480" height="300" fill="#12161b" />
          <rect y="110" width="480" height="190" fill="#1d232b" />
          <path d="M40,300 L40,196 C40,174 58,160 84,160 L186,160 C212,160 228,176 228,198 L228,300 Z" fill="#0f1318" />
          <path d="M252,300 L252,198 C252,176 268,160 294,160 L396,160 C422,160 440,174 440,196 L440,300 Z" fill="#0f1318" />
          <rect x="62" y="186" width="144" height="12" rx="6" fill={body} opacity="0.6" />
          <rect x="274" y="186" width="144" height="12" rx="6" fill={body} opacity="0.6" />
          <rect x="62" y="212" width="144" height="70" rx="10" fill="#161b22" />
          <rect x="274" y="212" width="144" height="70" rx="10" fill="#161b22" />
          <rect y="104" width="480" height="16" fill="#0a0c0f" />
        </g>
      )}

      <text
        x="452"
        y="286"
        textAnchor="end"
        fontSize="12"
        fontWeight="700"
        letterSpacing="1"
        fill={onStage ? "#c9ced6" : "#0d0f12"}
        opacity="0.45"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        RV
      </text>
    </svg>
  );
}

/** Silhueta pura da carroceria — usada como ícone nas categorias. */
export function BodyIcon({
  body,
  className,
}: {
  body: Body;
  className?: string;
}) {
  return (
    <svg viewBox="40 85 400 168" className={className} aria-hidden focusable="false">
      <path d={SIDE_PATHS[body]} fill="currentColor" />
      <circle cx={WHEELS[body][0]} cy={214} r={26} fill="currentColor" />
      <circle cx={WHEELS[body][1]} cy={214} r={26} fill="currentColor" />
    </svg>
  );
}

/** Quantas imagens o anúncio tem: fotos reais quando existirem, senão os ângulos ilustrados. */
export const slideCount = (vehicle: Vehicle) =>
  vehicle.photos?.length || PHOTO_VIEWS.length;

type MediaProps = {
  vehicle: Vehicle;
  index?: number;
  variant?: PhotoVariant;
  className?: string;
  priority?: boolean;
};

/**
 * Imagem do anúncio. Usa a foto real quando ela existe e cai na ilustração
 * vetorial quando o anúncio ainda não tem fotos.
 */
export function VehicleMedia({
  vehicle,
  index = 0,
  variant = "studio",
  className,
  priority = false,
}: MediaProps) {
  const photo = vehicle.photos?.[index];

  if (photo) {
    return (
      <Image
        src={asset(photo)}
        alt={`${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.modelYear}`}
        width={1400}
        height={933}
        priority={priority}
        unoptimized
        className={`object-cover ${className ?? ""}`}
      />
    );
  }

  return (
    <VehiclePhoto
      vehicle={vehicle}
      view={PHOTO_VIEWS[index % PHOTO_VIEWS.length]}
      variant={variant}
      className={className}
    />
  );
}
