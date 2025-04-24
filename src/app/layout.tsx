// Modification de layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  // Métadonnées principales
  title: 'Stages de Récupération de Points à Saint-Maur-des-Fossés (94) | Premier centre du 94',
  description: 'Centre de stages de récupération de points à Saint-Maur-des-Fossés. Meilleurs tarifs du 94 et de l\'Île-de-France. Récupérez 4 points en 2 jours, calendrier flexible et places garanties.',
  
  // Balises Open Graph pour le partage sur les réseaux sociaux
  openGraph: {
    title: 'Stages Récupération Points Saint-Maur-des-Fossés | N°1 dans le 94',
    description: 'Centre de stages homologué à Saint-Maur-des-Fossés. Récupérez jusqu\'à 4 points en 48h. Sessions hebdomadaires, réservation en ligne, paiement sécurisé.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'SMB Le Bon Point',
    url: 'https://smb-lebonpoint.fr',
    images: [
      {
        url: '/images/stage-recuperation-points-saint-maur.jpg',
        width: 1200,
        height: 630,
        alt: 'Centre de stages de récupération de points à Saint-Maur-des-Fossés',
      },
    ],
  },
  
  // Balises Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Stages Points Saint-Maur-des-Fossés | Centre principal du Val-de-Marne',
    description: 'Réservez votre stage permis à points à Saint-Maur-des-Fossés. Dates disponibles chaque semaine. Prix imbattables sur le 94 et toute l\'IDF !',
    images: ['/images/stage-saint-maur-twitter.jpg'],
    site: '@SMBLeBonPoint',
  },
  
  // Métadonnées additionnelles
  keywords: 'stage récupération points Saint-Maur-des-Fossés, stage permis à points 94, récupération points Saint-Maur, stage 4 points Val-de-Marne, stage sensibilisation sécurité routière Saint-Maur, prix stage récupération points 94, stage points pas cher IDF',
  
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
  publisher: 'SMB Le Bon Point',
  organization: 'Centre de stages SMB Le Bon Point',
  address: {
    streetAddress: 'Saint-Maur-des-Fossés',
    addressLocality: 'Saint-Maur-des-Fossés',
    addressRegion: 'Val-de-Marne',
    postalCode: '94100',
    addressCountry: 'FR',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="/favicon.ico" />        
      </head>
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className=" ">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
