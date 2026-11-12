import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Barlow, IBM_Plex_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chatbot/ChatWidget";
import CookieBanner from "@/components/cookie/CookieBanner";
import Analytics from "@/components/seo/Analytics";
import ScrollProgress from "@/components/motion/ScrollProgress";
import { IntroProvider } from "@/components/motion/IntroContext";
import IntroOverlay from "@/components/motion/IntroOverlay";
import { siteConfig } from "@/lib/config";
import "@/styles/globals.css";

const display = Bebas_Neue({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-display",
  display: "swap"
});

const body = Barlow({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Advocac — De atirador para atirador",
    template: "%s | Advocac"
  },
  description:
    "Assessoria jurídica e documental para CACs. CRAF, registros e processos na Polícia Federal.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Advocac",
    url: siteConfig.url
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    }),
    ...(process.env.NEXT_PUBLIC_BING_VERIFICATION && {
      other: {
        "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION
      }
    })
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#17191C"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <IntroProvider>
          <a
            href="#conteudo"
            className="skip-link"
          >
            Pular para o conteúdo
          </a>
          <IntroOverlay />
          <ScrollProgress />
          <Header />
          <div id="conteudo" className="flex-1">
            {children}
          </div>
          <Footer />
          <Analytics />
          <ChatWidget />
          <CookieBanner />
        </IntroProvider>
      </body>
    </html>
  );
}