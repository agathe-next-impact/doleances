<<<<<<< HEAD
import YoutubeEmbed from "@/components/ui/video";
=======
import { Button } from "@/components/ui/button";
import YoutubeEmbed from "@/components/ui/video";
import Verbatim from "@/components/verbatim";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
>>>>>>> 8a2bf5b9e97e5d44e654e03244bd12b6261289d3
import { fetchPageBySlug } from "@/lib/api";


export default async function Page () {

  const page = await fetchPageBySlug("etats-generaux-communaux");
  console.log(page);

  return (
    <div className="container mx-auto md:p-8 p-4">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-43xl font-light tracking-tight">Etats Généraux communaux</h1> 
        <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
        Wiki du corpus des doléances de 2018/2019
        </p>
      </div>

<<<<<<< HEAD
          <section className="w-full h-max mb-12 flex flex-col gap-12 md:grid md:grid-cols-6 md:gap-12">                     
          <div className="h-max flex flex-col col-span-3 overflow-hidden border rounded-lg bg-card shadow-lg overflow-hidden">
            <YoutubeEmbed videoLink={page.acf?.video || "https://www.youtube.com/embed/8bof5Anluk4?si=H5M7BGGsvWFUODBM"} />
            <div className="items-end">
              
            </div>
          </div>
          <div className="h-full flex flex-col col-span-3 flex-grow justify-center p-6 justify-between rounded-lg border bg-card shadow-lg">
            <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Plaidoyer</h2>       
            {page?.acf?.plaidoyer && (
              <div
              className="text-muted-foreground my-4"
=======
        <section className="w-full h-max mb-12 flex flex-col gap-12 md:grid md:grid-cols-6 md:gap-12">                     
          <div className="h-max flex flex-col col-span-2 gap-4 overflow-hidden">            
            <div className="items-end border rounded-lg bg-card shadow-lg overflow-hidden mb-8"> 
              <YoutubeEmbed videoLink={page.acf?.video || "https://www.youtube.com/embed/8bof5Anluk4?si=H5M7BGGsvWFUODBM"} />
            </div>
             {page?.acf?.carte_de_une && (
            <div className="h-full flex flex-col col-span-4 flex-grow p-6 justify-between rounded-lg border bg-card shadow-lg">
                <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Lancer vos Etats Généraux Communaux</h2>               
                <div
                className="my-4"
                dangerouslySetInnerHTML={{
                  __html: page?.acf?.carte_de_une,
                }}
                />
                <Button variant="outline" className="w-full mt-4">
                  <Link href="/#kits" target="_blank" rel="noopener noreferrer">
                    Accéder aux kits
                  </Link>
                </Button>
            </div>            
              )}
            <div className="h-full flex flex-col col-span-4 flex-grow p-6 ">
            <Verbatim />
            </div>
          </div>
          <div className="h-full flex flex-col col-span-4 flex-grow p-6 justify-between rounded-lg border bg-card shadow-lg">
            <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Plaidoyer</h2>       
            {page?.acf?.plaidoyer && (
              <div
              className="my-4"
>>>>>>> 8a2bf5b9e97e5d44e654e03244bd12b6261289d3
              dangerouslySetInnerHTML={{
                __html: page?.acf?.plaidoyer,
              }}
              />
            )}
            <div className="mt-4">
<<<<<<< HEAD
          </div>
          </div>

      </section>

=======
          </div> 
          </div>
      </section>

      
      <section className="w-full h-max mb-12 flex flex-col gap-12 md:grid md:grid-cols-6 md:gap-12">                     
        <div className="h-max col-span-6 flex flex-col overflow-hidden">
          <div className="items-end border rounded-lg bg-card shadow-lg overflow-hidden mb-8">
            <Tabs
              defaultValue="etats-generaux-communes"
              className="w-full h-full"
              orientation="vertical"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4">
                  <h2 className="text-lg font-semibold">Les communes</h2>
                </div>
                <TabsList className="flex flex-wrap gap-2 p-4">
                  {page?.acf?.kit && (
                    <>
                      {(page.acf.kit as { titre: string; presentation_du_kit?: string }[]).map((kit, index) => (
                        <TabsTrigger key={index} value={`kit-${index}`}>
                          {kit.titre}
                        </TabsTrigger>
                      ))}
                      {page.acf.kit.map((kit: { titre: string; presentation_du_kit?: string }, index: number) => (
                        <TabsContent key={index} value={`kit-${index}`} className="flex-grow">
                          <div className="p-4">
                            <h3 className="text-lg font-semibold">{kit.titre}</h3>
                            {kit.presentation_du_kit && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                {kit.presentation_du_kit}
                              </div>
                            )}
                          </div>  
                        </TabsContent>
                      ))}
                    </>
                  )}
                </TabsList>
                </div>
            </Tabs>
          </div>   
        </div>
      </section>
>>>>>>> 8a2bf5b9e97e5d44e654e03244bd12b6261289d3
  </div>

  );
}