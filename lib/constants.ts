// Constantes de l'application

// Clé API Google Maps
// Remplacez cette valeur par votre propre clé API Google Maps
// Obtenez une clé API sur https://developers.google.com/maps/documentation/javascript/get-api-key
export const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "AIzaSyA1lJXqXBc0-w5WUVO1KhvggK05FCbi7Yg"

// Origine du backend WordPress (utilisée pour l'API REST et la transformation des URLs de médias).
// Override via NEXT_PUBLIC_WP_BACKEND_URL dans .env.local
export const WP_BACKEND_URL =
  process.env.NEXT_PUBLIC_WP_BACKEND_URL || "https://admin.lesdoleances.fr"

// URL de base de l'API REST WordPress
export const API_BASE_URL = `${WP_BACKEND_URL}/wp-json/wp/v2`
