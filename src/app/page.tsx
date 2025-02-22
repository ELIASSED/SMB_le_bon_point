// Mise à jour des fichiers pour refléter le style institutionnel

"use client";

import Image from 'next/image';
import BookingButton from '../components/BookingButton';
import Hero from '../components/Homepage/Hero';
import FAQ from '../components/Homepage/FAQ';
import ExternalLinkButton from '../components/ExternalLinkButton';
import FeaturesGrid from '../components/Homepage/FeatureGrid';

export default function HomePage() {
  return (
    <>
      <Hero />
      <div>
        <div className="mb-6">
          {/* Section Introduction */}
        </div>
        <p className="mb-4 text-gray-800">
          Découvrez notre Centre de Récupération de Points Permis à St Maur des Fossés, à deux pas du RER A Saint-Maur le Parc.
          ‍Avec un parking, plus de 200m2 d'espace, salle de repos, coins repas, et zones de détente, nous rendons la récupération de points aussi facile que confortable.
          ‍Optez pour la tranquillité sur la route avec nous.
        </p>

        <h2 className="text-2xl font-semibold mb-2 text-black">Pourquoi choisir notre centre à Saint-Maur-des-Fossés ?</h2>

       <FeaturesGrid/>
        <br />

        <p className="mb-6 text-gray-700">
          Notre centre est situé au cœur de Saint-Maur, facilement accessible en transport en commun ou en voiture. Les sessions ont lieu régulièrement, et les places sont limitées (maximum 20 participants).
        </p>

        <BookingButton />

        <h2 className="text-2xl font-semibold mt-8 mb-2 text-black">Informations pratiques</h2>
        <p className="mb-2 text-gray-700">
          <strong>Adresse :</strong> 35 Avenue Foch, 94100 Saint-Maur
        </p>
        <p className="mb-2 text-gray-700">
          <strong>Tarif :</strong> 230 € (incluant les frais de dossier)
        </p>
        <p className="mb-2 text-gray-700">
          <strong>Durée du stage :</strong> 2 jours (14 heures de formation)
        </p>
        <p className="mb-6 text-gray-700">
          À l’issue du stage, une attestation vous sera remise, permettant la récupération de points sur votre permis (sous réserve d’éligibilité).
        </p>
      </div>
      <ExternalLinkButton />
      <FAQ />
    </>
  );
}
