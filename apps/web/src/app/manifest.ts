import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Advocac — Advocacia para CACs",
    short_name: "Advocac",
    description:
      "Assessoria jurídica e documental especializada para CACs. De atirador para atirador.",
    start_url: "/",
    display: "standalone",
    background_color: "#17191C",
    theme_color: "#17191C",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}