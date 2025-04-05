"use client";

import React, { useState, useEffect } from "react";
import SortOptions from "../SortOptions";
import { formatDateRange } from "../../utils";
import { Stage } from "../types";
import { fetchStages } from "../../../lib/api";
import { CalendarDays, MapPin, Users, CreditCard } from "lucide-react";

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
      const data = await fetchStages();
      setStages(data);
    } catch (err) {
      setError("Erreur lors de la récupération des stages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStagesFromApi();
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
    setCurrentPage(1);
  };

  const getCapacityColor = (capacity: number) => {
    if (capacity <= 2) return "text-red-600 bg-red-50";
    if (capacity <= 5) return "text-orange-600 bg-orange-50";
    return "text-green-600 bg-green-50";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
        <div className="flex">
          <div className="py-1">
            <svg className="h-6 w-6 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-bold">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-10 rounded-lg shadow-lg border border-gray-200">

      
      <div className="mb-6">
        <SortOptions onDataUpdate={handleDataUpdate} />
      </div>

      {stages.length > 0 ? (
        <>
          <div className="space-y-4">
            {paginatedStages.map((stage) => (
              <div
                key={stage.id}
                className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="space-y-3">  <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <span className="text-xl font-bold text-gray-800">
                        {stage.price.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </div>
                    
                    
                    
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${getCapacityColor(stage.capacity)}`}>
                        {stage.capacity} {stage.capacity > 1 ? 'places disponibles' : 'place disponible'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                      <CalendarDays className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-blue-600">
                        {formatDateRange(stage.startDate, stage.endDate)}
                      </h3>
                    </div>
                    
            
                  <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end space-y-3">
                  
                    <button
                      onClick={() => onStageSelected(stage)}
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow transition-colors duration-200"
                    >
                      Voir le stage
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Précédent</span>
              </button>
              
              <span className="text-gray-700">
                Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                <span>Suivant</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun stage disponible</h3>
          <p className="mt-1 text-gray-500">Aucune session de stage n'est disponible pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default StageSelectionStep;