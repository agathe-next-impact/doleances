"use client"

import type { Post } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { fetchGroupeLocalById } from "@/lib/api"
import DateFormat, { TimeFormat } from "@/components/date-format"

interface ArticleCardProps {
  post: Post
}

export default function ArticleCard({ post }: ArticleCardProps) {
  const [groupeLocalName, setGroupeLocalName] = useState<string | null>(null)
  const [groupeLocalSlug, setGroupeLocalSlug] = useState<string | null>(null)
  const [isLoadingGroupe, setIsLoadingGroupe] = useState(false)

  // Get featured image if available
  const featuredImage = (() => {
    try {
      return (
        post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
        `/img/doleance_couv.png`
      )
    } catch (error) {
      return `/img/doleance_couv.png`
    }
  })()

  // Récupérer l'ID du groupe local depuis les champs ACF (utiliser tax_groupe_local ou groupe_local_tax)
  const groupeLocalId = post.acf?.tax_groupe_local || post.acf?.groupe_local_tax || null

  // Charger le nom du groupe local si on a un ID
  useEffect(() => {
    const loadGroupeLocalName = async () => {
      if (groupeLocalId) {
        try {
          setIsLoadingGroupe(true)
          const groupe = await fetchGroupeLocalById(groupeLocalId)
          if (groupe) {
            setGroupeLocalName(groupe.title.rendered)
            setGroupeLocalSlug(groupe.slug)
          }
        } catch (error) {
          console.error(`Erreur lors du chargement du groupe local ${groupeLocalId}:`, error)
        } finally {
          setIsLoadingGroupe(false)
        }
      }
    }

    loadGroupeLocalName()
  }, [groupeLocalId])


  // Get all ACF fields except groupe_local which we handle separately
  const acfFields = []
  try {
    if (post.acf) {
      for (const [key, value] of Object.entries(post.acf)) {
        if (
          key !== "groupe_local" &&
          key !== "groupe_local_tax" &&
          key !== "tax_groupe_local" &&
          value !== null &&
          value !== undefined &&
          value !== ""
        ) {
          acfFields.push([key, value])
        }
      }
    }
  } catch (error) {
    console.error("Error extracting ACF fields:", error)
  }

  // Check if this post is an event
  const isEvent = post.acf?.date_de_levenement || post.acf?.heure_de_levenement || post.acf?.lieu_de_levenement

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

  return (
    <Card className="h-full flex flex-col"> 
      <div className="relative h-48 w-full">
        <Image
          src={featuredImage || "/img/doleance_couv.png"}
          alt=""
          fill
          className="object-cover rounded-t-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          <Link href={`/article/${post.slug}`} className="hover:text-primary">
            <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
                {/* Affichage du groupe local avec lien */}
        {groupeLocalSlug && (
          <div className="flex items-start gap-1.5 my-4">
            <div>
              {isLoadingGroupe ? (
                <span className="text-muted-foreground">Chargement du groupe local...</span>
              ) : (
                <Badge variant="secondary">
                <Link href={`/groupe-local/${groupeLocalSlug}`}>
                  {groupeLocalName || "Voir le groupe local"}
                </Link>
                </Badge>
              )}
            </div>
          </div>
        )}
        {isEvent && (
          <div className="mb-3 space-y-1.5 text-sm">
            {post.acf?.date_de_levenement && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <DateFormat dateStr={post.acf.date_de_levenement}/>
              </div>
            )}
            {post.acf?.heure_de_levenement && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span><TimeFormat timeStr={post.acf.heure_de_levenement} /></span>
              </div>
            )}
            <div className="flex items-start gap-1.5">
              <MapPin className="h-4 w-4 text-primary mt-0.5" />
              <div>
                {eventLocationName && <div className="font-medium text-primary">{eventLocationName}</div>}
                {eventAddress && <div className="text-xs text-muted-foreground line-clamp-2">{eventAddress}</div>}
              </div>
            </div>
          </div>
        )}

        <div
          className="text-sm text-muted-foreground line-clamp-3 mb-4"
          dangerouslySetInnerHTML={{ __html: post.acf?.descriptif || post.excerpt.rendered }}
        />

        {acfFields.length > 0 &&
          !isEvent && ( // N'affiche pas les autres champs ACF si c'est un événement (déjà affiché au-dessus)
            <div className="mt-2 space-y-2">
              {acfFields
                .filter(
                  ([key]) =>
                    ![
                      "date_de_levenement",
                      'descriptif',
                      "heure_evenement",
                      "adresse_evenement",
                      "adress",
                      "adresse",
                      "latitude",
                      "longitude",
                      "lieu_de_levenement", // Exclure le champ imbriqué
                    ].includes(key),
                )
                .slice(0, 3) // Limite à 3 champs pour ne pas surcharger la carte
                .map(([key, value]) => {
                  // Vérifier si la valeur est un objet (comme lieu_de_levenement)
                  if (typeof value === "object" && value !== null) {
                    return null // Ne pas afficher les objets complexes
                  }

                  return (
                    <div key={key} className="text-xs">
                      <span className="font-regular uppercase text-muted-foreground">{key.replace(/_/g, " ")}: </span>
                      <span >
                        {typeof value === "string" && value.startsWith("http") ? (
                          <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary"
                          >
                          Voir en ligne
                          </a>
                        ) : (
                          String(value)
                          .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
                          .substring(0, 50) + (String(value).length > 50 ? "..." : "")
                        )}
                      </span>
                    </div>
                  )
                })
                .filter(Boolean)}{" "}
              {/* Filtrer les valeurs null */}
            </div>
          )}
      </CardContent>
      {/* Affichage du footer si la carte n'est pas un événement */}
      {!isEvent && (
      <CardFooter className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
        <div>{formatDate(post.date)}</div>
      </CardFooter>
      )}
    </Card>
  )
}
