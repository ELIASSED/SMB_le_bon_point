"use client";
import React, { useState, useEffect } from "react";
import MergedForm, { MergedFormData } from "../Form/MergedForm";
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
        <MergedForm onSubmit={function (data: MergedFormData): void {
          throw new Error("Function not implemented.");
        } }         
        />
      )}
    </div>
  );
};

export default StageSelectionStep;