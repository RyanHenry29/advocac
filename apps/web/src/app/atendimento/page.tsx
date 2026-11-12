import type { Metadata } from "next";
import AtendimentoClient from "./AtendimentoClient";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Atendimento",
  description:
    "Atendimento Advocac: descreva sua situação com suas próprias palavras e receba orientação preliminar com fonte e data de verificação. 24h, com encaminhamento à equipe quando necessário.",
  alternates: { canonical: "/atendimento" }
};

export default function AtendimentoPage() {
  return (
    <main className="section-gap shell">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="kicker">Atendimento Advocac</p>
          <h1 className="section-title mt-4">
            Conte o que aconteceu.
            <span className="text-action"> Nós localizamos a rota.</span>
          </h1>
          <p className="mt-6 max-w-md text-ink-secondary">
            Você não precisa conhecer o nome do procedimento jurídico. Descreva a
            situação com suas próprias palavras — o atendimento classifica o tema,
            apresenta a orientação com fonte e, se houver urgência, encaminha
            direto para a equipe no WhatsApp.
          </p>

          <div className="mt-10 space-y-5 border-l border-line pl-6">
            {[
              ["01", "Descreva", "Situação em palavras simples."],
              ["02", "Receba", "Orientação preliminar com fonte e data de verificação."],
              ["03", "Resolva", "Urgência ou caso complexo? Resumo pronto para a equipe."]
            ].map(([n, t, d]) => (
              <div key={n}>
                <span className="index-label">{n}</span>
                <p className="mt-1 font-display text-lg uppercase text-ink-primary">{t}</p>
                <p className="text-sm text-ink-secondary">{d}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 font-mono text-[10px] uppercase leading-relaxed tracking-wider text-ink-muted">
            {siteConfig.disclaimer} Escopo: questões jurídicas, documentais e
            administrativas do universo CAC. Orientação tática/operacional não é
            prestada por este canal.
          </p>
        </div>

        <AtendimentoClient />
      </div>
    </main>
  );
}