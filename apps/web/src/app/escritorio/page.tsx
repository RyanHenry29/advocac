import type { Metadata } from "next";
import Reveal from "@/components/motion/Reveal";
import LogoMark from "@/components/brand/LogoMark";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "O Escritório",
  description:
    "Conheça a Advocac: advocacia especializada no universo dos CACs, assessoria documental e atuação em processos. De atirador para atirador.",
  alternates: { canonical: "/escritorio" }
};

export default function EscritorioPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Attorney",
    name: "Advocac",
    description:
      "Escritório de advocacia especializado em CACs — CRAF, CR, habitualidade e processos administrativos na Polícia Federal.",
    url: `${siteConfig.url}/escritorio`,
    email: siteConfig.email,
    telephone: siteConfig.whatsappDisplay,
    areaServed: "BR",
    sameAs: [siteConfig.instagram]
  };

  return (
    <main className="section-gap shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Reveal>
        <p className="kicker">O Escritório</p>
        <h1 className="section-title mt-4 max-w-3xl">
          De atirador <span className="text-action">para atirador.</span>
        </h1>
      </Reveal>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <Reveal delay={120} className="prose-advocac">
          <p>
            A <strong className="text-ink-primary">Advocac</strong> é um escritório
            de advocacia especializado no ambiente regulatório dos{" "}
            <strong className="text-ink-primary">CACs</strong> — Caçadores,
            Atiradores Desportivos e Colecionadores — com assessoria documental e
            atuação em processos administrativos e judiciais junto à Polícia
            Federal.
          </p>
          <p>
            O diferencial está no posicionamento:{" "}
            <em className="text-ink-primary">quem atende o CAC entende o
            ecossistema por dentro</em>. CRAF, CR, habitualidade, SINARM-CAC,
            Portal PF, níveis de atirador, processos administrativos — a
            linguagem é técnica-clara porque o titular vive o mesmo universo.
          </p>
          <p>
            O titular é também{" "}
            <strong className="text-ink-primary">
              Instrutor de Armamento e Tiro (IAT) credenciado pela Polícia
              Federal
            </strong>
            , o que aproxima ainda mais o escritório da realidade de clubes,
            atiradores e instrutores.
          </p>
          <p>
            Atuação em múltiplos estados — SP, RJ, MG e demais SFPCs, conforme o
            caso — sempre com o mesmo princípio:{" "}
            <strong className="text-ink-primary">
              não há garantia de sucesso; há consistência de resultados, fruto de
              um trabalho bem desenvolvido
            </strong>
            .
          </p>
        </Reveal>

        <Reveal delay={240} variant="scale">
          <div className="card overflow-hidden bg-base">
            <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden border-b border-line/60 bg-surface/30 p-10">
              <span className="absolute left-0 top-0 h-1 w-20 bg-action" aria-hidden="true" />
              <LogoMark size={220} variant="latao" />
            </div>
            <div className="divider p-5">
              <p className="text-center font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted">
                Assessoria de atirador
                <br />
                para atirador
              </p>
              <div className="mt-5 space-y-3 text-sm">
                <p className="flex items-center justify-between gap-4">
                  <span className="text-ink-muted">Instagram</span>
                  <a
                    href={siteConfig.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-ink-secondary"
                  >
                    {siteConfig.instagramHandle}
                  </a>
                </p>
                <p className="flex items-center justify-between gap-4">
                  <span className="text-ink-muted">WhatsApp</span>
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-ink-secondary"
                  >
                    {siteConfig.whatsappDisplay}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={150} className="mt-16">
        <div className="border-l-2 border-action bg-surface/30 p-6 md:p-8">
          <p className="index-label uppercase">Posicionamento ético</p>
          <p className="mt-3 max-w-3xl text-ink-secondary">
            O requerimento é analisado por um Delegado de Polícia Federal — só
            ele dita o resultado. A nós cabe o esforço de um bom trabalho:
            fundamentação técnica, documentação completa e acompanhamento
            processual. Nenhuma promessa de resultado é feita neste escritório.
          </p>
        </div>
      </Reveal>
    </main>
  );
}