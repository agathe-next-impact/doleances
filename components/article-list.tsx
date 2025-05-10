"use client"

import type { Post } from "@/lib/api"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import ArticleCard from "./article-card"
import { fetchPostsByCategoryAndGroupeLocalCPT } from "@/lib/api"


interface ArticleListProps {
  initialPosts: Post[]
  categoryId: number
  isEventCategory?: boolean
}

export default function ArticleList({ initialPosts, categoryId, isEventCategory = false }: ArticleListProps) {
  const searchParams = useSearchParams()
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(initialPosts)
  const [loading, setLoading] = useState(false)

  // Memoize the search parameters to prevent unnecessary re-renders
  const searchQuery = useMemo(() => searchParams.get("q") || "", [searchParams])
  const dateFilter = useMemo(() => searchParams.get("date") || "", [searchParams])
  const groupeLocalCptFilter = useMemo(() => searchParams.get("groupe_local_cpt") || "", [searchParams])

  // Filtrer les articles lorsque les paramètres de recherche changent
  useEffect(() => {
    let isMounted = true
    console.log("Filtrage avec paramètres:", { searchQuery, dateFilter, groupeLocalCptFilter })

    const fetchFilteredPosts = async () => {
      try {
        setLoading(true)

        // Si un filtre de groupe local est actif, récupérer les articles avec ce filtre
        if (groupeLocalCptFilter) {
          try {
            const posts = await fetchPostsByCategoryAndGroupeLocalCPT(categoryId, Number.parseInt(groupeLocalCptFilter))

            if (!isMounted) return

            // Appliquer les autres filtres aux articles récupérés
            let filtered = [...posts]

            // Appliquer le filtre de recherche
            if (searchQuery) {
              filtered = filtered.filter(
                (post) =>
                  post.title.rendered.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  post.content.rendered.toLowerCase().includes(searchQuery.toLowerCase()),
              )
            }

            // Appliquer le filtre de date
            if (dateFilter) {
              if (isEventCategory) {
                // Pour les catégories d'événements, filtrer par mois/année de la date d'événement
                filtered = filtered.filter((post) => {
                  if (!post.acf?.date_de_levenement) {
                    return false
                  }

                  try {
                    // Format attendu pour date_de_levenement: DD/MM/YYYY
                    const dateParts = post.acf.date_de_levenement.split("/")
                    if (dateParts && dateParts.length === 3) {
                      const month = dateParts[1]
                      const year = dateParts[2]
                      const monthYearFormat = `${month}/${year}`

                      // Comparer avec le filtre de date (MM/YYYY)
                      return monthYearFormat === dateFilter
                    }
                    return false
                  } catch (error) {
                    console.error(`Erreur lors du filtrage par date pour l'article ${post.slug}:`, error)
                    return false
                  }
                })
              } else {
                // Pour les autres catégories, filtrer par date de publication
                filtered = filtered.filter((post) => {
                  try {
                    const postDate = new Date(post.date)
                    const postDateStr = `${postDate.getMonth() + 1}/${postDate.getFullYear()}`
                    return postDateStr === dateFilter
                  } catch (error) {
                    return false
                  }
                })
              }
            }

            if (isMounted) {
              setFilteredPosts(filtered)
            }
          } catch (error) {
            console.error("Error fetching filtered posts:", error)
            if (isMounted) {
              setFilteredPosts([]) // Set empty array on error
            }
          }
        } else {
          // Si aucun filtre de groupe local n'est actif, filtrer les articles initiaux
          let filtered = [...initialPosts]

          // Appliquer le filtre de recherche
          if (searchQuery) {
            filtered = filtered.filter(
              (post) =>
                post.title.rendered.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content.rendered.toLowerCase().includes(searchQuery.toLowerCase()),
            )
          }

          // Appliquer le filtre de date
          if (dateFilter) {
            if (isEventCategory) {
              // Pour les catégories d'événements, filtrer par mois/année de la date d'événement
              filtered = filtered.filter((post) => {
                if (!post.acf?.date_de_levenement) {
                  return false
                }

                try {
                  // Format attendu pour date_de_levenement: YYYYMMDD
                  // ou DD/MM/YYYY
                  
                  const dateParts = post.acf.date_de_levenement.split("/")
                  // Vérifier si le format est YYYYMMDD
                  if (post.acf.date_de_levenement.length === 8) {
                    const year = post.acf.date_de_levenement.slice(0, 4)
                    const month = post.acf.date_de_levenement.slice(4, 6)
                    const monthYearFormat = `${month}/${year}`

                    // Comparer avec le filtre de date (MM/YYYY)
                    return monthYearFormat === dateFilter
                  }
                  if (dateParts && dateParts.length === 3) {
                    const month = dateParts[1]
                    const year = dateParts[2]
                    const monthYearFormat = `${month}/${year}`

                    // Comparer avec le filtre de date (MM/YYYY)
                    return monthYearFormat === dateFilter
                  }
                  return false
                } catch (error) {
                  console.error(`Erreur lors du filtrage par date pour l'article ${post.slug}:`, error)
                  return false
                }
              })
            } else {
              // Pour les autres catégories, filtrer par date de publication
              filtered = filtered.filter((post) => {
                try {
                  const postDate = new Date(post.date)
                  const postDateStr = `${postDate.getMonth() + 1}/${postDate.getFullYear()}`
                  return postDateStr === dateFilter
                } catch (error) {
                  return false
                }
              })
            }
          }

          // Filtrer par groupe_local_cpt si présent dans les champs ACF
          if (groupeLocalCptFilter) {
            const groupeLocalCptId = Number.parseInt(groupeLocalCptFilter)
            filtered = filtered.filter((post) => post.acf?.groupe_local_tax === groupeLocalCptId)
          }

          if (isMounted) {
            setFilteredPosts(filtered)
          }
        }
      } catch (error) {
        console.error("Error in fetchFilteredPosts:", error)
        if (isMounted) {
          setFilteredPosts([]) // Set empty array on error
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchFilteredPosts()

    return () => {
      isMounted = false
    }
  }, [searchQuery, dateFilter, groupeLocalCptFilter, initialPosts, categoryId, isEventCategory])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Chargement...
          </span>
        </div>
        <p className="mt-2 text-muted-foreground">Filtrage des articles...</p>
      </div>
    )
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Aucun article ne correspond à votre recherche</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPosts.map((post) => (
        <ArticleCard key={post.slug} post={post} />
      ))}
    </div>
  )
}
