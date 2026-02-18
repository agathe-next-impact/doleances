'use client';

import Script from "next/script";
import { useEffect, useState } from "react";

export default function MicrosoftClarity({ clarityId }: { clarityId?: string }) {
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

  if (!consent || !clarityId) return null;

  return (
    <Script id="clarity-init" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window,document,"clarity","script","${clarityId}");
      `}
    </Script>
  );
}
