import { fetchAttachmentById, fetchPostBySlug, fetchAllPosts } from "@/lib/api";
import { notFound } from "next/navigation";
import ArticleContent from "@/components/actualites/article-content";
import type { Metadata } from "next";
import ShareSocial from "@/components/ui/share-social";
import type React from "react";
import { buildMetadata, cleanWPText, SITE_URL, DEFAULT_IMAGE } from "@/lib/metadata";
import JsonLd from "@/components/json-ld";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { draftMode } from "next/headers";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    return buildMetadata({
      title: "Actualités - Les Doléances",
      description: "L'actualité des doléances",
      path: `/article/${slug}`,
      type: "article",
    });
  }

  return buildMetadata({
    title: post.title?.rendered,
    description: post.excerpt?.rendered,
    path: `/article/${slug}`,
    type: "article",
    featuredMediaId: post.featured_media,
    acfOverrides: post.acf,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  try {
    const { slug } = await params;
    const { isEnabled: isDraft } = await draftMode();
    const post = await fetchPostBySlug(slug, isDraft);
    const postMedia = post?.featured_media
      ? await fetchAttachmentById(post.featured_media)
      : {};

    // OpenGraph data fallback
    const ogTitle = cleanWPText(post?.acf?.opengraph_title || post?.title?.rendered);
    const ogDescription = cleanWPText(post?.acf?.opengraph_description || post?.excerpt?.rendered);
    const ogImage = postMedia.source_url || DEFAULT_IMAGE;
    const url = `${SITE_URL}/article/${slug}`;

    return (
      <>
        <JsonLd data={[
          buildArticleJsonLd({
            title: ogTitle,
            description: ogDescription,
            url,
            datePublished: post?.date || "",
            dateModified: post?.modified || post?.date || "",
            imageUrl: ogImage,
          }),
          buildBreadcrumbJsonLd([
            { name: "Accueil", url: SITE_URL },
            { name: "Actualités", url: `${SITE_URL}/category` },
            { name: ogTitle, url },
          ]),
        ]} />
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
