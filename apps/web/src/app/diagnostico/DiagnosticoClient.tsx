"use client";

import { useState } from "react";
import { waLink } from "@/lib/config";

const profiles = [
  { id: "ATIRADOR", label: "Atirador desportivo" },
  { id: "CACADOR", label: "Caçador" },
  { id: "COLECIONADOR", label: "Colecionador" },
  { id: "MULTIPLO", label: "Mais de um" },
  { id: "INICIANTE", label: "Estou iniciando" }
];

const situations = [
  { id: "CRAF_RENOVACAO", label: "Preciso renovar meu CRAF" },
  { id: "EXIGENCIA", label: "Estou com uma exigência" },
  { id: "INDEFERIMENTO", label: "Meu processo foi indeferido" },
  { id: "REGULARIZACAO", label: "Preciso regularizar uma situação" },
  { id: "DOCUMENTACAO", label: "Tenho dúvida sobre documentação" },
  { id: "PROCEDIMENTO", label: "Preciso entender um procedimento" },
  { id: "OUTRO", label: "Outro" }
];

const urgencies = [
  { id: "sim", label: "Sim — prazo correndo/vencido" },
  { id: "nao", label: "Não, é uma dúvida planejada" }
];

const topicLabels: Record<string, string> = {
  CRAF_RENOVACAO: "Renovação de CRAF",
  EXIGENCIA: "Exigência no processo",
  INDEFERIMENTO: "Indeferimento e recurso",
  REGULARIZACAO: "Regularização cadastral",
  DOCUMENTACAO: "Documentação",
  PROCEDIMENTO: "Entendimento de procedimento",
  OUTRO: "Tema a classificar"
};

export default function DiagnosticoClient() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<string | null>(null);
  const [situation, setSituation] = useState<string | null>(null);
  const [urgent, setUrgent] = useState<string | null>(null);

  const done = step >= 3;

  const summary = [
    `Olá, venho pelo site da Advocac (diagnóstico inicial).`,
    ``,
    `Perfil: ${profiles.find((p) => p.id === profile)?.label || "—"}`,
    `Situação: ${topicLabels[situation || ""] || "—"}`,
    `Urgência: ${urgent === "sim" ? "sim — prazo envolvido" : "não identificada"}`
  ].join("\n");

  function OptionList({
    options,
    value,
    onSelect
  }: {
    options: Array<{ id: string; label: string }>;
    value: string | null;
    onSelect: (id: string) => void;
  }) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`min-h-[52px] border px-4 py-3 text-left text-sm transition-all duration-150 ${
              value === opt.id
                ? "border-action bg-action/10 text-ink-primary"
                : "border-line text-ink-secondary hover:border-action/40 hover:text-ink-primary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="card-line p-6 md:p-10">
      {!done && (
        <div className="mb-8 flex items-center gap-2">
          {[0, 1, 2].map((s) => (
            <span
              key={s}
              className={`h-1 flex-1 transition-colors duration-300 ${
                step >= s ? "bg-action" : "bg-line"
              }`}
            />
          ))}
        </div>
      )}

      {step === 0 && (
        <div className="animate-rise">
          <p className="index-label">PERGUNTA 01/03</p>
          <h2 className="display mt-2 text-2xl text-ink-primary">Qual é o seu perfil?</h2>
          <div className="mt-6">
            <OptionList options={profiles} value={profile} onSelect={setProfile} />
          </div>
          <button
            type="button"
            disabled={!profile}
            onClick={() => setStep(1)}
            className="btn-action mt-8 w-full disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuar →
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="animate-rise">
          <p className="index-label">PERGUNTA 02/03</p>
          <h2 className="display mt-2 text-2xl text-ink-primary">Qual é a sua situação?</h2>
          <div className="mt-6">
            <OptionList options={situations} value={situation} onSelect={setSituation} />
          </div>
          <div className="mt-8 flex gap-3">
            <button type="button" onClick={() => setStep(0)} className="btn-ghost">
              ← Voltar
            </button>
            <button
              type="button"
              disabled={!situation}
              onClick={() => setStep(2)}
              className="btn-action flex-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-rise">
          <p className="index-label">PERGUNTA 03/03</p>
          <h2 className="display mt-2 text-2xl text-ink-primary">
            Existe prazo envolvido?
          </h2>
          <div className="mt-6">
            <OptionList options={urgencies} value={urgent} onSelect={setUrgent} />
          </div>
          <div className="mt-8 flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-ghost">
              ← Voltar
            </button>
            <button
              type="button"
              disabled={!urgent}
              onClick={() => setStep(3)}
              className="btn-action flex-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Ver análise →
            </button>
          </div>
        </div>
      )}

      {done && (
        <div className="animate-rise">
          <p className="index-label">ANÁLISE PRELIMINAR</p>
          <h2 className="display mt-2 text-2xl text-ink-primary">
            Demanda identificada:{" "}
            <span className="text-action">{topicLabels[situation || ""]}</span>
          </h2>

          <div className="mt-6 space-y-3 border border-line bg-base/60 p-5 text-sm">
            <p className="flex justify-between gap-4">
              <span className="text-ink-muted">Perfil</span>
              <span className="text-ink-primary">{profiles.find((p) => p.id === profile)?.label}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-ink-muted">Urgência</span>
              <span className={urgent === "sim" ? "text-action" : "text-ink-primary"}>
                {urgent === "sim" ? "Sim — priorize validação humana" : "Não identificada"}
              </span>
            </p>
            <p className="border-t border-line pt-3 leading-relaxed text-ink-secondary">
              {urgent === "sim"
                ? "Há elemento de urgência (prazo correndo/vencido). Nesses casos recomendamos validar o caso com a equipe ainda hoje — o encaminhamento já sai com esse resumo."
                : "Para orientar corretamente, a equipe vai confirmar informações adicionais do seu caso. O atendimento automatizado também pode adiantar dúvidas pontuais."}
            </p>
          </div>

          <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            Informação preliminar · não substitui análise jurídica individualizada
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={waLink(summary)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-action flex-1"
            >
              Enviar resumo à equipe
            </a>
            <a href="/atendimento" className="btn-ghost flex-1">
              Continuar no atendimento
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
