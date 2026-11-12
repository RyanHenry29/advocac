"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useIntro } from "@/components/motion/IntroContext";

interface CookieConsent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const STORAGE_KEY = "advocac-cookie-consent";
const CONSENT_VERSION = "1.0";

function loadConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== CONSENT_VERSION) return null;
    if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(consent: Omit<CookieConsent, "timestamp">) {
  const full: CookieConsent & { version: string; expiresAt: string } = {
    ...consent,
    timestamp: new Date().toISOString(),
    // expira em 180 dias — depois disso o banner aparece de novo
    expiresAt: new Date(Date.now() + 180 * 864e5).toISOString(),
    version: CONSENT_VERSION
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  window.dispatchEvent(new CustomEvent("cookie-consent", { detail: full }));
}

export function getStoredConsent(): CookieConsent | null {
  return loadConsent();
}

export default function CookieBanner() {
  const { introDone } = useIntro();
  const [show, setShow] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(show);

  const reopen = useCallback(() => {
    const existing = loadConsent();
    if (existing) {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }
    setShow(true);
    setShowPrefs(false);
  }, []);

  useEffect(() => {
    if (!introDone) return;
    const existing = loadConsent();
    if (!existing) setShow(true);

    const handleOpen = () => reopen();
    window.addEventListener("open-cookie-preferences", handleOpen);
    return () => window.removeEventListener("open-cookie-preferences", handleOpen);
  }, [introDone, reopen]);

  useEffect(() => {
    if (!show) return;
    const first = dialogRef.current?.querySelector<HTMLElement>(
      "button, [role='switch'], a"
    );
    first?.focus();
  }, [show, showPrefs]);

  useEffect(() => {
    if (!show) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShow(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show]);

  const acceptAll = useCallback(() => {
    saveConsent({ necessary: true, analytics: true, marketing: true });
    setShow(false);
  }, []);

  const rejectAll = useCallback(() => {
    saveConsent({ necessary: true, analytics: false, marketing: false });
    setShow(false);
  }, []);

  const savePreferences = useCallback(() => {
    saveConsent({ necessary: true, analytics, marketing });
    setShow(false);
    setShowPrefs(false);
  }, [analytics, marketing]);

  if (!introDone) return null;

  if (!show) {
    return (
      <button
        ref={triggerRef}
        onClick={reopen}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-muted shadow-lg transition-colors hover:border-action/40 hover:text-ink-primary"
        aria-label="Configurar cookies"
        title="Configurar cookies"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>
    );
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-label="Preferências de cookies"
      className="fixed bottom-0 left-0 right-0 z-[71] border-t border-line bg-surface px-5 py-5 shadow-2xl md:px-8"
    >
      {showPrefs ? (
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg uppercase text-ink-primary">
              Preferências de cookies
            </h2>
            <button
              onClick={() => setShowPrefs(false)}
              className="text-ink-muted hover:text-ink-primary"
              aria-label="Voltar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded border border-line bg-base px-4 py-3">
              <div>
                <span className="text-sm font-medium text-ink-primary">Necessários</span>
                <p className="text-xs text-ink-muted">Essenciais para o funcionamento do site</p>
              </div>
              <span className="font-mono text-[10px] uppercase text-ink-muted">Sempre ativo</span>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded border border-line bg-base px-4 py-3 transition-colors hover:border-action/40">
              <div>
                <span className="text-sm font-medium text-ink-primary">Analytics</span>
                <p className="text-xs text-ink-muted">Nos ajudam a entender como você usa o site</p>
              </div>
              <div
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  analytics ? "bg-action" : "bg-line"
                }`}
                role="switch"
                aria-checked={analytics}
                tabIndex={0}
                onClick={() => setAnalytics(!analytics)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setAnalytics(!analytics);
                  }
                }}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-ink-primary transition-transform ${
                    analytics ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded border border-line bg-base px-4 py-3 transition-colors hover:border-action/40">
              <div>
                <span className="text-sm font-medium text-ink-primary">Marketing</span>
                <p className="text-xs text-ink-muted">Usados para anúncios relevantes</p>
              </div>
              <div
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  marketing ? "bg-action" : "bg-line"
                }`}
                role="switch"
                aria-checked={marketing}
                tabIndex={0}
                onClick={() => setMarketing(!marketing)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setMarketing(!marketing);
                  }
                }}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-ink-primary transition-transform ${
                    marketing ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>
          </div>

          <button onClick={savePreferences} className="btn-action w-full">
            Salvar preferências
          </button>
        </div>
      ) : (
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-ink-secondary">
            Usamos cookies essenciais para o funcionamento do site. Cookies de
            analytics e marketing são opcionais.{" "}
            <Link href="/cookies" className="link-underline text-ink-primary">
              Saiba mais
            </Link>
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              onClick={rejectAll}
              className="btn-ghost !min-h-[40px] !px-4 !text-xs"
            >
              Recusar
            </button>
            <button
              onClick={() => setShowPrefs(true)}
              className="btn-ghost !min-h-[40px] !px-4 !text-xs"
            >
              Preferências
            </button>
            <button onClick={acceptAll} className="btn-action !min-h-[40px] !px-4 !text-xs">
              Aceitar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
