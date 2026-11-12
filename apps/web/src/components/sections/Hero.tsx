"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const stripItems = [
  "CAC",
  "CRAF",
  "Registro CR",
  "Habitualidade",
  "Processos Administrativos",
  "Polícia Federal",
  "Portal PF",
  "Documentação",
  "IAT"
];

export default function Hero() {
  const [visible, setVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const t = window.setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const anim = (delay: number) => ({
    className: `hero-item${visible ? " hero-item-in" : ""}`,
    style: { transitionDelay: visible ? `${delay}ms` : "0ms" } as React.CSSProperties,
  });

  return (
    <section className="relative flex svh-fallback flex-col justify-center min-h-[600px] overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/hero-novo.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-base/55" />
      </div>

      <div className="shell relative z-10 pt-28 pb-24 md:pt-36 md:pb-32 lg:pt-40 lg:pb-36">
        <p {...anim(0)} className="kicker text-ink-primary/90">
          Advocacia · CAC · IAT
        </p>

        <h1 {...anim(100)} className="mt-6 max-w-5xl font-display font-normal uppercase text-ink-primary leading-[0.98] drop-shadow-lg" style={{ fontSize: "clamp(2.75rem, 7.5vw, 6rem)" }}>
          Direito.<br />
          Documentação.<br />
          <span className="text-action">Precisão.</span>
        </h1>

        <p {...anim(450)} className="mt-8 max-w-xl text-base leading-relaxed text-ink-primary/90 md:text-lg md:leading-relaxed drop-shadow-lg" style={{ maxWidth: "42ch" }}>
          Assessoria jurídica e documental especializada para CACs.
          CRAF, CR, habitualidade, processos na Polícia Federal —
          <strong className="text-ink-primary">de atirador para atirador.</strong>
        </p>

        <div {...anim(600)} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/atendimento" className="btn-action">
            Falar com a equipe
          </Link>
          <Link href="/escritorio" className="btn-ghost border-ink-primary/30 text-ink-primary hover:bg-ink-primary/10">
            Conhecer o escritório
          </Link>
        </div>

        <p {...anim(750)} className="mt-12 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-primary/70 drop-shadow-lg">
          Atendimento 24h · Fonte e data em cada resposta
        </p>
      </div>

      <div className="relative border-y border-ink-primary/15 bg-base/30 py-4 overflow-hidden">
        <div className="flex" aria-hidden="true">
          <div className="marquee-track flex w-max shrink-0 items-center">
            {[...stripItems, ...stripItems, ...stripItems].map((label, i) => (
              <span
                key={`${label}-${i}`}
                className="flex items-center gap-12 pr-12 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.1em] text-ink-primary/60"
              >
                {label}
                <span className="text-action/70">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        className="scroll-cue"
        style={{ opacity: visible && scrollY < 100 ? 1 : 0, pointerEvents: "none" }}
        aria-hidden="true"
      >
        <div className="scroll-cue-line" />
      </div>
    </section>
  );
}
