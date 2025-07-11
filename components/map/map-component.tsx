"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, MarkerClusterer } from "@react-google-maps/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LocationSidebar from "./location-sidebar";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


// Types
interface Location {
  id: string;
  slug: string;
  title: { rendered: string };
  acf: {
    personne: string;
    personne2?: string;
    telephone2?: string;
    email2?: string;
    localisation: {
      lat: string | number;
      lng: string | number;
      address?: string;
    };
    departement: string;
    adresse: string;
    telephone: string;
    email: string;
    site_web: string;
  };
  featured_media?: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
    }>;
  };
}

interface ProcessedLocation {
  id: string;
  slug?: string;
  title: string;
  position: { lat: number; lng: number };
  address: string;
  content?: string;
  phone?: string;
  email?: string;
  website?: string;
  departement: string;
  thumbnail?: string;
}

interface GroupDepartement {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  zoom: number;
  locations: ProcessedLocation[];
}

// Styles
const containerStyle = {
  width: "100%",
  height: "calc(100vh - 80px)",
};

// Coordonnées par défaut pour la France
const defaultCenter = { lat: 46.603354, lng: 2.3522 };
const defaultZoom = 6;

// Clé API Google Maps
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || "https://wp-starter.io/wp-json/wp/v2";

export default function MapComponent() {
  const [selectedDepartement, setSelectedDepartement] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<ProcessedLocation | null>(null);
  const [groupDepartements, setGroupDepartements] = useState<GroupDepartement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [viewingAllFrance, setViewingAllFrance] = useState<boolean>(true);

  // Utiliser useJsApiLoader au lieu de LoadScript pour une meilleure gestion des erreurs
  if (!googleMapsApiKey) {
  return (
    <div className="p-4 text-red-500">
      Clé API Google Maps manquante. Veuillez configurer NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
    </div>
  );
}

const { isLoaded, loadError } = useJsApiLoader({
  googleMapsApiKey,
  preventGoogleFontsLoading: true,
});

  // Récupérer les données des groupes locaux depuis l'API WordPress
  useEffect(() => {
    const fetchGroupesLocaux = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${WORDPRESS_API_URL}/groupe_local?_embed&per_page=100`, {
          mode: "cors",
          credentials: "omit",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data: Location[] = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Format de données invalide");
        }

        const processedLocations: ProcessedLocation[] = data
          .filter((item) => item.acf?.localisation?.lat && item.acf?.localisation?.lng)
          .map((item) => {
            const lat = parseFloat(item.acf.localisation.lat as string);
            const lng = parseFloat(item.acf.localisation.lng as string);

            if (isNaN(lat) || isNaN(lng)) {
              console.warn(`Coordonnées invalides pour ${item.id}:`, item.acf.localisation);
              return null;
            }
            return {
              id: item.id.toString(),
              slug: item.slug,
              title: item.title?.rendered || "Sans titre",
              position: { lat, lng },
              address: item.acf.adresse || "",
              personne: item.acf?.personne_contact || "",
              phone: item.acf.telephone || "",
              email: item.acf.email || "",
              personne2: item.acf?.personne_contact_2 || "",
              phone2: item.acf.telephone_2 || "",
              email2: item.acf.email_2 || "",
              website: item.acf.site_web || "",
              departement: item.acf.departement || "Autres",
              thumbnail: item._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
            };
          })
          .filter(Boolean) as ProcessedLocation[];

        if (processedLocations.length === 0) {
          setError("Aucune localisation valide trouvée dans les données.");
          setLoading(false);
          return;
        }


        // Regrouper les localisations par département
        const departementGroups: Record<string, ProcessedLocation[]> = {};
        processedLocations.forEach((location) => {
          if (!departementGroups[location.departement]) {
            departementGroups[location.departement] = [];
          }
          departementGroups[location.departement].push(location);
        });


        const groups: GroupDepartement[] = Object.entries(departementGroups).map(([departement, locations]) => {
          const center = locations.reduce(
            (acc, loc) => ({
              lat: acc.lat + loc.position.lat / locations.length,
              lng: acc.lng + loc.position.lng / locations.length,
            }),
            { lat: 0, lng: 0 }
          );


          return {
            id: departement,
            name: departement,
            center,
            zoom: 9,
            locations,
          };
        });

        // Trier les groupes par nom
        groups.sort((a, b) => a.name.localeCompare(b.name));

        setGroupDepartements(groups);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération des groupes locaux:", err);
        setError("Impossible de charger les données. Veuillez réessayer plus tard.");
        setLoading(false);
      }
    };

    fetchGroupesLocaux();
  }, []);


  const resetToFranceView = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.panTo(defaultCenter);
      mapRef.current.setZoom(defaultZoom);
      setSelectedLocation(null);
      setSelectedDepartement(null);
      setViewingAllFrance(true);
    }
  }, []);

  const handleDepartementChange = useCallback(
    (departementId: string) => {
      setSelectedDepartement(departementId);
      setSelectedLocation(null);

      const group = groupDepartements.find((g) => g.id === departementId);
      if (group && mapRef.current) {
        mapRef.current.panTo(group.center);
        mapRef.current.setZoom(group.zoom);
      }
    },
    [groupDepartements]
  );


  const handleMarkerClick = useCallback((location: ProcessedLocation) => {
    setSelectedLocation(location);

    if (mapRef.current) {
      mapRef.current.panTo(location.position);
      mapRef.current.setZoom(11);
    }
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    map.panTo(defaultCenter);
    map.setZoom(defaultZoom);
  }, []);

  const currentGroup = groupDepartements.find((g) => g.id === selectedDepartement);
  const locations = currentGroup ? currentGroup.locations : groupDepartements.flatMap((g) => g.locations);


  const handleCloseLocation = useCallback(() => {
    setSelectedLocation(null);

    if (mapRef.current) {
      mapRef.current.panTo(defaultCenter);
      mapRef.current.setZoom(defaultZoom);
    }
  }, []);


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
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Chargement des données...</p>
        </div>
      </div>
    );
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
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Chargement de Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="py-4">
        <Select
          value={selectedDepartement || ""}
          onValueChange={(value) => {
            if (value === "all") {
              resetToFranceView();
            } else {
              handleDepartementChange(value);
            }
          }}
        >
          <SelectTrigger className="w-full md:w-[300px]">
            <SelectValue placeholder="Sélectionnez une département" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les départements</SelectItem>
            {groupDepartements.map((group) => (
              <SelectItem key={group.id} value={group.id}>
              {group.name} ({group.locations.length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col md:flex-row flex-1 h-full">
        <div className="w-full md:w-2/3 h-auto">
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
                    />
                  ))}
                </>
              )}
            </MarkerClusterer>
          </GoogleMap>
        </div>

        <LocationSidebar
          location={selectedLocation}
          onClose={handleCloseLocation}
          locations={locations}
          onLocationSelect={handleMarkerClick}
        />
      </div>
    </div>
  );
}

