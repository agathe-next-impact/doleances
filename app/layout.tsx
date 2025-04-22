import type React from "react"
import ClientLayout from "./ClientLayout"

const metadata = {
  title: "Les doléances",
  description: "Archives des doléances de la convention citoyenne.",
}

export { metadata }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'