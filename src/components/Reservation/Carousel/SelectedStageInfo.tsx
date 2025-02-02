// components/Carousel/SelectedStageInfo.tsx
"use client";

import React from "react";
import { Stage } from "./types";
import { formatDateWithDay } from "./utils";

interface SelectedStageInfoProps {
  selectedStage?: Stage;
}

const SelectedStageInfo: React.FC<SelectedStageInfoProps> = ({ selectedStage }) => {
  if (!selectedStage) {
    return null; // Ne rien afficher si aucun stage n'est sélectionné
  }

  return (
    <div className="mb-6 p-6 border rounded-lg bg-white shadow-md">
      <h3 className="text-xl font-semibold text-indigo-700 mb-4">Stage Sélectionné</h3>
      
      <div className="space-y-2">
        {/* Dates */}
        <p>
          <span className="font-bold">Dates :</span>{" "}
          {formatDateWithDay(selectedStage.startDate)} au{" "}
          {formatDateWithDay(selectedStage.endDate)}
        </p>
        
        {/* Localisation */}
        <p>
          <span className="font-bold">Lieu :</span> {selectedStage.location}
        </p>
        
        {/* Numéro de Stage Préfectoral */}
        <p>
          <span className="font-bold">Numéro de Stage Préfectoral :</span>{" "}
          <span className="font-semibold">{selectedStage.numeroStageAnts}</span>
        </p>
        
        {/* Places Restantes */}
        <p>
          <span className="font-bold">Places Restantes :</span>{" "}
          <span
            className={
              selectedStage.capacity <= 5 ? "text-red-600 font-semibold" : "text-gray-700"
            }
          >
            {selectedStage.capacity}
          </span>
        </p>
        
        {/* Prix */}
        <p>
          <span className="font-bold text-green-600">Prix :</span>{" "}
          {selectedStage.price.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
          })}
        </p>
      </div>
    </div>
  );
};

export default SelectedStageInfo;
