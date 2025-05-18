import React from "react";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";
import { fetchPageBySlug, fetchRandomVerbatimImage, fetchAttachmentById } from "@/lib/api";
import YouTubeEmbed from "@/components/ui/video";
import Verbatim from "@/components/verbatim";
import Image from "next/image";

export default async function DraggableCardDemo() {
  const images = await fetchRandomVerbatimImage()
  const imagesObjects = await Promise.all(
    (images ?? [])
      .map((image) => image.acf?.image_du_verbatim)
      .map((id) => fetchAttachmentById(Number(id)))
  )

  // Mélanger les images et les retourner en ordre aléatoire en tableau sans index
  const shuffledImages = imagesObjects.sort(() => Math.random() - 0.5)

  // Créer un tableau au format title, url et className d'images en ordre aléatoire  
  const items = shuffledImages.map((image, index) => ({
    image: image?.source_url,
    className: `absolute top-${Math.floor(Math.random() * 100)}% left-${Math.floor(Math.random() * 100)}% rotate-[${Math.floor(Math.random() * 20) - 10}deg]`,
  }));

  const accueil = await fetchPageBySlug("a-propos");


  return (
     <div className="container mx-auto px-4 py-8">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-43xl font-light tracking-tight">A propos de la démarche</h1> 
            <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
            Collectif citoyen et populaire
            </p>
          </div>

          <section className="h-max mb-12 grid gap-12 grid-cols-6 place-items-end">
            {accueil && (
            <div className="flex flex-col md:col-span-4 col-span-6 h-full justify-between rounded-lg border bg-card shadow-lg overflow-hidden">
                <div className="flex flex-col p-6">
                  <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">
                    Notre démarche
                  </h2>
                    <div
                    className="flex flex-col gap-4 mb-4 flex-grow text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{
                      __html: accueil?.acf?.presentation_de_la_demarche || "",
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
          
          <div className="h-max flex flex-col md:col-span-2 col-span-6 gap-12">          
            <div className="flex flex-col flex-grow justify-center p-6">
              <Verbatim />
            </div>
            <div className="flex flex-col row-span-2 overflow-hidden border rounded-lg bg-card shadow-lg overflow-hidden">

            </div>  
          </div>
      </section> 
    
          <section className="w-full h-max mb-12 flex flex-col gap-12 md:grid md:grid-cols-6 md:gap-12">  
            <DraggableCardContainer className="relative flex min-h-screen w-full items-center justify-center overflow-clip">
              <p className="absolute top-1/2 mx-auto max-w-sm -translate-y-3/4 text-center text-2xl font-serif md:text-4xl dark:text-neutral-800">
                Cahier de la colère et de l'espoir
              </p>
              {items.map((item) => (
                <DraggableCardBody className={item.className}>
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
  );
}
