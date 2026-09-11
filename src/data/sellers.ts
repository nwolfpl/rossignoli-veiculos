import type { Seller } from "@/domain/types";

/** Vendedores fictícios do protótipo. */
export const SELLERS: Seller[] = [
  {
    id: "s1",
    name: "Rossignoli Veículos",
    kind: "loja",
    city: "Varginha",
    state: "MG",
    verified: true,
    memberSince: "2014",
    responseTime: "Responde em ~15 min",
    activeListings: 0,
  },
  {
    id: "s2",
    name: "Auto Center Sul de Minas",
    kind: "loja",
    city: "Três Corações",
    state: "MG",
    verified: true,
    memberSince: "2018",
    responseTime: "Responde em ~1 h",
    activeListings: 0,
  },
  {
    id: "s3",
    name: "Garagem BH Seminovos",
    kind: "loja",
    city: "Belo Horizonte",
    state: "MG",
    verified: true,
    memberSince: "2016",
    responseTime: "Responde em ~40 min",
    activeListings: 0,
  },
  {
    id: "s4",
    name: "Marcos Almeida",
    kind: "particular",
    city: "Varginha",
    state: "MG",
    verified: false,
    memberSince: "2023",
    responseTime: "Responde em algumas horas",
    activeListings: 0,
  },
  {
    id: "s5",
    name: "Patrícia Nunes",
    kind: "particular",
    city: "Lavras",
    state: "MG",
    verified: true,
    memberSince: "2021",
    responseTime: "Responde em ~2 h",
    activeListings: 0,
  },
  {
    id: "s6",
    name: "Rodrigo Faria",
    kind: "particular",
    city: "Três Pontas",
    state: "MG",
    verified: false,
    memberSince: "2024",
    responseTime: "Responde em algumas horas",
    activeListings: 0,
  },
  {
    id: "s7",
    name: "Premium Motors",
    kind: "loja",
    city: "Poços de Caldas",
    state: "MG",
    verified: true,
    memberSince: "2012",
    responseTime: "Responde em ~30 min",
    activeListings: 0,
  },
];

/** Vendedor usado nos anúncios publicados no próprio navegador. */
export const CURRENT_USER_SELLER: Seller = {
  id: "me",
  name: "Meu anúncio",
  kind: "particular",
  city: "Varginha",
  state: "MG",
  verified: false,
  memberSince: "2026",
  responseTime: "Você recebe os contatos por aqui",
  activeListings: 0,
};

export const sellerById = (id: string): Seller =>
  SELLERS.find((seller) => seller.id === id) ?? CURRENT_USER_SELLER;
