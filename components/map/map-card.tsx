"use client";

import { useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, MarkerClusterer } from "@react-google-maps/api";


// Types pour les props
interface StaticMapProps {
  locations: {
    id: string;
    slug: string;
    position: { lat: number; lng: number };
  }[];
  height?: string | number;
  width?: string | number;
  zoom?: number;
  center?: { lat: number; lng: number };
}

const defaultCenter = { lat: 46.603354, lng: 2.3522 };
const containerStyle = {
  width: "100%",
  height: "400px",
};



const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";

export default function CardMap({
  locations,
  height = 400,
  width = "100%",
  zoom = 5,
  center = defaultCenter,
}: StaticMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  
  console.log(locations);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey,
    preventGoogleFontsLoading: true,
  });

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center" style={{ height, width }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div style={{ height, width }} className="rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={{ ...containerStyle, height, width }}
        center={center}
        zoom={zoom}
        options={{
          draggable: false,
          zoomControl: false,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: false,          
          zoomControl: true, // Ajoute les boutons de zoom/dézoom
          scrollwheel: true, // Active le zoom avec la molette de la souris
        }}
        onLoad={(map) => { mapRef.current = map; }}
      >
        <MarkerClusterer>
          {(clusterer) => (
            <>
              {locations.map((location) => (
                <Marker
                  key={location.id}
                  position={location.position}
                  clusterer={clusterer}
                  clickable={true}
                  onClick={() => {
                    window.location.href = `/groupe-local/${location.slug}`;
                  }}
                />
              ))}
            </>
          )}
        </MarkerClusterer>
      </GoogleMap>
    </div>
  );
}