"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiMail } from "react-icons/fi";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {/* Conteneur global pour la carte + l'image (2 colonnes) */}
      <div className="flex pb-[16rem] flex-col md:flex-row w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Colonne gauche : Message de confirmation */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center text-center">
          <div className="mb-4 text-green-600 flex justify-center">
            <FiCheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            Inscription réussie !
          </h1>
          <p className="text-gray-700 mb-6">
            Votre inscription a été validée avec succès. Un email de
            confirmation vous a été envoyé à votre adresse.
          </p>
          <div className="flex items-center justify-center mb-6 text-blue-500">
            <FiMail size={32} />
            <span className="ml-2 text-gray-600">
              Vérifiez votre boîte de réception
            </span>
          </div>
          <button
            className="bg-[#084c94] mt-[4rem] hover:bg-blue-600 text-white py-2 px-6 rounded transition-colors"
            onClick={() => router.push("/")}
          >
            Retour à l'accueil
          </button>
        </div>

        {/* Colonne droite : Logo ou illustration */}
        <div
          className="md:w-1/2 h-64 md:h-auto bg-center bg-no-repeat bg-contain"
          style={{
            backgroundImage: 'url("/smblbp_logo.png")',
          }}
        />
      </div>
    </div>
  );
}
