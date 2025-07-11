"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"

interface RandomImageTransitionProps {
  // Tableau d'URLs d'images ou de chemins d'accès
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
}

export default function RandomImageTransition({
  images,
  displayDuration = 5000,
  transitionDuration = 1500,
  height = 400,
  width = "100%",
  className = "",
}: RandomImageTransitionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null)

  // Fonction pour obtenir un index aléatoire différent de l'index actuel
  const getRandomIndex = useCallback(() => {
    if (images.length <= 1) return 0

    let newIndex
    do {
      newIndex = Math.floor(Math.random() * images.length)
    } while (newIndex === currentImageIndex)

    return newIndex
  }, [images.length, currentImageIndex])

  // Effet pour gérer le changement d'image
  useEffect(() => {
    if (images.length === 0) return

    const intervalId = setInterval(() => {
      setIsTransitioning(true)
      setNextImageIndex(getRandomIndex())

      // Après la transition, mettre à jour l'image actuelle
      setTimeout(() => {
        if (nextImageIndex !== null) {
          setCurrentImageIndex(nextImageIndex)
          setIsTransitioning(false)
          setNextImageIndex(null)
        }
      }, transitionDuration)
    }, displayDuration)

    return () => clearInterval(intervalId)
  }, [images, displayDuration, transitionDuration, getRandomIndex, nextImageIndex])

  // Style pour la transition
  const transitionStyle = {
    transition: `opacity ${transitionDuration}ms, transform ${transitionDuration}ms`,
    opacity: isTransitioning ? 0 : 1,
    transform: isTransitioning ? "translateY(-30px)" : "translateY(0)",
  }

  if (images.length === 0) {
    return <div className="text-center p-4">Aucune image disponible</div>
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height, width }}>
      <div className="w-full h-full" style={transitionStyle}>
        <Image
          src={images[currentImageIndex] || "/placeholder.svg"}
          alt={`Image aléatoire ${currentImageIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          className="object-cover"
        />
      </div>
    </div>
  )
}
