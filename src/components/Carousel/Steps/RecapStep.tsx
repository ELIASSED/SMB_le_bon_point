// src/components/Carousel/Steps/RecapStep.tsx
"use client";

import React from "react";
import { FiCheckCircle, FiMail } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Stage, RegistrationInfo } from "../types";
import { formatDateWithDay } from "../../utils";

interface RecapStepProps {
  selectedStage: Stage | null;
  registrationInfo: RegistrationInfo | null;
  paymentIntentId: string | null;
}

export default function RecapStep({ selectedStage, registrationInfo, paymentIntentId }: RecapStepProps) {
  const router = useRouter();

  if (!selectedStage || !registrationInfo || !paymentIntentId) {
    return (
      <p className="text-gray-500 text-center">
        Veuillez compléter le paiement pour voir le récapitulatif.
      </p>
    );
  }
 
  return (
    <div className="min-h-[400px] bg-gray-50 flex items-center justify-center px-4">
      {/* Conteneur global pour la carte + l'image */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Colonne gauche : Message de confirmation et récapitulatif */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center text-center">
          <div className="mb-4 text-green-600 flex justify-center">
            <FiCheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            Inscription réussie  au  <p>
              <strong>stage </strong> {selectedStage.numeroStageAnts}
            </p>
          </h1>
          <div className="text-gray-700 mb-6 text-left">
            <p>
       {registrationInfo.prenom} {registrationInfo.nom}
            </p>
            <p>
              <strong>Lieu du stage :</strong> {selectedStage.location}
            </p>
           
            <p>
              <strong>Dates :</strong> {formatDateWithDay(selectedStage.startDate)} -{" "}
              {formatDateWithDay(selectedStage.endDate)}
            </p>
            <p>
              <strong>Montant payé :</strong> {(selectedStage.price).toFixed(2)} €
            </p>
         
          </div>
          <div className="flex items-center justify-center mb-6 text-blue-500">
            <FiMail size={32} />
            <span className="ml-2 text-gray-600">
              Un email de confirmation vous a été envoyé à {registrationInfo.email}.
            </span>
          </div>
          <button
            className="bg-[#084c94] hover:bg-blue-600 text-white py-2 px-6 rounded transition-colors"
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