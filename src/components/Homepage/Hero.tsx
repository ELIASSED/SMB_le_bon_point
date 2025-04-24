"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import React from 'react';

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
    <section className="absolute inset-0 flex items-center justify-center text-white">
      <div className="container px-4 sm:px-6 lg:px-8 relative h-full">
        <div className="h-full flex flex-col">
          {/* Contenu textuel */}
          <div className="pt-8 md:pt-12 lg:pt-16">
            <div className="space-y-4 p-4  inline-block">
              <h1 className="font-bold  bg-black bg-opacity-5 text-2xl sm:text-3xl md:text-4xl text-white">
                Récupérez Vos Points à Saint-Maur-des-Fossés (Site en demo)
              </h1>
            </div>
          </div>
          
          {/* Bouton positionné en bas à droite */}
          <div className="mt-auto mb-6 md:mb-8 lg:mb-10 flex justify-end">
            <button
              type="button"
              onClick={handleRedirect}
              className={`bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-full transition-transform duration-300 ease-in-out hover:scale-110 ${isSliding ? 'transform scale-90 opacity-50' : ''}`}
            >
              Voir les stages
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}