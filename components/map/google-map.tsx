"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import { Skeleton } from "@/components/ui/skeleton"


interface GoogleMapProps {
  address?: string
  latitude?: number
  longitude?: number
  zoom?: number
  height?: string
  width?: string
  apiKey?: string
}

export default function GoogleMap({
  address,
  latitude,
  longitude,
  zoom = 15,
  height = "400px",
  width = "100%",
  apiKey = "",
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Utiliser la clé API fournie ou celle de l'environnement
  const effectiveApiKey = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEYS || process.env.GOOGLE_MAPS_API_KEY

  useEffect(() => {
    let isMounted = true

    // Fonction pour charger et initialiser la carte
    const initMap = async () => {
      try {
        if (!effectiveApiKey) {
          if (isMounted) {
            setError(
              "Aucune clé API Google Maps fournie. Veuillez configurer une clé API dans les paramètres de l'application.",
            )
            setLoading(false)
          }
          return
        }

        if (!address && (typeof latitude !== "number" || typeof longitude !== "number")) {
          if (isMounted) {
            setError("Aucune coordonnée ou adresse fournie")
            setLoading(false)
          }
          return
        }

        setLoading(true)
        setError(null)

        // Charger l'API Google Maps
        const loader = new Loader({
          apiKey: effectiveApiKey,
          version: "weekly",
        })

        const googleObj = await loader.load()

        // Si nous avons des coordonnées, utiliser directement
        if (typeof latitude === "number" && typeof longitude === "number") {
          const { Map, Marker } = (await googleObj.maps.importLibrary("maps")) as typeof google.maps
          const position = { lat: latitude, lng: longitude }
          if (mapRef.current) {
            mapInstance.current = new Map(mapRef.current, {
              center: position,
              zoom: zoom,
              mapId: "DEMO_MAP_ID",
            })
            new Marker({
              position,
              map: mapInstance.current,
              title: address || "Emplacement",
            })
          }
          if (isMounted) setLoading(false)
        }
        // Sinon, si nous avons une adresse, géocoder
        else if (address) {
          const { Map, Marker } = (await googleObj.maps.importLibrary("maps")) as typeof google.maps
          const geocoder = new googleObj.maps.Geocoder()
          geocoder.geocode({ address }, (results, status) => {
            if (!isMounted) return
            try {
              if (status === googleObj.maps.GeocoderStatus.OK && results && results[0]) {
                const position = results[0].geometry.location
                if (mapRef.current) {
                  mapInstance.current = new Map(mapRef.current, {
                    center: position,
                    zoom: zoom,
                    mapId: "DEMO_MAP_ID",
                  })
                  new Marker({
                    position,
                    map: mapInstance.current,
                    title: address,
                  })
                }
                setLoading(false)
              } else {
                const statusString = typeof status === "string" ? status : "UNKNOWN_ERROR"
                setError(`Impossible de localiser l'adresse: ${statusString}`)
                setLoading(false)
              }
            } catch (geocodeError) {
              console.error("Erreur lors du géocodage:", geocodeError)
              setError("Erreur lors de la localisation de l'adresse")
              setLoading(false)
            }
          })
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur inconnue"
        console.error("Erreur lors du chargement de la carte:", errorMessage)
        if (isMounted) {
          setError(`Impossible de charger la carte Google Maps: ${errorMessage}`)
          setLoading(false)
        }
      }
    }

    if (mapRef.current) {
      initMap()
    }

    return () => {
      isMounted = false
      // Nettoyage de la carte pour éviter les fuites mémoire
      if (mapInstance.current) {
        // Google Maps ne fournit pas de méthode officielle pour détruire une carte,
        // mais on peut vider le conteneur pour libérer la mémoire.
        if (mapRef.current) {
          mapRef.current.innerHTML = ""
        }
        mapInstance.current = null
      }
    }
  }, [address, latitude, longitude, zoom, effectiveApiKey])

  // Afficher un message d'information si aucune clé API n'est fournie
  if (!effectiveApiKey) {
    return (
      <div
        className="bg-muted/50 rounded-md flex items-center justify-center text-muted-foreground p-4 text-center"
        style={{ height, width }}
      >
        <div>
          <p className="mb-2">Configuration de la carte Google Maps requise</p>
          <p className="text-sm">
            Pour afficher la carte, vous devez obtenir une clé API Google Maps et la configurer dans l'application.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="bg-muted/50 rounded-md flex items-center justify-center text-muted-foreground p-4"
        style={{ height, width }}
      >
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="relative rounded-md overflow-hidden" style={{ height, width }}>
      {loading && <Skeleton className="absolute inset-0" />}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  )
}
