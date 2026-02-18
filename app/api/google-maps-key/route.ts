import { NextResponse } from "next/server"
import { GOOGLE_MAPS_API_KEY } from "@/lib/constants"

export async function GET() {
  return NextResponse.json({
    apiKey: GOOGLE_MAPS_API_KEY || "",
  })
}
