"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchAttachmentById } from "@/lib/api";
import { Mail } from "lucide-react";
import YoutubeEmbed from "./ui/video";

type Kit = {
  titre: string;
  presentation_du_kit?: string;
  fichiers_du_kit?: { fichier: number; titre?: string; date?: string }[];
  contact?: {
    nom_de_la_personne: string;
    email_de_la_personne: string;
    mini_biographie: string;
    photo_de_la_personne: number;
  };
  video: string;
};

export default function KitTabs({ kits }: { kits: Kit[] }) {
  const [activeTab, setActiveTab] = useState("kit-0");
  const [kitsWithFiles, setKitsWithFiles] = useState<Kit[]>(kits);

  useEffect(() => {
    let isMounted = true;
    async function enrichKits() {
      const enriched = await Promise.all(
        kits.map(async (kit) => {
          if (kit.fichiers_du_kit && Array.isArray(kit.fichiers_du_kit)) {
            const filesWithProps = await Promise.all(
              kit.fichiers_du_kit.map(async (file) => {
                try {
                  const fetchedFile = await fetchAttachmentById(file.fichier);
                  return { ...file, ...fetchedFile };
                } catch (error) {
                  console.error("Error fetching file:", error);
                  return file;
                }
              })
            );
            return { ...kit, fichiers_du_kit: filesWithProps };
          }
          return kit;
        })
      );
      if (isMounted) setKitsWithFiles(enriched);
    }
    enrichKits();
    return () => { isMounted = false; };
  }, [kits]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full h-full"
      orientation="vertical"
    >
      <div className="flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">Les kits</h2>
      </div>
      <TabsList className="flex flex-wrap gap-2 p-4 bg-white">
        {kitsWithFiles.map((kit, index) => (
        <TabsTrigger key={index} value={`kit-${index}`} className="text-base">
          {kit.titre}
        </TabsTrigger>
        ))}
      </TabsList>
      <div className="relative overflow-hidden min-h-[1600px] md:min-h-[1000px] mt-8">
        {kitsWithFiles.map((kit, index) => (
        <TabsContent key={index} value={`kit-${index}`} className="absolute inset-0 mt-8 mx-auto w-full">
          <motion.div
          key={kit.titre}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="p-4"
          >
          <h3 className="my-8 text-xl font-semibold">{kit.titre}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-sm md:col-span-3 col-span-1">
            {kit.presentation_du_kit && (
              <div className="py-8 px-4 md:px-12 border rounded-lg bg-card shadow-lg" dangerouslySetInnerHTML={{ __html: kit.presentation_du_kit }} />
            )}
            </div>
            <div className="col-span-1 w-full h-max flex flex-col gap-8 justify-self-end border rounded-lg bg-card shadow-lg p-4 md:p-8">
            {kit.fichiers_du_kit && kit.fichiers_du_kit.length > 0 && (
              <>
              {kit.fichiers_du_kit.map((file, fileIndex) => (
                <div key={fileIndex} className="flex flex-col items-center justify-between">
                <p className="font-semibold">
                  {file.title?.rendered
                  ? <span dangerouslySetInnerHTML={{ __html: file.title.rendered }} />
                  : (file.titre || "Document")}
                </p>
                <a
                  href={file.source_url || `/kits/${file.titre || "document"}`}
                  target="_blank"
                  download
                  className="text-sm uppercase text-primary underline-offset-4 underline"
                >
                  Télécharger
                </a>
                </div>
              ))}
              </>
            )}
            <div>
              {kit?.contact?.email_de_la_personne && (
              <div className="w-full flex justify-center items-center">
                <div className="bg-primary/10 p-2 rounded-full">
                <Mail className="h-5 w-5" />
                </div>
                <a href={`mailto:${kit?.contact.email_de_la_personne}`} className="text-primary ml-2 break-all">
                {kit?.contact.email_de_la_personne}
                </a>
              </div>
              )}
            </div>
            </div>
            {kit.video && (
            <div className="md:col-span-2 col-span-1 flex flex-col gap-4 h-max rounded-lg border bg-card shadow-lg overflow-hidden">
              <YoutubeEmbed videoLink={kit.video}/>
            </div>
            )}
            <div className="md:col-span-2 col-span-1 flex flex-col gap-4 rounded-lg border bg-card shadow-lg overflow-hidden p-4 md:p-8">
            <h4 className="w-full mb-4 pb-3 text-xl font-serif font-light uppercase border-b-[1px]">Créateur</h4>
            {kit.contact?.nom_de_la_personne && (
              <p className="text-sm font-semibold">{kit.contact.nom_de_la_personne}</p>
            )}
            {kit.contact?.mini_biographie && (
              <p className="text-sm" dangerouslySetInnerHTML={{__html:kit.contact.mini_biographie}} />
            )}
            </div>
          </div>
          </motion.div>
        </TabsContent>
        ))}
      </div>
      </div>
    </Tabs>
  );
}