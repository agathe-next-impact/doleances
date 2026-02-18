import React from "react";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";
import { fetchPageBySlug, fetchRandomVerbatimImage, fetchAttachmentById, fetchGroupesLocaux, fetchPostById } from "@/lib/api";
import YouTubeEmbed from "@/components/ui/video";
import Verbatim from "@/components/verbatim";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { buildStaticMetadata } from "@/lib/metadata";

const CardMap = dynamic(() => import("@/components/map/map-card"), {
  loading: () => <div className="flex items-center justify-center h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>,
})

export const revalidate = 3600;

export const metadata: Metadata = buildStaticMetadata({
  title: "A propos de nous - Les Doléances",
  description: "Présentation de la démarche et des groupes locaux",
  path: "/a-propos",
})

export default async function DraggableCardDemo() {
  // Paralléliser les fetches indépendants
  const [images, apropos, locations] = await Promise.all([
    fetchRandomVerbatimImage(),
    fetchPageBySlug("a-propos"),
    fetchGroupesLocaux(),
  ])

  const imagesObjects = await Promise.all(
    (images ?? [])
      .map((image) => image.acf?.image_du_verbatim)
      .map((id) => fetchAttachmentById(Number(id)))
  )

  const shuffledImages = imagesObjects.sort(() => Math.random() - 0.5)

  const items = shuffledImages.map((image, index) => ({
    image: image?.source_url,
    className: `absolute`,
  }));

  // Paralléliser les fetches dépendant de apropos
  const [imageALaUne, dossierDePresse] = await Promise.all([
    fetchAttachmentById(apropos?.featured_media),
    fetchAttachmentById(apropos?.acf?.infos_documentaire?.dossier_de_presse),
  ])
  // Adapter les données pour correspondre à l'interface attendue par CardMap
  const mapLocations = locations.map((location) => ({
    id: String(location.id),
    slug: location.slug,
    position: {
      lat: parseFloat(location.acf?.localisation.lat),
      lng: parseFloat(location.acf?.localisation.lng),
    },
  }));
  let vignettes = apropos?.acf?.infos_documentaire?.vignettes || [];

  vignettes = await Promise.all(
    vignettes.map(async (value: any, key: number) => {
      if (value ) {
        const imageUrl = await fetchAttachmentById(value.image);        
        const linkedArticle = value.lien_darticle ? await fetchPostById(value.lien_darticle) : null;
        return {
          image: imageUrl?.source_url,
          titre: value.titre || `Vignette ${key + 1}`,
          lien: linkedArticle ? `/article/${linkedArticle.slug}` : null,
          legende: value.legende || "Voir l'article",
        };
      }
      return value; 
    })
  );

console.log("Vignettes:", vignettes);
  return (
    <>
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[100px] left-0 h-[500px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[500px] right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
     <div className="container mx-auto md:p-8 p-4">
          <div className="py-4 text-center">
            <h1 className="mb-4 text-43xl font-light tracking-tight">A propos de la démarche</h1> 
            <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
            Collectif citoyen et populaire
            </p>
          </div>

    <section className="h-max mb-12 grid gap-12 grid-cols-6 place-items-end">
      {apropos && (
      <div className="flex flex-col lg:col-span-4 col-span-6 h-full justify-between rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="flex flex-col p-6">
            <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">
              Notre démarche
            </h2>
              <div
              className="mb-4 text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: apropos?.acf?.presentation_de_la_demarche || "",
              }}
              />              
          </div>
      </div>

      )}
    
    <div className="h-max flex flex-col lg:col-span-2 col-span-6 gap-12">       
      <div className="flex flex-col col-span-2 border rounded-lg bg-card shadow-lg overflow-hidden">
        <Image 
          src={imageALaUne.source_url}
          alt="Image d'illustration"
          width={500}
          height={300}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex flex-col flex-grow justify-center p-6">
        <Verbatim />
      </div>
    </div>
    </section> 

    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[800px] left-0 h-[1000px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[1500px] right-0 h-[900px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>



    <section className="h-max mb-12 grid gap-12 grid-cols-6 place-items-end">
      <div className="flex flex-col col-span-6 h-full justify-between rounded-lg border bg-card shadow-lg overflow-hidden">
        <div className="w-full h-full flex flex-col p-6">
        <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">
          Making of
        </h2>
          <div
          className="flex flex-col gap-4 mb-8 flex-grow text-muted-foreground"
          dangerouslySetInnerHTML={{
            __html: apropos?.acf?.infos_documentaire.intro_making_of || "",
          }}
          />    
          <div className="flex sm:flex-row flex-col flex-wrap sm:justify-around justify-between mb-4">
            {vignettes.map((vignette, index) => (
              <div key={index} className="flex flex-col lg:w-[20%] sm:w-[40%] w-full lg:mb-0 mb-8 items-center">  
                <Image
                  src={vignette.image}
                  alt={vignette.titre}
                  width={500}
                  height={300}
                  className="object-cover w-full h-full rounded-lg"
                />
                <h3 className="mt-2 mx-auto text-md font-semibold">{vignette.titre}</h3>
                {vignette.lien && (
                <Button variant="outline" asChild>
                  <Link href={vignette.lien} rel="noopener noreferrer" className="text-sm">
                    {vignette.legende ? vignette.legende : ""}
                  </Link>
                </Button>
                )}
              </div>   
            ))}
        </div>
      </div>
    </div>
    </section>

    <section className="h-max mb-12 grid gap-12 grid-cols-6 place-items-end">
    <div className="h-full w-full flex flex-col lg:col-span-2 col-span-6 rounded-lg border bg-card shadow-lg overflow-hidden">
      <div className="flex flex-col flex-grow justify-between content-stretch p-6">
          <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">
            Les groupes locaux
            </h2>
              <CardMap
                locations={mapLocations}
              />
            <Button variant="outline" asChild className="mt-4"> 
              <Link href='/cartographie'>Voir les groupes</Link>
            </Button>
        </div>  
    </div>
    <div className="flex flex-col lg:col-span-4 col-span-6 h-full justify-between rounded-lg border bg-card shadow-lg overflow-hidden">
      <div className="w-full h-full flex flex-col p-6">
        <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">
          Le documentaire sur les doléances
        </h2>
          <div
          className="flex flex-col gap-4 mb-4 flex-grow text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{
            __html: apropos?.acf?.infos_documentaire.presentation_du_docu || "",
          }}
          />  
        <Button variant="outline" asChild>
          <Link href={dossierDePresse.source_url} target="_blank" rel="noopener noreferrer">
            Dossier de presse
          </Link>
        </Button>            
      </div>
    </div>
        <div className="h-max w-full flex flex-col md:col-span-6 col-span-6 gap-12">  
          <div className="relative h-full w-full overflow-hidden rounded-lg border bg-card shadow-lg">
            <YouTubeEmbed videoLink={apropos?.acf.infos_documentaire?.video} />        
          </div>    
        </div>
    </section>

    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[2000px] left-0 h-[1000px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[2400px] right-0 h-[900px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
          <section className="w-full h-max my-24 flex flex-col gap-12 md:grid md:grid-cols-6 md:gap-12">  
            
            <DraggableCardContainer className="relative md:col-span-6 flex min-h-screen w-full items-center justify-center">
              <p className="absolute top-1/2 mx-auto max-w-sm -translate-y-3/4 text-center text-2xl font-serif md:text-4xl dark:text-neutral-800">
                Cahier de la colère et de l'espoir
              </p>
                {items.map((item, index) => (
                <DraggableCardBody key={item.image || index} className={item.className}>
                  <img
                  src={item.image}
                  alt={item.title}
                  className="pointer-events-none relative z-10 w-[40rem] object-contain"
                  />
                  <h3 className="mt-4 text-center text-2xl font-bold text-neutral-700 dark:text-neutral-300">
                  {item.title}
                  </h3>
                </DraggableCardBody>
                ))}
            </DraggableCardContainer>
          </section>
    </div>
    </>
  );
}
