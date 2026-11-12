import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

const pillars = [
  {
    index: "01",
    title: "Direito",
    text: "Atuação jurídica e processos: defesa administrativa, recursos, liminares contra demora e indeferimento junto à Polícia Federal."
  },
  {
    index: "02",
    title: "Documentação",
    text: "Orientação e organização documental: CRAF, CR, habitualidade, certidões, avaliações e conformidade cadastral."
  },
  {
    index: "03",
    title: "Conhecimento",
    text: "Conteúdo e orientação para CACs: Portal PF, mudanças regulatórias e o que muda na prática — de atirador para atirador."
  }
];

export default function Pilares() {
  return (
    <section className="section-gap shell">
      <Reveal>
        <p className="kicker">Os três pilares</p>
        <h2 className="section-title mt-4">
          Como a Advocac trabalha
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-px md:border md:border-line md:bg-line">
        {pillars.map((p, i) => (
          <Reveal key={p.index} delay={i * 120}>
            <div className="h-full bg-surface/50 p-7 md:p-9">
              <span className="index-label">{p.index}</span>
              <h3 className="display mt-4 text-xl text-ink-primary md:text-2xl">
                {p.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-ink-secondary">{p.text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200} className="mt-10">
        <Link href="/atuacao" className="link-underline text-sm uppercase tracking-widest text-action">
          Ver áreas de atuação
        </Link>
      </Reveal>
    </section>
  );
}