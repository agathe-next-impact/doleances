"use client"

import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// Configurer le worker PDF.js via CDN (react-pdf v10 + pdfjs-dist v5)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfViewerProps {
  fileUrl: string
}

export default function PdfViewer({ fileUrl }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  if (error) {
    return (
      <div style={{ color: "red", fontSize: 14, padding: 16 }}>
        Erreur d&apos;affichage du PDF : {error}
      </div>
    )
  }

  return (
    <div ref={containerRef}>
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        onLoadError={(err) => setError(err.message)}
        loading={
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <Page
          pageNumber={pageNumber}
          width={containerWidth}
          renderAnnotationLayer
          renderTextLayer
        />
      </Document>
      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-3">
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-40"
          >
            &larr; Pr&eacute;c&eacute;dent
          </button>
          <span className="text-sm text-muted-foreground">
            Page {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-40"
          >
            Suivant &rarr;
          </button>
        </div>
      )}
    </div>
  )
}
