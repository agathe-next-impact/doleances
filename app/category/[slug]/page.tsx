// Améliorer la gestion des erreurs et ajouter des fallbacks pour les données manquantes
import { fetchPostsByCategory, extractGroupesLocauxCPTFromCategory, fetchCategoryBySlug } from "@/lib/api"
import ArticleList from "@/components/actualites/article-list"
import CategoryHero from "@/components/actualites/category-hero"
import SearchFilter from "@/components/actualites/search-filter"
import { Suspense } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Actualités - Les Doléances",
  description: "L'actualité des doléances",
}



export default async function CategoryPage({ params }: { params: { slug: string } }) {
  try {

    const categorySlug = params.slug
    console.log(`Récupération de la catégorie avec le slug ${categorySlug}`)

    // Fetch category data with better error handling
    let category
    try {
      category = await fetchCategoryBySlug(categorySlug)
    } catch (error) {
      console.error(`Error fetching category ${categorySlug}:`, error)
      // Provide a fallback category
      category = {
        id: category?.id,
        name: `Catégorie ${category?.name}`,
        description: category?.description || "",
        count: 0,
        link: "", 
      }
    }


    // Fetch posts for this category with better error handling
    let posts: any[] = []
    try {
      posts = await fetchPostsByCategory(category?.id)
    } catch (error) {
      console.error(`Error fetching posts for category ${category?.id}:`, error)
    }


    // Déterminer si c'est une catégorie d'événements
    // Pour simplifier, nous considérons que toute catégorie avec au moins un article
    // ayant un champ date_de_levenement est une catégorie d'événements
    const postsWithEventDate = posts.filter((post) => post.acf?.date_de_levenement)
    const isEventCategory = postsWithEventDate.length > 0

    // Extraire les dates pour le filtrage
    let dates = []

    if (isEventCategory) {
      // Pour les catégories d'événements, utiliser la date de l'événement
      console.log("Catégorie d'événements détectée, extraction des dates d'événements")

      // Collecter toutes les dates d'événements et les formater en MM/YYYY (comme pour les publications)
      const eventDates = []
      for (const post of posts) {
        if (post.acf?.date_de_levenement) {
          try {
            // Format attendu pour date_de_levenement: YYYYMMDD
            const dateParts = post.acf.date_de_levenement
            if (dateParts.length === 8) {
              const month = dateParts.slice(4, 6)
              const year = dateParts.slice(0, 4)

              // Ajouter la date au format MM/YYYY pour le filtrage (comme pour les publications)
              const monthYearFormat = `${month}/${year}`
              eventDates.push(monthYearFormat)
              console.log(`Date d'événement formatée: ${monthYearFormat} pour l'article ${post.id}`)
            } else {
              console.log(`Format de date invalide: ${post.acf.date_de_levenement} pour l'article ${post.id}`)
            }
          } catch (error) {
            console.error(`Erreur lors du traitement de la date pour l'article ${post.id}:`, error)
          }
        }
      }

      // Filtrer les dates uniques et les trier
      dates = [...new Set(eventDates)].sort((a, b) => {
        try {
          const [monthA, yearA] = (a?.includes("/") ? a.split("/") : ["0", "0"]).map(Number)
          const [monthB, yearB] = b.split("/").map(Number)

          // Trier par année décroissante, puis par mois décroissant
          return yearB - yearA || monthB - monthA
        } catch (error) {
          console.error("Erreur lors du tri des dates:", error)
          return 0
        }
      })

      console.log(`Dates d'événements uniques après tri: ${dates.join(", ")}`)
    } else {
      // Pour les autres catégories, utiliser la date de publication
      dates = [
        ...new Set(
          posts
            .map((post) => {
              try {
                const date = new Date(post.date)
                return `${date.getMonth() + 1}/${date.getFullYear()}`
              } catch (error) {
                console.error(`Erreur lors du traitement de la date pour l'article ${post.id}:`, error)
                return null
              }
            })
            .filter(Boolean),
        ),
      ].sort((a, b) => {
        try {
          const [monthA, yearA] = a.split("/").map(Number)
          const [monthB, yearB] = b.split("/").map(Number)
          return yearB - yearA || monthB - monthA
        } catch (error) {
          return 0
        }
      })
    }

    // Récupérer les CPT groupe_local associés aux articles de cette catégorie
    const groupesLocauxCPT = await extractGroupesLocauxCPTFromCategory(category?.id)

    return (
    <>
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[100px] left-0 h-[500px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[500px] right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
      <div className="container mx-auto md:p-8 p-4">
        <CategoryHero category={category?.name} description={category?.description } />
        <div className="mb-8">
          <Suspense fallback={<div>Chargement des filtres...</div>}>
            <SearchFilter
              dates={dates.filter((date): date is string => date !== null)}
              groupesLocauxCPT={groupesLocauxCPT}
              categoryId={category?.id}
              isEventCategory={isEventCategory}
            />
          </Suspense>
        </div>
        <ArticleList initialPosts={posts} categoryId={category?.id} isEventCategory={isEventCategory} />
      </div>
      </>
    )
  } catch (error) {
    console.error("Error in CategoryPage:", error)
    return (
    <>
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[100px] left-0 h-[500px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[500px] right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
      <div className="container mx-auto md:p-8 p-4">
        <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
        <p>Impossible de charger les données de la catégorie. Veuillez réessayer ultérieurement.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Détail: {error instanceof Error ? error.message : String(error)}
        </p>
      </div>
      </>
    )
  }
}
