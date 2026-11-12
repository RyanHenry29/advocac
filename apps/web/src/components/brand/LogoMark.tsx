const sources = {
  color: "/logo.png",
  latao: "/logo-latao.png",
  offwhite: "/logo-offwhite.png",
  grafite: "/logo-grafite.png",
  preto: "/logo-preto.png"
} as const;

type LogoVariant = keyof typeof sources;

// Escala mínima da marca — manual de identidade (02/10/2026):
// 36 px comentário · 72 px stories · 160 px perfil. Nunca abaixo disso.
export const LOGO_MIN = { comentario: 36, stories: 72, perfil: 160 } as const;

const RATIO = 433 / 377;

export default function LogoMark({
  size = LOGO_MIN.comentario,
  variant = "color",
  className = ""
}: {
  size?: number;
  variant?: LogoVariant;
  className?: string;
}) {
  return (
    <img
      src={sources[variant]}
      alt="Advocac"
      width={size}
      height={Math.round(size * RATIO)}
      className={`object-contain ${className}`}
      decoding="async"
    />
  );
}
