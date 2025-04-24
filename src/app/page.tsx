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
      <div className="relative w-full overflow-hidden shadow-xl" style={{ height: "80vh", minHeight: "300px", maxHeight: "600px" }}>
        <div className="absolute inset-0 transform ">
          <Image 
            src="/image4.jpg" 
            alt="Centre de récupération de points à Saint-Maur-des-Fossés" 
            fill 
            className="object-cover"
            priority
          />
        </div>
        <Hero />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="mb-4 text-gray-800">
          Découvrez notre Centre de Récupération de Points Permis à St Maur des Fossés, à deux pas du RER A Saint-Maur le Parc.
          ‍Avec un parking, plus de 200m2 d'espace, salle de repos, coins repas, et zones de détente, nous rendons la récupération de points aussi facile que confortable.
          ‍Optez pour la tranquillité sur la route avec nous.
        </p>
        <h2 className="text-2xl font-semibold mb-2 text-black">Pourquoi choisir notre centre à Saint-Maur-des-Fossés ?</h2>
        <FeaturesGrid />
        <br />
        <p className="mb-6 text-gray-700">
          Notre centre est situé au cœur de Saint-Maur, facilement accessible en transport en commun ou en voiture. Les sessions ont lieu régulièrement, et les places sont limitées (maximum 20 participants).
        </p>
        {/* Location Section */}
        <div className="bg-gray-50 rounded-lg shadow-md overflow-hidden my-12">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-black mb-4">Où nous retrouver ?</h2>
              <p className="text-xl text-gray-800 mb-2">35 Av. Foch, 94100 Saint-Maur-des-Fossés</p>
              <p className="text-xl font-bold text-red-600 mb-2">Entrée : 2 Av. de Curti, 94100 Saint-Maur-des-Fossés</p>
              <p className="text-lg text-gray-800 mb-6">À 5 minutes à pied de la gare du Parc de Saint-Maur</p>
              <div className="mt-6">
                <h3 className="text-2xl font-semibold text-black mb-2">Besoin d'aide ou d'une question ?</h3>
                <p className="text-lg">
                  Appelez-nous au{" "}
                  <a href="tel:0619774782" className="text-blue-600 font-bold hover:underline">
                    06 19 77 47 82
                  </a>
                </p>
              </div>
            </div>
            <div className="h-full min-h-80">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2628.305262908395!2d2.489187615639635!3d48.80273087928208!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e60d6258a8045d%3A0x6c59dcc2a20bf24a!2s35%20Av.%20Foch%2C%2094100%20Saint-Maur-des-Foss%C3%A9s%2C%20France!5e0!3m2!1sfr!2sfr!4v1698765432100!5m2!1sfr!2sfr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-80"
              />
              <BookingButton />
            </div>
          </div>
        </div>
        {/* FAQ Section */}
        <FAQ />
      </div>
    </>
  );
}