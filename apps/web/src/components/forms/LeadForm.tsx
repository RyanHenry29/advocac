"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/config";

function maskPhone(value: string): string {
  const d = value
    .replace(/\D/g, "")
    .replace(/^55/, "")
    .slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function LeadForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [phone, setPhone] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const whatsappWin = window.open("about:blank", "_blank");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          whatsapp: phone,
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
          company: data.get("company")
        })
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Falha ao enviar");
      }

      setSent(true);
      if (whatsappWin && json.handoffUrl) {
        whatsappWin.location.href = json.handoffUrl;
      } else if (whatsappWin) {
        whatsappWin.close();
      }
    } catch (err) {
      if (whatsappWin) whatsappWin.close();
      setError(
        err instanceof Error && !(err instanceof TypeError)
          ? err.message
          : "Não foi possível enviar agora. Tente o WhatsApp direto."
      );
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="card animate-rise p-8 text-center">
        <p className="index-label">Recebido</p>
        <h3 className="display mt-3 text-2xl text-ink-primary">Mensagem registrada.</h3>
        <p className="mt-3 text-sm text-ink-secondary">
          Abrimos o WhatsApp com seu resumo pronto — basta enviar. Se a janela
          não abriu, chame no {siteConfig.whatsappDisplay}.
        </p>
        <a
          href={`https://wa.me/${siteConfig.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-action mt-6"
        >
          Abrir WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5 md:p-7">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="lead-name"
            className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-muted"
          >
            Nome *
          </label>
          <input
            id="lead-name"
            name="name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            className="input-field"
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label
            htmlFor="lead-whatsapp"
            className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-muted"
          >
            WhatsApp *
          </label>
          <input
            id="lead-whatsapp"
            name="whatsapp"
            required
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            className="input-field"
            placeholder="(11) 91234-5678"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="lead-email"
          className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-muted"
        >
          E-mail <span className="normal-case tracking-normal">(opcional)</span>
        </label>
        <input
          id="lead-email"
          name="email"
          type="email"
          autoComplete="email"
          className="input-field"
          placeholder="voce@email.com"
        />
      </div>

      <div>
        <label
          htmlFor="lead-subject"
          className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-muted"
        >
          Assunto <span className="normal-case tracking-normal">(opcional)</span>
        </label>
        <select
          id="lead-subject"
          name="subject"
          defaultValue=""
          className="input-field"
        >
          <option value="">Prefiro explicar no WhatsApp</option>
          <option value="Renovação de CRAF">Renovação de CRAF</option>
          <option value="Exigência no processo">Exigência no processo</option>
          <option value="Indeferimento / recurso">Indeferimento / recurso</option>
          <option value="Registro (CR)">Registro (CR)</option>
          <option value="Aquisição / cota">Aquisição / cota</option>
          <option value="Transferência">Transferência</option>
          <option value="Habitualidade">Habitualidade</option>
          <option value="Outro assunto CAC">Outro assunto CAC</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="lead-message"
          className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-muted"
        >
          Situação <span className="normal-case tracking-normal">(opcional)</span>
        </label>
        <textarea
          id="lead-message"
          name="message"
          maxLength={2000}
          rows={4}
          className="input-field !h-auto py-3"
          placeholder="Se quiser, adianta o contexto. Prefere falar? Mande áudio no WhatsApp — o campo pode ficar vazio."
        />
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="lead-company">Empresa</label>
        <input id="lead-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {error && (
        <p role="alert" className="border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad">
          {error}
        </p>
      )}

      <button type="submit" disabled={sending} className="btn-action w-full disabled:opacity-60">
        {sending ? "Enviando…" : "Enviar e abrir WhatsApp"}
      </button>

      <p className="text-center font-mono text-[10px] uppercase tracking-wider text-ink-muted">
        {siteConfig.disclaimerShort}
      </p>
      <p className="text-center text-[11px] leading-relaxed text-ink-muted">
        Ao enviar, você concorda com a nossa{" "}
        <a href="/privacidade" className="link-underline text-ink-secondary">
          Política de Privacidade
        </a>
        .
      </p>
    </form>
  );
}
