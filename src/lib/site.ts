/**
 * Configuração da loja. Os contatos abaixo são PLACEHOLDERS do protótipo —
 * substitua pelos dados reais antes de publicar.
 */
export const SITE = {
  name: "Rossignoli Veículos",
  tagline: "Seminovos e usados selecionados em Varginha e região",
  whatsapp: "5535900000000",
  phoneLabel: "(35) 90000-0000",
  email: "contato@rossignoliveiculos.com.br",
  city: "Varginha - MG",
  hours: "Seg a sex, 8h às 18h • Sáb, 8h às 12h",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://nwolfpl.github.io/rossignoli-veiculos/",
} as const;

export const whatsappLink = (message: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;


/**
 * Prefixa caminhos de /public com o basePath do site — o GitHub Pages serve o
 * projeto em um subdiretório e a tag de imagem não recebe esse prefixo sozinha.
 */
export const asset = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
