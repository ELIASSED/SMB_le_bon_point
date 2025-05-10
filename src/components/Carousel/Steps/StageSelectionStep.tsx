"use client";

import React, { useState, useEffect } from "react";
import SortOptions from "../SortOptions";
import { formatDateRange } from "../../utils";  // <-- importez formatDateRange
import { Stage } from "../types";  // Assurez-vous que le type Stage est bien importé
import { fetchStages } from "../../../lib/api";  // Assurez-vous que cette fonction existe

interface StageSelectionStepProps {
  onStageSelected: (stage: Stage) => void;
}

const StageSelectionStep = ({ onStageSelected }: StageSelectionStepProps) => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isSortOptionsOpen, setIsSortOpen] = useState(false);

  const fetchStagesFromApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStages(); // Appel API pour récupérer les stages
      setStages(data);
    } catch (err) {
      setError("Erreur lors de la récupération des stages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStagesFromApi();  // Récupérer les stages lorsque le composant est monté
  }, []);

  // Pagination
  const totalPages = Math.ceil(stages.length / itemsPerPage);
  const paginatedStages = stages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handleDataUpdate = (sortedStages: Stage[]) => {
    setStages(sortedStages);
    setCurrentPage(1);  // Réinitialiser la pagination après le tri
  };

  if (loading) {
    return <p className="text-center text-gray-500">Chargement des stages...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Erreur : {error}</p>;
  }

  return (
    <div className="bg-white p-6 md:p-10 rounded-lg shadow-lg border border-gray-200">
      {/* Modale pour trier les stages */}
      <div className="mb-6 flex justify-end">
        {isSortOptionsOpen && <SortOptions onDataUpdate={handleDataUpdate} />}
      </div>

      {stages.length > 0 ? (
        <>
          <div className="space-y-4">
            <SortOptions onDataUpdate={handleDataUpdate} />
            {paginatedStages.map((stage) => (
              <div
                key={stage.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-2 md:space-y-0">
                  <div className="text-lg font-semibold text-yellow-600">
                    {formatDateRange(stage.startDate, stage.endDate)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{stage.location}</span>
                  </div>
                  <div
                    className={`text-ms font-medium ${
                      stage.capacity <= 5 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    Places restantes
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center md:space-x-4 space-y-4 md:space-y-0">
                  <div className="text-lg font-bold text-gray-700">
                    {stage.price.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </div>
                  <button
                    onClick={() => onStageSelected(stage)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded shadow transition"
                  >
                    Réserver
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center items-center space-x-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg shadow ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Précédent
            </button>
            <span className="text-gray-700">
              Page <strong>{currentPage}</strong> / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg shadow ${
                currentPage === totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Suivant
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">Aucun stage disponible pour le moment.</p>
      )}
    </div>
  );
};

export default StageSelectionStep;
