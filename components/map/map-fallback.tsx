import Image from "next/image"
import { MapPin } from "lucide-react"

interface MapFallbackProps {
  address?: string
  height?: string
  width?: string
}

export default function MapFallback({ address, height = "300px", width = "100%" }: MapFallbackProps) {
  // Créer une URL d'image de carte statique basée sur l'adresse
  // Utiliser un placeholder si aucune adresse n'est fournie
  const mapImageUrl = address
    ? `/placeholder.svg?height=600&width=800&query=map of ${encodeURIComponent(address)}`
    : "/placeholder.svg?key=9uwiz"

  return (
    <div className="relative rounded-md overflow-hidden" style={{ height, width }}>
      <Image
        src={mapImageUrl || "/placeholder.svg"}
        alt={`Carte de ${address || "l'emplacement"}`}
        fill
        className="object-cover"
      />

      {address && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background/80 rounded-full p-3 shadow-lg">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
        </div>
      )}

      {address && (
        <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-2 text-center text-sm">{address}</div>
      )}
    </div>
  )
}
