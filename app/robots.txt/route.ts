export const dynamic = 'force-dynamic'; // pour permettre le fetch dynamique

export async function GET() {
  const content = `
User-agent: *
Allow: /

Sitemap: https://lesdoleances.fr/sitemap.xml
`;

  return new Response(content.trim(), {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
