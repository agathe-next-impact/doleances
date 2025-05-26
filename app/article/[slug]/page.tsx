import { fetchAttachmentById, fetchPostBySlug } from "@/lib/api"
import { notFound } from "next/navigation"
import ArticleContent from "@/components/actualites/article-content" 
import type { Metadata } from "next"
import ShareSocial from "@/components/ui/share-social"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await fetchPostBySlug(params.slug)
  return {
    title: post?.title?.rendered || "Actualités - Les Doléances",
    description: post?.excerpt?.rendered?.replace(/<[^>]+>/g, "") || "L'actualité des doléances",
    openGraph: {
      title: post?.title?.rendered || "Actualités - Les Doléances",
      description: post?.excerpt?.rendered?.replace(/<[^>]+>/g, "") || "L'actualité des doléances",
      images: [
        {
          url: "/img/logo.svg",
          alt: post?.title?.rendered || "Actualités - Les Doléances",
        },
      ],
    },
  }
}



export default async function ArticlePage({ params }: { params: { slug: string } }) {
  try {
    const post = await fetchPostBySlug(params.slug)
    const postMedia = post?.featured_media ? await fetchAttachmentById(post.featured_media) : null

    // OpenGraph data fallback
    const ogTitle = post?.acf?.opengraph_title || post?.title?.rendered || ""
    const ogDescription = post?.acf?.opengraph_description || post?.excerpt?.rendered?.replace(/<[^>]+>/g, "") || ""
    const ogImage = postMedia ||
      "/img/logo.svg"

    // Vérifier si l'article a un groupe local associé
    if (post.acf?.groupe_local_tax) {
      console.log(`Cet article est associé au groupe local avec l'ID ${post.acf.groupe_local_tax}`)
    } else {
      console.log("Cet article n'a pas de groupe local associé dans les champs ACF")
    }
    
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://les-doleances.fr"}/article/${params.slug}`


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
        <ArticleContent post={post} />
      </div>
      </>
    )
  } catch (error) {
    console.error("Error fetching article:", error)
    notFound()
  }
}
