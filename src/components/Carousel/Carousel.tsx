// components/Carousel/Carousel.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createPaymentIntent, registerUser, sendConfirmationEmail } from "../../lib/api";
import { Stage, RegistrationInfo } from "../types";
import ProgressBar from "./ProgressBar";
import StageSelectionStep from "./Steps/StageSelectionStep";
import PersonalInfoStep from "./Steps/PersonalInfoStep";
import PaymentStep from "./Steps/PaymentStep";

export default function Carousel() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [registrationInfo, setRegistrationInfo] = useState<RegistrationInfo | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const router = useRouter();

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  // Étape 1 : Sélection du stage
  const handleStageSelection = async (stage: Stage) => {
    try {
      setSelectedStage(stage);
      const paymentIntent = await createPaymentIntent(stage);
      setClientSecret(paymentIntent.clientSecret);
      nextStep();
    } catch (err: any) {
      console.error("Erreur lors de la sélection du stage :", err.message);
      setError("Impossible de sélectionner le stage. Veuillez réessayer.");
    }
  };

  // Étape 2 : Soumission des infos d'inscription
  const handleRegistrationSubmit = (info: RegistrationInfo) => {
    console.log("Données d'inscription :", info);
    setRegistrationInfo(info);
    nextStep();
  };

  // Étape 3 : Paiement réussi, finalisation de l'inscription
  const handlePaymentSuccess = async () => {
    if (!selectedStage || !registrationInfo) return;
    try {
      setIsSubmitting(true);
      const registrationData = {
        stageId: selectedStage.id,
        userData: registrationInfo,
      };
      await registerUser(registrationData);
      await sendConfirmationEmail({
        to: registrationInfo.email,
        subject: "Confirmation d'inscription",
        text: `Votre inscription au stage ${selectedStage.description} est confirmée.`,
        html: `<p>Merci pour votre inscription au stage ${selectedStage.description}.</p>`,
      });
      router.push("/success");
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement :", err.message);
      setError("L'inscription a échoué. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Sélectionnez un stage",
      content: <StageSelectionStep onStageSelected={handleStageSelection} />,
    },
    {
      title: "Formulaire d'inscription",
      content: (
        <PersonalInfoStep
          selectedStage={selectedStage!}
          onSubmit={handleRegistrationSubmit}
        />
      ),
    },
    {
      title: "Paiement",
      content: (
        <PaymentStep
          selectedStage={selectedStage!}
          clientSecret={clientSecret!}
          onPaymentSuccess={handlePaymentSuccess}
        />
      ),
    },
  ];

  return (
    <div className="carousel-container max-w-4xl mx-auto">
      <ProgressBar currentStep={currentStep} stepsLength={steps.length} />
      <h1 className="text-2xl font-bold mb-4">{steps[currentStep].title}</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="step-content">{steps[currentStep].content}</div>
      <div className="navigation mt-6 flex justify-between">
        {currentStep > 0 && (
          <button
            onClick={prevStep}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Précédent
          </button>
        )}
      </div>
      {isSubmitting && <p className="text-center mt-4">Envoi en cours...</p>}
    </div>
  );
}
