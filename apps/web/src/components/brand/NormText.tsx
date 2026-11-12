const NORM =
  /((?:Lei|Decreto)\s+n?[º°]?\s*\d[\d.]*(?:\/\d{2,4})?|\bIN\s+\d+\/\d+(?:[-/][A-Z]+)*|\barts?\.\s*\d+(?:\s*e\s*\d+)?)/g;

// Manual de identidade: número de norma, ofício e processo em IBM Plex Mono.
export default function NormText({ text }: { text: string }) {
  return (
    <>
      {text.split(NORM).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-mono text-[0.92em] tracking-tight text-ink-primary">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
