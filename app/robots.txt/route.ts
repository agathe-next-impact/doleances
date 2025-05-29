import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://les-doleances.fr";
  return new NextResponse(
    `User-agent: *
Allow: /
Sitemap: https://lesdoleances.fr/sitemap.xml
`,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
}