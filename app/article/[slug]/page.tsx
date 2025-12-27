import { fetchAttachmentById, fetchPostBySlug } from "@/lib/api";
import { notFound } from "next/navigation";
import ArticleContent from "@/components/actualites/article-content";
import type { Metadata } from "next";
import ShareSocial from "@/components/ui/share-social";
import type React from "react";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Actualités - Les Doléances",
      description: "L'actualité des doléances",
      openGraph: {
        siteName: "Les Doléances",
        title: "Actualités - Les Doléances",
        description: "L'actualité des doléances",
        url: `https://www.lesdoleances.fr/article/${params.slug}`,
        type: "article",
        images: [
          {
            url: "https://www.lesdoleances.fr/img/doleances_couv.png",
            alt: "Actualités - Les Doléances",
          },
        ],
      },
    };
  }

  // Post exists, generate metadata
  const title = post.title?.rendered
    ? post.title.rendered
        .replace(/<[^>]*>/g, "") // Supprime les balises HTML
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&rsquo;/g, "'")
        .replace(/&hellip;/g, "...")
        .replace(/&ndash;/g, "–")
        .replace(/&mdash;/g, "—")
        .trim()
    : "Actualités - Les Doléances";

  const description = post.excerpt?.rendered
    ? post.excerpt.rendered
        .replace(/<[^>]*>/g, "") // Supprime les balises HTML
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&rsquo;/g, "'")
        .replace(/&hellip;/g, "...")
        .replace(/&ndash;/g, "–")
        .replace(/&mdash;/g, "—")
        .replace(/\s+/g, " ") // Remplace les espaces multiples par un seul
        .trim()
        .substring(0, 160) // Limite à 160 caractères pour les méta descriptions
    : "L'actualité des doléances";

  // Fetch featured image if available
  const img = post.featured_media
    ? await fetchAttachmentById(post.featured_media)
    : null;
  const imageUrl =
    img?.source_url || "https://www.lesdoleances.fr/img/doleances_couv.png";

  return {
    title,
    description,
    openGraph: {
      siteName: "Les Doléances",
      title,
      description,
      url: `https://www.lesdoleances.fr/article/${params.slug}`,
      type: "article",
      images: [
        {
          url: imageUrl,
          alt: title,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}): Promise<React.JSX.Element> {
  try {
    const post = await fetchPostBySlug(params.slug);
    const postMedia = post?.featured_media
      ? await fetchAttachmentById(post.featured_media)
      : {};

    // OpenGraph data fallback
    const ogTitle = post?.acf?.opengraph_title || post?.title?.rendered || "";
    const ogDescription =
      post?.acf?.opengraph_description ||
      post?.excerpt?.rendered?.replace(/<[^>]+>/g, "") ||
      "";
    const ogImage = postMedia.source_url || "/img/logo.svg";

    const url = `${
      process.env.NEXT_PUBLIC_SITE_URL || "https://les-doleances.fr"
    }/article/${params.slug}`;

    return (
      <>
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[100px] left-0 h-[500px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
          <div className="absolute top-[500px] right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
        </div>
        <div className="container mx-auto md:p-8 p-4">
          <ShareSocial
            url={url}
            title={ogTitle}
            text={ogDescription}
            image={ogImage}
          />
          {post && <ArticleContent post={post} />}
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching article:", error);
    notFound();
  }
}
