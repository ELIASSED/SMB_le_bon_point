import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: "Contactez-nous - Stage de récupération de points à Saint-Maur",
  description: "Contactez notre centre de récupération de points à Saint-Maur-des-Fossés. Trouvez notre emplacement, appelez-nous pour toute question ou besoin d'assistance.",
  openGraph: {
    title: "Contactez-nous - Stage de récupération de points à Saint-Maur",
    description: "Informations de contact et localisation de notre centre de récupération de points à Saint-Maur-des-Fossés.",
    url: "https://www.votre-site-saint-maur.fr/contact",
    siteName: "Stage Points Saint-Maur",
    images: [
      {
        url: "/images/saint-maur-center.webp",
        width: 1200,
        height: 630,
        alt: "Centre de récupération de points Saint-Maur",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="space-y-12">
        {/* En-tête */}
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contactez le Centre SMB
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nous sommes là pour répondre à vos questions et vous guider pour votre stage de récupération de points.
          </p>
        </header>

        {/* Informations de contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Adresse */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Où nous retrouver</h2>
            <div className="space-y-2 text-gray-800">
              <p>35 Av. Foch, 94100 Saint-Maur-des-Fossés</p>
              <p className="text-xl font-medium text-red-600">
                Entrée : 2 Av. de Curti, 94100 Saint-Maur-des-Fossés
              </p>
              <p>À 5 minutes à pied de la gare du Parc de Saint-Maur</p>
            </div>
          </section>

          {/* Contact téléphonique */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Besoin d'aide ?</h2>
            <p className="text-gray-800">
              Appelez-nous au{' '}
              <a
                href="tel:0619774782"
                className="text-yellow-600 hover:text-yellow-700 underline font-medium"
                aria-label="Appeler le centre SMB au 06 19 77 47 82"
              >
                06 19 77 47 82
              </a>
            </p>
          </section>
        </div>

        {/* Carte Google Maps */}
        <section className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.469151394134!2d2.495465315675272!3d48.80686387928407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e60eea5ad9b5c7%3A0x5baf9b8b16dca682!2s35%20Av.%20Foch%2C%2094100%20Saint-Maur-des-Foss%C3%A9s!5e0!3m2!1sfr!2sfr!4v1700000000000!5m2!1sfr!2sfr"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Carte du Centre SMB à Saint-Maur"
          ></iframe>
        </section>
      </section>
    </main>
  );
}