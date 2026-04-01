
import { Button } from "@/components/ui/button";
import YoutubeEmbed from "@/components/ui/video";
import Verbatim from "@/components/verbatim";
import Link from "next/link";
import dynamic from "next/dynamic";
import { fetchPageBySlug } from "@/lib/api";
import { decodeWordPressText } from "@/lib/utils";
import type { Metadata } from "next"
import { buildMetadata } from "@/lib/metadata"

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPageBySlug("etats-generaux-communaux")
  return buildMetadata({
    title: page?.title?.rendered || "Etats Généraux Communaux - Les Doléances",
    description: page?.content?.rendered || "Les Etats Généraux communaux des doléances",
    path: "/etats-generaux-communaux",
    featuredMediaId: page?.featured_media,
  })
}


const KitTabs = dynamic(() => import("@/components/kit-tabs"), { ssr: true });

export default async function Page () {

  const page = await fetchPageBySlug("etats-generaux-communaux");


  return (
    <>
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-0 left-0 h-[500px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[500px] right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
    <div className="container mx-auto md:p-8 p-4">
      <div className="py-4 text-center">
        <h1 className="mb-4 text-43xl font-light tracking-tight">Etats Généraux communaux</h1> 
      </div>

        <section className="w-full h-max mb-12 flex flex-col gap-12 md:grid md:grid-cols-6 md:gap-12">                     
          <div className="h-max flex flex-col lg:col-span-2 col-span-6 gap-4 overflow-hidden">            
            <div className="items-end border rounded-lg bg-card shadow-lg overflow-hidden mb-8"> 
              <YoutubeEmbed videoLink={page?.acf?.video || "https://www.youtube.com/embed/8bof5Anluk4?si=H5M7BGGsvWFUODBM"} />
            </div>
             {page?.acf?.carte_de_une && (
            <div className="h-full flex flex-col col-span-4 flex-grow p-6 justify-between rounded-lg border bg-card shadow-lg">
                <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Lancer vos Etats Généraux Communaux</h2>               
                <div
                className="my-4"
                dangerouslySetInnerHTML={{
                  __html: decodeWordPressText(page?.acf?.carte_de_une ?? ""),
                }}
                />
                {/*
                <Button variant="outline" className="w-full mt-4">
                  <Link href="/etats-generaux-communaux/#kits" rel="noopener noreferrer">
                    Accéder aux kits
                  </Link>
                </Button>
                */}
            </div>            
              )}
            <div className="h-full flex flex-col col-span-4 flex-grow p-6 mt-8">
            <Verbatim />
            </div>
          </div>
          <div className="h-full flex flex-col lg:col-span-4 col-span-6 flex-grow p-6 justify-between rounded-lg border bg-card shadow-lg">
            <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Plaidoyer</h2>       
            {page?.acf?.plaidoyer && (
              <div
              className="my-4"
              dangerouslySetInnerHTML={{
                __html: decodeWordPressText(page?.acf?.plaidoyer ?? ""),
              }}
              />
            )}
            <div className="mt-4">
          </div> 
          </div>
      </section>

     {/* 
      <section id="kits" className="w-full h-max mb-12 flex flex-col gap-12 md:grid md:grid-cols-6 md:gap-12">                     
        <div className="h-max col-span-6 flex flex-col overflow-hidden">
            <div className="items-end overflow-hidden mb-8">
              <KitTabs kits={page?.acf?.kit ?? []} />

            </div>   
        </div>
      </section>
*/}

  </div>
  </>
  );
}