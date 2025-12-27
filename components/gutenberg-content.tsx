"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { useState } from "react"
// Chargement dynamique du PDF Viewer côté client
const Viewer = dynamic(() => import("@react-pdf-viewer/core").then(mod => mod.Viewer), { ssr: false })
const Worker = dynamic(() => import("@react-pdf-viewer/core").then(mod => mod.Worker), { ssr: false })
import "@react-pdf-viewer/core/lib/styles/index.css"
import "@react-pdf-viewer/default-layout/lib/styles/index.css"
import "./gutenberg-styles.css"

interface GutenbergContentProps {
  content: string
  className?: string
}

export function GutenbergContent({ content, className = "" }: GutenbergContentProps) {
    // Conserve uniquement le lien PDF d'origine dans le contenu (texte en majuscules), sans CTA stylisé. PDF embarqué en bas de page (premier unique).
    function renderWithUppercasePdfLinkAndSingleEmbed(html: string) {
      const [isClient, setIsClient] = useState(false)
      useEffect(() => { setIsClient(true) }, [])
      // Extraction du premier lien PDF unique
      const regex = /<a ([^>]*?)href=["']([^"']+\.pdf)["']([^>]*)>([\s\S]*?)<\/a>/i;
      let firstPdfRef: { current: { url: string; text: string } | null } = { current: null };
      let replacedHtml = html.replace(regex, (match, beforeHref, url, afterHref, text) => {
        if (!firstPdfRef.current) {
          firstPdfRef.current = { url, text: text || 'TÉLÉCHARGER LE PDF' };
        }
        // Remplace le texte du lien par sa version majuscule
        return `<a ${beforeHref}href="${url}"${afterHref}>${(text || 'TÉLÉCHARGER LE PDF').toUpperCase()}</a>`;
      });
      const firstPdf = firstPdfRef.current;
      if (!isClient) {
        return <div className={`gutenberg-content ${className}`} dangerouslySetInnerHTML={{ __html: replacedHtml }} />
      }
      return (
        <>
          <div className={`gutenberg-content ${className}`} dangerouslySetInnerHTML={{ __html: replacedHtml }} />
          {firstPdf && (
            <div style={{ marginTop: 48 }}>
              <div key={firstPdf.url} style={{ margin: '2em 0' }}>
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                  <Viewer fileUrl={firstPdf.url} />
                </Worker>
              </div>
            </div>
          )}
        </>
      )
    }
  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!contentRef.current) return
    // Initialisation des blocs interactifs Gutenberg (galeries, embeds, etc.)
    const galleries = contentRef.current.querySelectorAll(".wp-block-gallery")
    if (galleries.length > 0) {
      // ...
    }
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

  // Remplacement des liens PDF par un viewer embarqué côté client uniquement
  function renderWithPdfEmbeds(html: string) {
    // Découpe le HTML en morceaux (avant, lien, après) pour chaque lien PDF
    // et remplace chaque lien PDF par un composant React
    const [isClient, setIsClient] = useState(false)
    useEffect(() => { setIsClient(true) }, [])
    if (!isClient) {
      // SSR : on affiche le HTML d'origine (avec les liens)
      return <div className={`gutenberg-content ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
    }
    // Côté client : on parse et on remplace
    const regex = /<a [^>]*href=["']([^"']+\.pdf)["'][^>]*>([\s\S]*?)<\/a>/gi;
    const parts: Array<string | { url: string; text: string }> = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(html))) {
      if (match.index > lastIndex) {
        parts.push(html.slice(lastIndex, match.index));
      }
      // match[2] = texte du lien (CTA)
      parts.push({ url: match[1], text: match[2]?.trim() || "Télécharger le PDF" });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < html.length) {
      parts.push(html.slice(lastIndex));
    }
    return (
      <div className={`gutenberg-content ${className}`}>
        {parts.map((part, idx) => {
          if (typeof part === "string") {
            // Utilise un fragment pour éviter un <span> inutile
            return <>{/* eslint-disable-next-line react/no-danger */}<div key={idx} dangerouslySetInnerHTML={{ __html: part }} /></>;
          } else {
            return (
              <div key={idx} style={{ margin: "2em 0" }}>
                <div style={{ height: 600, border: "1px solid #eee", marginBottom: 8 }}>
                  <SafePdfViewer fileUrl={part.url} />
                </div>
                <a href={part.url} download target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                  {part.text || "Télécharger le PDF"}
                </a>
              </div>
            )
          // Composant qui gère l'affichage du PDF et les erreurs de worker
          function SafePdfViewer({ fileUrl }: { fileUrl: string }) {
            const [error, setError] = useState<string | null>(null);
            // Vérifie que le worker est bien accessible côté client
            useEffect(() => {
              fetch('/pdf.worker.min.mjs', { method: 'HEAD' })
                .then(res => {
                  if (!res.ok) setError("Le worker PDF.js n'est pas accessible. Vérifiez le fichier public/pdf.worker.min.mjs.");
                })
                .catch(() => setError("Le worker PDF.js n'est pas accessible. Vérifiez le fichier public/pdf.worker.min.mjs."));
            }, []);
            if (error) {
              return <div style={{ color: 'red', fontSize: 14, padding: 16 }}>{error}</div>;
            }
            try {
              return (
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                  <Viewer fileUrl={fileUrl} />
                </Worker>
              );
            } catch (e) {
              return <div style={{ color: 'red', fontSize: 14, padding: 16 }}>Erreur d'affichage du PDF : {(e as Error).message}</div>;
            }
          }
          }
        })}
      </div>
    )
  }

  return renderWithUppercasePdfLinkAndSingleEmbed(content)
}
