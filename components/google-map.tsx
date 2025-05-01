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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [google, setGoogle] = useState<any>(null)

  useEffect(() => {
    // Fonction pour charger et initialiser la carte
    const initMap = async () => {
      try {
        // Vérifier si une clé API est disponible
        if (!apiKey) {
          setError(
            "Aucune clé API Google Maps fournie. Veuillez configurer une clé API dans les paramètres de l'application.",
          )
          setLoading(false)
          return
        }

        setLoading(true)
        setError(null)

        // Vérifier si nous avons des données de localisation
        if (!address && (!latitude || !longitude)) {
          setError("Aucune coordonnée ou adresse fournie")
          setLoading(false)
          return
        }

        // Charger l'API Google Maps
        const loader = new Loader({
          apiKey,
          version: "weekly",
        })

        // Charger l'API Google Maps
        try {
          const googleObj = await loader.load()
          setGoogle(googleObj)
        } catch (loadError) {
          console.error("Erreur lors du chargement de l'API Google Maps:", loadError)
          setError(
            "Impossible de charger l'API Google Maps. Veuillez vérifier votre connexion internet et votre clé API.",
          )
          setLoading(false)
          return
        }

        // Si nous avons des coordonnées, utiliser directement
        if (latitude && longitude) {
          try {
            const { Map, Marker } = (await google.maps.importLibrary("maps")) as any

            const position = { lat: latitude, lng: longitude }
            const map = new Map(mapRef.current!, {
              center: position,
              zoom: zoom,
              mapId: "DEMO_MAP_ID",
            })

            new Marker({
              position,
              map,
              title: address || "Emplacement",
            })

            setLoading(false)
          } catch (mapError) {
            console.error("Erreur lors de la création de la carte:", mapError)
            setError("Impossible de créer la carte Google Maps")
            setLoading(false)
          }
        }
        // Sinon, si nous avons une adresse, géocoder
        else if (address) {
          try {
            const { Map, Marker } = (await google.maps.importLibrary("maps")) as any
            const geocoder = new google.maps.Geocoder()

            geocoder.geocode({ address }, (results, status) => {
              try {
                if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                  const position = results[0].geometry.location
                  const map = new Map(mapRef.current!, {
                    center: position,
                    zoom: zoom,
                    mapId: "DEMO_MAP_ID",
                  })

                  new Marker({
                    position,
                    map,
                    title: address,
                  })

                  setLoading(false)
                } else {
                  // Convertir le statut en chaîne de caractères de manière sécurisée
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
          } catch (geocoderError) {
            console.error("Erreur lors de l'initialisation du géocodeur:", geocoderError)
            setError("Impossible d'initialiser le service de géocodage")
            setLoading(false)
          }
        }
      } catch (err) {
        // Convertir l'erreur en chaîne de caractères de manière sécurisée
        const errorMessage = err instanceof Error ? err.message : "Erreur inconnue"
        console.error("Erreur lors du chargement de la carte:", errorMessage)
        setError(`Impossible de charger la carte Google Maps: ${errorMessage}`)
        setLoading(false)
      }
    }

    if (mapRef.current) {
      initMap()
    }

    return () => {
      // Nettoyage si nécessaire
    }
  }, [address, latitude, longitude, zoom, apiKey])

  // Afficher un message d'information si aucune clé API n'est fournie
  if (!apiKey) {
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
