import { fetchPostBySlug } from "@/lib/api"
import { notFound } from "next/navigation"
import ArticleContent from "@/components/actualites/article-content" 
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  try {
    console.log(`Récupération de l'article avec l'ID ${params.slug}`)
    const post = await fetchPostBySlug(params.slug)

    // Vérifier si l'article a un groupe local associé
    if (post.acf?.groupe_local_tax) {
      console.log(`Cet article est associé au groupe local avec l'ID ${post.acf.groupe_local_tax}`)
    } else {
      console.log("Cet article n'a pas de groupe local associé dans les champs ACF")
    }

    console.log("Données de l'article:", post)

    return (
      <div className="container mx-auto px-4 py-8">
        <ArticleContent post={post} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching article:", error)
    notFound()
  }
}
