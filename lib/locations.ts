// Interface pour les localisations à afficher sur la carte
export interface Location {
  id: number
  name: string
  description: string
  coordinates: [number, number] // [latitude, longitude]
  type: "bureau" | "agence" | "partenaire" | "projet"
  address?: string
  contact?: {
    phone?: string
    email?: string
    website?: string
  }
  image?: string
}

// Groupes de types de localisations pour la légende
export const locationTypes = [
  { type: "bureau", label: "Bureaux", color: "#3b82f6" },
  { type: "agence", label: "Agences", color: "#10b981" },
  { type: "partenaire", label: "Partenaires", color: "#f59e0b" },
  { type: "projet", label: "Projets", color: "#8b5cf6" },
]

// Fonction pour obtenir la couleur d'un type de localisation
export function getLocationColor(type: Location["type"]): string {
  const locationType = locationTypes.find((lt) => lt.type === type)
  return locationType?.color || "#3b82f6"
}

// Fonction pour convertir les données de l'API WordPress en format Location
export function convertToLocations(groupesLocaux: any[]): Location[] {
  return groupesLocaux.map((groupe) => ({
    id: groupe.id,
    name: groupe.title,
    description: groupe.description,
    coordinates: groupe.coordinates,
    type: (groupe.type as Location["type"]) || "bureau",
    address: groupe.address,
    contact: {
      phone: groupe.phone,
      email: groupe.email,
      website: groupe.website,
    },
    image: groupe.featuredImage,
  }))
}
