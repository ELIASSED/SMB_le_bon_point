"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import PersonalInfoForm, { PersonalInfo } from "./PersonalInfoForm";
import DrivingLicenseForm, { DrivingLicenseInfo } from "./DrivingLicenseForm";

interface Stage {
  id: number;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
}

export default function Carousel() {
  const [currentStep, setCurrentStep] = useState(0); // Étape actuelle
  const [stages, setStages] = useState<Stage[]>([]); // Liste des stages
  const [loading, setLoading] = useState(true); // Indicateur de chargement
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null); // Stage sélectionné
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null); // Données personnelles
  const [drivingLicenseInfo, setDrivingLicenseInfo] = useState<DrivingLicenseInfo | null>(null); // Données du permis

  // Charger les stages depuis l'API
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await fetch("/api/stage");
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des stages");
        }
        const data = await res.json();
        setStages(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStages();
  }, []);

  // Gérer la sélection d'un stage
  const handleStageSelection = (stage: Stage) => {
    setSelectedStage(stage);
    setCurrentStep(1); // Passer à l'étape des informations personnelles
  };

  // Gérer la soumission des informations personnelles
  const handlePersonalInfoSubmit = (data: PersonalInfo) => {
    setPersonalInfo(data);
    setCurrentStep(2); // Passer à l'étape des informations du permis
  };

  // Gérer la soumission des informations du permis
  const handleDrivingLicenseSubmit = async (data: DrivingLicenseInfo) => {
    setDrivingLicenseInfo(data);

    // Combiner toutes les données
    if (!selectedStage || !personalInfo) return;

    const fullData = {
      ...personalInfo,
      ...data,
      stageId: selectedStage.id,
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullData),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'inscription");
      }

      alert("Inscription réussie !");
      setCurrentStep(0);
      setSelectedStage(null);
      setPersonalInfo(null);
      setDrivingLicenseInfo(null);
    } catch (err) {
      console.error("Erreur:", err);
      alert("Une erreur est survenue lors de l'inscription.");
    }
  };

  // Afficher les informations du stage sélectionné
  const renderSelectedStageInfo = () =>
    selectedStage && (
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Stage Sélectionné</h3>
        <p>
          <span className="font-bold">Dates: </span>
          {new Date(selectedStage.startDate).toLocaleDateString("fr-FR")} -{" "}
          {new Date(selectedStage.endDate).toLocaleDateString("fr-FR")}
        </p>
        <p>
          <span className="font-bold">Lieu: </span>
          {selectedStage.location}
        </p>
        <p>
          <span className="font-bold">Places restantes: </span>
          {selectedStage.capacity}
        </p>
      </div>
    );

  const steps = [
    {
      title: "",
      content: (
        <div className="flex flex-col items-center bg-gray-50 p-8 rounded-lg shadow-md">
          <div className="relative w-full h-64 mb-4">
            <Image
              src="/images/center.png"
              alt="Bannière Stage Permis"
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
            />
          </div>
          <h3 className="text-xl font-bold mb-4">Stages disponibles</h3>
          {loading ? (
            <p>Chargement des stages...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  <p className="text-lg font-bold text-yellow-600">
                    Stage du {new Date(stage.startDate).toLocaleDateString("fr-FR")} au{" "}
                    {new Date(stage.endDate).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="text-sm text-gray-700">Lieu: {stage.location}</p>
                  <p className="text-sm text-gray-600">Places restantes: {stage.capacity}</p>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mt-2"
                    onClick={() => handleStageSelection(stage)}
                  >
                    Réserver
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Informations personnelles",
      content: (
        <>
          {renderSelectedStageInfo()}
          <PersonalInfoForm
            initialData={personalInfo} // Pré-remplir avec les données existantes
            onNext={handlePersonalInfoSubmit}
          />
        </>
      ),
    },
    {
      title: "Informations du permis de conduire",
      content: (
        <>
          {renderSelectedStageInfo()}
          <DrivingLicenseForm
            initialData={drivingLicenseInfo} // Pré-remplir avec les données existantes
            onSubmit={handleDrivingLicenseSubmit}
          />
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl">
        {steps[currentStep].title && (
          <h2 className="text-2xl font-bold mb-6 text-center">{steps[currentStep].title}</h2>
        )}
        <div>{steps[currentStep].content}</div>
        {currentStep > 0 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
            >
              Précédent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
