import { draftMode } from "next/headers"
import { redirect } from "next/navigation"
import { NextRequest } from "next/server"

/**
 * Active le Draft Mode et redirige vers la page de preview.
 *
 * GET /api/draft?secret=XXX&slug=mon-article&post_type=post
 *
 * Appelé depuis le bouton "Aperçu" de WordPress.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const secret = searchParams.get("secret")
  const slug = searchParams.get("slug")
  const postType = searchParams.get("post_type") || "post"

  // Vérifier le secret
  if (secret !== process.env.WORDPRESS_WEBHOOK_SECRET) {
    return new Response("Invalid secret", { status: 401 })
  }

  if (!slug) {
    return new Response("Missing slug parameter", { status: 400 })
  }

  // Activer le draft mode
  const draft = await draftMode()
  draft.enable()

  // Rediriger vers la page correspondante
  let path: string
  switch (postType) {
    case "post":
      path = `/article/${slug}`
      break
    case "page":
      path = `/${slug}`
      break
    case "groupe_local":
      path = `/groupe-local/${slug}`
      break
    default:
      path = `/${slug}`
  }

  redirect(path)
}
