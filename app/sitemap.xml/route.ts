import { NextResponse } from "next/server";
import { fetchCategories, fetchGroupesLocaux, fetchLastThreePosts } from "@/lib/api";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://les-doleances.fr";

  // Récupère les articles et catégories (ajoute d'autres routes si besoin)
  const articles = await fetchLastThreePosts();
  const categories = await fetchCategories();
  const groupesLocaux = await fetchGroupesLocaux();

  let urls = [
    "",
    "category",
    "a-propos",
    "contact",
    "festival",
    "rgpd/mentions-legales",
    "cartographie",
    "contribuer",
    "etats-generaux-communaux",
    // Ajoute ici d'autres routes statiques si besoin
  ];

  // Ajoute les articles
  urls = urls.concat(
    articles.map((a) => `article/${typeof a.slug === "string" ? a.slug : a.slug?.rendered || ""}`)
  );

  // Ajoute les catégories
  urls = urls.concat(
    categories.map((c) => `category/${c.slug}`)
  );

    // Ajoute les groupes locaux
  urls = urls.concat(
    groupesLocaux.map((b) => `groupe-local/${b.slug}`)
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `<url><loc>${baseUrl}${path}</loc></url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}