import { fetchPageBySlug } from "@/lib/api";

export default async function MentionsLegalesPage() {
    const mentionsLegales = await fetchPageBySlug("mentions-legales");
    
    return (
        <>
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[100px] left-0 h-[500px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[500px] right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
     <div className="container mx-auto p-8 mt-4">
        <h1 className="text-3xl mb-8">Mentions Légales</h1>
        <div>
            <div dangerouslySetInnerHTML={{ __html: mentionsLegales?.acf?.mentions_legales || "" }} />
        </div>
    </div>
        </>
    );
}