import type { Metadata } from "next";
import Reveal from "@/components/motion/Reveal";
import NormText from "@/components/brand/NormText";
import { siteConfig } from "@/lib/config";
import Faq from "./Faq";

export const metadata: Metadata = {
  title: "Central CAC",
  description:
    "Renovação de CRAF no Portal PF, habitualidade, níveis de atirador, CRAF manual e prazos da PF — com fonte e data de verificação.",
  alternates: { canonical: "/central-cac" }
};

const guides = [
  {
    id: "craf",
    title: "Meu CRAF está vencendo. O que faço?",
    points: [
      "A validade do CRAF está vinculada ao mês do seu aniversário — confira a data exata no documento",
      "A renovação é feita pelo novo Portal de Serviços da PF (gov.br), com taxa de R$ 88,00 por arma",
      "Renove com antecedência: CRAF vencido deixa seu acervo irregular",
      "Se já venceu, trate como prioridade — a conduta muda conforme a situação"
    ]
  },
  {
    id: "portal-pf",
    title: "Novo Portal PF: o que funciona hoje",
    points: [
      "Lançado em julho de 2026; a renovação do CRAF de CACs foi o primeiro serviço",
      "Demais serviços (aquisição, transferência, registro) em migração gradual",
      "Use conta gov.br com nível de verificação adequado",
      "Diante de erro no sistema, registre e busque orientação antes de perder prazo"
    ]
  },
  {
    id: "habitualidade",
    title: "Habitualidade e níveis de atirador",
    points: [
      "Habitualidade é requisito para manutenção do CR e renovação do CRAF",
      "Níveis I, II e III determinam frequência e quantidade de comprovantes",
      "Progressão de nível (IN 311/25-DG/PF): 12 treinamentos + 4 competições (2 estaduais+) a cada 12 meses",
      "Subir de nível traz vantagens além do aumento de acervo"
    ]
  },
  {
    id: "exigencia",
    title: "Recebi uma exigência. E agora?",
    points: [
      "O processo fica suspenso até o cumprimento — o prazo de resposta é o ponto crítico",
      "Liste item por item o que foi pedido e confira formatos aceitos pela PF",
      "Protocolar dentro do prazo e guardar o recibo é essencial",
      "Documento em formato errado gera nova exigência e atraso"
    ]
  },
  {
    id: "indeferimento",
    title: "Meu processo foi indeferido",
    points: [
      "Indeferimento não é sentença definitiva — em regra cabe recurso ou novo requerimento",
      "A estratégia depende do fundamento: documentação insuficiente, restrição cadastral, questão técnica",
      "Renda não é requisito: o Decreto 11.615/23 exige ocupação lícita, não rendimentos",
      "Obtenha a íntegra da decisão e mapeie o prazo recursal desde a ciência"
    ]
  },
  {
    id: "renda-cr",
    title: "Renda não é requisito para o CR",
    points: [
      "O Decreto nº 11.615/2023 exige comprovação de ocupação lícita — não de renda ou rendimentos mínimos",
      "Indeferimento por 'rendimentos insuficientes' merece revisão: o fundamento legal é a ocupação lícita",
      "Matrícula em universidade, isoladamente, não comprova ocupação lícita",
      "Reúna provas da ocupação e da idoneidade; cada caso exige análise individualizada"
    ]
  }
];

const faq = [
  {
    q: "A PF tem prazo para decidir meu processo?",
    a: "Sim. A Lei 9.784/1999 (arts. 48 e 49) fixa 30 dias para decisão após a instrução, prorrogáveis apenas com motivação expressa. Na prática, a PF estima até 60 dias para renovação de CRAF no Portal PF. Superado o prazo, cabe representação administrativa ou medida judicial — os tribunais têm fixado 15 dias para a PF decidir."
  },
  {
    q: "'Tirar o CAC' existe?",
    a: "Não existe 'tirar o CAC'. O que existe é o registro (CR/CRAF) junto à Polícia Federal. Desconfie de promessas nesse sentido."
  },
  {
    q: "O CR pode ser cancelado?",
    a: "Sim — e a maioria dos CACs não sabe o porquê. Falta de habitualidade, exigências não cumpridas, irregularidades cadastrais e erros de interpretação são os caminhos mais comuns. Organização documental previne."
  },
  {
    q: "Renda é requisito para o CR?",
    a: "Não. O Decreto nº 11.615/2023 exige comprovação de ocupação lícita — não de renda ou de rendimentos mínimos. Se o indeferimento veio justamente da alegação de 'rendimentos insuficientes', vale revisar o fundamento: a norma não transforma renda em requisito. Cada caso exige análise individualizada da decisão e das provas apresentadas."
  },
  {
    q: "Preciso de advogado desde o início?",
    a: "O requerimento bem fundamentado desde a origem reduz exigências e indeferimentos. Se já houve exigência ou indeferimento, o acompanhamento técnico se torna ainda mais importante."
  }
];

export default function CentralCacPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="section-gap shell">
        <Reveal>
          <p className="kicker">Central CAC</p>
          <h1 className="section-title mt-4 max-w-3xl">
            Conhecimento orientado a <span className="text-action">problemas</span>
          </h1>
          <p className="mt-6 max-w-2xl text-ink-secondary">
            Guias diretos sobre o que trava o CAC na prática — com fonte e data de verificação. Conteúdo preliminar; cada caso merece análise individualizada.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {guides.map((g, i) => (
            <Reveal key={g.id} delay={(i % 2) * 100}>
              <div className="h-full card p-7 md:p-8">
                <span className="index-label">GUIA {String(i + 1).padStart(2, "0")}</span>
                <h2 id={g.id} className="mt-3 font-display text-xl uppercase text-ink-primary md:text-2xl">
                  {g.title}
                </h2>
                <ul className="mt-5 space-y-3">
                  {g.points.map((p, j) => (
                    <li key={j} className="flex gap-3 text-sm leading-relaxed text-ink-secondary">
                      <span className="mt-0.5 font-mono text-xs text-gold">{String(j + 1).padStart(2, "0")}</span>
                      <NormText text={p} />
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150} className="mt-14">
          <p className="kicker">Perguntas frequentes</p>
          <div className="mt-6">
            <Faq items={faq} />
          </div>
        </Reveal>

        <Reveal delay={200} className="mt-12 border-l-2 border-action bg-surface/30 p-6 md:p-8">
<p className="text-ink-secondary">
            Não achou seu caso? O atendimento classifica sua situação em segundos
            — ou{" "}
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-action"
            >
              fale conosco no WhatsApp
            </a>
            .
          </p>
        </Reveal>
      </div>
    </main>
  );
}