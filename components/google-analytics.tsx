'use client';
import Script from "next/script";
import { useEffect, useState } from "react";

export default function Analytics() {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userConsent="));
    if (value?.includes("true")) {
      setConsent(true);
    }
  }, []);

  if (!consent) return null;

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-H8K3E2XW8R"
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-H8K3E2XW8R');
        `}
      </Script>
    </>
  );
}


