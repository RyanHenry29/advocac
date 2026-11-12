"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoMark from "@/components/brand/LogoMark";

const navItems = [
  { href: "/escritorio", label: "O Escritório" },
  { href: "/atuacao", label: "Atuação" },
  { href: "/central-cac", label: "Central CAC" },
  { href: "/contato", label: "Contato" }
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => setScrolled(window.scrollY > 40);
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
    } else {
      const top = document.body.style.top;
      const scrollY = Math.abs(parseInt(top || "0", 10) || 0);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    hamburgerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeMenu();
        return;
      }
      if (e.key === "Tab" && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeMenu]);

  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const first = menuRef.current.querySelector<HTMLElement>("a[href], button");
    first?.focus();
  }, [isOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-base/95 backdrop-blur-md border-b border-line/50"
          : "bg-transparent border-b border-transparent"
      } ${ready ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}
    >
      <div className="shell flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Advocac — início">
          <LogoMark size={36} />
          <span className="font-display text-xl font-normal uppercase tracking-tight text-ink-primary">
            Advocac
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Navegação principal">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`link-underline text-[13px] transition-colors ${
                pathname.startsWith(item.href)
                  ? "text-action"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/atendimento"
            className="btn-action !min-h-[38px] !px-4 !py-2 !text-xs"
          >
            Atendimento
          </Link>
        </nav>

        <button
          ref={hamburgerRef}
          type="button"
          className="md:hidden flex h-11 w-11 items-center justify-center text-ink-primary"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {isOpen ? (
              <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" />
            ) : (
              <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.5" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <nav
          ref={menuRef}
          className="md:hidden border-t border-line/50 bg-base/98 backdrop-blur-md animate-rise"
          aria-label="Navegação mobile"
        >
          <div className="shell flex flex-col py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[48px] items-center px-1 text-[15px] transition-colors ${
                  pathname.startsWith(item.href)
                    ? "text-action"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 divider" />
            <Link href="/atendimento" className="btn-action mt-3">
              Atendimento
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}