import { fetchGroupeLocalBySlug, fetchPostsByGroupeLocalTax, fetchCategory } from "@/lib/api"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { MapPin, Mail, Phone, Globe, Calendar, Clock, Bookmark, User } from "lucide-react"
import StaticMap from "@/components/map/static-map"
import { Badge } from "@/components/ui/badge"
import type { Post, Category } from "@/lib/api"

// Interface pour les articles regroupés par catégorie
interface PostsByCategory {
  category: Category
  posts: Post[]
}

export default async function GroupeLocalPage({ params }: { params: { slug: string } }) {
  try {
    const groupeLocal = await fetchGroupeLocalBySlug(params.slug)

    if (!groupeLocal) {
      console.log(`Groupe local avec l'ID ${params.slug} non trouvé`)
      notFound()
    }

    // Vérifier que les propriétés nécessaires existent
    if (!groupeLocal.title || typeof groupeLocal.title !== "object") {
      console.error(`Le groupe local ${params.slug} a une structure de titre invalide:`, groupeLocal.title)
      groupeLocal.title = { rendered: `Groupe Local ${params.slug}` }
    }

    console.log("Groupe local récupéré:", groupeLocal)

    // Récupérer les articles liés à ce groupe local via le champ tax_groupe_local
    const relatedPosts = await fetchPostsByGroupeLocalTax(groupeLocal.id)
    console.log(`Nombre d'articles associés au groupe local ${params.slug}: ${relatedPosts.length}`)

    // Récupérer l'image du groupe local si disponible
    const featuredImage = (() => {
      try {
        return (
          groupeLocal._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
          `/placeholder.svg?height=400&width=800&query=Groupe local ${encodeURIComponent(groupeLocal.title.rendered || `Groupe Local ${params.slug}`)}`
        )
      } catch (error) {
        return `/placeholder.svg?height=400&width=800&query=Groupe local`
      }
    })()

    // Extraire les coordonnées géographiques si disponibles
    const coordinates = (() => {
      try {
        if (groupeLocal.acf?.latitude && groupeLocal.acf?.longitude) {
          return {
            lat:
              typeof groupeLocal.acf.latitude === "string"
                ? Number.parseFloat(groupeLocal.acf.latitude)
                : groupeLocal.acf.latitude,
            lng:
              typeof groupeLocal.acf.longitude === "string"
                ? Number.parseFloat(groupeLocal.acf.longitude)
                : groupeLocal.acf.longitude,
          }
        }

        // Vérifier si les coordonnées sont dans un champ imbriqué
        if (groupeLocal.acf?.localisation?.lat && groupeLocal.acf?.localisation?.lng) {
          return {
            lat: groupeLocal.acf.localisation.lat,
            lng: groupeLocal.acf.localisation.lng,
          }
        }

        return null
      } catch (error) {
        console.error("Erreur lors de l'extraction des coordonnées:", error)
        return null
      }
    })()

    // Extraire l'adresse si disponible
    const address = (() => {
      try {
        // Vérifier différentes possibilités de structure pour l'adresse
        if (groupeLocal.acf?.adresse) {
          return groupeLocal.acf.adresse
        }

        if (groupeLocal.acf?.adress) {
          return groupeLocal.acf.adress
        }

        if (groupeLocal.acf?.localisation?.address) {
          return groupeLocal.acf.localisation.address
        }

        return null
      } catch (error) {
        console.error("Erreur lors de l'extraction de l'adresse:", error)
        return null
      }
    })()

    // Extraire les informations de contact
    const contact = {
      personne: groupeLocal.acf?.personne_contact || null,
      email: groupeLocal.acf?.email || null,
      telephone: groupeLocal.acf?.telephone || groupeLocal.acf?.phone || null,
      site_web: groupeLocal.acf?.site_web || groupeLocal.acf?.website || null,
    }

    // Séparer les articles en événements et articles standard
    const eventPosts = relatedPosts.filter(
      (post) => post.acf?.date_de_levenement || post.acf?.heure_evenement || post.acf?.lieu_de_levenement,
    )
    const standardPosts = relatedPosts.filter(
      (post) => !(post.acf?.date_evenement || post.acf?.heure_evenement || post.acf?.lieu_de_levenement),
    )

    // Regrouper les articles standard par catégorie
    const postsByCategory: PostsByCategory[] = []
    const categoriesMap = new Map<number, { category: Category; posts: Post[] }>()

    // Parcourir tous les articles standard
    for (const post of standardPosts) {
      // Récupérer les catégories du post
      const postCategories: Category[] = []

      // Vérifier si les catégories sont disponibles dans _embedded
      if (post._embedded?.["wp:term"]?.[0]) {
        postCategories.push(...post._embedded["wp:term"][0])
      }
      // Sinon, utiliser les IDs de catégorie pour récupérer les détails
      else if (post.categories && Array.isArray(post.categories)) {
        for (const categoryId of post.categories) {
          try {
            const category = await fetchCategory(categoryId)
            postCategories.push(category)
          } catch (error) {
            console.error(`Erreur lors de la récupération de la catégorie ${categoryId}:`, error)
          }
        }
      }

      // Ajouter le post à chaque catégorie
      for (const category of postCategories) {
        if (!categoriesMap.has(category.id)) {
          categoriesMap.set(category.id, { category, posts: [] })
        }
        categoriesMap.get(category.id)?.posts.push(post)
      }

      // Si le post n'a pas de catégorie, l'ajouter à une catégorie "Non classé"
      if (postCategories.length === 0) {
        const uncategorizedId = 1 // ID standard pour "Non classé" dans WordPress
        if (!categoriesMap.has(uncategorizedId)) {
          categoriesMap.set(uncategorizedId, {
            category: { id: uncategorizedId, name: "Non classé", description: "", count: 0, link: "" },
            posts: [],
          })
        }
        categoriesMap.get(uncategorizedId)?.posts.push(post)
      }
    }

    // Convertir la Map en tableau
    categoriesMap.forEach((value) => {
      postsByCategory.push(value)
    })

    // Trier les catégories par nombre d'articles (décroissant)
    postsByCategory.sort((a, b) => b.posts.length - a.posts.length)

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="px-4 py-8 mx-auto">
          {/* En-tête du groupe local avec image de fond et overlay */}
          <div className="flex relative rounded-lg overflow-hidden mb-8">

            {/* Titre et description superposés sur l'image */}
            <div className="w-full inset-0 flex flex-col justify-end flex-wrap p-6">
              <Badge variant="outline" className="mb-8 w-max py-2 px-4 self-end">
                <Link href="/cartographie">Tous les groupes locaux</Link>
              </Badge>
              
              <div className="uppercase font-regular text-muted-foreground mb-2">
                Groupe local
              </div>
              <h1
                className="text-3xl md:text-4xl mb-2"
                dangerouslySetInnerHTML={{ __html: groupeLocal.title?.rendered || `Groupe Local ${params.slug}` }}
              />
              {groupeLocal.acf?.departement && (
                <div className="text-sm md:text-base max-w-2xl">{groupeLocal?.acf.departement}</div>
              )}
            </div>
          </div>

          {/* Informations de contact et localisation */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Colonne de gauche: Informations de contact */}
            <div className="bg-muted/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Informations de contact</h2>
              
              <div className="space-y-4">

                {contact.personne && (
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <a href={`mailto:${contact.personne}`} className="text-primary hover:underline">
                      {contact.personne}
                    </a>
                  </div>
                )}

                {contact.email && (
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                      {contact.email}
                    </a>
                  </div>
                )}

                {contact.telephone && (
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <a href={`tel:${contact.telephone}`} className="text-primary hover:underline">
                      {contact.telephone}
                    </a>
                  </div>
                )}

                {contact.site_web && (
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <a
                      href={contact.site_web.startsWith("http") ? contact.site_web : `https://${contact.site_web}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {contact.site_web}
                    </a>
                  </div>
                )}

                {address && (
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full mt-1">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <span className="whitespace-pre-line">{address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne de droite: Carte */}
            {(coordinates || address) && (
              <div className="rounded-lg overflow-hidden">
                <StaticMap
                  address={address}
                  latitude={coordinates?.lat}
                  longitude={coordinates?.lng}
                  height="100%"
                  width="100%"
                  apiKey=""
                />
              </div>
            )}
          </div>

          {/* Contenu du groupe local */}
          {groupeLocal.content?.rendered && (
            <div className="prose prose-lg max-w-none mb-8 bg-muted/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">À propos de ce groupe local</h2>
              <div dangerouslySetInnerHTML={{ __html: groupeLocal.content.rendered }} />
            </div>
          )}

          {/* Statistiques des articles
          {relatedPosts.length > 0 && (
            <div className="mb-8 bg-muted/20 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Articles associés</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-background p-4 rounded-lg">
                  <div className="text-3xl font-bold text-primary">{eventPosts.length}</div>
                  <div className="text-sm text-muted-foreground">Événements</div>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <div className="text-3xl font-bold text-primary">{standardPosts.length}</div>
                  <div className="text-sm text-muted-foreground">Articles</div>
                </div>
              </div>
            </div>
          )}*:}

          {/* Événements à venir */}
          {eventPosts.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Événements à venir</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eventPosts.map((post) => {
                  // Récupérer les détails de l'événement
                  const eventDate = post.acf?.date_evenement || null
                  const eventTime = post.acf?.heure_evenement || null
                  const eventLocation = (() => {
                    try {
                      if (typeof post.acf?.lieu_de_levenement === "object" && post.acf?.lieu_de_levenement?.name) {
                        return post.acf.lieu_de_levenement.name
                      }
                      return post.acf?.lieu_evenement || null
                    } catch (error) {
                      return null
                    }
                  })()

                  return (
                    <Card key={post.id} className="h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          <Link href={`/article/${post.slug}`} className="hover:underline">
                            <span dangerouslySetInnerHTML={{ __html: post.title?.rendered || `Article ${post.id}` }} />
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-3">
                        {eventDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>{eventDate}</span>
                          </div>
                        )}
                        {eventTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>{eventTime}</span>
                          </div>
                        )}
                        {eventLocation && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{eventLocation}</span>
                          </div>
                        )}
                        <div
                          className="text-sm text-muted-foreground line-clamp-3 mt-2"
                          dangerouslySetInnerHTML={{ __html: post.excerpt?.rendered || "" }}
                        />
                      </CardContent>
                      <CardFooter className="text-xs text-muted-foreground">
                        <Link href={`/article/${post.slug}`} className="text-primary hover:underline">
                          Voir les détails
                        </Link>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Articles par catégorie */}
          {postsByCategory.length > 0 && (
            <div className="space-y-12 mb-8">
              {postsByCategory.map((categoryGroup) => (
                <div key={categoryGroup.category.id} className="bg-muted/10 p-6 rounded-lg">
                  <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-2xl font-serif font-medium">{categoryGroup.category.name}</h2>
                    <Badge variant="outline" className="ml-2">
                      {categoryGroup.posts.length} article{categoryGroup.posts.length > 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {categoryGroup.category.description && (
                    <div
                      className="text-muted-foreground mb-4"
                      dangerouslySetInnerHTML={{ __html: categoryGroup.category.description }}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categoryGroup.posts.map((post) => (
                      <Card key={post.id} className="h-full flex flex-col">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            <Link href={`/article/${post.slug}`} className="hover:underline">
                              <span
                                dangerouslySetInnerHTML={{ __html: post.title?.rendered || `Article ${post.id}` }}
                              />
                            </Link>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div
                            className="text-sm text-muted-foreground line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: post.excerpt?.rendered || "" }}
                          />
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground">
                          <div className="flex justify-between w-full">
                            <span>{formatDate(post.date)}</span>
                            <Link href={`/article/${post.slug}`} className="text-primary hover:underline">
                              Lire l'article
                            </Link>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-4 text-center">
                    <Link
                      href={`/category/${categoryGroup.category.slug}?groupe_local_cpt=${groupeLocal.id}`}
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Voir tous les articles de cette catégorie
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {relatedPosts.length === 0 && (
            <div className="text-center py-8 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Aucun article associé à ce groupe local pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in GroupeLocalPage:", error)
    notFound()
  }
}
