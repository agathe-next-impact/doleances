export const revalidate = 3600;

const SITE_URL = "https://lesdoleances.fr";

const STATIC_ROUTES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/category", changefreq: "weekly", priority: "0.8" },
  { path: "/a-propos", changefreq: "monthly", priority: "0.5" },
  { path: "/cartographie", changefreq: "monthly", priority: "0.5" },
  { path: "/contribuer", changefreq: "monthly", priority: "0.5" },
  { path: "/etats-generaux-communaux", changefreq: "monthly", priority: "0.5" },
  { path: "/festival", changefreq: "monthly", priority: "0.5" },
  { path: "/rgpd/mentions-legales", changefreq: "yearly", priority: "0.3" },
];

export async function GET() {
  const [res, articles, pages] = await Promise.all([
    fetch(`https://wpasso.fr/wp-json/wp/v2/groupe_local?per_page=100&_fields=slug,date,modified`, {
      next: { revalidate: 3600 },
    }),
    fetch(`https://wpasso.fr/wp-json/wp/v2/posts?per_page=100&_fields=slug,status,date,modified`, {
      next: { revalidate: 3600 },
    }),
    fetch(`https://wpasso.fr/wp-json/wp/v2/pages?per_page=100&_fields=slug,status,date,modified`, {
      next: { revalidate: 3600 },
    }),
  ]);

  if (!res.ok || !articles.ok || !pages.ok) {
    return new Response('Failed to fetch data', { status: 500 });
  }

  const groupes = await res.json();
  const posts = await articles.json();
  const postsFiltered = posts.filter((post: any) => post.status === 'publish');
  const pagesData = await pages.json();
  const pagesFiltered = pagesData.filter((page: any) => page.status === 'publish');

  const formatDate = (d: string) => d ? new Date(d).toISOString().split("T")[0] : "";

  const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_ROUTES.map((r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join("\n")}
${postsFiltered.map((post: any) => `  <url>
    <loc>${SITE_URL}/article/${post.slug}</loc>
    <lastmod>${formatDate(post.modified || post.date)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join("\n")}
${groupes.map((g: any) => `  <url>
    <loc>${SITE_URL}/groupe-local/${g.slug}</loc>
    <lastmod>${formatDate(g.modified || g.date)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join("\n")}
${pagesFiltered.map((page: any) => `  <url>
    <loc>${SITE_URL}/${page.slug}</loc>
    <lastmod>${formatDate(page.modified || page.date)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
