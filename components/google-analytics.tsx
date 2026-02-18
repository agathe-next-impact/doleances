'use client';

import Script from "next/script";
import { useEffect, useState } from "react";

export default function GoogleAnalytics({ gaId }: { gaId?: string }) {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userConsent="));
    if (value?.includes("true")) {
      setConsent(true);
    }

    const handler = () => setConsent(true);
    window.addEventListener("cookie-consent-accepted", handler);
    return () => window.removeEventListener("cookie-consent-accepted", handler);
  }, []);

  if (!consent || !gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
