import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Cookies e tecnologias utilizados pelo site da Advocac.",
  alternates: { canonical: "/cookies" },
  robots: { index: false }
};

export default function CookiesPage() {
  return (
    <main className="shell max-w-3xl py-24 md:py-32">
      <p className="kicker">Institucional</p>
      <h1 className="display mt-4 text-4xl text-ink-primary">
        Política de Cookies
      </h1>
      <div className="prose-advocac mt-10 text-sm leading-relaxed text-ink-secondary">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-line">
              <th className="py-2 pr-3 font-mono uppercase tracking-wider text-ink-muted">
                Nome
              </th>
              <th className="py-2 pr-3 font-mono uppercase tracking-wider text-ink-muted">
                Tipo
              </th>
              <th className="py-2 pr-3 font-mono uppercase tracking-wider text-ink-muted">
                Finalidade
              </th>
              <th className="py-2 font-mono uppercase tracking-wider text-ink-muted">
                Validade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            <tr>
              <td className="py-2 pr-3 font-mono">advocac-cookie-consent</td>
              <td className="py-2 pr-3">Necessário</td>
              <td className="py-2 pr-3">Registra sua preferência de cookies</td>
              <td className="py-2">180 dias</td>
            </tr>
            <tr>
              <td className="py-2 pr-3 font-mono">advocac-chat-*</td>
              <td className="py-2 pr-3">Necessário</td>
              <td className="py-2 pr-3">
                Mantém a sessão do atendimento em aberto
              </td>
              <td className="py-2">Sessão</td>
            </tr>
            <tr>
              <td className="py-2 pr-3 font-mono">advocac-intro-seen</td>
              <td className="py-2 pr-3">Necessário</td>
              <td className="py-2 pr-3">
                Evita repetir a abertura cinematográfica
              </td>
              <td className="py-2">Sessão</td>
            </tr>
            <tr>
              <td className="py-2 pr-3 font-mono">_ga / _ga_*</td>
              <td className="py-2 pr-3">Analytics</td>
              <td className="py-2 pr-3">
                Google Analytics 4 — estatísticas anônimas de uso
              </td>
              <td className="py-2">2 anos</td>
            </tr>
            <tr>
              <td className="py-2 pr-3 font-mono">_gtm_*</td>
              <td className="py-2 pr-3">Analytics</td>
              <td className="py-2 pr-3">Google Tag Manager — carrega as tags</td>
              <td className="py-2">Sessão</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-8">
          <strong className="text-ink-primary">Cookies essenciais.</strong> Este
          site utiliza armazenamento local do navegador para manter a sessão do
          atendimento (sessionStorage) e registrar suas preferências de cookies
          (localStorage). Esses cookies são estritamente necessários para o
          funcionamento do site e não podem ser desativados.
        </p>
        <p>
          <strong className="text-ink-primary">Cookies de analytics.</strong>{" "}
          Google Analytics 4 e Google Tag Manager só carregam se você autorizar
          na caixa de consentimento. Sem consentimento, nenhum script de
          medição é solicitado ao seu navegador.
        </p>
        <p>
          <strong className="text-ink-primary">Cookies de marketing.</strong>{" "}
          Caso você autorize, poderemos utilizar cookies para exibir anúncios
          relevantes. Hoje nenhum script de marketing está ativo no site; a
          categoria fica reservada para uso futuro.
        </p>
        <p>
          <strong className="text-ink-primary">Como gerenciar.</strong> Você pode
          alterar suas preferências a qualquer momento clicando em
          &quot;Gerenciar cookies&quot; no rodapé do site ou redefinindo as
          preferências pelo botão de configurações de cookies (ícone de engrenagem
          no canto inferior esquerdo).
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
          Última atualização: agosto/2026
        </p>
      </div>
    </main>
  );
}
