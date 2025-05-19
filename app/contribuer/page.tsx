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
      <main className="container mx-auto py-10 px-4">
        <h1 className="mb-4 text-4xl font-light tracking-tight text-center">Contactez-nous</h1>
        <ContactForm subjects={finalSubjects} />
      </main>
    )
  } catch (error) {
    console.error("Erreur dans la page de contact:", error)
    return (
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
    )
  }
}
