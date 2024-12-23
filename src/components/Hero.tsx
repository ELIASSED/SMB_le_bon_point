"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Hero() {
  const router = useRouter();
  const [isSliding, setIsSliding] = useState(false);

  const handleRedirect = () => {
    setIsSliding(true);
    setTimeout(() => {
      router.push('/stages');
    }, 600);
  };

  return (
<section className="relative bg-teal text-white overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
    <div className="flex flex-col-reverse lg:flex-row items-center justify-between relative">
      {/* Contenu textuel */}
      <div className="lg:w-1/2 relative z-10">
        <div className="space-y-4">
          <h1 className="rounded-[12px] p-2 bg-beige font-bold text-4xl text-teal">
            Récupérez Vos Points à Saint-Maur-des-Fossés
          </h1>

          <p className="text-lg text-gray-light">
            Participez à nos stages agréés et reprenez confiance au volant.
          </p>
          <button
            type="button"
            onClick={handleRedirect}
            className={`
              bg-yellow text-teal font-bold py-3 px-6 
              rounded-full transition-transform duration-300 ease-in-out
              hover:scale-110 hover:bg-yellow-dark
              ${isSliding ? 'transform scale-90 opacity-50' : ''}
            `}
          >
            Voir les stages
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        className={`
          lg:w-1/2 relative z-20
          transition-all duration-1000 ease-in-out
          ${isSliding ? 'transform -translate-x-full' : 'opacity-100'}
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
</section>

  );
}
