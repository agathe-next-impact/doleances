"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { GoogleMap, useJsApiLoader, Marker, MarkerClusterer } from "@react-google-maps/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LocationSidebar from "./location-sidebar"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Types
interface Location {
  id: string
  title: { rendered: string }
  acf: {
    localisation: {
      lat: string | number
      lng: string | number
      address?: string
    }
    type: string
    adresse: string
    telephone: string
    email: string
    site_web: string
  }
  content?: { rendered: string }
  featured_media?: number
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string
    }>
  }
}

interface ProcessedLocation {
  id: string
  title: string
  position: { lat: number; lng: number }
  address: string
  content?: string
  phone?: string
  email?: string
  website?: string
  type: string
  thumbnail?: string
}

interface GroupType {
  id: string
  name: string
  center: { lat: number; lng: number }
  zoom: number
  locations: ProcessedLocation[]
}

// Styles
const containerStyle = {
  width: "100%",
  height: "calc(100vh - 80px)",
}

// Mapping des types en français
const typeLabels: Record<string, string> = {
  bureau: "Bureaux",
  agence: "Agences",
  partenaire: "Partenaires",
  projet: "Projets",
}

// Coordonnées par défaut pour la France
const defaultCenter = { lat: 46.603354, lng: 1.888334 }
const defaultZoom = 5

// Clé API Google Maps
const googleMapsApiKey = "AIzaSyA1lJXqXBc0-w5WUVO1KhvggK05FCbi7Yg" // Remplacez par votre clé API

export default function MapComponent() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<ProcessedLocation | null>(null)
  const [groupTypes, setGroupTypes] = useState<GroupType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  // Utiliser useJsApiLoader au lieu de LoadScript pour une meilleure gestion des erreurs
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey,
    // Ajouter ces options pour éviter les problèmes CORS
    googleMapsClientId: undefined,
    preventGoogleFontsLoading: true,
  })

  // Récupérer les données des groupes locaux depuis l'API WordPress
  useEffect(() => {
    const fetchGroupesLocaux = async () => {
      try {
        setLoading(true)
        // Utiliser l'endpoint spécifié et inclure les médias associés
        const response = await fetch(
          "https://palegreen-capybara-652133.hostingersite.com/wp-json/wp/v2/groupe-local?_embed",
          {
            // Ajouter ces options pour éviter les problèmes CORS
            mode: "cors",
            credentials: "omit",
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data: Location[] = await response.json()

        // Vérifier si les données sont valides
        if (!Array.isArray(data)) {
          throw new Error("Format de données invalide")
        }

        // Traiter les données pour les adapter à notre structure
        const processedLocations: ProcessedLocation[] = data
          .filter((item) => {
            // Vérifier que tous les champs nécessaires existent
            return item && item.acf && item.acf.localisation && item.acf.localisation.lat && item.acf.localisation.lng
          })
          .map((item) => {
            // Convertir les coordonnées en nombres
            const lat =
              typeof item.acf.localisation.lat === "string"
                ? Number.parseFloat(item.acf.localisation.lat)
                : item.acf.localisation.lat

            const lng =
              typeof item.acf.localisation.lng === "string"
                ? Number.parseFloat(item.acf.localisation.lng)
                : item.acf.localisation.lng

            // Vérifier que les coordonnées sont valides
            if (isNaN(lat) || isNaN(lng)) {
              console.warn(`Coordonnées invalides pour ${item.id}:`, item.acf.localisation)
              // Utiliser des coordonnées par défaut
              return null
            }

            return {
              id: item.id.toString(),
              title: item.title?.rendered || "Sans titre",
              position: { lat, lng },
              address: item.acf.adresse || "",
              content: item.content?.rendered || "",
              phone: item.acf.telephone || "",
              email: item.acf.email || "",
              website: item.acf.site_web || "",
              type: item.acf.type || "autre",
              thumbnail: item._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
            }
          })
          .filter(Boolean) as ProcessedLocation[] // Filtrer les éléments null

        // Si aucune localisation valide n'a été trouvée
        if (processedLocations.length === 0) {
          setError("Aucune localisation valide trouvée dans les données.")
          setLoading(false)
          return
        }

        // Regrouper les localisations par type
        const typeGroups: Record<string, ProcessedLocation[]> = {}

        processedLocations.forEach((location) => {
          if (!typeGroups[location.type]) {
            typeGroups[location.type] = []
          }
          typeGroups[location.type].push(location)
        })

        // Créer les groupes de types
        const groups: GroupType[] = Object.entries(typeGroups).map(([type, locations]) => {
          // Calculer le centre du groupe (moyenne des coordonnées)
          const center = locations.reduce(
            (acc, loc) => {
              return {
                lat: acc.lat + loc.position.lat / locations.length,
                lng: acc.lng + loc.position.lng / locations.length,
              }
            },
            { lat: 0, lng: 0 },
          )

          return {
            id: type,
            name: typeLabels[type] || type,
            center,
            zoom: 7,
            locations,
          }
        })

        setGroupTypes(groups)

        // Sélectionner le premier type par défaut s'il existe
        if (groups.length > 0 && !selectedType) {
          setSelectedType(groups[0].id)
        }

        setLoading(false)
      } catch (err) {
        console.error("Erreur lors de la récupération des groupes locaux:", err)
        setError("Impossible de charger les données. Veuillez réessayer plus tard.")
        setLoading(false)
      }
    }

    fetchGroupesLocaux()
  }, [])

  // Handle type change
  const handleTypeChange = useCallback(
    (typeId: string) => {
      setSelectedType(typeId)
      setSelectedLocation(null)

      const group = groupTypes.find((g) => g.id === typeId)
      if (group && mapRef.current) {
        mapRef.current.panTo(group.center)
        mapRef.current.setZoom(group.zoom)
      }
    },
    [groupTypes],
  )

  // Handle marker click
  const handleMarkerClick = useCallback((location: ProcessedLocation) => {
    setSelectedLocation(location)
  }, [])

  // Handle map load
  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map

      // Set initial view if a type is selected
      if (selectedType) {
        const group = groupTypes.find((g) => g.id === selectedType)
        if (group) {
          map.panTo(group.center)
          map.setZoom(group.zoom)
        }
      }
    },
    [groupTypes, selectedType],
  )

  // Get current group
  const currentGroup = groupTypes.find((g) => g.id === selectedType)
  const locations = currentGroup ? currentGroup.locations : []

  // Afficher une erreur si le chargement de l'API Google Maps a échoué
  if (loadError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Impossible de charger Google Maps. Veuillez vérifier votre connexion internet et réessayer.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button className="mt-4 px-4 py-2 bg-primary text-white rounded-md" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  // Attendre que l'API Google Maps soit chargée
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Chargement de Google Maps...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold mb-4">Carte des Groupes Locaux</h1>
        <Select value={selectedType || ""} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full md:w-[300px]">
            <SelectValue placeholder="Sélectionnez un type" />
          </SelectTrigger>
          <SelectContent>
            {groupTypes.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name} ({group.locations.length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col md:flex-row flex-1 h-full">
        <div className="w-full md:w-2/3 h-[500px] md:h-auto">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentGroup?.center || defaultCenter}
            zoom={currentGroup?.zoom || defaultZoom}
            onLoad={onMapLoad}
            options={{
              mapTypeControl: true,
              streetViewControl: true,
              fullscreenControl: true,
            }}
          >
            <MarkerClusterer>
              {(clusterer) => (
                <>
                  {locations.map((location) => (
                    <Marker
                      key={location.id}
                      position={location.position}
                      onClick={() => handleMarkerClick(location)}
                      clusterer={clusterer}
                      // Suppression de l'animation pour éviter les erreurs
                    />
                  ))}
                </>
              )}
            </MarkerClusterer>
          </GoogleMap>
        </div>

        <LocationSidebar
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          locations={locations}
          onLocationSelect={handleMarkerClick}
        />
      </div>
    </div>
  )
}
