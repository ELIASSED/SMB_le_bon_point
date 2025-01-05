"use client";
import React, { useState } from "react";
import { Stage } from "../types";
import { formatDateWithDay } from "../utils";

interface StageSelectionStepProps {
  stages: Stage[];
  loading: boolean;
  onStageSelected: (stage: Stage) => void;
}

const StageSelectionStep: React.FC<StageSelectionStepProps> = ({
  stages,
  loading,
  onStageSelected,
}) => {
  // -- États pour la pagination --
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5; // Nombre de stages à afficher par page

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(stages.length / pageSize);

  // Extraction des stages pour la page courante
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStages = stages.slice(startIndex, endIndex);

  // Fonctions de navigation
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="bg-gray-50 p-4 md:p-8 rounded-lg shadow-md">
      <h3 className="text-lg md:text-xl font-bold mb-4">Stages disponibles</h3>

      {loading ? (
        <p>Chargement des stages...</p>
      ) : (
        <>
          {/* Liste paginée des stages */}
          <div className="space-y-4">
            {paginatedStages.map((stage) => (
              <div
                key={stage.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between border-b p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Informations sur le stage */}
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-8 mb-4 md:mb-0">
                  <div className="text-base md:text-lg font-bold text-yellow-600">
                    {formatDateWithDay(stage.startDate)} au {formatDateWithDay(stage.endDate)}
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">{stage.location}</span>
                  </div>
                  <div
                    className={`text-base md:text-lg font-semibold ${
                      stage.capacity <= 5 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    <span>Places restantes: {stage.capacity}</span>
                  </div>
                </div>

                {/* Prix et bouton de réservation */}
                <div className="flex items-center justify-between md:justify-end space-x-4">
                  <div className="text-base md:text-lg font-bold text-gray">
                    {stage.price.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </div>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
                    onClick={() => onStageSelected(stage)}
                  >
                    Réserver
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Contrôles de pagination */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`py-2 px-4 rounded ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Précédent
            </button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`py-2 px-4 rounded ${
                currentPage === totalPages
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Suivant
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StageSelectionStep;
