"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet"
import L from "leaflet"
import { type Location, getLocationColor } from "@/lib/locations"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Globe, MapPin } from "lucide-react"
import Image from "next/image"

// Styles nécessaires pour Leaflet
import "leaflet/dist/leaflet.css"

// Correction pour les icônes Leaflet dans Next.js
const fixLeafletIcons = () => {
  // Seulement exécuter côté client
  if (typeof window !== "undefined") {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })
  }
}

interface FranceMapProps {
  locations: Location[]
  height?: string
  className?: string
}

export function FranceMap({ locations, height = "600px", className = "" }: FranceMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef<L.Map | null>(null)

  // Fixer les icônes Leaflet au chargement
  useEffect(() => {
    fixLeafletIcons()
    setMapReady(true)
  }, [])

  // Créer des icônes personnalisées pour chaque type de localisation
  const createCustomIcon = (type: Location["type"]) => {
    return new L.DivIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: ${getLocationColor(
        type,
      )}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }

  // Centrer la carte sur une localisation
  const centerMapOnLocation = (location: Location) => {
    if (mapRef.current) {
      mapRef.current.setView(location.coordinates, 10)
      setSelectedLocation(location)
    }
  }

  // Centre de la France pour la vue initiale
  const franceCenterPosition: [number, number] = [46.603354, 1.8883335]

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Carte des localisations</CardTitle>
            <CardDescription>Explorez nos bureaux, agences et partenaires en France</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {mapReady && (
              <div style={{ height, width: "100%" }}>
                <MapContainer
                  center={franceCenterPosition}
                  zoom={6}
                  style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
                  zoomControl={false}
                  whenReady={() => {
                    if (mapRef.current) {
                      mapRef.current.invalidateSize();
                    }
                  }}
                  onReady={(map) => {
                    mapRef.current = map.target;
                  }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ZoomControl position="bottomright" />
                  {locations.map((location) => (
                    <Marker
                      key={location.id}
                      position={location.coordinates}
                      icon={createCustomIcon(location.type)} 
                      eventHandlers={{
                        click: () => {
                          setSelectedLocation(location)
                        },
                      }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <h3 className="font-bold">{location.name}</h3>
                          <p>{location.description}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2">
            <div className="flex flex-wrap gap-3">
              {[
                { type: "bureau", label: "Bureaux", color: "#3b82f6" },
                { type: "agence", label: "Agences", color: "#10b981" },
                { type: "partenaire", label: "Partenaires", color: "#f59e0b" },
                { type: "projet", label: "Projets", color: "#8b5cf6" },
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-1">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  ></div>
                  <span className="text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localisations</CardTitle>
            <CardDescription>Sélectionnez une localisation pour plus de détails</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            <div className="space-y-2">
              {locations.map((location) => (
                <Button
                  key={location.id}
                  variant={selectedLocation?.id === location.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => centerMapOnLocation(location)}
                >
                  <div
                    className="mr-2 h-3 w-3 rounded-full"
                    style={{ backgroundColor: getLocationColor(location.type) }}
                    aria-hidden="true"
                  ></div>
                  {location.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedLocation && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedLocation.name}</CardTitle>
            <CardDescription>{selectedLocation.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                {selectedLocation.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <span>{selectedLocation.address}</span>
                  </div>
                )}
                {selectedLocation.contact?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedLocation.contact.phone}</span>
                  </div>
                )}
                {selectedLocation.contact?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedLocation.contact.email}</span>
                  </div>
                )}
                {selectedLocation.contact?.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={selectedLocation.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Site web
                    </a>
                  </div>
                )}
              </div>
              {selectedLocation.image && (
                <div className="relative h-40 w-full overflow-hidden rounded-md">
                  <Image
                    src={selectedLocation.image || "/placeholder.svg"}
                    alt={`Image de ${selectedLocation.name}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
