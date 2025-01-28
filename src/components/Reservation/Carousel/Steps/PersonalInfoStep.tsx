"use client";
import React, { useState, useEffect } from "react";
import MergedForm from "../Form/MergedForm";
import SelectedStageInfo from "../SelectedStageInfo";
import { formatDateWithDay } from "../utils";

interface PaymentStepProps {
  selectedStage: Stage | null;
  clientSecret: string | null;
  onPaymentSuccess: () => void;
}

const StageSelectionStep = ({ onStageSelected }) => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Nombre d'éléments par page
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
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

  const handleStageSelect = (stage: Stage) => {
    setSelectedStage(stage);
    // Si vous voulez faire remonter l'info au parent :
     if (onStageSelected) onStageSelected(stage);
  };
  const renderSelectedStage = () => {
    if (!selectedStage) return null;

    return (
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Stage Sélectionné</h3>
        <p>
          <span className="font-bold">Dates :</span>{" "}
          {formatDateWithDay(selectedStage.startDate)} au{" "}
          {formatDateWithDay(selectedStage.endDate)}
        </p>
        <p>
          <span className="font-bold">{selectedStage.location}</span>
        </p>
        <p>
          <span className="font-bold">Numéro de stage préfectoral :</span>{" "}
          <span className="font-semibold">{selectedStage.numeroStageAnts}</span>
        </p>
        <p>
          <span className="font-bold">Places restantes :</span>{" "}
          <span
            className={
              selectedStage.capacity <= 5 ? "text-red-600 " : "text-gray-600 "
            }
          >
            {selectedStage.capacity}
          </span>
        </p>
        <p>
          <span className="font-bold text-green-600">Prix :</span>{" "}
          {selectedStage.price.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
          })}
        </p>
      </div>
    );
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