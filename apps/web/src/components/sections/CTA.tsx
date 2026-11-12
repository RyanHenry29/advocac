import Reveal from "@/components/motion/Reveal";
import { siteConfig } from "@/lib/config";

export default function CTA() {
  return (
    <section className="relative border-y border-line/50 bg-surface/30">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-20"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(600px 300px at 70% 50%, rgba(200,161,90,0.12), transparent 70%)"
        }}
      />
      <div className="shell relative section-gap">
        <Reveal>
          <p className="kicker">Próximo passo</p>
          <h2 className="section-title mt-4 max-w-3xl">
            Seu caso merece precisão, não generalidade.
          </h2>
          <p className="mt-5 max-w-xl text-ink-secondary">
            Descreva sua situação em palavras simples. O atendimento localiza a
            orientação certa, com fonte e data de verificação — e, se for o caso,
            encaminha direto para a equipe.
          </p>
        </Reveal>
        <Reveal delay={150} className="mt-8">
          <a
            href={`https://wa.me/${siteConfig.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-action"
          >
            Falar no WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}