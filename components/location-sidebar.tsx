"use client"

import { Phone, Mail, Globe, MapPin, X, Building, Home, Users, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

interface Location {
  id: string
  title: string
  position: { lat: number; lng: number }
  address: string
  content?: string
  phone?: string
  email?: string
  website?: string
  region: string
  thumbnail?: string
}

interface LocationSidebarProps {
  location: Location | null
  locations: Location[]
  onClose: () => void
  onLocationSelect: (location: Location) => void
}

// Fonction pour obtenir l'icône en fonction de la région
const getRegionIcon = (region: string) => {
  switch (region) {
    case "ileDeFrance":
      return <Building className="h-4 w-4" />
    case "oise":
      return <Home className="h-4 w-4" />
    case "auvergne":
      return <Users className="h-4 w-4" />
    default:
      return <MapPin className="h-4 w-4" />
  }
}

// Fonction pour obtenir le label du région
const getRegionLabel = (region: string) => {
  const labels: Record<string, string> = {
    ileDeFrance: "Ile de France",
    oise: "Oise",
    auvergne: "Auvergne",
  }
  return labels[region] || region
}

export default function LocationSidebar({ location, locations, onClose, onLocationSelect }: LocationSidebarProps) {
  const [imageError, setImageError] = useState<Record<string, boolean>>({})

  // Fonction pour gérer les erreurs de chargement d'image
  const handleImageError = (locationId: string) => {
    setImageError((prev) => ({ ...prev, [locationId]: true }))
  }

  // Fonction pour nettoyer le HTML
  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent }
  }

  return (
    <div className="w-full md:w-1/3 bg-white border-l border-gray-200">
      {location ? (
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{location.title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Button>
          </div>

          {location.thumbnail && !imageError[location.id] && (
            <div className="mb-4 relative h-48 rounded-lg overflow-hidden">
              {/* Utiliser une image standard au lieu de Next.js Image pour éviter les problèmes CORS */}
              <img
                src={location.thumbnail || "/placeholder.svg"}
                alt={location.title}
                className="w-full h-full object-cover"
                onError={() => handleImageError(location.id)}
              />
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {getRegionIcon(location.region)}
              <span className="ml-1">{getRegionLabel(location.region)}</span>
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {location.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <p>{location.address}</p>
              </div>
            )}

            {location.content && (
              <div className="border-t border-gray-200 pt-4">
                <div
                  className="text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={createMarkup(location.content)}
                />
              </div>
            )}

            {location.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-500" />
                <a href={`tel:${location.phone}`} className="text-primary hover:underline">
                  {location.phone}
                </a>
              </div>
            )}

            {location.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-500" />
                <a href={`mailto:${location.email}`} className="text-primary hover:underline">
                  {location.email}
                </a>
              </div>
            )}

            {location.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-500" />
                <a
                  href={location.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Visiter le site web
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 h-full">
          <h2 className="text-xl font-bold mb-4">Localisations</h2>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-2">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                  onClick={() => onLocationSelect(loc)}
                >
                  <div className="flex items-center gap-2">
                    {getRegionIcon(loc.region)}
                    <h3 className="font-medium">{loc.title}</h3>
                  </div>
                  {loc.address && <p className="text-sm text-gray-500 truncate mt-1">{loc.address}</p>}
                </div>
              ))}

              {locations.length === 0 && (
                <p className="text-gray-500 italic">Aucune localisation dans cette catégorie</p>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
