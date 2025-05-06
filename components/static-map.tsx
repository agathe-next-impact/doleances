interface StaticMapProps {
  address?: string
  latitude?: number
  longitude?: number
  zoom?: number
  height?: string
  width?: string
  apiKey?: string
}

export default function StaticMap({
  address,
  latitude,
  longitude,
  zoom = 15,
  height = "400px",
  width = "100%",
  apiKey = "",
}: StaticMapProps) {
  // Déterminer les paramètres de la carte
  let mapSrc = ""

  // Si nous avons des coordonnées, les utiliser en priorité
  if (latitude && longitude) {
    // Utiliser les coordonnées directement
    if (apiKey) {
      mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=${zoom}`
    } else {
      mapSrc = `https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`
    }
  }
  // Sinon, si nous avons une adresse, l'utiliser
  else if (address) {
    if (apiKey) {
      mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}&zoom=${zoom}`
    } else {
      mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=${zoom}&output=embed`
    }
  }

  // Si nous n'avons pas pu créer une URL de carte valide
  if (!mapSrc) {
    return (
      <div
        className="bg-muted/50 rounded-md flex items-center justify-center text-muted-foreground p-4"
        style={{ height, width }}
      >
        <p>Aucune donnée de localisation disponible</p>
      </div>
    )
  }

  return (
    <div className="relative rounded-md overflow-hidden" style={{ height, width }}>
      <iframe
        src={mapSrc}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Google Maps"
        className="absolute inset-0"
      ></iframe>
    </div>
  )
}
