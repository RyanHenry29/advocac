import Link from "next/link";
import LogoMark from "@/components/brand/LogoMark";

export default function NotFound() {
  return (
    <main className="shell flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <LogoMark size={72} />
      <p className="kicker mt-8">Erro 404</p>
      <h1 className="display mt-4 text-4xl text-ink-primary md:text-5xl">
        Página fora da mira.
      </h1>
      <p className="mt-4 max-w-md text-ink-secondary">
        O endereço acessado não existe ou foi movido. Volte ao início ou siga
        para o atendimento.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-action">
          Voltar ao início
        </Link>
        <Link href="/atendimento" className="btn-ghost">
          Ir para o atendimento
        </Link>
      </div>
    </main>
  );
}
