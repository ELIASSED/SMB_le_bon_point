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
    <section className="relative bg-[#246ed4] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between relative">
          {/* Contenu textuel */}
          <div className="lg:w-1/2 relative z-10">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">
                Récupérez Vos Points à Saint-Maur-des-Fossés
              </h1>
              <p className="text-lg">
                Participez à nos stages agréés et reprenez confiance au volant.
                </p>
              <button
  type="button"
  onClick={handleRedirect}
  className={`
    bg-yellow-500 text-white font-bold py-3 px-6 
    rounded-full transition-transform duration-300 ease-in-out
    hover:scale-110
    ${isSliding ? 'transform scale-90 opacity-50' : ''}
  `}
>
  Voir les stages
</button>

            </div>
          </div>

          {/* Image avec animation */}
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

      <div className="absolute inset-0 bg-black opacity-10 pointer-events-none"></div>
    </section>
  );
}
