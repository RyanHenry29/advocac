import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import NormText from "@/components/brand/NormText";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Atuação",
  description:
    "Áreas de atuação da Advocac: CRAF, CR, habitualidade, aquisição, transferência, acervo, processos administrativos na Polícia Federal, recursos e liminares.",
  alternates: { canonical: "/atuacao" }
};

const areas = [
  {
    index: "01",
    title: "CRAF",
    text: "Renovação pelo Portal PF, validade vinculada ao aniversário, prazos, exigências e indeferimentos. Acompanhamento completo do requerimento."
  },
  {
    index: "02",
    title: "Registro (CR)",
    text: "Novo registro, renovação, transferência e defesa contra cancelamento — inclusive por erro de interpretação que comprometa o documento."
  },
  {
    index: "03",
    title: "Habitualidade e níveis",
    text: "Comprovação de prática (níveis I, II e III), progressão de nível conforme IN 311/25-DG/PF e organização de comprovantes."
  },
  {
    index: "04",
    title: "Aquisição e cotas",
    text: "Requerimentos de aquisição de arma e munição, autorizações prévias, guias de trânsito e fundamentação de efetiva necessidade."
  },
  {
    index: "05",
    title: "Transferências",
    text: "Transferência de propriedade, mudança de estado, sucessão (herança) e doação — tudo homologado para o novo titular ficar regular."
  },
  {
    index: "06",
    title: "Processos administrativos",
    text: "Acompanhamento no SINARM-CAC e Portal PF, resposta a exigências dentro do prazo e representação contra morosidade."
  },
  {
    index: "07",
    title: "Recursos e liminares",
    text: "Recurso contra indeferimento e medidas judiciais que destravam processos parados — liminares com prazo fixado para a PF decidir."
  },
  {
    index: "08",
    title: "Acervo e coleção",
    text: "Obrigações do colecionador, catalogação, comunicação de alterações e tratamento de itens antigos/obsoletos."
  },
  {
    index: "09",
    title: "Documentação",
    text: "Certidões, comprovação de residência, capacidade técnica, avaliação psicológica e conformidade com os formatos aceitos pela PF."
  },
  {
    index: "10",
    title: "IAT",
    text: "Orientação sobre credenciamento e obrigações do Instrutor de Armamento e Tiro junto à Polícia Federal."
  }
];

export default function AtuacaoPage() {
  return (
    <main className="section-gap shell">
      <Reveal>
        <p className="kicker">Atuação</p>
        <h1 className="section-title mt-4 max-w-3xl">
          Especialista no ecossistema <span className="text-action">CAC</span>
        </h1>
        <p className="mt-6 max-w-2xl text-ink-secondary">
          Do requerimento ao recurso — assessoria documental e atuação em
          processos. Escolha o tema ou fale direto com a equipe.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-px sm:border sm:border-line sm:bg-line">
        {areas.map((area, i) => (
          <Reveal key={area.index} delay={(i % 3) * 100}>
            <div className="h-full bg-surface/50 p-6 transition-colors hover:bg-surface/80">
              <span className="index-label">{area.index}</span>
              <h2 className="mt-3 font-display text-lg uppercase text-ink-primary">
                {area.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary"><NormText text={area.text} /></p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200} className="mt-12 flex flex-col gap-3 sm:flex-row">
        <a
          href={`https://wa.me/${siteConfig.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-action"
        >
          Falar com a equipe
        </a>
        <Link href="/central-cac" className="btn-ghost">
          Ver Central CAC
        </Link>
      </Reveal>
    </main>
  );
}