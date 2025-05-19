"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"

interface CrossfadeImageTransitionProps {
  // Tableau d'URLs d'images
  images: string[]
  // Durée d'affichage de chaque image en millisecondes
  displayDuration?: number
  // Durée de la transition en millisecondes
  transitionDuration?: number
  // Hauteur du composant
  height?: number | string
  // Largeur du composant
  width?: number | string
  // Classe CSS additionnelle
  className?: string
  // Mode aléatoire ou séquentiel
  random?: boolean
  // Nombre d'images à précharger
  preloadCount?: number
}

export default function CrossfadeImageTransition({
  images,
  displayDuration = 5000,
  transitionDuration = 1500,
  height = 400,
  width = "100%",
  className = "",
  random = true,
  preloadCount = 3,
}: CrossfadeImageTransitionProps) {
  // Utiliser deux indices pour les deux images qui alternent
  const [indices, setIndices] = useState({ imageA: 0, imageB: 1 })
  const [activeImage, setActiveImage] = useState<"A" | "B">("A")
  const [isTransitioning, setIsTransitioning] = useState(false)
  

  // Référence pour l'intervalle
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fonction pour obtenir l'index suivant (aléatoire ou séquentiel)
  const getNextIndex = useCallback(() => {
    if (images.length <= 1) return 0

    const currentIndex = activeImage === "A" ? indices.imageA : indices.imageB

    if (random) {
      let newIndex
      do {
        newIndex = Math.floor(Math.random() * images.length)
      } while (newIndex === currentIndex)
      return newIndex
    } else {
      return (currentIndex + 1) % images.length
    }
  }, [images.length, indices, activeImage, random])

  // Effet pour gérer le changement d'image
  useEffect(() => {
    if (images.length <= 1) return

    // Configurer l'intervalle pour les transitions
    intervalRef.current = setInterval(() => {
      const nextIndex = getNextIndex()

      // Préparer la transition
      setIsTransitioning(true)

      // Mettre à jour l'index de l'image inactive
      setIndices((prev) => {
        if (activeImage === "A") {
          return { ...prev, imageB: nextIndex }
        } else {
          return { ...prev, imageA: nextIndex }
        }
      })

      // Après la durée de transition, basculer l'image active
      setTimeout(() => {
        setActiveImage((prev) => (prev === "A" ? "B" : "A"))
        setIsTransitioning(false)
      }, transitionDuration)
    }, displayDuration)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [images.length, displayDuration, transitionDuration, getNextIndex, activeImage])

  // Gestion des cas particuliers
  if (images.length === 0) {
    return <div className="text-center p-4">Aucune image disponible</div>
  }

  if (images.length === 1) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ height, width }}>
        <Image
          src={images[0] || "/placeholder.svg"}
          alt="Image unique"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height, width }}>
      {/* Image A */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: activeImage === "A" ? 1 : isTransitioning ? 0 : 0,
          transition: `opacity ${transitionDuration}ms ease-in-out`,
          zIndex: activeImage === "A" ? 2 : 1,
        }}
      >
        <Image
          src={images[indices.imageA] || "/placeholder.svg"}
          alt={`Image ${indices.imageA + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={activeImage === "A"}
          className="object-contain"
        />
      </div>

      {/* Image B */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: activeImage === "B" ? 1 : isTransitioning ? 0 : 0,
          transition: `opacity ${transitionDuration}ms ease-in-out`,
          zIndex: activeImage === "B" ? 2 : 1,
        }}
      >
        <Image
          src={images[indices.imageB] || "/placeholder.svg"}
          alt={`Image ${indices.imageB + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={activeImage === "B"}
          className="object-contain"
        />
      </div>
    </div>
  )
}
