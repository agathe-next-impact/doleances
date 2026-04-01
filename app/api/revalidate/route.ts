import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

const ALLOWED_ORIGINS = [
  "https://admin.lesdoleances.fr",
  "https://palegreen-capybara-652133.hostingersite.com",
]

function getCorsHeaders(origin?: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-webhook-secret",
  }
}

/** Preflight CORS */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin")
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) })
}

/**
 * Webhook appelé par WordPress lors d'une publication/modification/suppression.
 *
 * POST /api/revalidate
 * Headers: x-webhook-secret: <WORDPRESS_WEBHOOK_SECRET>
 * Body JSON: { post_type, slug, post_id, action }
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  const corsHeaders = getCorsHeaders(origin)
  const secret = request.headers.get("x-webhook-secret")

  if (secret !== process.env.WORDPRESS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401, headers: corsHeaders })
  }

  try {
    const body = await request.json()
    const { post_type, slug, action } = body

    const revalidated: string[] = []

    // Revalider la page concernée selon le type de contenu
    switch (post_type) {
      case "post":
        revalidatePath(`/article/${slug}`)
        revalidatePath("/category")
        revalidatePath("/")
        revalidated.push(`/article/${slug}`, "/category", "/")

        // Revalider aussi les pages catégorie associées
        if (body.categories && Array.isArray(body.categories)) {
          for (const catSlug of body.categories) {
            revalidatePath(`/category/${catSlug}`)
            revalidated.push(`/category/${catSlug}`)
          }
        }
        break

      case "page":
        revalidatePath(`/${slug}`)
        revalidatePath("/")
        revalidated.push(`/${slug}`, "/")
        break

      case "groupe_local":
        revalidatePath(`/groupe-local/${slug}`)
        revalidatePath("/cartographie")
        revalidatePath("/")
        revalidated.push(`/groupe-local/${slug}`, "/cartographie", "/")
        break

      default:
        // Pour tout type inconnu, revalider la page d'accueil
        revalidatePath("/")
        revalidated.push("/")
    }

    // Toujours revalider le sitemap
    revalidatePath("/sitemap.xml")
    revalidated.push("/sitemap.xml")

    return NextResponse.json({
      revalidated: true,
      paths: revalidated,
      action,
      timestamp: new Date().toISOString(),
    }, { headers: corsHeaders })
  } catch (error) {
    console.error("Revalidation error:", error)
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500, headers: corsHeaders },
    )
  }
}
