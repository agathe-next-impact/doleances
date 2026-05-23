import type { Metadata } from "next"
import { fetchAttachmentById } from "@/lib/api"

// ─── Constantes du site ────────────────────────────────────────────
export const SITE_NAME = "Les Doléances"
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.lesdoleances.fr"
export const DEFAULT_DESCRIPTION = "Wiki du corpus des doléances de 2018/2019"
export const DEFAULT_IMAGE = `${SITE_URL}/img/doleance_couv.png`
export const DEFAULT_LOCALE = "fr_FR"

// ─── Décodage HTML WordPress ───────────────────────────────────────
/**
 * Nettoie un texte issu de WordPress : supprime les balises HTML
 * et décode les entités HTML courantes.
 */
export function cleanWPText(raw: string | undefined | null): string {
  if (!raw) return ""
  return raw
    .replace(/<[^>]*>/g, "")       // supprime les balises HTML
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "\u2019") // '
    .replace(/&lsquo;/g, "\u2018") // '
    .replace(/&rdquo;/g, "\u201D") // "
    .replace(/&ldquo;/g, "\u201C") // "
    .replace(/&hellip;/g, "\u2026") // …
    .replace(/&ndash;/g, "\u2013") // –
    .replace(/&mdash;/g, "\u2014") // —
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Tronque une description à `max` caractères en respectant les mots.
 */
export function truncateDescription(text: string, max = 160): string {
  if (text.length <= max) return text
  const truncated = text.substring(0, max)
  const lastSpace = truncated.lastIndexOf(" ")
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "…"
}

// ─── Résolution d'image avec fallback ──────────────────────────────
/**
 * Récupère l'URL de l'image mise en avant d'un post/page WordPress.
 * Retourne l'image par défaut si aucune image n'est trouvée.
 */
export async function resolveOgImage(
  featuredMediaId?: number | null,
  altText?: string,
): Promise<{ url: string; alt: string; width: number; height: number }> {
  const fallback = {
    url: DEFAULT_IMAGE,
    alt: altText || SITE_NAME,
    width: 1200,
    height: 630,
  }

  if (!featuredMediaId) return fallback

  try {
    const media = await fetchAttachmentById(featuredMediaId)
    if (media?.source_url) {
      return {
        url: media.source_url,
        alt: media.alt_text || altText || SITE_NAME,
        width: 1200,
        height: 630,
      }
    }
  } catch {
    // silently fallback
  }

  return fallback
}

// ─── Types ─────────────────────────────────────────────────────────
interface BuildMetadataOptions {
  /** Titre de la page (sera nettoyé automatiquement) */
  title?: string
  /** Description (sera nettoyée et tronquée automatiquement) */
  description?: string
  /** Chemin relatif de la page, ex: "/article/mon-slug" */
  path?: string
  /** Type OpenGraph : "website" ou "article" */
  type?: "website" | "article"
  /** ID du media WordPress mis en avant */
  featuredMediaId?: number | null
  /** URL d'image directe (prioritaire sur featuredMediaId) */
  imageUrl?: string
  /** Texte alternatif de l'image */
  imageAlt?: string
  /** Surcharges ACF : opengraph_title / opengraph_description */
  acfOverrides?: {
    opengraph_title?: string
    opengraph_description?: string
    [key: string]: any
  }
}

// ─── Générateur centralisé ─────────────────────────────────────────
/**
 * Génère un objet Metadata Next.js complet avec OpenGraph et Twitter Card.
 *
 * Usage dans `generateMetadata()` ou en export statique :
 * ```ts
 * export async function generateMetadata({ params }) {
 *   const post = await fetchPostBySlug(slug)
 *   return buildMetadata({
 *     title: post.title.rendered,
 *     description: post.excerpt.rendered,
 *     path: `/article/${slug}`,
 *     type: "article",
 *     featuredMediaId: post.featured_media,
 *     acfOverrides: post.acf,
 *   })
 * }
 * ```
 */
export async function buildMetadata(options: BuildMetadataOptions = {}): Promise<Metadata> {
  const {
    title: rawTitle,
    description: rawDescription,
    path = "",
    type = "website",
    featuredMediaId,
    imageUrl,
    imageAlt,
    acfOverrides,
  } = options

  // 1. Titre : ACF override > titre fourni > défaut
  const title = cleanWPText(acfOverrides?.opengraph_title)
    || cleanWPText(rawTitle)
    || SITE_NAME

  // 2. Description : ACF override > description fournie > défaut
  const description = truncateDescription(
    cleanWPText(acfOverrides?.opengraph_description)
      || cleanWPText(rawDescription)
      || DEFAULT_DESCRIPTION,
  )

  // 3. URL canonique
  const url = path ? `${SITE_URL}${path}` : SITE_URL

  // 4. Image : URL directe > featured media > fallback
  let ogImage: { url: string; alt: string; width: number; height: number }
  if (imageUrl) {
    ogImage = { url: imageUrl, alt: imageAlt || title, width: 1200, height: 630 }
  } else {
    ogImage = await resolveOgImage(featuredMediaId, imageAlt || title)
  }

  return {
    title,
    description,
    openGraph: {
      siteName: SITE_NAME,
      title,
      description,
      url,
      type,
      locale: DEFAULT_LOCALE,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
    alternates: {
      canonical: url,
    },
  }
}

/**
 * Variante synchrone pour les pages statiques sans image WordPress à résoudre.
 * Utilise l'image par défaut ou une imageUrl fournie.
 */
export function buildStaticMetadata(options: Omit<BuildMetadataOptions, "featuredMediaId"> = {}): Metadata {
  const {
    title: rawTitle,
    description: rawDescription,
    path = "",
    type = "website",
    imageUrl,
    imageAlt,
  } = options

  const title = cleanWPText(rawTitle) || SITE_NAME
  const description = truncateDescription(cleanWPText(rawDescription) || DEFAULT_DESCRIPTION)
  const url = path ? `${SITE_URL}${path}` : SITE_URL
  const ogImage = {
    url: imageUrl || DEFAULT_IMAGE,
    alt: imageAlt || title,
    width: 1200,
    height: 630,
  }

  return {
    title,
    description,
    openGraph: {
      siteName: SITE_NAME,
      title,
      description,
      url,
      type,
      locale: DEFAULT_LOCALE,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
    alternates: {
      canonical: url,
    },
  }
}
