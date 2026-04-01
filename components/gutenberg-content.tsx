"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import "./gutenberg-styles.css"

// Charger react-pdf uniquement côté client (DOMMatrix n'existe pas côté serveur)
const PdfViewerLazy = dynamic(() => import("./pdf-viewer"), { ssr: false })

interface GutenbergContentProps {
  content: string
  className?: string
}

export function GutenbergContent({ content, className = "" }: GutenbergContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => { setIsClient(true) }, [])

  useEffect(() => {
    if (!contentRef.current) return
    const embeds = contentRef.current.querySelectorAll(".wp-block-embed")
    if (embeds.length > 0) {
      embeds.forEach((embed) => {
        const iframe = embed.querySelector("iframe")
        if (iframe) {
          iframe.style.maxWidth = "100%"
        }
      })
    }
  }, [content])

  // Extraction du premier lien PDF unique
  const regex = /<a ([^>]*?)href=["']([^"']+\.pdf)["']([^>]*)>([\s\S]*?)<\/a>/i
  let firstPdf: { url: string; text: string } | null = null
  const replacedHtml = content.replace(regex, (match, beforeHref, url, afterHref, text) => {
    if (!firstPdf) {
      firstPdf = { url, text: text || "TÉLÉCHARGER LE PDF" }
    }
    return `<a ${beforeHref}href="${url}"${afterHref}>${(text || "TÉLÉCHARGER LE PDF").toUpperCase()}</a>`
  })

  if (!isClient) {
    return <div className={`gutenberg-content ${className}`} dangerouslySetInnerHTML={{ __html: replacedHtml }} />
  }

  return (
    <>
      <div ref={contentRef} className={`gutenberg-content ${className}`} dangerouslySetInnerHTML={{ __html: replacedHtml }} />
      {firstPdf && (
        <div style={{ marginTop: 48 }}>
          <div style={{ margin: "2em 0", border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
            <PdfViewerLazy fileUrl={(firstPdf as { url: string }).url} />
          </div>
        </div>
      )}
    </>
  )
}
