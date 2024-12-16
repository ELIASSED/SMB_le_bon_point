'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import BookingButton from '@/components/BookingButton';

type Stage = {
  id: number;
  numeroStagePrefecture: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  remainingSlots: number;
};

export default function CalendarClient() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les données depuis l'API
  const fetchStages = async () => {
    try {
      const res = await fetch('/api/stage');
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des stages');
      }
      const data = await res.json();
      setStages(data.map((stage: Stage) => ({
        ...stage,
        remainingSlots: stage.capacity, // Placeholder, ajustez si nécessaire
      })));
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 container mx-auto p-8">
        <div className="relative w-full h-64 mb-8">
          <Image
            src="/images/center.png"
            alt="Bannière Stage Permis"
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <h2 className="text-3xl text-white font-bold">Récupération de Points - Saint-Maur-des-Fossés</h2>
          </div>
        </div>

        <section className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-black">Dates des stages disponibles</h3>

          <div className="flex flex-col gap-4">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="border rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition-shadow flex flex-col md:flex-row items-center md:items-start"
              >
                <div className="flex-none w-full md:w-1/4 text-center mb-4 md:mb-0">
                  <p className="text-lg font-bold text-black">Places restantes</p>
                  <p className="text-xl font-bold text-green-600">{stage.remainingSlots}</p>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="text-lg font-bold text-yellow-600">
                    {`Du ${new Date(stage.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} au ${new Date(stage.endDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
                  </p>
                  <p className="text-sm text-gray-600">{stage.description}</p>
                  <p className="text-sm text-gray-700">{stage.location}</p>
                </div>
                <div className="flex-none w-full md:w-1/4 text-center">
                  <BookingButton className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
