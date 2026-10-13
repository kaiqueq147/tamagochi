/** @type {import('next').NextConfig} */
const nextConfig = {
  // Gera um site 100% estático em `out/` (npm run build): dá para hospedar em qualquer lugar
  // (Vercel, Netlify, GitHub Pages...). Se usar GitHub Pages em subpasta, defina NEXT_PUBLIC_BASE_PATH=/nome-do-repo
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: true },
  reactStrictMode: true
};

export default nextConfig;
