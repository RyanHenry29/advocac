"use client";

import Link from "next/link";
import LogoMark from "@/components/brand/LogoMark";
import { siteConfig } from "@/lib/config";

const columns = [
  {
    title: "Navegação",
    links: [
      { href: "/", label: "Início" },
      { href: "/escritorio", label: "O Escritório" },
      { href: "/atuacao", label: "Atuação" },
      { href: "/atendimento", label: "Atendimento" }
    ]
  },
  {
    title: "Central CAC",
    links: [
      { href: "/central-cac", label: "Guias e dúvidas" },
      { href: "/central-cac#portal-pf", label: "Portal PF" },
      { href: "/central-cac#habitualidade", label: "Habitualidade" },
      { href: "/central-cac#craf", label: "CRAF" }
    ]
  },
  {
    title: "Institucional",
    links: [
      { href: "/contato", label: "Contato" },
      { href: "/termos", label: "Termos de uso" },
      { href: "/privacidade", label: "Privacidade" },
      { href: "/cookies", label: "Cookies" }
    ]
  }
];

export default function Footer() {
  const signature = [siteConfig.instagramHandle, siteConfig.lawyerName, siteConfig.oab]
    .filter(Boolean)
    .join(" · ");

  return (
    <footer className="border-t border-line/50 bg-surface/20">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark size={44} />
            <span className="font-display text-2xl font-normal uppercase text-ink-primary">
              Advocac
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-secondary">
            {siteConfig.tagline}. Assessoria jurídica e documental para CACs —
            CRAF, registros, processos administrativos e Polícia Federal.
          </p>
          <div className="mt-5 flex flex-col gap-2.5 text-sm">
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline w-fit text-ink-secondary hover:text-ink-primary"
            >
              WhatsApp {siteConfig.whatsappDisplay}
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="link-underline w-fit text-ink-secondary hover:text-ink-primary"
            >
              {siteConfig.email}
            </a>
            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline w-fit text-ink-secondary hover:text-ink-primary"
            >
              Instagram {siteConfig.instagramHandle}
            </a>
            <p className="text-[13px] text-ink-muted">{siteConfig.businessHours}</p>
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-0.5">
              {col.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-[36px] items-center text-[13px] text-ink-secondary transition-colors hover:text-action"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line/50">
        <div className="shell flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary">
              {signature}
            </p>
            <p className="text-[11px] text-ink-muted">
              © {new Date().getFullYear()} Advocac. Todos os direitos reservados.
            </p>
            {siteConfig.cnpj && (
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                CNPJ {siteConfig.cnpj}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-cookie-preferences"));
              }}
              className="text-[11px] underline transition-colors hover:text-ink-primary"
            >
              Gerenciar cookies
            </button>
            <p className="hidden font-mono text-[11px] uppercase tracking-wider text-ink-muted lg:block">
              {siteConfig.disclaimerShort}
            </p>
            <LogoMark size={36} variant="latao" />
          </div>
        </div>
      </div>
    </footer>
  );
}