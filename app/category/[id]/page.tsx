// Améliorer la gestion des erreurs et ajouter des fallbacks pour les données manquantes
import { fetchCategory, fetchPostsByCategory, extractGroupesLocauxCPTFromCategory } from "@/lib/api"
import ArticleList from "@/components/article-list"
import CategoryHero from "@/components/category-hero"
import SearchFilter from "@/components/search-filter"
import { Suspense } from "react"
import Link from "next/link"

export default async function CategoryPage(context: { params: { id: string } }) {
  try {
    // Récupérer l'ID de la catégorie à partir des paramètres de l'URL
    
    const categoryId = Number.parseInt(context.params.id)
    if (isNaN(categoryId)) {
      throw new Error(`Invalid category ID: ${context.params.id}`)
    }

    // Fetch category data with better error handling
    let category
    try {
      category = await fetchCategory(categoryId)
    } catch (error) {
      console.error(`Error fetching category ${categoryId}:`, error)
      // Provide a fallback category
      category = {
        id: categoryId,
        slug: `categorie-${categoryId}`, // Add a default slug
        name: `Catégorie ${categoryId}`,
        description: "",
        count: 0,
        link: "", 
      }
    }

    // Fetch posts for this category with better error handling
    let posts: Array<{ id: number; title?: string; acf?: { date_de_levenement?: string }; date: string }> = []
    try {
      posts = await fetchPostsByCategory(categoryId)
    } catch (error) {
      console.error(`Error fetching posts for category ${categoryId}:`, error)
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
            // Format attendu pour date_de_levenement: DD/MM/YYYY
            const dateParts = post.acf.date_de_levenement.split("/")
            if (dateParts && dateParts.length === 3) {
              const month = dateParts[1]
              const year = dateParts[2]

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

      console.log(`Nombre total de dates d'événements trouvées: ${eventDates.length}`)

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
    const groupesLocauxCPT = await extractGroupesLocauxCPTFromCategory(categoryId)

    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/category" className="text-sm text-muted-foreground flex items-center mb-4">
            <span>Toutes les actualités</span>
        </Link>
        <CategoryHero category={category} />
        <div className="my-8">
          <Suspense fallback={<div>Chargement des filtres...</div>}>
            <SearchFilter
              dates={dates.filter((date): date is string => date !== null)}
              groupesLocauxCPT={groupesLocauxCPT}
              categoryId={categoryId}
              isEventCategory={isEventCategory}
            />
          </Suspense>
        </div>
        <ArticleList
          initialPosts={posts.map((post) => ({
            ...post,
            title: post.title || "Titre par défaut",
            content: post.content || "Contenu par défaut",
            excerpt: post.excerpt || "Extrait par défaut",
            slug: post.slug || `post-${post.id}`,
            link: post.link || "#",
          }))}
          categoryId={categoryId}
          isEventCategory={isEventCategory}
        />
      </div>
    )
  } catch (error) {
    console.error("Error in CategoryPage:", error)
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
        <p>Impossible de charger les données de la catégorie. Veuillez réessayer ultérieurement.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Détail: {error instanceof Error ? error.message : String(error)}
        </p>
      </div>
    )
  }
}
