"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createPaymentIntent, registerUser, sendConfirmationEmail } from "../../lib/api";
import { Stage, RegistrationInfo } from "./types";
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

  const nextStep = () => {
    console.log("Passage au step suivant, currentStep =", currentStep);
    setCurrentStep((prev) => prev + 1);
    setError(null); // Réinitialiser l'erreur à chaque étape
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setError(null);
  };

  const handleStageSelection = async (stage: Stage) => {
    try {
      console.log("Stage sélectionné :", stage);
      setSelectedStage(stage);
      const paymentIntent = await createPaymentIntent(stage);
      setClientSecret(paymentIntent.clientSecret);
      nextStep();
    } catch (err: any) {
      console.error("Erreur lors de la sélection du stage :", err.message);
      setError("Impossible de sélectionner le stage. Veuillez réessayer.");
    }
  };

  const handlePersonalInfoSubmit = (data: FormData) => {
    const formEntries = Object.fromEntries(data.entries());
    formEntries.email = formEntries.email.toLowerCase().trim();
    formEntries.confirmationEmail = formEntries.confirmationEmail.toLowerCase().trim();
    console.log("Données step2 normalisées:", formEntries);
    setRegistrationInfo(formEntries as unknown as RegistrationInfo);
    nextStep();
  };

  const handlePaymentSuccess = async () => {
    if (!selectedStage || !registrationInfo) {
      console.error("Stage ou informations d'inscription manquants.");
      setError("Certaines informations nécessaires sont manquantes. Veuillez revenir en arrière et vérifier.");
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const registrationData = { stageId: selectedStage.id, userData: registrationInfo };
      console.log("Envoi à l'API :", registrationData);
      const response = await registerUser(registrationData);

      if (response.error) {
        setError(response.error); // Afficher le message d'erreur exact du backend
        return;
      }

      await sendConfirmationEmail({
        to: registrationInfo.email,
        subject: "Confirmation d'inscription",
        text: `Votre inscription au stage ${selectedStage.description} est confirmée.`,
        html: `<p>Merci pour votre inscription au stage ${selectedStage.description}.</p>`,
      });
      router.push("/success");
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement :", err.message);
      setError(err.message || "Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
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
      content: selectedStage ? (
        <PersonalInfoStep selectedStage={selectedStage} onSubmit={handlePersonalInfoSubmit} />
      ) : (
        <p>Veuillez sélectionner un stage avant de continuer.</p>
      ),
    },
    {
      title: "Paiement",
      content: selectedStage && clientSecret ? (
        <PaymentStep selectedStage={selectedStage} clientSecret={clientSecret} onPaymentSuccess={handlePaymentSuccess} />
      ) : (
        <p>Informations de paiement non disponibles.</p>
      ),
    },
  ];

  return (
    <div className="carousel-container max-w-4xl mx-auto">
      <ProgressBar currentStep={currentStep} stepsLength={steps.length} />
      <h1 className="text-2xl font-bold mb-4">{steps[currentStep].title}</h1>
      {error && (
        <div
          className="text-red-500 text-center mb-4 p-3 bg-red-100 border border-red-400 rounded"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="step-content">{steps[currentStep].content}</div>
      <div className="navigation mt-6 flex justify-between">
        {currentStep > 0 && (
          <button
            onClick={prevStep}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            disabled={isSubmitting}
          >
            Précédent
          </button>
        )}
      </div>
      {isSubmitting && <p className="text-center mt-4">Inscription en cours...</p>}
    </div>
  );
}