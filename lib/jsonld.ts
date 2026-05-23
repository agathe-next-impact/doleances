import { SITE_NAME, SITE_URL, DEFAULT_IMAGE } from "@/lib/metadata"

// ─── Organization (site-wide) ─────────────────────────────────────
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/img/doleance_couv.png`,
    description: "Wiki du corpus des doléances de 2018/2019",
  }
}

// ─── WebSite (homepage) ───────────────────────────────────────────
export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "fr",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/category?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }
}

// ─── Article ──────────────────────────────────────────────────────
export function buildArticleJsonLd(params: {
  title: string
  description: string
  url: string
  datePublished: string
  dateModified?: string
  imageUrl: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    url: params.url,
    datePublished: params.datePublished,
    dateModified: params.dateModified || params.datePublished,
    image: params.imageUrl || DEFAULT_IMAGE,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/img/doleance_couv.png`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": params.url,
    },
  }
}

// ─── BreadcrumbList ───────────────────────────────────────────────
export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// ─── Event ────────────────────────────────────────────────────────
export function buildEventJsonLd(params: {
  name: string
  description: string
  startDate: string
  endDate?: string
  location: { name: string; address: string }
  imageUrl?: string
  url: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: params.name,
    description: params.description,
    startDate: params.startDate,
    ...(params.endDate && { endDate: params.endDate }),
    url: params.url,
    image: params.imageUrl || DEFAULT_IMAGE,
    location: {
      "@type": "Place",
      name: params.location.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: params.location.address,
      },
    },
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

// ─── Local Group (Organization sous-type) ─────────────────────────
export function buildLocalGroupJsonLd(params: {
  name: string
  description: string
  url: string
  address?: string | null
  geo?: { lat: number; lng: number } | null
  imageUrl?: string | null
  email?: string | null
  telephone?: string | null
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: params.name,
    description: params.description,
    url: params.url,
    ...(params.imageUrl && { image: params.imageUrl }),
    ...(params.email && { email: params.email }),
    ...(params.telephone && { telephone: params.telephone }),
    ...(params.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: params.address,
      },
    }),
    ...(params.geo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: params.geo.lat,
        longitude: params.geo.lng,
      },
    }),
    parentOrganization: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}
