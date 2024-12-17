"use client";
import React from 'react';
import Image from 'next/image';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full text-center">
        <div className="mb-6">
          <Image
            src="/images/volant.png"
            alt="Maintenance"
            width={100}
            height={100}
            className="mx-auto"
          />
        </div>
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          ❗ Suite à une panne technique du site, SMB Le Bon Point vous prie de faire votre demande de réservation par téléphone ou par mail ❗
        </h1>
        <p className="text-gray-700 mb-4">
          Nous travaillons activement à résoudre ce problème et à restaurer notre système de réservation en ligne.
        </p>
        <p className="text-gray-700 mb-4">
          En attendant, vous pouvez nous contacter :
        </p>
        <p className="font-bold text-gray-800">
          📞 06 19 77 47 82
        </p>
        <p className="font-bold text-gray-800 mb-4">
          📩 smblebonpoint@gmail.com
        </p>
        <p className="text-gray-700">
          Nous vous remercions de votre compréhension et espérons vous revoir très bientôt en ligne.
        </p>
      </div>
    </div>
  );
}
