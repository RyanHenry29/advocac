import type { Metadata } from "next";
import LeadForm from "@/components/forms/LeadForm";
import Reveal from "@/components/motion/Reveal";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contato — Advogado para CACs",
  description:
    "Fale com a Advocac: WhatsApp comercial, Instagram e formulário direto. Assessoria jurídica e documental para CACs.",
  alternates: { canonical: "/contato" }
};

export default function ContatoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contato — Advocac",
    url: `${siteConfig.url}/contato`,
    mainEntity: {
      "@type": "Organization",
      name: "Advocac",
      email: siteConfig.email,
      telephone: siteConfig.whatsappDisplay,
      sameAs: [siteConfig.instagram]
    }
  };

  return (
    <main className="section-gap shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Reveal>
            <p className="kicker">Contato</p>
            <h1 className="section-title mt-4">
              Fale com a <span className="text-action">equipe</span>
            </h1>
            <p className="mt-6 max-w-md text-ink-secondary">
              Para análise individualizada do seu caso, o caminho direto é o
              WhatsApp comercial. O formulário abaixo registra sua demanda e já
              abre o WhatsApp com o resumo pronto.
            </p>
          </Reveal>

          <Reveal delay={150} className="mt-10 space-y-3">
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="card flex min-h-[60px] items-center justify-between px-5 transition-colors hover:border-action/40"
            >
              <span className="font-display text-sm uppercase tracking-wider text-ink-primary">WhatsApp</span>
              <span className="font-mono text-sm text-ink-secondary">{siteConfig.whatsappDisplay}</span>
            </a>
            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="card flex min-h-[60px] items-center justify-between px-5 transition-colors hover:border-action/40"
            >
              <span className="font-display text-sm uppercase tracking-wider text-ink-primary">Instagram</span>
              <span className="font-mono text-sm text-ink-secondary">{siteConfig.instagramHandle}</span>
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="card flex min-h-[60px] items-center justify-between px-5 transition-colors hover:border-action/40"
            >
              <span className="font-display text-sm uppercase tracking-wider text-ink-primary">E-mail</span>
              <span className="font-mono text-sm text-ink-secondary">{siteConfig.email}</span>
            </a>
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-wider text-ink-muted">
              {siteConfig.businessHours} · O chat do site responde 24h
            </p>
          </Reveal>
        </div>

        <Reveal delay={200} variant="scale">
          <LeadForm />
        </Reveal>
      </div>
    </main>
  );
}