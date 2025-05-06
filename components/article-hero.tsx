"use client"

import type { Post } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { fetchGroupeLocalById } from "@/lib/api"
import Link from "next/link"

interface ArticleHeroProps {
  post: Post
}

export default function ArticleHero({ post }: ArticleHeroProps) {
  const [groupeLocalName, setGroupeLocalName] = useState<string | null>(null)
  const [groupeLocalId, setGroupeLocalId] = useState<number | null>(null)

  // Récupérer l'ID du groupe local depuis les champs ACF (utiliser tax_groupe_local ou groupe_local_tax)
  useEffect(() => {
    const loadGroupeLocalInfo = async () => {
      const id = post.acf?.tax_groupe_local || post.acf?.groupe_local_tax || null
      if (id) {
        try {
          const groupe = await fetchGroupeLocalById(id)
          if (groupe) {
            setGroupeLocalName(groupe.title.rendered)
            setGroupeLocalId(groupe.id)
          }
        } catch (error) {
          console.error("Error loading groupe local info:", error)
        }
      }
    }

    loadGroupeLocalInfo()
  }, [post.acf?.tax_groupe_local, post.acf?.groupe_local_tax])

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-6">
        <div>{formatDate(post.date)}</div>
        {groupeLocalName && groupeLocalId && (
          <Link href={`/groupe-local/${groupeLocalId}`} className="hover:underline">
            <Badge variant="outline">{groupeLocalName}</Badge>
          </Link>
        )}
      </div>
    </div>
  )
}
