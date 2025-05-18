import React from "react";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";
import { fetchRandomVerbatimImage, fetchAttachmentById } from "@/lib/api";

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



  return (
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
  );
}
