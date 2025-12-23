"use client"

import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import Link from "next/link"
import { Suspense, useEffect } from "react"
import { resetCookieConsent } from "@/lib/cookies";

import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { FileText, Info, Library, Pen, Map, Menu, User } from "lucide-react"
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
    <html lang="fr" suppressHydrationWarning className="scroll-smooth">
      <head>
      <meta charSet="UTF-8" />
      <link rel="icon" href="/img/logo.svg" />
      <meta name="facebook-domain-verification" content="qthq59j7j8zxog6h5343r15d964vjl" />
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
      <body className={`${inter.className} overflow-x-hidden`}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md transition-colors duration-">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center md:justify-normal justify-start gap-4">
            <Sheet>
            <SheetTrigger asChild className="w-max md:ml-8 ml-0">
              <Button size="icon" className="mr-2" variant="link">
              <Menu className="h-5 w-5"/>
              <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] w-[100%] left-sheet">
              <SheetHeader>
              <Link href="/"
                onClick={(e) => {
                  e.preventDefault(); // Empêche la navigation immédiate
                  const closeEvent = new CustomEvent("close-sheet");
                  window.dispatchEvent(closeEvent);
                
                  // Attendre un court instant pour que le Sheet se ferme avant de naviguer
                  setTimeout(() => {
                    window.location.href = "/"; // Naviguer manuellement
                  }, 300); // Ajustez le délai si nécessaire
                  }}>
              <LottieAnimation animationPath="/animations/note.json" width="80px" height="80px"/>
              <SheetTitle className="text-left font-light text-2xl">Les doléances</SheetTitle>
              </Link>
              </SheetHeader>
              <nav className="mt-6">
              <ul className="space-y-4 left-sheet">
                <li>
                <Link
                  href="/cartographie"
                  className="flex items-center text-sm font-medium hover:text-primary"
                  onClick={(e) => {
                  e.preventDefault(); // Empêche la navigation immédiate
                  const closeEvent = new CustomEvent("close-sheet");
                  window.dispatchEvent(closeEvent);
                
                  // Attendre un court instant pour que le Sheet se ferme avant de naviguer
                  setTimeout(() => {
                    window.location.href = "/cartographie"; // Naviguer manuellement
                  }, 300); // Ajustez le délai si nécessaire
                  }}
                >
                  <Map className="mr-2 h-4 w-4" />
                  Cartographie des groupes locaux
                </Link>
                </li>
                <li>
                <Link
                  href="/etats-generaux-communaux"
                  className="flex items-center text-sm font-medium hover:text-primary"
                  onClick={(e) => {
                  e.preventDefault(); // Empêche la navigation immédiate
                  const closeEvent = new CustomEvent("close-sheet");
                  window.dispatchEvent(closeEvent);
                
                  // Attendre un court instant pour que le Sheet se ferme avant de naviguer
                  setTimeout(() => {
                    window.location.href = "/etats-generaux-communaux"; // Naviguer manuellement
                  }, 300); // Ajustez le délai si nécessaire
                  }}
                >
                  <Library className="mr-2 h-4 w-4" />
                  Etats généraux communaux
                </Link>
                </li>
                <li>
                <Link
                  href="/festival"
                  className="flex items-center text-sm font-medium hover:text-primary"
                  onClick={(e) => {
                  e.preventDefault(); // Empêche la navigation immédiate
                  const closeEvent = new CustomEvent("close-sheet");
                  window.dispatchEvent(closeEvent);
                
                  // Attendre un court instant pour que le Sheet se ferme avant de naviguer
                  setTimeout(() => {
                    window.location.href = "/festival"; // Naviguer manuellement
                  }, 300); // Ajustez le délai si nécessaire
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Festival
                </Link>
                </li>
                <li>
                <Link
                  href="/pages/a-propos"
                  className="flex items-center text-sm font-medium hover:text-primary"
                  onClick={(e) => {
                  e.preventDefault(); // Empêche la navigation immédiate
                  const closeEvent = new CustomEvent("close-sheet");
                  window.dispatchEvent(closeEvent);
                
                  // Attendre un court instant pour que le Sheet se ferme avant de naviguer
                  setTimeout(() => {
                    window.location.href = "/a-propos"; // Naviguer manuellement
                  }, 300); // Ajustez le délai si nécessaire
                  }}
                >
                  <Info className="mr-2 h-4 w-4" />
                  A propos
                </Link>
                </li>

                <li>
                <Link
                  href="/contribuer"
                  className="flex items-center text-sm font-medium hover:text-primary"
                  onClick={(e) => {
                  e.preventDefault(); // Empêche la navigation immédiate
                  const closeEvent = new CustomEvent("close-sheet");
                  window.dispatchEvent(closeEvent);
                
                  // Attendre un court instant pour que le Sheet se ferme avant de naviguer
                  setTimeout(() => {
                    window.location.href = "/contribuer"; // Naviguer manuellement
                  }, 300); // Ajustez le délai si nécessaire
                  }}
                >
                  <Pen className="mr-2 h-4 w-4" />
                  Nous contacter
                </Link>
                </li>

              </ul>
              </nav>
            </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2 text-2xl font-serif font-ligth">
            <LottieAnimation animationPath="/animations/note.json" width="50px" height="50px"/>
            Les doléances
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
            <SearchAutocomplete placeholder="Rechercher dans notre actu..." className="w-64" showButton={false} />
            </div>
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
            <LottieAnimation animationPath="/animations/note.json" width="80px" height="80px"/>
            <h3 className="mb-3 text-xl font-serif font-light">Les doléances</h3>
            <p className="text-sm text-muted-foreground">
            Wiki du corpus des doléances de 2018/2019 
            </p>
            </div>
            <div>
            <h3 className="mb-3 text-lg font-semibold">Liens</h3>
            <ul className="space-y-2 text-sm">
              <li>
              <Link href="/category" className="text-muted-foreground hover:underline">
                Actualités
              </Link>
              </li>
              <li>
              <Link href="/etats-generaux-communaux" className="text-muted-foreground hover:underline">
                Etats Généraux communaux
              </Link>
              </li>
              <li>
              <Link href="/a-propos" className="text-muted-foreground hover:underline">
                A propos
              </Link>
              </li>
            </ul>
            </div>
            <div>
            <h3 className="mb-3 text-lg font-semibold">RGPD</h3>
            <ul className="space-y-2 text-sm">
              <li>
              <Link href="/rgpd/mentions-legales" className="text-muted-foreground hover:underline">
                Mentions légales
              </Link>
              </li>
              <li>
              <button
                type="button"
                className="text-muted-foreground hover:underline bg-transparent border-0 p-0"
                onClick={() => resetCookieConsent()}
              >
                Gérer les cookies
              </button>
            </li>
            </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-4 font-serif text-center">
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
