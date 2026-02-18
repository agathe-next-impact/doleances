"use client";

import { useRef, useState, useEffect } from "react";
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

export default function CardMap({
  locations,
  height = 400,
  width = "100%",
  zoom = 5,
  center = defaultCenter,
}: StaticMapProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/google-maps-key")
      .then((res) => res.json())
      .then((data) => setApiKey(data.apiKey || ""))
      .catch(() => setApiKey(""));
  }, []);

  if (apiKey === null) {
    return (
      <div className="flex items-center justify-center" style={{ height, width }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center text-muted-foreground text-sm" style={{ height, width }}>
        Carte indisponible
      </div>
    );
  }

  return <CardMapInner apiKey={apiKey} locations={locations} height={height} width={width} zoom={zoom} center={center} />;
}

function CardMapInner({
  apiKey,
  locations,
  height,
  width,
  zoom,
  center,
}: StaticMapProps & { apiKey: string }) {
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
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
          disableDoubleClickZoom: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: false,
          zoomControl: true,
          scrollwheel: true,
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
