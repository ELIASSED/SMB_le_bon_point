import './globals.css';
import { ReactNode } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  // Métadonnées principales
  title: 'Stage Récupération Points Saint-Maur | 4 Points dès 180€',
  description: 'Récupérez 4 points sur votre permis en 2 jours à Saint-Maur-des-Fossés (94). Stages agréés, sessions hebdomadaires, réservation en ligne. À 5 min du RER A !',

  // Balises Open Graph pour les réseaux sociaux
  openGraph: {
    title: 'Récupérez 4 Points à Saint-Maur-des-Fossés | Stage Agréé',
    description: 'Centre agréé à Saint-Maur-des-Fossés (94) pour récupérer 4 points en 48h. Réservez votre stage de sensibilisation à la sécurité routière dès maintenant !',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Centre de Récupération Points Saint-Maur',
    url: 'https://smb-lebonpoint.fr',
    images: [
      {
        url: 'https://www.smb-lebonpoint.fr/images/logo-smb-lebonpoint.png',
        width: 1200,
        height: 630,
        alt: 'Stage de récupération de points permis à Saint-Maur-des-Fossés, Val-de-Marne',
      },
    ],
  },

  // Balises Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Stage Points Permis Saint-Maur | 4 Points en 48h',
    description: 'Réservez votre stage à Saint-Maur-des-Fossés (94) pour récupérer 4 points sur votre permis. Dates flexibles, prix dès 180€ !',
    images: ['https://smb-lebonpoint.fr/images/stage-saint-maur-twitter.jpg'],
    site: '@SMBLeBonPoint',
  },

  // Métadonnées additionnelles
  keywords: [
    'stage récupération points Saint-Maur-des-Fossés',
    'récupérer points permis 94',
    'stage permis à points Val-de-Marne',
    'stage 4 points Saint-Maur',
    'stage sensibilisation sécurité routière 94',
    'prix stage récupération points Saint-Maur',
  ],

  // Données structurées pour Google
  alternates: {
    canonical: 'https://smb-lebonpoint.fr',
  },

  // Métadonnées géographiques
  geo: {
    region: 'FR-IDF',
    placename: 'Saint-Maur-des-Fossés, Val-de-Marne, Île-de-France, France',
    position: '48.8006;2.4831',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Informations de l'entreprise
  publisher: 'Centre de Récupération Points Saint-Maur',
  organization: 'Centre de Récupération Points Saint-Maur',
  address: {
    streetAddress: '35 Av. Foch',
    addressLocality: 'Saint-Maur-des-Fossés',
    addressRegion: 'Val-de-Marne',
    postalCode: '94100',
    addressCountry: 'FR',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
<link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              'name': 'Centre de Récupération Points Saint-Maur',
              'address': {
                '@type': 'PostalAddress',
                'streetAddress': '35 Av. Foch',
                'addressLocality': 'Saint-Maur-des-Fossés',
                'addressRegion': 'Val-de-Marne',
                'postalCode': '94100',
                'addressCountry': 'FR',
              },
              'geo': {
                '@type': 'GeoCoordinates',
                'latitude': 48.8006,
                'longitude': 2.4831,
              },
              'telephone': '+33619774782',
              'url': 'https://smb-lebonpoint.fr',
              'description': 'Centre agréé de stages de récupération de points à Saint-Maur-des-Fossés. Récupérez jusqu’à 4 points en 2 jours dans le Val-de-Marne.',
              'openingHours': 'Mo-Fr 09:00-17:00',
              'logo': 'https://smb-lebonpoint.fr/images/logo-smb-lebonpoint.png',
            }),
          }}
        />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}