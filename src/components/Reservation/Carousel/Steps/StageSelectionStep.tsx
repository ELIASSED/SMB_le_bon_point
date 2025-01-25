"use client";
import React, { useState, useEffect } from "react";
import SortModal from "../SortModal"; // Modale pour trier les stages
import { formatDateWithDay } from "../utils";
import { Stage } from "../types";
const StageSelectionStep = ({ onStageSelected }) => {
  const [stages, setStages] = useState([]); // Liste des stages
  const [loading, setLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // État pour les erreurs éventuelles
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle
  const itemsPerPage = 5; // Nombre d'éléments par page
  const [isSortModalOpen, setIsSortModalOpen] = useState(false); // État pour ouvrir/fermer la modale de tri

  useEffect(() => {
    const fetchStages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/stage"); // Remplacez par l'URL réelle de votre API
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des stages");
        }
        const data = await response.json();
        setStages(data);
      } catch (err) {
        console.error("Erreur :", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStages();
  }, []);

  // Gestion de la pagination
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

  // Mise à jour des données triées depuis la modale
  const handleDataUpdate = (sortedStages) => {
    setStages(sortedStages);
    setCurrentPage(1); // Réinitialiser à la première page après tri
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
  
        {isSortModalOpen && (
          <SortModal
            onDataUpdate={handleDataUpdate}
            onClose={() => setIsSortModalOpen(false)}
          />
        )}
      </div>

      {/* Liste des stages */}
      {stages.length > 0 ? (
        <>
          <div className="space-y-4">
            {paginatedStages.map((stage) => (
              <div
                key={stage.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors shadow-sm"
              >
                {/* Informations du stage */}
                <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-2 md:space-y-0">
                  <div className="text-lg font-semibold text-yellow-600">
                    {new Date(stage.startDate).toLocaleDateString()} -{" "}
                    {new Date(stage.endDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{stage.location}</span>
                  </div>
                  <div
                    className={`text-lg font-medium ${
                      stage.capacity <= 5 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    Places restantes : {stage.capacity}
                  </div>
                </div>

                {/* Prix et bouton */}
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

          {/* Pagination */}
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
