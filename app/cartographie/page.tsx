
import type { Metadata } from "next"
import MapComponent from "@/components/map/map-component"


export const metadata: Metadata = {
  title: "Cartographie - WikiPress",
  description: "Explorez notre réseau de bureaux, agences et partenaires à travers la France",
}


export default async function CartographiePage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl text-center md:text-4xl">Cartographie des groupes locaux</h1>
        <p className="text-lg text-muted-foreground text-center">
          Explorez nos groupes locaux à travers la France et contactez les membres de votre région.
        </p>
        <MapComponent />
      </div>
    </div>
  )
}
  


