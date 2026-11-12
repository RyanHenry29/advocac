import type { Metadata } from "next";
import DiagnosticoClient from "./DiagnosticoClient";

export const metadata: Metadata = {
  title: "Diagnóstico Inicial",
  description:
    "Responda 3 perguntas rápidas e receba uma análise preliminar da sua demanda CAC — com encaminhamento direto para a equipe quando houver urgência.",
  alternates: { canonical: "/diagnostico" }
};

export default function DiagnosticoPage() {
  return (
    <main className="section-gap shell">
      <div className="mx-auto max-w-2xl">
        <p className="kicker">Diagnóstico Inicial</p>
        <h1 className="section-title mt-4">
          Três perguntas.
          <span className="text-action"> Uma direção clara.</span>
        </h1>
        <p className="mt-5 text-ink-secondary">
          Sem cadastro, sem complicação. Ao final, você recebe a análise
          preliminar e o caminho recomendado.
        </p>
        <div className="mt-10">
          <DiagnosticoClient />
        </div>
      </div>
    </main>
  );
}