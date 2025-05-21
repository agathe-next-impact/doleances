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
    <>
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[100px] left-0 h-[500px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[500px] right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
      <div className="container mx-auto md:p-8 p-4">
        <ArticleContent post={post} />
      </div>
      </>
    )
  } catch (error) {
    console.error("Error fetching article:", error)
    notFound()
  }
}
