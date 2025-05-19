import { fetchPageBySlug } from "@/lib/api"
import type { Metadata } from "next"
import MapComponent from "@/components/map/map-component"


export const metadata: Metadata = {
  title: "Cartographie - WikiPress",
  description: "Explorez notre réseau de bureaux, agences et partenaires à travers la France",
}


export default async function CartographiePage() {

  const page = await fetchPageBySlug("cartographie")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl text-center md:text-4xl">Cartographie des groupes locaux</h1>
        <div className="md:w-[60%] w-[90%] mx-auto mb-6">
          <p className="md:text-lg text-sm text-muted-foreground text-center">
          {page && page.acf?.texte_dintro ? (
            page.acf?.texte_dintro
          ) : "Tous les groupes locaux de la France à rencontrer"}
          </p>
        </div>
        <MapComponent />
      </div>
    </div>
  )
}
  


