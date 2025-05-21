import ContactForm from "@/components/contact-form"
import { getContactData } from "@/app/actions/contact-actions"

export default async function ContactPage() {
  try {
    // Récupérer les données de l'API
    const contactData = await getContactData()

    // Extraire les objets de message
    const subjects =
      contactData.subjects?.map((subject: string) => ({
        value: subject,
        label: subject,
      })) || []

    // Si aucun sujet n'est disponible, fournir des sujets par défaut
    const finalSubjects =
      subjects.length > 0
        ? subjects
        : [
            { value: "information", label: "Demande d'information" },
            { value: "support", label: "Support technique" },
            { value: "feedback", label: "Commentaires" },
            { value: "other", label: "Autre" },
          ]

    return (      
    <>
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-0 left-0 h-[500px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[500px] right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
      <main className="container mx-auto py-10 px-4">
        <h1 className="mb-4 text-4xl font-light tracking-tight text-center">Contactez-nous</h1>
        <ContactForm subjects={finalSubjects} />
      </main>
      </>
    )
  } catch (error) {
    console.error("Erreur dans la page de contact:", error)
    return (      
    <>
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-0 left-0 h-[500px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[500px] right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
      <main className="container mx-auto md:p-8 p-4">
        <h1 className="mb-4 text-4xl font-light tracking-tight md:text-5xl">Contactez-nous</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline">
            {" "}
            Impossible de charger le formulaire de contact. Veuillez réessayer plus tard.
          </span>
        </div>
      </main>
      </>
    )
  }
}
