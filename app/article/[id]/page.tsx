import { fetchPost } from "@/lib/api"
import { notFound } from "next/navigation"
import ArticleContent from "@/components/article-content"

export default async function ArticlePage({ params }: { params: { id: string } }) {
  try {
    const postId = Number.parseInt(params.id)
    console.log(`Récupération de l'article avec l'ID ${postId}`)
    const post = await fetchPost(postId)

    console.log(`Article récupéré: "${post.title.rendered}"`)

    // Vérifier si l'article a un groupe local associé
    if (post.acf?.groupe_local_tax) {
      console.log(`Cet article est associé au groupe local avec l'ID ${post.acf.groupe_local_tax}`)
    } else {
      console.log("Cet article n'a pas de groupe local associé dans les champs ACF")
    }

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
