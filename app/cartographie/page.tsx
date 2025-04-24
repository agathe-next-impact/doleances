
import type { Metadata } from "next"
import { fetchGroupesLocaux } from "@/lib/wordpress"
import MapComponent from "@/components/map-component"


export const metadata: Metadata = {
  title: "Cartographie - WikiPress",
  description: "Explorez notre réseau de bureaux, agences et partenaires à travers la France",
}


export default async function CartographiePage() {
  // Récupérer les données des groupes locaux depuis WordPress
  {/*const groupesLocaux = await fetchGroupesLocaux()

  // Convertir les données au format attendu par le composant FranceMap
  const locations = convertToLocations(groupesLocaux)*/}

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Cartographie</h1>
        <p className="text-lg text-muted-foreground">
          Explorez notre réseau de bureaux, agences et partenaires à travers la France. Cliquez sur les marqueurs pour
          plus d'informations.
        </p>
        <MapComponent />
      </div>
    </div>
  )
}
  


