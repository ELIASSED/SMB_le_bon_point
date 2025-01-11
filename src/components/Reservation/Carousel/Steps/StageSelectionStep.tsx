"use client";
import React, { useState, useEffect } from "react";
import axios from "axios"; // Ajout de l'importation manquante pour Axios
import { Stage } from "../types";
import { formatDateWithDay } from "../utils";
import SortModal from "../SortModal";

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
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5; // Nombre de stages par page

  // États pour les stages et les erreurs
  const [stageList, setStageList] = useState<Stage[]>(stages);
  const [error, setError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [isLoading, setLoading] = useState<boolean>(loading);

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(stageList.length / pageSize);

  // Stages pour la page actuelle
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStages = stageList.slice(startIndex, endIndex);

  // Navigation dans les pages
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Fonction pour récupérer les stages depuis l'API
  const fetchStages = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/stage");
      setStageList(response.data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des stages");
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir les données périodiquement
  useEffect(() => {
    fetchStages();
    const interval = setInterval(fetchStages, 30000); // Rafraîchir toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  // Gestion de la sélection d'un stage
  const handleStageSelect = (stageId: string) => {
    setSelectedStage(stageId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStage) {
      setError("Veuillez sélectionner un stage");
      return;
    }

    const selectedStageData = stageList.find((stage) => stage.id === selectedStage);

    if (!selectedStageData) {
      setError("Stage non trouvé");
      return;
    }

    try {
      await axios.post("/api/stage/select", { stageId: selectedStage });
      onStageSelected(selectedStageData);
    } catch (err) {
      setError("Erreur lors de la sélection du stage");
      console.error("Erreur de soumission:", err);
    }
  };

  // Mise à jour des données après tri
  const handleDataUpdate = (data: Stage[]) => {
    setStageList(data);
  };

  return (
    <div className="bg-gray-50 p-4 md:p-8 rounded-lg shadow-md">
      <h3 className="text-lg md:text-xl font-bold mb-4">Stages disponibles</h3>

      {/* Bouton pour ouvrir la modale de tri */}
      <SortModal onDataUpdate={handleDataUpdate} />

      {isLoading ? (
        <p>Chargement des stages...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Liste paginée des stages */}
          <div className="space-y-4">
            {paginatedStages.map((stage) => (
              <div
                key={stage.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between border-b p-4 hover:bg-gray-50 transition-colors"
              >
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
                    Places restantes: {stage.capacity}
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
                    onClick={() => handleStageSelect(stage.id)}
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
