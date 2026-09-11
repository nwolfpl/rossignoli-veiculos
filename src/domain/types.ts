export type Fuel = "Flex" | "Gasolina" | "Diesel" | "Híbrido" | "Elétrico";
export type Transmission = "Manual" | "Automático" | "Automatizado" | "CVT";
export type Body = "Hatch" | "Sedã" | "SUV" | "Picape" | "Minivan";
export type SellerKind = "loja" | "particular";
export type ListingStatus = "ativo" | "pausado" | "vendido";

export interface Seller {
  id: string;
  name: string;
  kind: SellerKind;
  city: string;
  state: string;
  verified: boolean;
  memberSince: string;
  responseTime: string;
  activeListings: number;
}

/** Registro de mudança de preço — alimenta o selo "Preço reduzido". */
export interface PricePoint {
  date: string;
  price: number;
}

export interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  modelYear: number;
  price: number;
  mileage: number;
  fuel: Fuel;
  transmission: Transmission;
  body: Body;
  color: string;
  colorHex: string;
  doors: number;
  power: number;
  city: string;
  state: string;
  features: string[];
  sellerId: string;
  highlighted: boolean;
  publishedAt: string;
  status: ListingStatus;
  description: string;
  priceHistory: PricePoint[];
  /** Fotos enviadas pelo usuário (data URLs). Vazio usa a ilustração gerada. */
  photos?: string[];
  /** Marca anúncios criados no próprio navegador. */
  userCreated?: boolean;
  metrics?: ListingMetrics;
}

export interface ListingMetrics {
  views: number;
  favorites: number;
  leads: number;
}

export interface VehicleQuery {
  q?: string;
  brand?: string;
  model?: string;
  body?: Body;
  transmission?: Transmission;
  fuel?: Fuel;
  color?: string;
  city?: string;
  sellerKind?: SellerKind;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxMileage?: number;
  features?: string[];
  sort?: SortKey;
}

export type SortKey =
  | "relevancia"
  | "menor-preco"
  | "maior-preco"
  | "mais-novos"
  | "menor-km"
  | "mais-recentes";

export const SORT_LABELS: Record<SortKey, string> = {
  relevancia: "Mais relevantes",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  "mais-novos": "Ano mais novo",
  "menor-km": "Menor quilometragem",
  "mais-recentes": "Anúncios mais recentes",
};

export interface Lead {
  id: string;
  vehicleId: string;
  vehicleTitle: string;
  name: string;
  phone: string;
  message: string;
  createdAt: string;
}

export interface SessionUser {
  name: string;
  email: string;
  kind: SellerKind;
}

/** Dados coletados no fluxo de publicação, antes de virarem um Vehicle. */
export interface ListingDraft {
  brand: string;
  model: string;
  version: string;
  year: number;
  modelYear: number;
  mileage: number;
  fuel: Fuel;
  transmission: Transmission;
  body: Body;
  color: string;
  doors: number;
  power: number;
  features: string[];
  photos: string[];
  price: number;
  city: string;
  state: string;
  description: string;
}
