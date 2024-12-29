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
    <section className="relative bg-beige text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between">
          {/* Contenu textuel */}
          <div className="lg:w-1/2">
            <div className="space-y-4">
              <h1 className="rounded-lg p-2 bg-yellow font-bold text-4xl text-teal">
                Récupérez Vos Points à Saint-Maur-des-Fossés
              </h1>
              <p className="text-lg font-bold text-teal">
                Participez à nos stages agréés et reprenez confiance au volant.
              </p>
              <button
                type="button"
                onClick={handleRedirect}
                className={`bg-yellow text-teal font-bold py-3 px-6 rounded-full transition-transform duration-300 ease-in-out hover:scale-110 hover:bg-yellow-dark ${isSliding ? 'transform scale-90 opacity-50' : ''}`}
              >
                Voir les stages
              </button> 
            </div>
          </div>
          {/* Image */} 
          <div className={`lg:w-1/2 transition-all duration-1000 ease-in-out ${isSliding ? 'transform -translate-x-full' : ''}`}>
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <Image
                src="/images/volant.png"
                alt="Stage de récupération de points"
                width={800}
                height={400}
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
