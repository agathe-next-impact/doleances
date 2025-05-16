import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArticleCardHome } from "@/components/actualites/article-card-home"
import { fetchLastThreePosts, fetchPageBySlug, fetchRandomVerbatimImage, fetchAttachmentById } from "@/lib/api"
import YouTubeEmbed from "@/components/ui/video"
import Verbatim from "@/components/verbatim"
import PopupImage from "@/components/ui/popup-image"
import CrossfadeImageTransition from "@/components/ui/crossfade-image-transition"

export default async function Home() {
  const articles = await fetchLastThreePosts()
  const accueil = await fetchPageBySlug("accueil")

  const images = await fetchRandomVerbatimImage()
  const imagesURLs = await Promise.all(
    (images ?? []).map((image) => fetchAttachmentById(image.acf?.image_du_verbatim))
  )
  // Créer un tableau d'URLs d'images en ordre aléatoire
  const randomImages = imagesURLs
    .map((image) => image?.source_url)
    .filter((url) => url !== undefined) as string[]

  // Mélanger les images et les retourner en ordre aléatoire en tableau sans index
  const shuffledImages = randomImages.sort(() => Math.random() - 0.5)




  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-light tracking-tight md:text-5xl">Les doléances</h1> 
        <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
        Wiki du corpus des doléances de 2018/2019
        </p>
      </div>

      <section className="h-max mb-12 grid gap-12 md:grid-cols-6 place-items-end">
        {accueil && (
        <div className="flex flex-col col-span-4 h-full justify-between rounded-lg border bg-card shadow-lg overflow-hidden">
            <div className="flex flex-col p-6">
              <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">
                {accueil?.acf?.carte_de_une?.titre}
              </h2>
                <div
                className="flex flex-col gap-4 mb-4 flex-grow text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: accueil?.acf?.carte_de_une?.texte,
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
        
        <div className="h-max flex flex-col col-span-2 gap-12">          
          <div className="flex flex-col flex-grow justify-center p-6">
            <Verbatim />
          </div>
          <div className="flex flex-col row-span-2 overflow-hidden border rounded-lg bg-card shadow-lg overflow-hidden">
            <Image 
              src="/img/festival_recto.jpg"
              alt="Image d'illustration"
              width={500}
              height={300}
              className="object-contain w-full h-full mb-4 "
            />
            <div className="items-end">
            <PopupImage image="/img/festival_verso.jpg"/>
            </div>
          </div>  
        </div>
      </section> 

      <section className="mb-8 grid gap-12 grid-cols-3 grid-rows-2">

        <div className="flex flex-col row-span-2 rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="flex flex-col flex-grow justify-between p-6">
              <div>
              <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Les Etats généraux communaux</h2>
              <p className="mb-6 line-clamp-3 text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut pellentesque tristique dolor, dictum mollis neque. Morbi nisl nisi, tempor vitae turpis id, posuere venenatis augue. Nam consectetur purus eu mi malesuada, venenatis congue felis interdum. Nullam vehicula est vitae est dictum, vel lobortis nisl fermentum. Donec dapibus sed lorem a convallis. Sed in risus augue. Aliquam a tortor sit amet nisl tincidunt porta rhoncus quis mauris. Quisque in suscipit nibh.</p>
              </div>  
                <Button variant="outline" asChild>
                  <Link href='/etats-generaux-communaux'>La démarche</Link>
                </Button>
        </div>
        </div> 

        <div className="flex flex-col row-span-1 rounded-lg border bg-card shadow-lg overflow-hidden">
        <div className="flex flex-col flex-grow justify-between p-6">
                <div>
                <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Les groupes locaux</h2>
                <p className="mb-6 line-clamp-3 text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut pellentesque tristique dolor, dictum mollis neque. Morbi nisl nisi, tempor vitae turpis id, posuere venenatis augue. Nam consectetur purus eu mi malesuada, venenatis congue felis interdum. Nullam vehicula est vitae est dictum, vel lobortis nisl fermentum. Donec dapibus sed lorem a convallis. Sed in risus augue. Aliquam a tortor sit amet nisl tincidunt porta rhoncus quis mauris. Quisque in suscipit nibh.</p>
               </div>  
              <Button variant="outline" asChild>
                <Link href='/cartographie'>Voir les groupes</Link>
              </Button>
          </div>
          </div> 


          <div className="flex flex-col row-span-1 rounded-lg border bg-card shadow-lg overflow-hidden">
            <div className="flex flex-col flex-grow justify-between p-6">
                <div>
                <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Le Festival des Doléances</h2>
                <p className="mb-6 line-clamp-3 text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut pellentesque tristique dolor, dictum mollis neque. Morbi nisl nisi, tempor vitae turpis id, posuere venenatis augue. Nam consectetur purus eu mi malesuada, venenatis congue felis interdum. Nullam vehicula est vitae est dictum, vel lobortis nisl fermentum. Donec dapibus sed lorem a convallis. Sed in risus augue. Aliquam a tortor sit amet nisl tincidunt porta rhoncus quis mauris. Quisque in suscipit nibh.</p>
               </div>  
              <Button variant="outline" asChild>
                <Link href='/festival'>Découvrir le festival</Link>
              </Button>
          </div>
          </div>

        <div className="flex flex-col col-span-2 row-span-2">
          <div className="flex flex-col flex-grow justify-between">
            <CrossfadeImageTransition
                images={shuffledImages}
                height={500}
                displayDuration={4000}
                transitionDuration={1500}
                className=""
                random={true}
                preloadCount={3}
              />
          </div>
        </div>  

        <div className="flex flex-col row-span-1 rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="flex flex-col flex-grow justify-between p-6">
                  <div>
                  <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Participer</h2>
                  <p className="mb-6 line-clamp-3 text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut pellentesque tristique dolor, dictum mollis neque. Morbi nisl nisi, tempor vitae turpis id, posuere venenatis augue. Nam consectetur purus eu mi malesuada, venenatis congue felis interdum. Nullam vehicula est vitae est dictum, vel lobortis nisl fermentum. Donec dapibus sed lorem a convallis. Sed in risus augue. Aliquam a tortor sit amet nisl tincidunt porta rhoncus quis mauris. Quisque in suscipit nibh.</p>
                  </div>  
                    <Button variant="outline" asChild>
                      <Link href='/contribuer'>Contribuer</Link>
                    </Button>
            </div>
            </div> 
          
      </section>

      <section className="my-24 p-6 rounded-lg border bg-card shadow-lg overflow-hidden">
        <div className="mb-6 flex items-center justify-between border-b-[1px] pb-3">
          <h2 className="text-2xl font-serif font-light uppercase">Actualités</h2>
          <Link href="/category" className="flex items-center text-sm font-medium text-lime-600">
            Voir toute l'actualité
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
            <ArticleCardHome key={article.id} article={article} />
            ))}
        </div>
      </section>


    </div>
  )
}
