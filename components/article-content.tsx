"use client"

import { useState, useEffect } from "react"
import type { Post, GroupeLocalPost } from "@/lib/api"
import { fetchGroupeLocalById } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Calendar, Users } from "lucide-react"
import StaticMap from "@/components/static-map"
import DateFormat, { TimeFormat } from "@/components/date-format"

interface ArticleContentProps {
  post: Post
}

export default function ArticleContent({ post }: ArticleContentProps) {
  const [groupeLocalPost, setGroupeLocalPost] = useState<GroupeLocalPost | null>(null)
  const [isLoadingGroupe, setIsLoadingGroupe] = useState(false)

  // Get featured image if available
  const featuredImage = (() => {
    try {
      return post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
    } catch (error) {
      console.error("Error getting featured image:", error)
      return null
    }
  })()

  // Get all ACF fields and extract date/time related fields
  const acfFields = []
  const dateTimeFields = []

  try {
    if (post.acf) {
      for (const [key, value] of Object.entries(post.acf)) {
        if (value !== null && value !== undefined && value !== "") {
          // Ajouter tous les champs à acfFields
          acfFields.push([key, value])

          // Extraire les champs liés à la date et l'h.push([key, value])

          // Extraire les champs liés à la date et l'heure pour l'en-tête
          if (
            key.toLowerCase().includes("date") ||
            key.toLowerCase().includes("heure") ||
            key.toLowerCase().includes("time") ||
            key.toLowerCase().includes("jour") ||
            key.toLowerCase().includes("day")
          ) {
            dateTimeFields.push([key, value])
          }
        }
      }

      // Trier les champs de date et heure pour un affichage cohérent
      dateTimeFields.sort((a, b) => {
        // Mettre les dates avant les heures
        if (a[0].includes("date") && !b[0].includes("date")) return -1
        if (!a[0].includes("date") && b[0].includes("date")) return 1
        return a[0].localeCompare(b[0])
      })
    }
  } catch (error) {
    console.error("Error extracting ACF fields:", error)
  }

  // Récupérer l'ID du groupe local depuis les champs ACF (utiliser tax_groupe_local ou groupe_local_tax)
  const groupeLocalId = post.acf?.tax_groupe_local || post.acf?.groupe_local_tax || null

  // Charger le CPT groupe_local correspondant
  useEffect(() => {
    const loadGroupeLocalPost = async () => {
      // Vérifier si nous avons un ID de CPT groupe_local dans les champs ACF
      if (groupeLocalId) {
        try {
          setIsLoadingGroupe(true)
          console.log(`Chargement du groupe local avec l'ID ${groupeLocalId} depuis les champs ACF`)
          const groupe = await fetchGroupeLocalById(groupeLocalId)
          if (groupe) {
            console.log(`Groupe local trouvé: ${groupe.title.rendered}`)
            setGroupeLocalPost(groupe)
          } else {
            console.log(`Aucun groupe local trouvé avec l'ID ${groupeLocalId}`)
          }
        } catch (error) {
          console.error("Error loading groupe local post from ACF:", error)
        } finally {
          setIsLoadingGroupe(false)
        }
      }
    }

    loadGroupeLocalPost()
  }, [groupeLocalId])

  // Vérifier si cet article est un événement
  const isEvent =
    post.acf?.date_de_levenement ||
    post.acf?.heure_evenement ||
    post.acf?.lieu_de_levenement ||
    dateTimeFields.length > 0

  // Récupérer l'adresse du lieu de l'événement (structure imbriquée)
  const eventAddress = (() => {
    try {
      // Vérifier d'abord la structure imbriquée lieu_de_levenement.adress
      if (post.acf?.lieu_de_levenement?.adress) {
        return post.acf.lieu_de_levenement.adress
      }

      // Vérifier si lieu_de_levenement est un objet avec une propriété address
      if (post.acf?.lieu_de_levenement?.address) {
        return post.acf.lieu_de_levenement.address
      }

      // Fallbacks pour les autres formats possibles
      return post.acf?.adress || post.acf?.adresse || post.acf?.adresse_evenement
    } catch (error) {
      console.error("Error extracting event address:", error)
      return null
    }
  })()

  // Récupérer le nom du lieu de l'événement
  const eventLocationName = (() => {
    try {
      // Si lieu_de_levenement est un objet avec une propriété name, utiliser celle-ci
      if (typeof post.acf?.lieu_de_levenement === "object" && post.acf?.lieu_de_levenement?.name) {
        return post.acf.lieu_de_levenement.name
      }

      // Si lieu_de_levenement est une chaîne, l'utiliser directement
      if (typeof post.acf?.lieu_de_levenement === "string") {
        return post.acf.lieu_de_levenement
      }

      // Fallback au champ lieu_evenement
      return post.acf?.lieu_evenement || null
    } catch (error) {
      console.error("Error extracting event location name:", error)
      return null
    }
  })()

console.log(post.acf?.heure_evenement)

  // Récupérer la ville du lieu de l'événement
  const eventCity = (() => {
    try {
      if (typeof post.acf?.lieu_de_levenement === "object" && post.acf?.lieu_de_levenement?.city) {
        return post.acf.lieu_de_levenement.city
      }
      return null
    } catch (error) {
      console.error("Error extracting event city:", error)
      return null
    }
  })()

  return (
    <div className="px-4 py-8 mx-auto">
      {/* Nouvelle mise en page pour les événements avec image à gauche (50%) et détails à droite (50%) */}
      {isEvent ? (
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-6"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />

          <div className="grid md:grid-cols-2 gap-6">
            {/* Colonne de gauche: Image (50%) */}
            <div className="relative h-full min-h-[300px] rounded-lg overflow-hidden">
              <Image
                src={
                  featuredImage ||
                  `/placeholder.svg?height=600&width=600&query=Event ${encodeURIComponent(post.title.rendered) || "/placeholder.svg"}`
                }
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 40vw, 50vw"
              />
            </div>

            {/* Colonne de droite: Détails de l'événement (50%) */}
            <div className="bg-muted/30 rounded-lg p-6 flex flex-col space-y-6">
              {/* Section Date et Heure */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Date et heure</h3>
                </div>

                <div className="p-4 bg-muted/50 rounded-md">
                    <>
                      {post.acf?.date_de_levenement ? (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Date :</span>
                          {post.acf?.date_de_levenement ? (
                            <DateFormat dateStr={post.acf.date_de_levenement} />
                          ) : (
                            <span>Non précisée</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Date :</span>
                          <span>Non précisée</span>
                        </div>
                      )}
                      {post.acf?.heure_evenement && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Heure:</span>
                          <span><TimeFormat timeStr={post.acf.heure_evenement} /></span>
                        </div>
                      )}
                    </>
                </div>
              </div>

              {/* Section Lieu */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Lieu</h3>
                </div>

                {/* Nom du lieu mis en évidence */}
                {eventLocationName ? (
                  <div className="p-3 bg-primary/10 border-l-4 border-primary rounded-r-md">
                    <div className="text-xl font-medium text-primary">
                      {eventLocationName}
                      {eventCity && <span className="ml-2 text-sm text-muted-foreground">({eventCity})</span>}
                    </div>

                    {/* Adresse */}
                    {eventAddress && (
                      <div className="mt-2 text-muted-foreground whitespace-pre-line">{eventAddress}</div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-muted/50 rounded-md text-muted-foreground">
                    {eventAddress ? eventAddress : "Lieu non précisé"}
                  </div>
                )}
              </div>

              {/* Groupe local avec lien */}
              {groupeLocalPost && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Groupe local</h3>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-md">
                    <Link
                      href={`/groupe-local/${groupeLocalPost.slug}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {groupeLocalPost.title.rendered}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Affichage standard pour les articles non-événements
        <div className="flex">
          {featuredImage && (
            <div className="relative h-64 md:h-96 w-1/3 mb-8">
              <Image
                src={featuredImage || "/placeholder.svg"}
                alt=""
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 40vw, (max-width: 1200px) 768px, 1024px"
              />
            </div>
          )}
          <div className="w-2/3 px-12 py-8 mx-auto mb-8">
            <h1
              className="text-3xl md:text-4xl font-bold mb-4"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-6">
              <div><DateFormat dateStr={post.date} /></div>
              <div><TimeFormat dateStr={post.time} /></div>

              {/* Groupe local avec lien */}
              {groupeLocalPost && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Link href={`/groupe-local/${groupeLocalPost.slug}`} className="text-primary hover:underline">
                    {groupeLocalPost.title.rendered}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <article className="prose prose-lg max-w-none mb-8">
        <div dangerouslySetInnerHTML={{ __html: post.acf?.descriptif || "" }} />
      </article>

      {acfFields.length > 0 && !isEvent && (
        <div className="mb-8 p-4 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Informations complémentaires</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {
              acfFields
                .filter(
                  ([key]) =>
                    ![
                      "date_de_levenement",
                      "heure_evenement",
                      "lieu_evenement",
                      "adresse_evenement",
                      "adress",
                      "adresse",
                      "latitude",
                      "longitude",
                      "lieu_de_levenement", // Exclure le champ imbriqué
                      "groupe_local",
                      "groupe_local_tax", // Exclure les champs de groupe local
                      "tax_groupe_local", // Exclure le nouveau champ de groupe local
                    ].includes(key),
                )
                .map(([key, value]) => {
                  // Vérifier si la valeur est un objet (comme lieu_de_levenement)
                  if (typeof value === "object" && value !== null) {
                    return null // Ne pas afficher les objets complexes
                  }

                  return (
                    <div key={key} className="space-y-1">
                      <dt className="text-sm font-medium text-muted-foreground capitalize">{key.replace(/_/g, " ")}</dt>
                      <dd className="text-sm">
                        {typeof value === "string" && value.startsWith("http") ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {value}
                          </a>
                        ) : (
                          String(value)
                        )}
                      </dd>
                    </div>
                  )
                })
                .filter(Boolean) // Filtrer les valeurs null
            }
          </dl>
        </div>
      )}

      {isEvent && (post.acf?.lieu_de_levenement || eventAddress) && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Localisation</h2>
          <StaticMap
            address={eventAddress}
            latitude={
              typeof post.acf?.latitude === "number"
                ? post.acf.latitude
                : typeof post.acf?.latitude === "string"
                  ? Number.parseFloat(post.acf.latitude)
                  : typeof post.acf?.lieu_de_levenement?.lat === "number"
                    ? post.acf.lieu_de_levenement.lat
                    : undefined
            }
            longitude={
              typeof post.acf?.longitude === "number"
                ? post.acf.longitude
                : typeof post.acf?.longitude === "string"
                  ? Number.parseFloat(post.acf.longitude)
                  : typeof post.acf?.lieu_de_levenement?.lng === "number"
                    ? post.acf.lieu_de_levenement.lng
                    : undefined
            }
            height="400px"
            apiKey=""
          />
        </div>
      )}
    </div>
  )
}