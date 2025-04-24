"use client"

import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import Link from "next/link"
import { Suspense, useEffect } from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { FileText, Info, Library, Pen, Map, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SearchAutocomplete } from "@/components/search-autocomplete"
import LottieAnimation from "@/components/ui/lottie-animation"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Configuration pour Leaflet
  useEffect(() => {
    // Ajouter une classe au body pour éviter les conflits de z-index avec Leaflet
    document.body.classList.add("has-leaflet-map")

    // Écouter l'événement de fermeture du menu
    const handleCloseSheet = () => {
      const sheetTriggers = document.querySelectorAll('[data-state="open"]')
      sheetTriggers.forEach((trigger) => {
        const closeButton = trigger.querySelector('button[aria-label="Close"]')
        if (closeButton) {
          ;(closeButton as HTMLButtonElement).click()
        }
      })
    }

    window.addEventListener("close-sheet", handleCloseSheet)

    return () => {
      document.body.classList.remove("has-leaflet-map")
      window.removeEventListener("close-sheet", handleCloseSheet)
    }
  }, [])

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Ajouter les styles pour Leaflet */}
        <style>{`
          .leaflet-container {
            z-index: 1;
          }
          .custom-div-icon {
            background: transparent;
            border: none;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-10 border-b bg-background">
              <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-4">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="mr-2">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                      <SheetHeader>
                        <LottieAnimation animationPath="/animations/earth.json" width="80px" height="80px" loop="false"/>
                        <SheetTitle className="text-left font-light text-2xl">Les doléances</SheetTitle>
                      </SheetHeader>
                      <nav className="mt-6">
                        <ul className="space-y-4">
                          <li>
                            <Link
                              href="/articles"
                              className="flex items-center text-sm font-medium hover:text-primary"
                              onClick={(e) => {
                                // Close the sheet when a link is clicked
                                const closeEvent = new CustomEvent("close-sheet")
                                window.dispatchEvent(closeEvent)
                              }}
                            >
                              <Library className="mr-2 h-4 w-4" />
                              Archives des doléances
                            </Link>
                          </li>

                          <li>
                            <Link
                              href="/cartographie"
                              className="flex items-center text-sm font-medium hover:text-primary"
                              onClick={(e) => {
                                // Close the sheet when a link is clicked
                                const closeEvent = new CustomEvent("close-sheet")
                                window.dispatchEvent(closeEvent)
                              }}
                            >
                              <Map className="mr-2 h-4 w-4" />
                              Cartographie des groupes locaux
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/contribuer"
                              className="flex items-center text-sm font-medium hover:text-primary"
                              onClick={(e) => {
                                // Close the sheet when a link is clicked
                                const closeEvent = new CustomEvent("close-sheet")
                                window.dispatchEvent(closeEvent)
                              }}
                            >
                              <Pen className="mr-2 h-4 w-4" />
                              Contribuer
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/pages/a-propos"
                              className="flex items-center text-sm font-medium hover:text-primary"
                              onClick={(e) => {
                                // Close the sheet when a link is clicked
                                const closeEvent = new CustomEvent("close-sheet")
                                window.dispatchEvent(closeEvent)
                              }}
                            >
                              <Info className="mr-2 h-4 w-4" />
                              A propos
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/categories"
                              className="flex items-center text-sm font-medium hover:text-primary"
                              onClick={(e) => {
                                // Close the sheet when a link is clicked
                                const closeEvent = new CustomEvent("close-sheet")
                                window.dispatchEvent(closeEvent)
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Actualités
                            </Link>
                          </li>
                        </ul>
                      </nav>
                    </SheetContent>
                  </Sheet>
                  <Link href="/" className="flex items-center gap-2 text-2xl font-serif font-ligth">
                  <LottieAnimation animationPath="/animations/earth.json" width="40px" height="40px" loop="false" />
                    Les doléances
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative hidden md:block">
                    <SearchAutocomplete placeholder="Rechercher des articles..." className="w-64" showButton={false} />
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="https://palegreen-capybara-652133.hostingersite.com/wp-admin" target="_blank">
                      Contributeur
                    </Link>
                  </Button>
                </div>
              </div>
            </header>
            <Suspense>
              <main className="flex-1">{children}</main>
            </Suspense>
            <footer className="border-t py-6">
              <div className="container mx-auto px-4">
                <div className="grid gap-8 md:grid-cols-3">
                  <div>
                    <h3 className="mb-3 text-lg font-light">Les doléances</h3>
                    <p className="text-sm text-muted-foreground">
                      Archives des doléances de la convention citoyenne. 
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Liens</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <Link href="/articles" className="text-muted-foreground hover:underline">
                          Actualités
                        </Link>
                      </li>
                      <li>
                        <Link href="/categories" className="text-muted-foreground hover:underline">
                          Doléances
                        </Link>
                      </li>
                      <li>
                        <Link href="/pages/a-propos" className="text-muted-foreground hover:underline">
                          A propos
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">RGPD</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <Link href="/privacy" className="text-muted-foreground hover:underline">
                          Politique de confidentialité
                        </Link>
                      </li>
                      <li>
                        <Link href="/terms" className="text-muted-foreground hover:underline">
                          Mentions légales
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Les doléances
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
