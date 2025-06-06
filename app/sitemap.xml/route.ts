export const dynamic = 'force-dynamic'; // 🔥 indispensable

export async function GET() {
  const res = await fetch('https://wp-starter.io/wp-json/wp/v2/groupe_local?_embed&per_page=100', {
    next: { revalidate: 0 }, // ou cache: 'no-store'
  });

  const groupes = await res.json();

  const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${groupes
        .map((g: any) => {
          return `<url><loc>https://lesdoleances.fr/groupes/${g.slug}</loc></url>`;
        })
        .join('\n')}
    </urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
