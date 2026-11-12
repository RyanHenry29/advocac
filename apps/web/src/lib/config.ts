function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const siteConfig = {
  name: "Advocac",
  url: resolveSiteUrl(),
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "5511932290927",
  whatsappDisplay: "+55 11 93229-0927",
  instagram: "https://www.instagram.com/advocac_",
  instagramHandle: "@advocac_",
  email: process.env.NEXT_PUBLIC_EMAIL || "contato@advocac.com.br",
  lawyerName: process.env.NEXT_PUBLIC_LAWYER_NAME || "",
  oab: process.env.NEXT_PUBLIC_OAB || "",
  cnpj: process.env.NEXT_PUBLIC_CNPJ || "",
  tagline: "De atirador para atirador",
  businessHours: "Segunda a sexta · 9h às 18h",
  disclaimerShort:
    "Informações preliminares · não substituem análise jurídica individualizada",
  disclaimer:
    "Informação preliminar e geral. Não substitui análise jurídica individualizada."
};

export function waLink(message: string): string {
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}
