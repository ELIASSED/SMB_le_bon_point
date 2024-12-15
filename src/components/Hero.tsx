"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Hero() {
  const router = useRouter();
  const [isSliding, setIsSliding] = useState(false);

  const handleRedirect = () => {
    // Activation de l'animation de sliding
    setIsSliding(true);
    
    // Redirection après un court délai pour permettre l'animation
    setTimeout(() => {
      router.push('/stages');
    }, 500); // Délai court pour une transition fluide
  };

  return (
    <section className="relative bg-[#246ed4] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Conteneur principal avec flexbox */}
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between">
          {/* Contenu textuel et bouton - placé en premier pour assurer l'interactivité */}
          <div className="lg:w-1/2 z-10 relative">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">
                Récupérez Vos Points à Saint-Maur-des-Fossés
              </h1>
              <p className="text-lg">
                Participez à nos stages agréés et reprenez confiance au volant.
              </p>
              
              {/* Bouton avec gestion claire de l'événement de clic */}
              <button
                type="button"
                onClick={handleRedirect}
                className={`
                  bg-yellow-500 hover:bg-yellow-600 
                  text-white font-bold py-3 px-6 
                  rounded-lg transition-all duration-300
                  ${isSliding ? 'transform scale-90 opacity-50' : ''}
                `}
              >
                Voir les stages
              </button>
            </div>
          </div>

          {/* Image avec gestion de l'animation de sliding */}
          <div 
            className={`
              lg:w-1/2 relative 
              transition-all duration-1000 ease-in-out
              ${isSliding ? 'transform -translate-x-full opacity-0' : 'opacity-100'}
            `}
          >
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <img
                src="/images/volant.png"
                alt="Stage de récupération de points"
                className="rounded-lg w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overlay subtil */}
      <div className="absolute inset-0 bg-black opacity-10 pointer-events-none"></div>
    </section>
  );
}