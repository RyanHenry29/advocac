import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const routes = [
    { path: "", priority: 1, freq: "weekly" as const },
    { path: "/atuacao", priority: 0.9, freq: "monthly" as const },
    { path: "/central-cac", priority: 0.9, freq: "weekly" as const },
    { path: "/atendimento", priority: 0.9, freq: "monthly" as const },
    { path: "/escritorio", priority: 0.7, freq: "monthly" as const },
    { path: "/diagnostico", priority: 0.7, freq: "monthly" as const },
    { path: "/contato", priority: 0.6, freq: "monthly" as const }
  ];

  return routes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.freq,
    priority: r.priority
  }));
}
