"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Stage } from "../types";
import { formatDateWithDay } from "../utils";
import SortModal from "../SortModal";

interface StageSelectionStepProps {
  onStageSelected: (stage: Stage) => void;
}

const StageSelectionStep: React.FC<StageSelectionStepProps> = ({
  onStageSelected,
}) => {
  // États pour les données, le chargement, la pagination, et les erreurs
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // Calcul des données paginées
  const totalPages = Math.ceil(stages.length / pageSize);
  const paginatedStages = stages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Fetch des stages avec gestion d'erreurs et timeout
  const fetchStages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Timeout explicite avec abort controller
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes

      const response = await axios.get("/api/stage", {
        signal: controller.signal,
      });
      setStages(response.data);
      clearTimeout(timeout);
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("La requête a expiré. Réessayez.");
      } else {
        setError("Erreur lors du chargement des stages.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  // Navigation dans les pages
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="bg-gray-50 p-4 md:p-8 rounded-lg shadow-md">
      <h3 className="text-lg md:text-xl font-bold mb-4">Stages disponibles</h3>

      <SortModal onDataUpdate={setStages} />

      {loading ? (
        <p>Chargement des stages...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedStages.map((stage) => (
              <div
                key={stage.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between border-b p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-8 mb-4 md:mb-0">
                  <div className="text-base md:text-lg font-bold text-yellow-600">
                    {formatDateWithDay(stage.startDate)} au{" "}
                    {formatDateWithDay(stage.endDate)}
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
