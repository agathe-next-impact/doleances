"use client";

import { Phone, Mail, Globe, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import Link from "next/link";

interface Location {
  id: string;
  slug?: string;
  title: string;
  position: { lat: number; lng: number };
  address: string;
  personne?: string;
  phone?: string;
  email?: string;
  website?: string;
  departement: string;
  thumbnail?: string;
}

interface LocationSidebarProps {
  location: Location | null;
  locations: Location[];
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
}

// Fonction pour regrouper les localisations par département
const groupLocationsByDepartement = (locations: Location[]) => {
  return locations.reduce((groups: Record<string, Location[]>, location) => {
    const departement = location.departement || "Autres";
    if (!groups[departement]) {
      groups[departement] = [];
    }
    groups[departement].push(location);
    return groups;
  }, {});
};

export default function LocationSidebar({
  location,
  locations,
  onClose,
  onLocationSelect,
}: LocationSidebarProps) {
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  // Fonction pour gérer les erreurs de chargement d'image
  const handleImageError = (locationId: string) => {
    setImageError((prev) => ({ ...prev, [locationId]: true }));
  };

  // Fonction pour nettoyer le HTML
  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent };
  };

  // Regrouper les localisations par département
  const groupedLocations = groupLocationsByDepartement(locations);


  
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
              <img
                src={location.thumbnail || ""}
                alt={location.title}
                className="w-full h-full object-cover"
                onError={() => handleImageError(location.id)}
              />
            </div>
          )}

          <div className="space-y-4 flex-1">
            {location.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <p>{location.address}</p>
              </div>
            )}

            {location.personne && (
              <div className="border-t border-gray-200 pt-4">
                <div
                  className="text-gray-700 prose prose-sm max-w-none">
                  {location.personne}
                </div>
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

            {location.slug && (
              <div className="flex items-center gap-2 pt-8">
                <Button variant="outline">
                <Link
                  href={location.slug ? `/groupe-local/${location.slug}` : "#"}
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Voir l'activité du groupe local
                </Link>
                </Button> 
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 h-full">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6">
              {Object.entries(groupedLocations).map(([departement, departementLocations]) => (
                <div key={departement}>
                  <h3 className="text-lg font-semibold mb-2">{departement}</h3>
                  <div className="space-y-4">
                    {departementLocations.map((loc) => (
                      <div
                        key={loc.id}
                        className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => onLocationSelect(loc)}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-gray-500" />
                          <h3 className="font-medium">{loc.title}</h3>
                        </div>
                        {loc.address && (
                          <p className="text-sm text-gray-500 truncate mt-1">{loc.address}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {locations.length === 0 && (
                <p className="text-gray-500 italic">Aucune localisation disponible</p>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}