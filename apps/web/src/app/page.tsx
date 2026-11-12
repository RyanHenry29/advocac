import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import Pilares from "@/components/sections/Pilares";
import CTA from "@/components/sections/CTA";
import Reveal from "@/components/motion/Reveal";
import { siteConfig } from "@/lib/config";
import { companyFacts } from "@/lib/knowledge/company";

export const metadata: Metadata = {
  title: "Advocac",
  description:
    "Assessoria jurídica e documental para CACs — CRAF, registros e processos na Polícia Federal. De atirador para atirador.",
  alternates: { canonical: "/" }
};

const results = [
  {
    label: "Liminar JF/MG",
    text: "PF obrigada a analisar processo de CAC em 15 dias"
  },
  {
    label: "PF/BH/MG",
    text: "Atraso resolvido em menos de 20 dias — aquisição liberada"
  },
  {
    label: "Campinas/SP",
    text: "CRAF liberado via liminar — mandado cumprido"
  },
  {
    label: "Após 8 meses",
    text: "CRAF destravado judicialmente e expedido"
  }
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LegalService",
        name: "Advocac",
        description:
          "Assessoria jurídica e documental especializada para CACs — CRAF, registros, processos administrativos e Polícia Federal.",
        url: siteConfig.url,
        telephone: siteConfig.whatsappDisplay,
        email: siteConfig.email,
        areaServed: "BR",
        sameAs: [siteConfig.instagram],
        knowsAbout: [
          "CRAF",
          "Certificado de Registro",
          "CAC",
          "Polícia Federal",
          "Processos administrativos",
          "Habitualidade"
        ]
      },
      {
        "@type": "WebSite",
        name: "Advocac",
        url: siteConfig.url,
        inLanguage: "pt-BR"
      }
    ]
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Pilares />

      <section className="section-gap shell">
        <Reveal>
          <p className="kicker">Resultados documentados</p>
          <h2 className="section-title mt-4 max-w-3xl">
            Não há garantia de sucesso.
            <span className="text-action"> Há consistência de trabalho.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-ink-secondary">
            O resultado é do Delegado; a nós cabe o esforço de um bom trabalho.
            Casos divulgados publicamente pelo escritório:
          </p>
        </Reveal>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-px sm:border sm:border-line sm:bg-line">
          {results.map((r, i) => (
            <Reveal key={r.label} delay={i * 100}>
              <div className="bg-surface/50 p-6">
                <span className="index-label uppercase">{r.label}</span>
                <p className="mt-3 text-sm leading-relaxed text-ink-primary">{r.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            Casos reais divulgados no Instagram {siteConfig.instagramHandle} · resultados
            passados não garantem resultado futuro
          </p>
        </Reveal>
      </section>

      <section className="border-t border-line/50 bg-surface/20">
        <div className="section-gap shell">
          <Reveal>
            <p className="kicker">Central CAC</p>
            <h2 className="section-title mt-4">
              O que está mudando agora
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {companyFacts.slice(0, 3).map((fact, i) => (
              <Reveal key={fact.id} delay={i * 120}>
                <div className="card h-full p-7">
                  <span className="index-label uppercase">
                    Verificado em {fact.verified}
                  </span>
                  <h3 className="mt-3 font-display text-lg uppercase text-ink-primary">
                    {fact.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                    {fact.content.slice(0, 180)}…
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200} className="mt-10">
            <a href="/central-cac" className="link-underline text-sm uppercase tracking-widest text-action">
              Ver a Central CAC completa
            </a>
          </Reveal>
        </div>
      </section>

      <CTA />
    </main>
  );
}