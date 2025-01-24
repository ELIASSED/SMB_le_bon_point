"use client";
import React, { useState, useEffect } from "react";

const StageSelectionStep = ({ onStageSelected }) => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // État pour les erreurs éventuelles

  useEffect(() => {
    const fetchStages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/stage"); // Vérifiez bien cette URL
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

  if (loading) {
    return <p className="text-center text-gray-500">Chargement des stages...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Erreur : {error}</p>;
  }

  return (
    <div className="bg-white p-6 md:p-10 rounded-lg shadow-lg border border-gray-200">
      {stages.length > 0 ? (
        <div className="space-y-4">
          {stages.map((stage) => (
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
      ) : (
        <p className="text-center text-gray-500">Aucun stage disponible pour le moment.</p>
      )}
    </div>
  );
};

export default StageSelectionStep;
