import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a Advocac coleta, usa e protege seus dados (LGPD).",
  alternates: { canonical: "/privacidade" },
  robots: { index: false }
};

export default function PrivacidadePage() {
  return (
    <main className="shell max-w-3xl py-24 md:py-32">
      <p className="kicker">Institucional</p>
      <h1 className="display mt-4 text-4xl text-ink-primary">
        Política de Privacidade
      </h1>
      <div className="prose-advocac mt-10 text-sm leading-relaxed text-ink-secondary">
        <p>
          <strong className="text-ink-primary">1. Dados coletados.</strong> (a)
          Dados que você informa no formulário de contato: nome, WhatsApp, e-mail
          (opcional) e a descrição da sua demanda; (b) registro automatizado do
          atendimento: tema identificado, perfil declarado, urgência e as
          mensagens trocadas no chat — usados para dar continuidade ao
          atendimento e melhorar a base de conhecimento.
        </p>
        <p>
          <strong className="text-ink-primary">2. Finalidade.</strong> Os dados
          servem exclusivamente para: responder sua demanda, encaminhar o
          resumo do atendimento à equipe, e evoluir as respostas do
          atendimento (análise de dúvidas não respondidas).
        </p>
        <p>
          <strong className="text-ink-primary">3. Base legal (LGPD).</strong> O
          tratamento se apoia no art. 7º, V (execução de contrato — resposta à
          sua demanda), VI (cumprimento de obrigação legal — registros da
          advocacia) e I (consentimento — cookies de analytics/marketing,
          revogável a qualquer momento).
        </p>
        <p>
          <strong className="text-ink-primary">4. Compartilhamento.</strong> Os
          dados não são vendidos nem compartilhados com terceiros para
          marketing. Infraestrutura técnica (hospedagem, banco de dados e
          provedor de IA) processa dados apenas como prestadores de serviço.
        </p>
        <p>
          <strong className="text-ink-primary">5. Transferência
          internacional.</strong> Hospedagem (Vercel), banco (Supabase) e
          provedor de IA (Groq) podem processar dados fora do Brasil, com
          transferência amparada em cláusulas contratuais padrão e obrigações
          de segurança equivalentes às desta política.
        </p>
        <p>
          <strong className="text-ink-primary">6. Encarregado (DPO).</strong>{" "}
          Solicitações de titular: {siteConfig.email} · WhatsApp{" "}
          {siteConfig.whatsappDisplay}. Resposta em prazo razoável.
        </p>
        <p>
          <strong className="text-ink-primary">7. Retenção.</strong> Os registros
          de atendimento são mantidos pelo período necessário ao atendimento e
          às obrigações da advocacia, podendo ser excluídos a seu pedido.
        </p>
        <p>
          <strong className="text-ink-primary">8. Seus direitos (LGPD).</strong>{" "}
          Você pode solicitar confirmação de tratamento, acesso, correção,
          portabilidade, anonimização, revogação do consentimento ou exclusão
          dos seus dados pelo WhatsApp {siteConfig.whatsappDisplay} ou e-mail{" "}
          {siteConfig.email}.
        </p>
        <p>
          <strong className="text-ink-primary">9. Segurança.</strong> As chaves
          de infraestrutura ficam exclusivamente no servidor (nunca no
          navegador); as comunicações ocorrem por HTTPS; dados de chat são
          registrados no banco com controle de acesso (RLS).
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
          Última atualização: agosto/2026 · Documento sujeito a revisão jurídica
          pelo titular
        </p>
      </div>
    </main>
  );
}
