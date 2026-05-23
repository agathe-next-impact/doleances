import { draftMode } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

/**
 * Désactive le Draft Mode.
 * GET /api/draft/disable
 */
export async function GET(request: NextRequest) {
  const draft = await draftMode()
  draft.disable()

  return NextResponse.json({ draftMode: false })
}
