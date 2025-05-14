import ContactForm from "@/components/contact-form";
import { getContactFormConfig } from "@/lib/api";

export default async function ContactPage() {
  try {
    const page = await getContactFormConfig();

    if (!page) {
      return <p>Erreur chargement du formulaire</p>;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <ContactForm page={page} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching contact page data:", error);
    return <p>Erreur chargement du formulaire</p>;
  }
}