import YoutubeEmbed from "@/components/ui/video";
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
              dangerouslySetInnerHTML={{
                __html: page?.acf?.plaidoyer,
              }}
              />
            )}
            <div className="mt-4">
          </div>
          </div>

      </section>

  </div>

  );
}