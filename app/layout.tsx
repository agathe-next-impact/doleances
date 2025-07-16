import { Metadata } from "next";
import type React from "react";
import ClientLayout from "./ClientLayout";
import "./globals.css";

const metadata = {
  title: {
    default: "Les Doléances",
    template: "Les Doléances",
  },
  description: "Wiki du corpus des doléances de 2018/2019",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://lesdoleances.fr",
    siteName: "Les Doléances",
  },
};

export async function generateMetadata({ params }) {
  const slug = params?.slug;
  return {
    ...metadata,
    title: slug ? `Les Doléances` : metadata.title.default,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientLayout>{children}</ClientLayout>;
}
