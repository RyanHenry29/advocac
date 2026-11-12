"use client";

import { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  variant?: "up" | "fade" | "left" | "scale";
  className?: string;
}

export default function Reveal({
  children,
  delay = 0,
  variant = "up",
  className = ""
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (delay > 0) {
        const timer = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(timer);
      }
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(node);

    const safety = setTimeout(() => {
      setVisible(true);
      observer.disconnect();
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(safety);
    };
  }, [delay]);

  const variantClass = {
    up: "reveal-up",
    fade: "reveal-fade",
    left: "reveal-left",
    scale: "reveal-scale"
  }[variant];

  return (
    <div
      ref={ref}
      className={`${variantClass} ${visible ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
