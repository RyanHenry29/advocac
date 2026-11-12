import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Identidade Advocac — paleta aprovada em 02/10/2026
        base: "#17191C", // grafite · fundo
        surface: "#1E2126",
        panel: "#252A30",
        line: "#343A41",
        action: {
          DEFAULT: "#C8A15A", // latão · único destaque
          hover: "#D8B477"
        },
        olive: "#4E5838", // verde-oliva · apoio
        copper: "#B8683A", // cobre · detalhe
        gold: "#C8A15A",
        ink: {
          primary: "#EFEAE0", // off-white · texto
          secondary: "#C9C4B9",
          muted: "#A9A69E"
        },
        ok: "#4E5838",
        warn: "#C8A15A",
        bad: "#C0392B" // vermelho · só radar/erro
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      maxWidth: {
        shell: "1200px"
      }
    }
  },
  plugins: []
};

export default config;
