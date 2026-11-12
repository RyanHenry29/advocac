import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso do site da Advocac.",
  alternates: { canonical: "/termos" },
  robots: { index: false }
};

export default function TermosPage() {
  return (
    <main className="shell max-w-3xl py-24 md:py-32">
      <p className="kicker">Institucional</p>
      <h1 className="display mt-4 text-4xl text-ink-primary">Termos de Uso</h1>
      <div className="prose-advocac mt-10 text-sm leading-relaxed text-ink-secondary">
        <p>
          <strong className="text-ink-primary">1. Objeto.</strong> Este site
          oferece informações institucionais e atendimento automatizado de
          orientação preliminar sobre questões jurídico-administrativas do
          universo CAC, prestado pela Advocac.
        </p>
        <p>
          <strong className="text-ink-primary">2. Natureza das informações.</strong>{" "}
          Todo conteúdo — inclusive respostas do atendimento automatizado — tem
          caráter preliminar e geral, com indicação de fonte e data de
          verificação quando aplicável, e não constitui parecer jurídico nem
          substitui análise individualizada do caso concreto.
        </p>
        <p>
          <strong className="text-ink-primary">3. Ausência de garantia.</strong>{" "}
          Nenhuma informação neste site constitui promessa ou garantia de
          resultado processual ou administrativo.
        </p>
        <p>
          <strong className="text-ink-primary">4. Uso permitido.</strong> O
          atendimento automatizado é destinado exclusivamente ao escopo
          jurídico, documental e administrativo do universo CAC. Solicitações
          fora desse escopo serão recusadas.
        </p>
        <p>
          <strong className="text-ink-primary">5. Dados pessoais.</strong> O
          tratamento de dados segue a Política de Privacidade deste site, em
          conformidade com a LGPD (
          <span className="font-mono text-[0.92em] tracking-tight text-ink-primary">
            Lei nº 13.709/2018
          </span>
          ).
        </p>
        <p>
          <strong className="text-ink-primary">6. Propriedade intelectual.</strong>{" "}
          Marcas, textos e elementos visuais pertencem à Advocac; reprodução
          total ou parcial sem autorização é proibida.
        </p>
        <p>
          <strong className="text-ink-primary">7. Contato.</strong> Dúvidas sobre
          estes termos: WhatsApp {siteConfig.whatsappDisplay} ou Instagram{" "}
          {siteConfig.instagramHandle}.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
          Última atualização: agosto/2026 · Documento sujeito a revisão jurídica
          pelo titular
        </p>
      </div>
    </main>
  );
}
