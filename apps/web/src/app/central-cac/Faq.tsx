"use client";

import { useId, useState } from "react";
import NormText from "@/components/brand/NormText";

interface FaqItem {
  q: string;
  a: string;
}

export default function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const buttonId = `${baseId}-btn-${i}`;
        const panelId = `${baseId}-panel-${i}`;
        const isOpen = open === i;
        return (
          <div key={i} className="card overflow-hidden">
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <span className="font-body text-sm font-semibold uppercase tracking-wide text-ink-primary md:text-base">
                {item.q}
              </span>
              <span
                aria-hidden="true"
                className={`ml-4 flex-shrink-0 text-action transition-transform duration-200 ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? "max-h-96 pb-5" : "max-h-0 invisible"
              }`}
            >
              <p className="px-5 text-sm leading-relaxed text-ink-secondary">
                <NormText text={item.a} />
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
