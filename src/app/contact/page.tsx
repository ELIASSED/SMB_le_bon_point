

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
        url: "/images/saint-maur-center.jpg",
        width: 1200,
        height: 630,
        alt: "Centre de récupération de points Saint-Maur",
      },
    ],
    locale: "fr_FR",
    type: "website",
  }
};

export default function ContactPage() {
  return (
    <div className="space-y-8">
      {/* Titre de la Page */}
      <h1 className="text-3xl font-bold">Contactez le Centre SMB</h1>

      {/* Informations de Contact */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Où nous retrouver</h2>
          <p>35 Av. Foch, 94100 Saint-Maur-des-Fossés</p>
          <p>Entrée : 2 Av. de Curti, 94100 Saint-Maur-des-Fossés</p>
          <p>À 5 minutes à pied de la gare du Parc de Saint-Maur</p>
       
        </div>

        <div>
          <h2 className="text-2xl font-semibold">Besoin d'aide ou d'une question ?</h2>
<p>C&#39;est un test d&#39;appel.</p>
       
        </div>
      </div>

      {/* Carte Google Maps */}
      <div className="w-full h-96">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.469151394134!2d2.495465315675272!3d48.80686387928407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e60eea5ad9b5c7%3A0x5baf9b8b16dca682!2s35%20Av.%20Foch%2C%2094100%20Saint-Maur-des-Foss%C3%A9s!5e0!3m2!1sfr!2sfr!4v1700000000000!5m2!1sfr!2sfr"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Carte du Centre SMB à Saint-Maur"
        ></iframe>
      </div>
    </div>
  );
}