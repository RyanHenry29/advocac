"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useIntro } from "@/components/motion/IntroContext";
import LogoMark from "@/components/brand/LogoMark";

type ExitStep = "idle" | "lift" | "shutter" | "flash" | "done";

export default function IntroOverlay() {
  const { introDone, finishIntro } = useIntro();
  const overlayRef = useRef<HTMLDivElement>(null);
  const dismissed = useRef(false);
  const [phase, setPhase] = useState(0);
  const [exitStep, setExitStep] = useState<ExitStep>("idle");

  const dismiss = useCallback(() => {
    if (dismissed.current || exitStep !== "idle") return;
    dismissed.current = true;
    setExitStep("lift");
  }, [exitStep]);

  useEffect(() => {
    if (introDone || dismissed.current) return;
    const t1 = setTimeout(() => setPhase(1), 50);
    const t2 = setTimeout(() => setPhase(2), 150);
    const t3 = setTimeout(() => setPhase(3), 320);
    const t4 = setTimeout(() => setPhase(4), 470);
    const t5 = setTimeout(() => setPhase(5), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [introDone]);

  useEffect(() => {
    if (exitStep === "lift") {
      const t = setTimeout(() => setExitStep("shutter"), 300);
      return () => clearTimeout(t);
    }
    if (exitStep === "shutter") {
      const t = setTimeout(() => setExitStep("flash"), 350);
      return () => clearTimeout(t);
    }
    if (exitStep === "flash") {
      const t = setTimeout(() => setExitStep("done"), 400);
      return () => clearTimeout(t);
    }
    if (exitStep === "done") {
      const t = setTimeout(() => finishIntro(), 100);
      return () => clearTimeout(t);
    }
  }, [exitStep, finishIntro]);

  useEffect(() => {
    if (introDone || dismissed.current) return;
    const onScroll = () => dismiss();
    const onClick = () => dismiss();
    const onTouch = () => dismiss();
    window.addEventListener("scroll", onScroll, { passive: true, once: true });
    window.addEventListener("click", onClick, { once: true });
    window.addEventListener("touchstart", onTouch, { passive: true, once: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchstart", onTouch);
    };
  }, [introDone, dismiss]);

  if (introDone) return null;

  const isExiting = exitStep !== "idle";
  const liftOut = exitStep === "lift" || exitStep === "shutter" || exitStep === "flash" || exitStep === "done";
  const shutterIn = exitStep === "shutter" || exitStep === "flash" || exitStep === "done";
  const flashIn = exitStep === "flash" || exitStep === "done";

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#17191C]"
      style={{
        opacity: flashIn ? 0 : 1,
        transition: flashIn ? "opacity 0.35s ease" : undefined,
      }}
    >
      {/* Shutter bars — exit phase 2 */}
      <div
        className="absolute top-0 left-0 h-1/2 w-full bg-[#1E2126]"
        style={{
          transform: shutterIn ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.4s cubic-bezier(0.7, 0, 0.3, 1)",
          zIndex: 90,
        }}
      />
      <div
        className="absolute bottom-0 left-0 h-1/2 w-full bg-[#1E2126]"
        style={{
          transform: shutterIn ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.7, 0, 0.3, 1)",
          zIndex: 90,
        }}
      />

      {/* Flash — exit phase 3 */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(200,161,90,0.6) 0%, rgba(200,161,90,0.15) 30%, transparent 60%)",
          opacity: flashIn ? 1 : 0,
          transform: flashIn ? "scale(4)" : "scale(0.5)",
          transition: "opacity 0.25s ease-out, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          zIndex: 80,
        }}
      />

      {/* Grid lines — phase 1 */}
      <div
        className="absolute inset-0"
        style={{
          opacity: phase >= 1 && !isExiting ? 0.04 : 0,
          transition: "opacity 0.4s ease",
          backgroundImage:
            "linear-gradient(rgba(78,88,56,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(78,88,56,0.35) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Outer ring — phase 2 */}
      <div
        className="absolute"
        style={{
          width: "420px",
          height: "420px",
          border: "1px solid rgba(78,88,56,0.2)",
          borderRadius: "50%",
          opacity: phase >= 2 && !isExiting ? 1 : liftOut ? 0 : 0,
          transform: phase >= 2 && !isExiting
            ? "scale(1)"
            : liftOut
              ? "scale(2.5)"
              : "scale(0.6)",
          transition: liftOut
            ? "opacity 0.35s ease, transform 0.45s cubic-bezier(0.4, 0, 1, 1)"
            : "opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      {/* Middle ring — phase 2 */}
      <div
        className="absolute"
        style={{
          width: "320px",
          height: "320px",
          border: "1px solid rgba(200,161,90,0.16)",
          borderRadius: "50%",
          opacity: phase >= 2 && !isExiting ? 1 : liftOut ? 0 : 0,
          transform: phase >= 2 && !isExiting
            ? "scale(1) rotate(0deg)"
            : liftOut
              ? "scale(2) rotate(90deg)"
              : "scale(0.5) rotate(-45deg)",
          transition: liftOut
            ? "opacity 0.3s ease 0.05s, transform 0.4s cubic-bezier(0.4, 0, 1, 1) 0.05s"
            : "opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.05s, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.05s",
        }}
      />

      {/* Inner ring — phase 2 */}
      <div
        className="absolute"
        style={{
          width: "220px",
          height: "220px",
          border: "1px solid rgba(200,161,90,0.14)",
          borderRadius: "50%",
          opacity: phase >= 2 && !isExiting ? 1 : liftOut ? 0 : 0,
          transform: phase >= 2 && !isExiting
            ? "scale(1) rotate(0deg)"
            : liftOut
              ? "scale(1.8) rotate(-90deg)"
              : "scale(0.4) rotate(45deg)",
          transition: liftOut
            ? "opacity 0.3s ease 0.1s, transform 0.4s cubic-bezier(0.4, 0, 1, 1) 0.1s"
            : "opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s",
        }}
      />

      {/* Corner accents — phase 1 */}
      {[
        { top: "15%", left: "15%", rotate: "0deg" },
        { top: "15%", right: "15%", rotate: "90deg" },
        { bottom: "15%", right: "15%", rotate: "180deg" },
        { bottom: "15%", left: "15%", rotate: "270deg" },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            ...pos,
            width: "40px",
            height: "40px",
            borderTop: "1px solid rgba(200,161,90,0.24)",
            borderLeft: "1px solid rgba(200,161,90,0.24)",
            transform: `rotate(${pos.rotate})`,
            opacity: phase >= 1 && !isExiting ? 1 : 0,
            transition: `opacity 0.3s ease ${0.1 + i * 0.05}s`,
          }}
        />
      ))}

      {/* Scan line — phase 3 */}
      <div
        className="absolute left-0 right-0"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(200,161,90,0.35), transparent)",
          top: phase >= 3 && !isExiting ? "50%" : "20%",
          opacity: phase >= 3 && !isExiting ? 0.6 : 0,
          transition: "top 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease",
        }}
      />

      {/* Glow behind logo — phase 3 */}
      <div
        className="absolute"
        style={{
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,161,90,0.1) 0%, transparent 70%)",
          opacity: phase >= 3 && !isExiting ? 1 : 0,
          transform: phase >= 3 && !isExiting ? "scale(1)" : "scale(0.5)",
          transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      {/* Logo — phase 3 */}
      <div
        className="relative z-10"
        style={{
          opacity: phase >= 3 && !isExiting ? 1 : liftOut ? 0 : 0,
          transform: phase >= 3 && !isExiting
            ? "scale(1) translateY(0)"
            : liftOut
              ? "scale(1.4) translateY(-30px)"
              : "scale(0.85) translateY(15px)",
          filter: liftOut ? "blur(6px)" : "none",
          transition: liftOut
            ? "opacity 0.3s ease, transform 0.4s cubic-bezier(0.4, 0, 1, 1), filter 0.3s ease"
            : "opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), filter 0.3s ease",
        }}
      >
        <LogoMark
          size={140}
          variant="color"
          className="opacity-95"
        />
      </div>

      {/* Brand name — phase 4 */}
      <div
        className="relative z-10"
        style={{
          opacity: phase >= 4 && !isExiting ? 1 : liftOut ? 0 : 0,
          transform: phase >= 4 && !isExiting
            ? "translateY(0)"
            : liftOut
              ? "translateY(-20px)"
              : "translateY(12px)",
          filter: liftOut ? "blur(4px)" : "none",
          transition: liftOut
            ? "opacity 0.25s ease, transform 0.35s cubic-bezier(0.4, 0, 1, 1), filter 0.25s ease"
            : "opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1), transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <p
          className="mt-6 font-display text-2xl font-normal uppercase text-ink-primary"
          style={{ letterSpacing: "0.2em" }}
        >
          ADVOCAC
        </p>
      </div>

      {/* Tagline — phase 4 */}
      <div
        className="relative z-10"
        style={{
          opacity: phase >= 4 && !isExiting ? 1 : liftOut ? 0 : 0,
          transform: phase >= 4 && !isExiting
            ? "translateY(0)"
            : liftOut
              ? "translateY(-15px)"
              : "translateY(8px)",
          filter: liftOut ? "blur(3px)" : "none",
          transition: liftOut
            ? "opacity 0.2s ease 0.05s, transform 0.3s cubic-bezier(0.4, 0, 1, 1) 0.05s, filter 0.2s ease 0.05s"
            : "opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1) 0.08s, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1) 0.08s",
        }}
      >
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-muted">
          Direito · Documentação · Precisão
        </p>
      </div>

      {/* CTA — phase 5 */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
        style={{
          opacity: phase >= 5 && !isExiting ? 1 : 0,
          transform: phase >= 5 && !isExiting ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(10px)",
          transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted">
          TOQUE OU DESLIZE PARA ENTRAR
        </p>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-ink-muted/70" style={{ animation: "intro-bounce 1.5s ease-in-out infinite" }}>
          <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </div>

      <style>{`
        @keyframes intro-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(6px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
