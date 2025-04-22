
import type { Metadata } from "next"
import { FranceMap } from "@/components/france-map"
import { fetchGroupesLocaux } from "@/lib/wordpress"
import { convertToLocations } from "@/lib/locations"

export const metadata: Metadata = {
  title: "Cartographie - WikiPress",
  description: "Explorez notre réseau de bureaux, agences et partenaires à travers la France",
}

export default async function CartographiePage() {
  // Récupérer les données des groupes locaux depuis WordPress
  const groupesLocaux = await fetchGroupesLocaux()

  // Convertir les données au format attendu par le composant FranceMap
  const locations = convertToLocations(groupesLocaux)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Cartographie</h1>
        <p className="text-lg text-muted-foreground">
          Explorez notre réseau de bureaux, agences et partenaires à travers la France. Cliquez sur les marqueurs pour
          plus d'informations.
        </p>
      </div>

      <FranceMap locations={locations} height="600px" />

      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-bold">Notre réseau national</h2>
        <p>
          WikiPress dispose d'un réseau étendu de bureaux, agences et partenaires à travers la France. Cette présence
          nationale nous permet de mieux servir nos utilisateurs et de collaborer efficacement avec nos partenaires
          locaux.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="mb-2 text-xl font-semibold">Bureaux régionaux</h3>
            <p className="text-muted-foreground">
              Nos bureaux régionaux coordonnent les activités locales et assurent une présence permanente dans les
              principales régions françaises.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-xl font-semibold">Agences partenaires</h3>
            <p className="text-muted-foreground">
              Nos agences partenaires étendent notre réseau et offrent des services complémentaires adaptés aux besoins
              locaux.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-xl font-semibold">Projets collaboratifs</h3>
            <p className="text-muted-foreground">
              Nous participons à de nombreux projets collaboratifs avec des institutions académiques, des collectivités
              et des entreprises locales.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
