"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import LogoMark from "@/components/brand/LogoMark";
import { useChatEngine } from "@/components/chatbot/useChatEngine";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { messages, chips, input, setInput, typing, handoffUrl, boot, send } =
    useChatEngine();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, typing]);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (pathname?.startsWith("/atendimento")) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          boot();
        }}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 z-50 flex items-center gap-2 border border-action/50 bg-action/90 px-3.5 py-2.5 text-xs font-semibold text-base backdrop-blur-sm transition-all hover:bg-action sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:right-5"
        aria-label="Fale com a equipe Advocac"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
        Precisa de ajuda?
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Atendimento Advocac"
      className="fixed bottom-0 right-0 z-50 flex h-[100dvh] w-full flex-col border-l border-line bg-base sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:right-5 sm:h-[600px] sm:max-h-[85vh] sm:w-[400px] sm:rounded-sm sm:shadow-2xl sm:shadow-black/50"
    >
      <div className="flex items-center justify-between border-b border-line/50 bg-surface/60 px-4 py-3">
        <div className="flex items-center gap-3">
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
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex h-10 w-10 items-center justify-center text-ink-muted transition-colors hover:text-ink-primary"
          aria-label="Fechar atendimento"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>

      <div ref={logRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" role="log" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`msg-in ${m.who === "user" ? "flex justify-end" : ""}`}>
            <div
              className={`max-w-[88%] text-sm leading-relaxed ${
                m.who === "user"
                  ? "border border-olive/30 bg-olive/15 px-3.5 py-2.5 text-ink-primary"
                  : "border border-line/50 bg-surface/40 px-3.5 py-2.5 text-ink-secondary [&_em]:text-ink-primary [&_strong]:text-ink-primary"
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
          className="h-10 flex-1 border border-line/50 bg-surface/40 px-3 text-base text-ink-primary placeholder:text-ink-muted focus:border-action focus:outline-none"
        />
        <button type="submit" className="btn-action !min-h-[40px] !px-3.5" aria-label="Enviar mensagem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 12h16M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </button>
      </form>
    </div>
  );
}