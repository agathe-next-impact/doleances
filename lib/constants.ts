// Constantes de l'application

// Clé API Google Maps — lue depuis les variables d'environnement
// Préfixée NEXT_PUBLIC_ pour être accessible côté client
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

// Origine du backend WordPress (utilisée pour l'API REST et la transformation des URLs de médias).
// Override via NEXT_PUBLIC_WP_BACKEND_URL dans .env.local
export const WP_BACKEND_URL =
  process.env.NEXT_PUBLIC_WP_BACKEND_URL || "https://admin.lesdoleances.fr"

// URL de base de l'API REST WordPress
export const API_BASE_URL = `${WP_BACKEND_URL}/wp-json/wp/v2`
