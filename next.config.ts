import type { NextConfig } from "next";

/**
 * O site é 100% estático (todas as rotas são pré-renderizadas), então ele é
 * exportado como HTML e publicado no GitHub Pages. `NEXT_PUBLIC_BASE_PATH`
 * ajusta os caminhos quando o site fica em um subdiretório do domínio.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
