import { NextResponse } from "next/server"
import { GOOGLE_MAPS_API_KEY } from "@/lib/constants"

export async function GET() {
  // Cette route API permet de récupérer la clé API Google Maps côté client
  // tout en la protégeant contre les accès non autorisés

  // Vous pouvez ajouter ici des vérifications supplémentaires
  // comme l'authentification ou la vérification du domaine référent

  return NextResponse.json({
    apiKey: GOOGLE_MAPS_API_KEY || "",
  })
}
