"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getStoredConsent } from "@/components/cookie/CookieBanner";

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

/**
 * GA4/GTM só carregam se a env existir E o consentimento de analytics for true.
 * Escuta `cookie-consent` para reagir a mudanças de preferência.
 */
export default function Analytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (!GA_ID && !GTM_ID) return;

    const apply = () => {
      const allowed = getStoredConsent()?.analytics === true;
      setConsented(allowed);
      if (allowed && GA_ID) {
        gtag("js", new Date());
        gtag("config", GA_ID, { anonymize_ip: true, send_page_view: true });
      }
      if (!allowed) {
        // revogação: derruba os scripts já injetados e sinaliza a dataLayer
        document.getElementById("ga4")?.remove();
        document.getElementById("gtm")?.remove();
        document
          .querySelector('script[src*="gtag/js"]')
          ?.remove();
        document
          .querySelector('script[src*="googletagmanager.com/gtm.js"]')
          ?.remove();
        gtag("consent", "default", { analytics_storage: "denied" });
      }
    };

    apply();
    window.addEventListener("cookie-consent", apply);
    return () => window.removeEventListener("cookie-consent", apply);
  }, []);

  if (!GA_ID && !GTM_ID) return null;
  if (!consented) return null;

  return (
    <>
      {GA_ID && (
        <Script
          id="ga4"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
      )}
      {GTM_ID && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      )}
      <noscript>
        {GTM_ID && (
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        )}
      </noscript>
    </>
  );
}
