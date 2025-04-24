"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { GoogleMap, LoadScript, Marker, MarkerClusterer } from "@react-google-maps/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LocationSidebar from "./location-sidebar"
import { locationsData } from "@/lib/locations-data"

// Types
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

interface Region {
  id: string
  name: string
  center: { lat: number; lng: number }
  zoom: number
  locations: Location[]
}

// Styles
const containerStyle = {
  width: "100%",
  height: "calc(100vh - 80px)",
}

export default function MapComponent() {
    
  const [regions] = useState<Region[]>(locationsData)
    // Initialiser selectedRegion avec la première région
    const [selectedRegion, setSelectedRegion] = useState<string | null>(
        regions.length > 0 ? regions[0].id : null
      );
    // Initialiser selectedLocation avec le premier emplacement de la première région
      const [selectedLocation, setSelectedLocation] = useState<Location | null>(
        regions.length > 0 && regions[0].locations.length > 0 ? regions[0].locations[0] : null
      );
  const mapRef = useRef<google.maps.Map | null>(null)

  // Set default region on first load
  useEffect(() => {
    if (regions.length > 0 && !selectedRegion) {
      setSelectedRegion(regions[0].id)
    }
  }, [regions, selectedRegion])

  // Handle region change
  const handleRegionChange = useCallback(
    (regionId: string) => {
      setSelectedRegion(regionId)
      setSelectedLocation(null)

      const region = regions.find((r) => r.id === regionId)
      if (region && mapRef.current) {
        mapRef.current.panTo(region.center)
        mapRef.current.setZoom(region.zoom)
      }
    },
    [regions],
  )

  // Handle marker click
  const handleMarkerClick = useCallback((location: Location) => {
    setSelectedLocation(location)
  }, [])

  // Handle map load
  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map

      // Set initial view if a region is selected
      if (selectedRegion) {
        const region = regions.find((r) => r.id === selectedRegion)
        if (region) {
          map.panTo(region.center)
          map.setZoom(region.zoom)
        }
      }
    },
    [regions, selectedRegion],
  )

  // Get current region
  const currentRegion = regions.find((r) => r.id === selectedRegion)
  const locations = currentRegion ? currentRegion.locations : []

    // Declare google variable
    const google = useRef<typeof window.google | undefined>(undefined);

    useEffect(() => {
        google.current = window.google;
    }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-white shadow-md">
        <Select value={selectedRegion || ""} onValueChange={handleRegionChange}>
          <SelectTrigger className="w-full md:w-[300px]">
            <SelectValue placeholder="Sélectionnez une région" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col md:flex-row flex-1 h-full">
        <div className="w-full md:w-2/3 h-[500px] md:h-auto">
          <LoadScript googleMapsApiKey="AIzaSyA1lJXqXBc0-w5WUVO1KhvggK05FCbi7Yg">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={currentRegion?.center || { lat: 46.603354, lng: 1.888334 }} // France center
              zoom={currentRegion?.zoom || 5}
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
                        animation={google.current?.maps?.Animation.DROP}
                      />
                    ))}
                  </>
                )}
              </MarkerClusterer>
            </GoogleMap>
          </LoadScript>
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
