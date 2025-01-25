"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  fetchStages,
  createPaymentIntent,
  registerUser,
  sendConfirmationEmail,
} from "../../../lib/api";

import ProgressBar from "./ProgressBar";
import StageSelectionStep from "./Steps/StageSelectionStep";
import PersonalInfoStep from "./Steps/PersonalInfoStep";
import PaymentStep from "./Steps/PaymentStep";

export default function Carousel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    async function loadStages() {
      try {
        const data = await fetchStages();
        setStages(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des stages :", err.message);
        setError("Impossible de charger les stages. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    }

    loadStages();
  }, []);

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => Math.max(0, prev - 1));

  const handleStageSelection = async (stage) => {
    try {
      setSelectedStage(stage);
      const paymentIntent = await createPaymentIntent(stage);
      setClientSecret(paymentIntent.clientSecret);
      nextStep();
    } catch (err) {
      console.error("Erreur lors de la sélection du stage :", err.message);
      setError("Impossible de créer un paiement. Veuillez réessayer.");
    }
  };

  const handlePersonalInfoSubmit = (data) => {
    setPersonalInfo(data);
    nextStep();
  };

  const handleRegistration = async () => {
    if (!selectedStage || !personalInfo) return;

    try {
      const registrationData = {
        stageId: selectedStage.id,
        userData: personalInfo,
      };

      await registerUser(registrationData);
      await sendConfirmationEmail({
        to: personalInfo.email,
        subject: "Confirmation d'inscription",
        text: `Votre inscription au stage ${selectedStage.description} est confirmée.`,
        html: `<p>Merci pour votre inscription au stage ${selectedStage.description}.</p>`,
      });

      router.push("/success");
    } catch (err) {
      console.error("Erreur lors de l'enregistrement :", err.message);
      setError("L'inscription a échoué. Veuillez réessayer.");
    }
  };

  const steps = [
    {
      title: "Sélectionnez un stage",
      content: (
        <StageSelectionStep
          stages={stages}
          loading={loading}
          onStageSelected={handleStageSelection}
        />
      ),
    },
    {
      title: "",
      content: (
        <PersonalInfoStep
          selectedStage={selectedStage}
          onSubmit={handlePersonalInfoSubmit}
        />
      ),
    },
    {
      title: "Paiement",
      content: (
        <PaymentStep
          selectedStage={selectedStage}
          clientSecret={clientSecret}
          onPaymentSuccess={handleRegistration}
        />
      ),
    },
  ];

  return (
    <div className="carousel-container">
      <ProgressBar currentStep={currentStep} stepsLength={steps.length} />
      <h1>{steps[currentStep].title}</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div>{steps[currentStep].content}</div>
      <div className="navigation">
        {currentStep > 0 && (
          <button onClick={prevStep} className="btn-secondary">
            Précédent
          </button>
        )}
      </div>
    </div>
  );
}
