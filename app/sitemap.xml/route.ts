export const dynamic = 'force-dynamic'; // 🔥 indispensable

export async function GET() {
  const res = await fetch('https://wpasso.fr/wp-json/wp/v2/groupe_local?_embed&per_page=100', {
    next: { revalidate: 0 }, // ou cache: 'no-store'
  });
  const articles = await fetch('https://wpasso.fr/wp-json/wp/v2/posts?_embed&per_page=100', {
    next: { revalidate: 0 }, // ou cache: 'no-store'
  });
  const pages = await fetch('https://wpasso.fr/wp-json/wp/v2/pages?_embed&per_page=100', {
    next: { revalidate: 0 }, // ou cache: 'no-store'
  });
  if (!res.ok || !articles.ok || !pages.ok) {
    return new Response('Failed to fetch data', { status: 500 });
  }

  const groupes = await res.json();
  const posts = await articles.json();
  const postsFiltered = posts.filter((post: any) => post.status === 'publish');
  const pagesData = await pages.json();
  const pagesFiltered = pagesData.filter((page: any) => page.status === 'publish');

  const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${groupes
        .map((g: any) => {
          return `<url><loc>https://lesdoleances.fr/groupe-local/${g.slug}</loc></url>`;
        })
        .join('\n')}
      ${postsFiltered
        .map((post: any) => {
          return `<url><loc>https://lesdoleances.fr/article/${post.slug}</loc></url>`;
        })
        .join('\n')}
      ${pagesFiltered
        .map((page: any) => {
          return `<url><loc>https://lesdoleances.fr/${page.slug}</loc></url>`;
        })
        .join('\n')}
    </urlset>
    `;



  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
