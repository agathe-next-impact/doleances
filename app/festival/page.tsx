import { fetchPageBySlug, fetchAttachmentById } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import PopupImage from "@/components/ui/popup-image";
import Verbatim from "@/components/verbatim";
import StaticMap from "@/components/map/static-map";
import DateFormat from "@/components/date-format";

export default async function Page() {
  const page = await fetchPageBySlug("festival-mai-2025");
  const bd: { id: number }[] = page?.acf?.bd ?? [];
  const imagesBd = await Promise.all(
    bd.map((image) => fetchAttachmentById(image))
  );
  const imageDeUne = await fetchAttachmentById(page?.acf?.image_de_une);

  return (
    <>
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-0 left-0 h-[500px] w-[40vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
    
    <div className="container mx-auto md:p-8 p-4">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-43xl font-light tracking-tight">
          Festival des doléances
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
          31 et 31 mai 2025
        </p>
        <div className="mx-auto w-64">
          <PopupImage image="/img/festival_verso.jpg" />
        </div>
      </div>

      <section className="w-full h-max mb-12 flex flex-col gap-12 md:grid md:grid-cols-6 md:gap-12">
        <div className="h-max flex lg:flex-col md:flex-row lg:col-span-2 col-span-6 gap-6 overflow-hidden">
          {page?.acf?.image_de_une && (
            <>
              <div className="h-full w-full flex flex-col flex-grow justify-between p-6 border rounded-lg bg-card shadow-lg">
                <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">
                  La cagnotte
                </h2>
                
                <Image
                  src={imageDeUne.source_url}
                  alt="Image d'illustration"
                  width={150}
                  height={100}
                  className="object-contain mb-4"
                />
                <p>
                  La jeune association Les doléances que nous venons de créer ne dispose pas encore 
                  des ressources financières pour porter seule ce grand rendez-vous citoyen.</p>
                  <p className="font-bold">Faîtes exister cette première édition du Festival</p> 
                  <p>Nous comptons donc sur nos seules ressources mais elles sont immenses !
                  Si vous en avez la possibilité, cette cagnotte servira à nous aider à tenir cette belle idée.
                  Merci d'avance et à très vite pour ce beau moment de vie démocratique et artistique !</p>
                <p className="font-handwritten">
                  Hélène et Fabrice.
                </p>
                <Button variant="outline" className="w-full mt-2">
                  <Link
                    href="https://www.leetchi.com/fr/c/festival-les-doleances-1974817"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Participer
                  </Link>
                </Button>
              </div>
            </>
          )}
          <div className="h-max mt-8 flex flex-col col-span-2 border rounded-lg bg-card shadow-lg overflow-hidden">
            <Image
              src="/img/festival_recto.jpg"
              alt="Image d'illustration"
              width={500}
              height={300}
              className="object-contain w-full h-full mb-4 "
            />
            <div className="items-end">
              <PopupImage image="/img/festival_verso.jpg" />
            </div>
          </div>
        </div>
        <div className="h-max flex flex-col lg:col-span-4 col-span-6 flex-grow p-6 justify-between rounded-lg border bg-card shadow-lg">
          <div>
            <p className="font-serif text-2xl">
              {page?.acf?.date_de_debut && (
                <span>
                  <DateFormat dateStr={page?.acf?.date_de_debut} /> -{" "}
                  {page?.acf?.date_de_fin && (
                    <span>
                      <DateFormat dateStr={page?.acf?.date_de_fin} />
                    </span>
                  )}
                </span>
              )}
            </p>
          </div>
          <div className="text-lg uppercase font-regular text-muted-foreground">
            <span>à</span>
            {page?.acf?.lieu_de_levenement?.postal_code}{" "}
            {page?.acf?.lieu_de_levenement?.city}
          </div>

          <p className="text-lg mt-8">
            {page?.acf?.intro && (
              <span
                className="mb-4 text-base"
                dangerouslySetInnerHTML={{
                  __html: page?.acf?.intro,
                }}
              />
            )}
          </p>
          <div className="mt-8">
            <StaticMap
              address={page?.acf?.lieu_de_levenement?.address}
              latitude={
                typeof page.acf?.latitude === "number"
                  ? page.acf.latitude
                  : typeof page.acf?.latitude === "string"
                  ? Number.parseFloat(page.acf.latitude)
                  : typeof page.acf?.lieu_de_levenement?.lat === "number"
                  ? page.acf.lieu_de_levenement.lat
                  : undefined
              }
              longitude={
                typeof page.acf?.longitude === "number"
                  ? page.acf.longitude
                  : typeof page.acf?.longitude === "string"
                  ? Number.parseFloat(page.acf.longitude)
                  : typeof page.acf?.lieu_de_levenement?.lng === "number"
                  ? page.acf.lieu_de_levenement.lng
                  : undefined
              }
              height="400px"
              width="100%"
            />
          </div>
        </div>
      </section>

    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[1000px] left-0 h-[500px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[1500px] right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
      <section className="mb-8 grid gap-12 grid-cols-3">
        <div className="flex flex-col col-span-4 h-full w-full justify-between rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="flex lg:flex-row flex-col justify-between gap-8 p-6">
            {page?.acf?.edito_fabrice && (
              <div className="basis-1/2">
                <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">
                  Fabrice Dalongeville
                </h2>
                <div
                  className="flex flex-col gap-4 mb-4 flex-grow text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: page?.acf?.edito_fabrice,
                  }}
                />
              </div>
            )}
            {page?.acf?.edito_helene && (
              <div className="basis-1/2">
                <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">
                  Hélène Desplanques
                </h2>
                <div
                  className="flex flex-col gap-4 mb-4 flex-grow text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: page?.acf?.edito_helene,
                  }}
                />
                <Verbatim />
              </div>
            )}
          </div>
        </div>
      </section>

    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[2400px] left-0 h-[500px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[1800px] right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
      <section className="w-full h-max mb-12 flex flex-col gap-12 md:grid md:grid-cols-6 md:gap-12">
        {imagesBd.map((image) => (
          <div
            key={image.id}
            className="h-full flex flex-col col-span-2 overflow-hidden border rounded-lg bg-card shadow-lg overflow-hidden"
          >
            <Image
              src={image?.source_url}
              alt="Image d'illustration"
              width={500}
              height={300}
              className="object-contain w-full h-full mb-4 "
            />
          </div>
        ))}
      </section>
    </div>
    </>
  );
}
