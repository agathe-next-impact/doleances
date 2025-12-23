import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import CategoryCard from "@/components/actualites/category-card"
import { ArticleCardHome } from "@/components/actualites/article-card-home"
import { fetchLastThreePosts, fetchPageBySlug, fetchRandomVerbatimImage, fetchAttachmentById, fetchGroupesLocaux, fetchCategories } from "@/lib/api"
import YouTubeEmbed from "@/components/ui/video"
import Verbatim from "@/components/verbatim"
import { formatDate } from "@/lib/utils"
import { User2, CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge"
import React from "react";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";
import CardMap from "@/components/map/map-card";
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Les Doléances",
  description: "Wiki du corpus des doléances de 2018/2019",
  openGraph: {
    title: "Les Doléances",
    description: "Wiki du corpus des doléances de 2018/2019",
    images: [
      {
        url: "https://doleances.fr/img/doleances_couv.png",
        alt: "Les Doléances",
      },
    ],
  },
}

export const revalidate = 60;

export default async function Home() {
  const articles = await fetchLastThreePosts()
  const accueil = await fetchPageBySlug("accueil")
  const contribuer = await fetchPageBySlug("contribuer")
  const etatsGeneraux = await fetchPageBySlug("etats-generaux-communaux")
  const cartographie = await fetchPageBySlug("cartographie")

  // Utilisation directe de l'ID de playlist pour l'intégration YouTube
  const playlistId = accueil?.acf?.carte_de_une?.chaine_youtube;

  const images = await fetchRandomVerbatimImage()
  const imagesObjects = await Promise.all(
    (images ?? [])
      .map((image) => image.acf?.image_du_verbatim)
      .map((id) => fetchAttachmentById(Number(id)))
  )

  // Mélanger les images et les retourner en ordre aléatoire en tableau sans index
  const shuffledImages = imagesObjects.sort(() => Math.random() - 0.5)
  const verbatimImages = shuffledImages.map((image) => {

    return {
      title: image?.title?.rendered,
      image: image?.source_url,
      className: `absolute`,
    };
  });

  const locations = await fetchGroupesLocaux()
  // Adapter les données pour correspondre à l'interface attendue par CardMap
  const mapLocations = locations.map((location) => ({
    id: String(location.id),
    slug: location.slug,
    position: {
      lat: parseFloat(location.acf?.localisation.lat),
      lng: parseFloat(location.acf?.localisation.lng),
    },
  }));

  const categories = await fetchCategories()
  categories.sort((a, b) => b.count - a.count)
  const posts = await fetchLastThreePosts()
  const stickyPost = posts[0]


  return (
    <>
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-0 left-0 h-[500px] w-[40vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
    <div className="container mx-auto md:p-8 p-4">
      <div className="mt-8 mb-12 md:mt-8 text-center">
        <h1 className="mb-4 text-4xl font-light tracking-tight md:text-5xl">Les doléances</h1> 
        <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
        Wiki du corpus des doléances de 2018/2019
        </p>
      </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
              {stickyPost && (
                <div className="lg:col-span-2 col-span-3 flex row-span-2 rounded-lg border bg-card shadow-lg overflow-hidden">
                  {stickyPost.featuredImage && (
                  <div className="relative md:block h-full lg:basis-[30%] hidden">
                    <Image
                      src={
                        typeof stickyPost.featuredImage === "string"
                          ? stickyPost.featuredImage
                          : "/img/doleance_couv.png"
                      }
                      alt={
                        typeof stickyPost.title === "string"
                          ? stickyPost.title
                          : stickyPost.title?.rendered || ""
                      }
                      fill
                      className="object-cover object-center "
                    />
                  </div>
                  )}

                  <div className="flex flex-col lg:basis-[70%] basis-full p-6">
                    <h2 className="mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">à la une</h2>
                    <>
                      <h3 className="mb-2 font-medium">
                        <Link href={`/article/${typeof stickyPost.slug === "string" ? stickyPost.slug : stickyPost.slug?.rendered || ""}`}>
                          {stickyPost.title
                                .replace(/&amp;/g, "&")
                                .replace(/&quot;/g, '"')
                                .replace(/&rsquo;/g, "'")
                                .replace(/<[^>]+>/g, "")
                                .replace(/&#8211;/g, "-")
                                .replace(/&#8217;/g, "'")}
                        </Link>
                      </h3>
                      <div
                        className="mb-4 flex-grow text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html:
                            typeof stickyPost.excerpt === "string"
                              ? stickyPost.excerpt
                              : stickyPost.excerpt?.rendered || "",
                        }}
                      />
                      <div className="flex flex-wrap gap-2 pt-2">
                        {stickyPost.categories && stickyPost.categories[0] && (
                          <Badge variant="secondary" className="mx-0">
                            <Link href={`/category/${stickyPost.categoriesSlug[0]}`}>
                              {stickyPost.categories[0]}
                            </Link>
                          </Badge>
                        )}
                      </div>
                      <div className="flex w-full items-center justify-between p-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User2 className="h-3 w-3" />
                          <span>{stickyPost.author}</span>
                        </div>
                        <div className="flex items-center gap-1 pb-2">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{formatDate(stickyPost.date)}</span>
                        </div>
                      </div>
                    </>
                  </div>
                </div>
              )}
            <div className="md:col-span-1 col-span-3 lg:flex flex-col hidden my-8 gap-6">
              <Verbatim />
            </div>


    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[700px] left-0 h-[400px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[1000px] right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
        <div className="col-span-3 grid grid-cols-6 gap-6">
          {categories.map((category) => (
            category.count > 0 && (
            <CategoryCard key={category.id} category={category}/>
            )
          ))}
        </div>

        </div>

{/* Hero section */}
      <section className="h-max mb-12 grid gap-12 grid-cols-6 place-items-start">
        {accueil && (
        <div className="flex flex-col lg:col-span-4 col-span-6 h-full justify-between rounded-lg border bg-card shadow-lg overflow-hidden">
            <div className="flex flex-col p-6">
              <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">
                {accueil?.acf?.carte_de_une?.titre}
              </h2>
                <div
                className="flex flex-col gap-4 mb-4 flex-grow text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: accueil?.acf?.carte_de_une?.texte,
                }}
                />
              <div className="h-max flex flex-col rounded-lg border bg-card shadow-lg overflow-hidden">
                <div className="relative w-full">
                {!playlistId && 
                <YouTubeEmbed videoLink={accueil?.acf?.carte_de_une?.video}/>
                  }               
                {/* Intégration de la playlist YouTube via l'ID du champ texte */}
                {playlistId && (
                  <iframe
                    width="100%"
                    height="315"
                    src={`https://www.youtube.com/embed?listType=playlist&list=${playlistId}`}
                    title="Playlist YouTube intégrée"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
                </div>
              </div>
          
            </div>
        </div>

        )}
        
        <div className="flex lg:flex-col sm:flex-row flex-col lg:col-span-2 col-span-6 gap-12"> 
          <div className="h-max flex flex-col overflow-hidden border rounded-lg bg-card shadow-lg">
            <Image 
              src="/img/fanzine-couv.jpg"
              alt="Image d'illustration"
              width={400}
              height={300}
              className="object-contain mb-4 "
            />
            {/*
            <div className="items-end">
            <PopupImage image="/img/festival_verso.jpg"/>
            </div>
            */}
            
            <Button variant="outline" asChild className="mb-8 max-w-max">
              <Link target="_blank" href='/doc/fanzine-doleance_avec-couv-min.pdf'>Découvrir</Link>
            </Button>
          </div>  
        </div>
      </section> 

{/* Section des cartes d'introduction */}
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[900px] left-0 h-full w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[1400px] right-0 h-[400px] w-[50vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
      <section className="mb-8 grid gap-12 lg:grid-cols-4">
        <div className="h-max flex flex-col lg:col-span-2 md:row-span-1 shrink rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="flex flex-col flex-grow justify-between p-6">
              <div>
              <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Les Etats généraux communaux</h2>
                <div
                className="gap-4 mb-4 text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: etatsGeneraux?.acf?.carte_de_une,
                }}
                />              
                </div>  
                <Button variant="outline" asChild>
                  <Link href='/etats-generaux-communaux'>La démarche</Link>
                </Button>
        </div>
        </div> 
        <div className="h-max flex flex-col lg:col-span-2 col-span-1 md:row-span-2 rounded-lg border bg-card shadow-lg overflow-hidden">
        <div className="flex flex-col flex-grow justify-between p-6">
              <h2 className="w-full pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Les groupes locaux</h2>
                <div
                className="gap-4 my-4 text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: cartographie?.acf?.texte_dintro ,
                }}
                /> 
              <CardMap
                locations={mapLocations}
              /> 
              <Button variant="outline" asChild>
                <Link href='/cartographie'>Voir les groupes</Link>
              </Button>
          </div>
          </div> 
        <div className="h-max flex flex-col lg:col-span-2 col-span-1 md:row-span-1 rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="flex flex-col flex-grow justify-between p-6">
                  <div>
                  <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Nous contacter</h2>
                  <div className="mb-6 line-clamp-4 text-muted-foreground" dangerouslySetInnerHTML={
                    { __html: contribuer?.acf?.intro }} />    
                  </div>  
                    <Button variant="outline" asChild>
                      <Link href='/contribuer'>Envoyer un message</Link>
                    </Button>
            </div>
            </div>           
      </section>

    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[2100px] left-0 h-full w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[2200px] right-0 h-[400px] w-[50vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
      <section className="my-36 p-6 rounded-lg border bg-card shadow-lg overflow-hidden">
        <div className="mb-6 flex items-center justify-between border-b-[1px] pb-3">
          <h2 className="text-2xl font-serif font-light uppercase">Actualités</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
            <ArticleCardHome key={article.id} article={article} />
            ))}
        </div>
        
          <div className="flex items-center justify-center">
          <Button variant="outline" asChild className="mt-12">
          <Link href="/category">
            Voir toute l'actualité
          </Link>
          </Button>
          </div>
      </section>  

      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[3200px] left-0 h-full w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
        <div className="absolute top-[3400px] right-0 h-[400px] w-[50vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
      </div>
      <section className="mb-24 ">
            <DraggableCardContainer className="relative flex md:min-h-screen min-h-[50rem] w-full md:items-center items-start justify-center">
              <p className="absolute top-1/2 mx-auto max-w-sm -translate-y-3/4 text-center text-2xl font-serif md:text-4xl dark:text-neutral-800">
              Cahier de la colère et de l'espoir
              </p>
              {verbatimImages.map((item, idx) => (
              <DraggableCardBody key={item.image ?? idx} className={item.className}>
                <img
                src={item.image}
                alt={item.title}
                className="pointer-events-none relative z-10 w-[40rem] object-contain"
                />
              </DraggableCardBody>
              ))}
            </DraggableCardContainer>
      </section>
    </div>
    </>
  )
}
