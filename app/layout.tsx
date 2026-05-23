import type { Metadata } from "next";
import type React from "react";
import ClientLayout from "./ClientLayout";
import "./globals.css";
import { SITE_NAME, DEFAULT_DESCRIPTION, SITE_URL, DEFAULT_IMAGE, DEFAULT_LOCALE } from "@/lib/metadata";
import JsonLd from "@/components/json-ld";
import { buildOrganizationJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: DEFAULT_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: DEFAULT_IMAGE, alt: SITE_NAME, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.GA_ID;
  const clarityId = process.env.CLARITY_ID;

  return (
    <>
      <JsonLd data={buildOrganizationJsonLd()} />
      <ClientLayout gaId={gaId} clarityId={clarityId}>{children}</ClientLayout>
    </>
  );
}
