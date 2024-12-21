"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PersonalInfoForm, { PersonalInfo } from "./PersonalInfoForm";
import DrivingLicenseForm, { DrivingLicenseInfo } from "./DrivingLicenseForm";

interface Stage {
  id: number;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  price: number;
}

export default function Carousel() {
  const [currentStep, setCurrentStep] = useState(0); // Current step in the carousel
  const [stages, setStages] = useState<Stage[]>([]); // List of stages
  const [loading, setLoading] = useState(true); // Loading indicator
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null); // Selected stage
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null); // Personal info data
  const [drivingLicenseInfo, setDrivingLicenseInfo] = useState<DrivingLicenseInfo | null>(null); // Driving license data
  const router = useRouter();

  // Fetch stages from the API
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const response = await fetch("/api/stage");
        if (!response.ok) throw new Error("Erreur lors de la récupération des stages");
        const data = await response.json();
        setStages(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStages();
  }, []);

  // Handle stage selection
  const handleStageSelection = (stage: Stage) => {
    setSelectedStage(stage);
    setCurrentStep(1);
  };

  // Handle personal info submission
  const handlePersonalInfoSubmit = (data: PersonalInfo) => {
    setPersonalInfo(data);
    setCurrentStep(2);
  };

  // Handle driving license submission
  const handleDrivingLicenseSubmit = (data: DrivingLicenseInfo) => {
    setDrivingLicenseInfo(data);
    setCurrentStep(3);
  };

  // Handle registration and payment
  const handleRegistration = async () => {
    if (!selectedStage || !personalInfo || !drivingLicenseInfo) return;

    const fullData = {
      stageId: selectedStage.id,
      userData: personalInfo,
      drivingLicenseData: drivingLicenseInfo,
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'inscription");
      }

      const result = await response.json();
      alert(result.message);

      // Redirect to success page
      router.push("/success");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue lors de l'inscription.");
    }
  };

  // Progress bar and step indicators
  const renderProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              index <= currentStep ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>
      <div className="relative w-full h-2 bg-gray-300 rounded-full">
        <div
          className="absolute top-0 left-0 h-2 bg-green-500 rounded-full"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  // Steps array for the carousel
  const steps = [
    {
      title: "Sélectionnez un stage",
      content: (
        <div className="bg-gray-50 p-8 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Stages disponibles</h3>
          {loading ? (
            <p>Chargement des stages...</p>
          ) : (
            <div className="space-y-4">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between border-b p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-8">
                    <div className="text-lg font-bold text-yellow-600">
                      {new Date(stage.startDate).toLocaleDateString("fr-FR")} au {" "}
                      {new Date(stage.endDate).toLocaleDateString("fr-FR")}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Lieu :</span> {stage.location}
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        stage.capacity <= 5 ? "text-red-600" : "text-gray-600"
                      }`}
                    >
                      <span>Places restantes</span> {stage.capacity}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-lg font-bold text-green-600">
                      {stage.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </div>
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                      onClick={() => handleStageSelection(stage)}
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Informations personnelles",
      content: <PersonalInfoForm onNext={handlePersonalInfoSubmit} />,
    },
    {
      title: "Informations du permis de conduire",
      content: <DrivingLicenseForm onSubmit={handleDrivingLicenseSubmit} />,
    },
    {
      title: "Paiement",
      content: (
        <div>
          <h3 className="text-xl font-bold mb-4">Effectuez votre paiement</h3>
          <button
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            onClick={handleRegistration}
          >
            Finaliser et Payer
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl">
        {renderProgress()}
        <h2 className="text-2xl font-bold mb-6 text-center">{steps[currentStep].title}</h2>
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
