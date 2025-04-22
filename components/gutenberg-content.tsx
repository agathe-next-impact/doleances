"use client"

import { useEffect, useRef } from "react"
import "./gutenberg-styles.css"

interface GutenbergContentProps {
  content: string
  className?: string
}

export function GutenbergContent({ content, className = "" }: GutenbergContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return

    // Handle any client-side initialization for interactive Gutenberg blocks

    // Example: Initialize image galleries if needed
    const galleries = contentRef.current.querySelectorAll(".wp-block-gallery")
    if (galleries.length > 0) {
      // Initialize galleries (if you have a gallery library)
      // Example: initializeGalleries(galleries)
    }

    // Example: Initialize embeds like YouTube videos
    const embeds = contentRef.current.querySelectorAll(".wp-block-embed")
    if (embeds.length > 0) {
      // Ensure embeds are responsive
      embeds.forEach((embed) => {
        const iframe = embed.querySelector("iframe")
        if (iframe) {
          iframe.style.maxWidth = "100%"
        }
      })
    }

    // Example: Initialize any interactive blocks like tabs, accordions, etc.
    // ...
  }, [content])

  return (
    <div ref={contentRef} className={`gutenberg-content ${className}`} dangerouslySetInnerHTML={{ __html: content }} />
  )
}
