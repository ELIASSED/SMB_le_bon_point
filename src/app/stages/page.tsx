"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import BookingButton from '@/components/BookingButton';
type Stage = {
  id: number;
  color: string;
  price: string; // Exemple: "200€"
  remainingSlots: number; // Nombre de places restantes (max 20)
  startDate: string; // format YYYY-MM-DD
  endDate: string;   // format YYYY-MM-DD
  address: string;
  postalCode: string;
  city: string;
  schedule: {
    morning: string;
    afternoon: string;
  };
  amenities: string[];
  accessInfo: string;
};

export default function CalendarClient() {
  const [selectedStages, setSelectedStages] = useState<Stage[]>([]);

  const stages: Stage[] = [
    {
      id: 1,
      color: 'bg-blue-200',
      price: '200€',
      remainingSlots: 5,
      startDate: '2024-12-22',
      endDate: '2024-12-23',
      address: '35 Avenue Foch',
      postalCode: '94100',
      city: 'SAINT-MAUR-DES-FOSSES',
      schedule: {
        morning: '08h00 à 12h30',
        afternoon: '13h30 à 16h30',
      },
      amenities: ['Parking', 'Déjeuner', 'Sur place'],
      accessInfo: 'PMR',
    },
    {
      id: 2,
      color: 'bg-green-200',
      price: '250€',
      remainingSlots: 18,
      startDate: '2024-12-29',
      endDate: '2024-12-30',
      address: '35 Avenue Foch',
      postalCode: '94100',
      city: 'SAINT-MAUR-DES-FOSSES',
      schedule: {
        morning: '08h00 à 12h30',
        afternoon: '13h30 à 16h30',
      },
      amenities: ['Parking', 'Déjeuner', 'Sur place'],
      accessInfo: 'PMR',
    },
    {
      id: 3,
      color: 'bg-yellow-200',
      price: '220€',
      remainingSlots: 12,
      startDate: '2025-01-05',
      endDate: '2025-01-06',
      address: '35 Avenue Foch',
      postalCode: '94100',
      city: 'SAINT-MAUR-DES-FOSSES',
      schedule: {
        morning: '08h00 à 12h30',
        afternoon: '13h30 à 16h30',
      },
      amenities: ['Parking', 'Déjeuner', 'Sur place'],
      accessInfo: 'PMR',
    },
    {
      id: 4,
      color: 'bg-red-200',
      price: '240€',
      remainingSlots: 16,
      startDate: '2025-01-15',
      endDate: '2025-01-16',
      address: '35 Avenue Foch',
      postalCode: '94100',
      city: 'SAINT-MAUR-DES-FOSSES',
      schedule: {
        morning: '08h00 à 12h30',
        afternoon: '13h30 à 16h30',
      },
      amenities: ['Parking', 'Déjeuner', 'Sur place'],
      accessInfo: 'PMR',
    },
    {
      id: 4,
      color: 'bg-red-200',
      price: '240€',
      remainingSlots: 16,
      startDate: '2025-01-15',
      endDate: '2025-01-16',
      address: '35 Avenue Foch',
      postalCode: '94100',
      city: 'SAINT-MAUR-DES-FOSSES',
      schedule: {
        morning: '08h00 à 12h30',
        afternoon: '13h30 à 16h30',
      },
      amenities: ['Parking', 'Déjeuner', 'Sur place'],
      accessInfo: 'PMR',
    },
    {
      id: 5,
      color: 'bg-red-200',
      price: '240€',
      remainingSlots: 16,
      startDate: '2025-01-25',
      endDate: '2025-01-26',
      address: '35 Avenue Foch',
      postalCode: '94100',
      city: 'SAINT-MAUR-DES-FOSSES',
      schedule: {
        morning: '08h00 à 12h30',
        afternoon: '13h30 à 16h30',
      },
      amenities: ['Parking', 'Déjeuner', 'Sur place'],
      accessInfo: 'PMR',
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto p-4">
        <div className="relative w-full h-64 mb-8">
          <Image 
            src="/images/center.png" 
            alt="Bannière Stage Permis" 
            layout="fill" 
            objectFit="cover" 
            className="rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <h2 className="text-3xl text-white font-bold">Récupération de Points - Saint-Maur-des-Fossses</h2>
       
          </div>
        </div>

        <section className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Dates des stages disponibles</h3>

          <div className="flex flex-col gap-4">
            {stages.map((stage) => (
              <div 
                key={stage.id} 
                className="border rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition-shadow flex items-center"
              >
                <div className="flex-none w-1/4 text-center">
                <p className="text-lg font-bold text-dark">
                    {`Places restantes`}
                  </p> <p className="text-lg font-bold text-green-600">
                    {` ${stage.remainingSlots}`}
                  </p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold text-secondary">
                    {`${new Date(stage.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} au ${new Date(stage.endDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    Horaires : {stage.schedule.morning} - {stage.schedule.afternoon}
                  </p>
                </div>
                <div className="flex-none w-1/4 text-center">
                  <p className="text-lg font-bold text-green-600 mb-2">{stage.price}</p>
                  <BookingButton />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
