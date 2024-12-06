import '../app/globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = {
  title: "Stage de récupération de points à Saint-Maur",
  description: "Trouvez et réservez votre stage de récupération de points de permis à Saint-Maur. Sessions agréées, paiement sécurisé, places limitées.",
  openGraph: {
    title: "Stage de récupération de points à Saint-Maur",
    description: "Réservez votre stage de récupération de points du permis à Saint-Maur, facilement et rapidement.",
    url: "https://www.votre-site-saint-maur.fr",
    siteName: "Stage Points Saint-Maur",
    images: [
      {
        url: "/images/saint-maur-center.jpg",
        width: 1200,
        height: 630,
        alt: "Centre de formation Saint-Maur",
      },
    ],
    locale: "fr_FR",
    type: "website",
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-gray-100 text-gray-800">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
