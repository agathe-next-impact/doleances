import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-webhook-secret",
}

/** Preflight CORS */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

/**
 * Webhook appelé par WordPress lors d'une publication/modification/suppression.
 *
 * POST /api/revalidate
 * Headers: x-webhook-secret: <WORDPRESS_WEBHOOK_SECRET>
 * Body JSON: { post_type, slug, post_id, action }
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-webhook-secret")

  if (secret !== process.env.WORDPRESS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401, headers: CORS_HEADERS })
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
    }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error("Revalidation error:", error)
    return NextResponse.json(
      { error: "Failed to revalidate", details: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: CORS_HEADERS },
    )
  }
}
