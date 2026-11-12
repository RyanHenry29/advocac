"use client";

import { useEffect, useRef } from "react";
import { useChatEngine } from "@/components/chatbot/useChatEngine";
import LogoMark from "@/components/brand/LogoMark";
import { siteConfig } from "@/lib/config";

export default function ChatPanel({ compact = false }: { compact?: boolean }) {
  const { messages, chips, input, setInput, typing, handoffUrl, boot, send } =
    useChatEngine();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    boot();
  }, [boot]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, typing]);

  return (
    <div className="flex h-full min-h-[500px] flex-col border border-line/50 bg-surface/30">
      <div className="flex items-center gap-3 border-b border-line/50 px-4 py-3">
        <LogoMark size={36} />
        <div>
          <p className="font-display text-sm uppercase tracking-wider text-ink-primary">
            Atendimento Advocac
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Sistema ativo · orientação imediata
          </p>
        </div>
      </div>

      <div
        ref={logRef}
        className={`flex-1 space-y-3 overflow-y-auto px-4 py-4 ${compact ? "max-h-[360px]" : ""}`}
        role="log"
        aria-live="polite"
      >
        {messages.map((m, i) => (
          <div key={i} className={`msg-in ${m.who === "user" ? "flex justify-end" : ""}`}>
            <div
              className={`max-w-[88%] text-sm leading-relaxed ${
                m.who === "user"
                  ? "border border-olive/30 bg-olive/15 px-3.5 py-2.5 text-ink-primary"
                  : "border border-line/50 bg-base/40 px-3.5 py-2.5 text-ink-secondary [&_em]:text-ink-primary [&_strong]:text-ink-primary"
              }`}
              dangerouslySetInnerHTML={{ __html: m.html }}
            />
            {m.source && (
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                Fonte: {m.source.label} · verificada em {m.source.verified}
              </p>
            )}
            {m.steps && (
              <ul className="mt-2 space-y-1.5 border-l border-olive/40 pl-3">
                {m.steps.map((s, j) => (
                  <li key={j} className="text-xs leading-relaxed text-ink-secondary">
                    <span className="mr-1.5 font-mono text-gold">
                      {String(j + 1).padStart(2, "0")}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {typing && (
          <div className="flex items-center gap-1.5 px-1" aria-label="Digitando">
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-action" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-action" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-action" />
          </div>
        )}

        {handoffUrl && (!chips || chips.length === 0) && (
          <a
            href={handoffUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="msg-in btn-action w-full"
          >
            Falar com a equipe no WhatsApp
          </a>
        )}
      </div>

      {chips && chips.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-line/50 px-4 py-3">
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => send(chip.value || chip.label, chip.value)}
              className={`min-h-[38px] border px-3 py-2 text-xs transition-colors duration-150 ${
                chip.primary
                  ? "border-action bg-action/10 text-action hover:bg-action hover:text-base"
                  : "border-line/50 text-ink-secondary hover:border-ink-muted hover:text-ink-primary"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex items-center gap-2 border-t border-line/50 px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Descreva sua situação…"
          aria-label="Descreva sua situação"
          className="h-10 flex-1 border border-line/50 bg-base/40 px-3 text-base text-ink-primary placeholder:text-ink-muted focus:border-action focus:outline-none"
        />
        <button type="submit" className="btn-action !min-h-[40px] !px-3.5" aria-label="Enviar mensagem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 12h16M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </button>
      </form>

      <p className="border-t border-line/50 bg-base/30 px-4 py-2 text-center font-mono text-[9px] uppercase tracking-wider text-ink-muted">
        {siteConfig.disclaimerShort}
      </p>
      <p className="bg-base/30 px-4 pb-2 text-center text-[10px] text-ink-muted">
        As mensagens são registradas para dar continuidade ao atendimento ·{" "}
        <a href="/privacidade" className="link-underline text-ink-secondary">
          Privacidade
        </a>
      </p>
    </div>
  );
}
