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
    <>
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-0 left-0 h-[500px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[500px] right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
    <div className="container mx-auto md:p-8 p-4">
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
    </>
  )
}
  


