import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArticleCardHome } from "@/components/actualites/article-card-home"
import { fetchLastThreePosts, fetchPageBySlug, fetchRandomVerbatimImage, fetchAttachmentById, fetchGroupesLocaux } from "@/lib/api"
import YouTubeEmbed from "@/components/ui/video"
import Verbatim from "@/components/verbatim"
import PopupImage from "@/components/ui/popup-image"
import React from "react";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";
import CardMap from "@/components/map/map-card";

export default async function Home() {
  const articles = await fetchLastThreePosts()
  const accueil = await fetchPageBySlug("accueil")

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

  const contribuer = await fetchPageBySlug("contribuer")
  


  return (
    <>
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-0 left-0 h-[500px] w-[40vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
    <div className="container mx-auto md:p-8 p-4">
      <div className="mt-8 mb-12 md:mt-4 md:mt-8 text-center">
        <h1 className="mb-4 text-4xl font-light tracking-tight md:text-5xl">Les doléances</h1> 
        <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
        Wiki du corpus des doléances de 2018/2019
        </p>
      </div>

      <section className="h-max mb-12 grid gap-12 grid-cols-6 place-items-start">
        {accueil && (
        <div className="flex flex-col md:col-span-4 col-span-6 h-full justify-between rounded-lg border bg-card shadow-lg overflow-hidden">
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
                <YouTubeEmbed videoLink="https://www.youtube.com/embed/8bof5Anluk4?si=H5M7BGGsvWFUODBM" />
                </div>
              </div>
          
            </div>
        </div>

        )}
        
        <div className="h-full flex flex-col md:col-span-2 col-span-6 grow gap-12"> 
          <div className="flex flex-col row-span-2 overflow-hidden border rounded-lg bg-card shadow-lg">
            <Image 
              src="/img/festival_recto.jpg"
              alt="Image d'illustration"
              width={500}
              height={300}
              className="object-contain w-full h-full mb-4 "
            />
            <div className="items-end">
            <PopupImage image="/img/festival_verso.jpg"/>
            </div>
            
            <Button variant="outline" asChild className="mb-8">
              <Link href='/festival'>Découvrir le festival</Link>
            </Button>
          </div>           
          <div className="flex flex-col flex-grow justify-start p-6">
            <Verbatim />
          </div>
        </div>
      </section> 

    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[900px] left-0 h-full w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[1400px] right-0 h-[400px] w-[50vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
      <section className="mb-8 grid gap-12 md:grid-cols-3 grid-rows-2">
        <div className="flex flex-col md:col-span-1 col-span-3 row-span-1 rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="flex flex-col flex-grow justify-between p-6">
              <div>
              <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Les Etats généraux communaux</h2>
              <p className="mb-6 line-clamp-3 text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut pellentesque tristique dolor, dictum mollis neque. Morbi nisl nisi, tempor vitae turpis id, posuere venenatis augue. Nam consectetur purus eu mi malesuada, venenatis congue felis interdum. Nullam vehicula est vitae est dictum, vel lobortis nisl fermentum. Donec dapibus sed lorem a convallis. Sed in risus augue. Aliquam a tortor sit amet nisl tincidunt porta rhoncus quis mauris. Quisque in suscipit nibh.</p>
              </div>  
                <Button variant="outline" asChild>
                  <Link href='/etats-generaux-communaux'>La démarche</Link>
                </Button>
        </div>
        </div> 
        <div className="flex flex-col md:col-span-1 col-span-3 row-span-2 rounded-lg border bg-card shadow-lg overflow-hidden">
        <div className="flex flex-col flex-grow justify-between gap-4 p-6">
              <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Les groupes locaux</h2>
              <CardMap
                locations={mapLocations}
              /> 
              <Button variant="outline" asChild>
                <Link href='/cartographie'>Voir les groupes</Link>
              </Button>
          </div>
          </div> 
        <div className="flex flex-col md:col-span-1 col-span-3 row-span-1 rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="flex flex-col flex-grow justify-between p-6">
                  <div>
                  <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Participer</h2>
                  <div className="mb-6 line-clamp-4 text-muted-foreground" dangerouslySetInnerHTML={
                    { __html: contribuer?.acf?.intro }} />    
                  </div>  
                    <Button variant="outline" asChild>
                      <Link href='/contribuer'>Contribuer</Link>
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
        <div className="absolute top-[32300px] left-0 h-full w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
        <div className="absolute top-[3400px] right-0 h-[400px] w-[50vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
      </div>
      <section className="mb-24 ">
            <DraggableCardContainer className="relative flex md:min-h-screen min-h-[50rem] w-full md:items-center items-start justify-center">
              <p className="absolute top-1/2 mx-auto max-w-sm -translate-y-3/4 text-center text-2xl font-serif md:text-4xl dark:text-neutral-800">
                Cahier de la colère et de l'espoir
              </p>
              {verbatimImages.map((item) => (
                <DraggableCardBody className={item.className}>
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
