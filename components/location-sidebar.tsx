"use client"

import { Phone, Mail, Globe, MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Location {
  id: string
  name: string
  position: { lat: number; lng: number }
  address: string
  description: string
  phone?: string
  email?: string
  website?: string
}

interface LocationSidebarProps {
  location: Location | null
  locations: Location[]
  onClose: () => void
  onLocationSelect: (location: Location) => void
}

export default function LocationSidebar({ location, locations, onClose, onLocationSelect }: LocationSidebarProps) {
  return (
    <div className="w-full md:w-1/3 bg-white border-l border-gray-200">
      {location ? (
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{location.name}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Button>
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <p>{location.address}</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-gray-700">{location.description}</p>
            </div>

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
                  <h3 className="font-medium">{loc.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{loc.address}</p>
                </div>
              ))}

              {locations.length === 0 && <p className="text-gray-500 italic">Aucune localisation dans cette région</p>}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
