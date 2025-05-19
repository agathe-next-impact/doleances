"use client";

import { useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, MarkerClusterer } from "@react-google-maps/api";


// Types pour les props
interface StaticMapProps {
  locations: {
    id: string;
    position: { lat: number; lng: number };
  }[];
  height?: string | number;
  width?: string | number;
  zoom?: number;
  center?: { lat: number; lng: number };
}

const defaultCenter = { lat: 46.603354, lng: 2.3522 };
const defaultZoom = 6;
const containerStyle = {
  width: "100%",
  height: "400px",
};


const googleMapsApiKey = "AIzaSyA1lJXqXBc0-w5WUVO1KhvggK05FCbi7Yg"; // Remplacez par votre clé API

export default function CardMap({
  locations,
  height = 400,
  width = "100%",
  zoom = 5,
  center = defaultCenter,
}: StaticMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  

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
          mapTypeControl: false,
          fullscreenControl: false,
        }}
        onLoad={(map) => (mapRef.current = map)}
      >
        <MarkerClusterer>
          {(clusterer) => (
            <>
              {locations.map((location) => (
                <Marker
                  key={location.id}
                  position={location.position}
                  clusterer={clusterer}
                  clickable={false}
                />
              ))}
            </>
          )}
        </MarkerClusterer>
      </GoogleMap>
    </div>
  );
}