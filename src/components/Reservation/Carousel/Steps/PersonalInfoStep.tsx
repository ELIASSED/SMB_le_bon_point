"use client";
import React, { useState, useEffect } from "react";
import StageList from "../StageList"; // Chemin à adapter selon votre projet

const StageSelectionStep = ({ onStageSelected }) => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Nombre d'éléments par page

  useEffect(() => {
    const fetchStages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/stages");
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

  const handleDataUpdate = (sortedStages) => {
    setStages(sortedStages);
    setCurrentPage(1); // Réinitialiser à la première page après tri
  };

  return (
    <div className="bg-gray-50 p-6 md:p-10 rounded-lg shadow-lg border border-gray-200">

      {/* Gestion des erreurs */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Liste des stages ou chargement */}
      {!error && (
        <StageList
          stages={paginatedStages}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onStageSelected={onStageSelected}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
          handleDataUpdate={handleDataUpdate}
        />
      )}
    </div>
  );
};

export default StageSelectionStep;