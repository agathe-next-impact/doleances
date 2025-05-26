"use client"

import { useState, useEffect } from "react"
import type { Post, GroupeLocalPost } from "@/lib/api"
import { fetchGroupeLocalById, fetchAttachmentById } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Users } from "lucide-react"
import StaticMap from "@/components/map/static-map"
import DateFormat, { TimeFormat } from "@/components/date-format"
import ShareSocial from "@/components/ui/share-social"

interface ArticleContentProps {
  post: Post
}

export default function ArticleContent({ post }: ArticleContentProps) {
  const [groupeLocalPost, setGroupeLocalPost] = useState<GroupeLocalPost | null>(null)
  const [isLoadingGroupe, setIsLoadingGroupe] = useState(false)
  const [attachedFile, setAttachedFile] = useState<string | null>(null);


  // retrouve le nom et le slug de la catégorie de l'article
  const categoryName = post._embedded?.["wp:term"]?.[0]?.[0]?.name
  const categorySlug = post._embedded?.["wp:term"]?.[0]?.[0]?.slug

  useEffect(() => {
  const loadAttachedFile = async () => {
    try {
      const fileId = Number(post.acf?.fichier_de_la_publication);
      if (!fileId) return;
      const attachedMedia = await fetchAttachmentById(fileId);
      setAttachedFile(attachedMedia?.source_url || null);
    } catch (error) {
      console.error("Error getting attached file:", error);
    }
  };

  loadAttachedFile();
}, [post.acf?.fichier_de_la_publication]);


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

console.log("ACF Fields:", acfFields)

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

  const isEvent = Boolean(
    post.acf?.date_de_levenement ||
    post.acf?.heure_de_levenement ||
    post.acf?.lieu_de_levenement
  );

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
    <div className="lg:py-8 py-0 mx-auto">
      {/* Nouvelle mise en page pour les événements avec image à gauche (50%) et détails à droite (50%) */}
      {isEvent ? (
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">
            <Link href={`/category/${categorySlug}`}>
                {categoryName}
            </Link>
          </Badge>
          <div className="mb-12 text-center">
            <h1
              className="w-full mb-4 text-center text-3xl font-light tracking-tight md:text-4xl"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
          </div>
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
                className="object-cover border-2 border-muted rounded-lg"
                sizes="(max-width: 768px) 40vw, 50vw"
              />
            </div>

            {/* Colonne de droite: Détails de l'événement (50%) */}
            <div className="bg-white border shadow-sm rounded-lg p-6 flex flex-col space-y-6">
              {/* Section Date et Heure */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h3 className="uppercase text-muted-foreground">Date et heure</h3>
                </div>

                <div className="p-4 pt-0">
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
                      {post.acf?.heure_de_levenement && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Heure:</span>
                          <span><TimeFormat timeStr={post.acf.heure_de_levenement} /></span>
                        </div>
                      )}
                    </>
                </div>
              </div>

              {/* Section Lieu */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <h3 className="uppercase text-muted-foreground">Lieu</h3>
                </div>

                {/* Nom du lieu mis en évidence */}
                {eventLocationName ? (
                  <div className="bg-primary/10 border-&-2 border-primary rounded-r-md">

                    {/* Adresse */}
                    {eventAddress && (
                      <div className="p-4 pt-0 whitespace-pre-line">{eventAddress}</div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-md text-muted-foreground">
                    {eventAddress ? eventAddress : "Lieu non précisé"}
                  </div>
                )}
              </div>

              {/* Groupe local avec lien */}
              {groupeLocalPost && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <h3 className="uppercase text-muted-foreground">Groupe local</h3>
                  </div>

                  <div className="p-4 pt-0">
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
        <div className="flex lg:flex-row flex-col lg:gap-8">
          {/* Colonne de gauche: Image (33%) */}
          <div className="w-full lg:w-1/3 py-4 mx-auto">

                <div className="relative lg:h-64 md:h-48 h-36 mb-8">
                  <Image
                    src={featuredImage || "/img/placeholder.png"}
                    alt=""
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 40vw, (max-width: 1200px) 768px, 1024px"
                  />
                </div>
          </div>
          {/* Colonne de droite: Détails de l'article (67%) */}
          <div className="lg:w-2/3 w-full md:px-4 lg:py-8 p-4">
                <div className="px-8 lg:pt-8 pt-4 md:mb-8 mb-0 bg-white border shadow-sm rounded-lg">
                  <Badge variant="secondary" className="mb-4">
                  <Link href={`/category/${categorySlug}`}>
                      {categoryName}
                  </Link>
                </Badge>
                  <h1
                    className="text-3xl md:text-4xl mb-4"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-6">
                    <div><DateFormat dateStr={post.date} /></div>

                    
                    {post.acf?.region_etats_generaux_communaux && (
                      <>
                        <div className="text-sm font-medium text-muted-foreground capitalize"> - </div>
                          <div className="text-primary hover:underline">
                            {post.acf.region_etats_generaux_communaux}
                          </div>
                      </>
                    )}

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
                {acfFields.length > 0 && !isEvent && (
                  acfFields.some(([key]) =>
                  ["auteur", "lien_de_la_publication", "date_de_la_publication", "auteur_et_media", "lien_vers_larticle"].includes(key)
                  ) && (
                  <>
                  <div className="md:ml-2 ml-0 md:mt-0 mt-8">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <>
                      <div className="space-y-1">

                        {attachedFile && (
                          <>
                            <dt className="text-sm font-medium text-muted-foreground capitalize">Fichier de la publication</dt>
                              <dd className="text-sm">
                            <a
                              href={attachedFile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Télécharger
                            </a>
                            </dd>
                          </>
                        )}
                      
                        {post.acf?.auteur && (
                          <>
                            <dt className="text-sm font-medium text-muted-foreground capitalize">Auteur</dt>
                            <dd className="text-sm">
                              <div className="text-primary hover:underline">
                                {post.acf.auteur}
                              </div>
                            </dd>
                          </>
                        )}
                        {post.acf?.lien_de_la_publication && (
                          <>
                            <dt className="text-sm font-medium text-muted-foreground capitalize">Lien vers la publication</dt>
                            <dd className="text-sm">
                              <a
                                href={post.acf.lien_de_la_publication}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {post.acf.lien_de_la_publication}
                              </a>
                            </dd>
                          </>
                        )}
                        {post.acf?.date_de_la_publication && (
                          <>
                            <dt className="text-sm font-medium text-muted-foreground capitalize">Date de la publication</dt>
                            <dd className="text-sm">
                              <div className="text-primary hover:underline">
                                <DateFormat dateStr={post.acf.date_de_la_publication} />
                              </div>
                            </dd>
                          </>
                        )}
                        {post.acf?.auteur_et_media && (
                          <>
                            <dt className="text-sm font-medium text-muted-foreground capitalize">Média</dt>
                            <dd className="text-sm">
                              <div>
                                {post.acf.auteur_et_media}
                              </div>
                            </dd>
                          </>
                        )}
                        {post.acf?.lien_vers_larticle && (
                          <>
                            <dt className="text-sm font-medium text-muted-foreground capitalize">Lien vers le reportage</dt>
                            <dd className="text-sm">
                              <a
                                href={post.acf.lien_vers_larticle}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {post.acf.lien_vers_larticle}
                              </a>
                            </dd>
                          </>
                        )}
                      </div>
                    </>
                  </dl>

                </div>
                  </>
                  )
                )}
          </div>
        </div>
      )}

      {/* Affichage du contenu principal de l'article */}


          {post.acf?.descriptif && (
            <div className="gap-2 py-4">
              <div className="text-sm text-muted-foreground">
                <div dangerouslySetInnerHTML={{ __html: post.acf.descriptif }} />
              </div>
            </div>
        )}

        {post?.content.rendered && (
            <article className="gap-2 mt-4">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    post?.content.rendered ??
                    "",
                }}
              />
            </article>
        )}  

          {post.acf?.contenu_de_larticle && (
            <article className="gap-2 mt-4">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    post.acf?.contenu_de_larticle ??
                    "",
                }}
              />
            </article>
        )}  
          {post.acf?.contenu_de_la_publication && (
            <article className="gap-2 mt-8">
              <div
              dangerouslySetInnerHTML={{
                __html: post.acf?.contenu_de_la_publication ?? "",
              }}
              />
            </article>
        )}  

      {isEvent && (post.acf?.lieu_de_levenement || eventAddress) && (
        <div className="my-8">
          <h2 className="text-xl font-sansserif font-semibold mb-4">Localisation</h2>
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