import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Video } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ArticleCard } from "@/components/article-card"
import { PageCard } from "@/components/page-card"
import { fetchFeaturedArticles, fetchPages } from "@/lib/wordpress"
import { SearchAutocomplete } from "@/components/search-autocomplete"
import YouTubeEmbed from "@/components/ui/video"

export default async function Home() {
  const articles = await fetchFeaturedArticles()
  const pages = await fetchPages()

  // Get specific pages by slug
  const presentationPage = pages.find((page) => page.slug === "presentation")
  const stickyArticle = articles[0]

  // Get pages for the different sections
  const cartographiePage = pages.find((page) => page.slug === "cartographie")
  const consulterPage = pages.find((page) => page.slug === "consulter")
  const aboutPage = pages.find((page) => page.slug === "about")
  const contributePage = pages.find((page) => page.slug === "contribute")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-light tracking-tight md:text-5xl">Les doléances</h1> 
        <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
            Wiki des doléances de la convention citoyenne
        </p>{/*
        <div className="mx-auto max-w-md">
          <SearchAutocomplete placeholder="Rechercher des articles" buttonLabel="Rechercher" />
        </div>*/}
      </div>

      <section className="mb-12 grid gap-8 md:grid-cols-6 md:grid-rows-3">
        <div className="flex flex-col col-span-4 row-span-3 rounded-lg border bg-card shadow-lg overflow-hidden">
            <div className="flex flex-col p-6">
              <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">L'association Les doléances</h2>
              <div className="flex flex-col gap-4 mb-4 flex-grow text-sm text-muted-foreground">
                  <p>Le 27 novembre 1903, Jean Jaurès interpella les députés : « Ces
                  documents sont dispersés dans les archives ; ils ne sont même pas
                  classés, et fussent-ils classés, il serait impossible à un travailleur
                  isolé d'en prendre connaissance. Voilà pourquoi il faut que l'Etat, par
                  une publication d'ensemble, mette au service des historiens qui
                  veulent aller jusqu'au fond des choses les moyens nécessaires de
                  travail. »</p>
                  <p>Le 12 décembre 2024, réunis au deuxième sous-sol de l'Assemblée
                  nationale, plus d'une centaine de citoyennes et citoyens réunis ont
                  de nouveau fait échos aux paroles prononcées 121 ans plus tôt par
                  le parlementaire.
                  Au regard des crises politiques et sociales en cours, ils ont
                  symboliquement exprimé le serment de travailler ensemble à leur
                  publication sur une plateforme d'accès universel, et de poursuivre la
                  mobilisation de collectifs de citoyens locaux.</p>                
                  <p>La création le 17 novembre 2024 de l'association
                  Les doléances vise à tenir cette promesse.</p>
              </div>
          </div>
            <div className="relative w-full">
            <YouTubeEmbed videoLink="https://www.youtube.com/embed/9S0VA52zcxM?si=HEBQ9HPu5MDNm2uI" />
            </div>
        </div>
        <div className="flex flex-col col-span-2 row-span-2 rounded-lg border bg-card shadow-lg overflow-hidden">
          {stickyArticle && stickyArticle.featuredImage && (
            <div className="relative h-48 w-full">
              <Image
                src={stickyArticle.featuredImage || "/placeholder.svg"}
                alt={stickyArticle.title}
                fill
                className="object-cover object-top"
              />
            </div>
          )}
          <div className="flex flex-col flex-grow p-6">
            <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">à la une</h2>
            {stickyArticle && (
              <>
                <h3 className="mb-2 font-medium">{stickyArticle.title}</h3>
                <div
                  className="mb-4 flex-grow line-clamp-3 text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: stickyArticle.excerpt }}
                />
                <Button variant="outline" asChild>
                  <Link href={`/articles/${stickyArticle.slug}`}>Lire plus</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col col-span-2 row-span-1 rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="flex flex-col flex-grow p-6">
            <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Contribuer</h2>
                <h3 className="mb-2 font-medium">Participer à la démarche</h3>
                <div
                  className="mb-4 flex-grow line-clamp-3 text-sm text-muted-foreground">
                  <p>Vous pouvez contribuer à la démarche en nous aidant à
                  collecter les doléances, en nous aidant à les publier, ou en
                  participant à la rédaction d'articles.</p>
                  <p>Nous avons besoin de vous pour faire vivre cette plateforme et
                  la rendre accessible à tous.</p>
                  </div>
                <Button variant="outline" asChild>
                  <Link href={`/contribuer`}>Contribuer</Link>
                </Button>
          </div>
        </div>
      </section> 

      <section className="mb-8 grid gap-8 grid-cols-2">
      <div className="flex flex-col rounded-lg border bg-card shadow-lg overflow-hidden">
        <div className="flex flex-col flex-grow p-6">
            <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Cartographie des groupes locaux</h2>
            {stickyArticle && (
                <>
                    <p className="mb-6 line-clamp-3 text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut pellentesque tristique dolor, dictum mollis neque. Morbi nisl nisi, tempor vitae turpis id, posuere venenatis augue. Nam consectetur purus eu mi malesuada, venenatis congue felis interdum. Nullam vehicula est vitae est dictum, vel lobortis nisl fermentum. Donec dapibus sed lorem a convallis. Sed in risus augue. Aliquam a tortor sit amet nisl tincidunt porta rhoncus quis mauris. Quisque in suscipit nibh.</p>
                  <Button variant="outline" asChild>
                    <Link href={`/articles/${stickyArticle.slug}`}>Localiser les groupes</Link>
                  </Button>
                </>
            )}
          </div>
          </div>
        <div className="flex flex-col rounded-lg border bg-card shadow-lg overflow-hidden">
        <div className="flex flex-col flex-grow p-6">
            <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Les archives des doléances</h2>
            {stickyArticle && (
                <>
                    <p className="mb-6 line-clamp-3 text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut pellentesque tristique dolor, dictum mollis neque. Morbi nisl nisi, tempor vitae turpis id, posuere venenatis augue. Nam consectetur purus eu mi malesuada, venenatis congue felis interdum. Nullam vehicula est vitae est dictum, vel lobortis nisl fermentum. Donec dapibus sed lorem a convallis. Sed in risus augue. Aliquam a tortor sit amet nisl tincidunt porta rhoncus quis mauris. Quisque in suscipit nibh.</p>
                  <Button variant="outline" asChild>
                    <Link href={`/articles/${stickyArticle.slug}`}>Consulter les archives</Link>
                  </Button>
                </>
            )}
          </div>
          </div>
      </section>


      <section className="mb-12 p-6 rounded-lg shadow-lg">
        <div className="mb-6 flex items-center justify-between border-b-[1px] pb-3">
          <h2 className="text-2xl font-serif font-light uppercase">Actualités</h2>
          <Link href="/articles" className="flex items-center text-sm font-medium text-lime-600">
            Voir tous les articles
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>


    </div>
  )
}
