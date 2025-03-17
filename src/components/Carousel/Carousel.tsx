// components/Carousel/Carousel.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { generateConfirmationEmail } from "../../lib/emailUtils";
import { formatDateWithDay } from "../utils"; // Ajout de l'importation
import { Stage, RegistrationInfo } from "./types";
import StageSelectionStep from "./Steps/StageSelectionStep";
import PersonalInfoStep from "./Steps/PersonalInfoStep";
import PaymentStep from "./Steps/PaymentStep";
import ProgressBar from "./ProgressBar";
import { createPaymentIntent, registerUser } from "../../lib/api";

export default function Carousel() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [registrationInfo, setRegistrationInfo] = useState<RegistrationInfo | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const router = useRouter();

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
    setError(null);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setError(null);
  };

  const handleStageSelection = async (stage: Stage) => {
    try {
      console.log("Stage sélectionné :", stage);
      setSelectedStage(stage);
      setSessionId(stage.id);
      console.log("sessionId défini :", stage.id);

      const paymentIntent = await createPaymentIntent(stage);
      setClientSecret(paymentIntent.clientSecret);
      console.log("clientSecret défini :", paymentIntent.clientSecret);
      nextStep();
    } catch (err: any) {
      console.error("Erreur lors de la sélection du stage :", err.message);
      setError("Impossible de sélectionner le stage. Veuillez réessayer.");
    }
  };

  const handlePersonalInfoSubmit = async (data: FormData) => {
    try {
      const formEntries = Object.fromEntries(data.entries()) as unknown as RegistrationInfo;
      formEntries.email = formEntries.email.toLowerCase().trim();
      formEntries.confirmationEmail = formEntries.confirmationEmail.toLowerCase().trim();
      console.log("Données personnelles normalisées :", formEntries);
      setRegistrationInfo(formEntries);

      if (!selectedStage) {
        setError("Aucun stage sélectionné.");
        return;
      }

      const registrationData = { stageId: selectedStage.id, userData: formEntries };
      const response = await registerUser(registrationData);

      if (response.error) {
        setError(response.error);
        return;
      }

      setUserId(response.user.id);
      console.log("userId défini :", response.user.id);
      nextStep();
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement initial :", err.message);
      setError(err.message || "Erreur lors de l'enregistrement des informations. Veuillez réessayer.");
    }
  };

const handlePaymentSuccess = async (paymentIntentId: string) => {
  console.log("handlePaymentSuccess appelé avec paymentIntentId :", paymentIntentId);
  if (!selectedStage || !registrationInfo || !sessionId || !userId || !paymentIntentId) {
    console.error("Données manquantes pour finaliser le paiement :", {
      selectedStage,
      registrationInfo,
      sessionId,
      userId,
      paymentIntentId,
    });
    setError("Informations manquantes. Veuillez revenir en arrière et vérifier.");
    return;
  }

  try {
    setIsSubmitting(true);
    setError(null);

    console.log("Envoi à /api/confirm-payment :", { sessionId, userId, paymentIntentId });
    const updateResponse = await fetch("/api/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, userId, paymentIntentId }),
    });

    const updateResult = await updateResponse.json();
    console.log("Réponse de /api/confirm-payment :", updateResult);

    if (!updateResponse.ok) {
      throw new Error(updateResult.error || "Erreur lors de la mise à jour du paiement.");
    }

    if (!updateResult.sessionUser.isPaid) {
      throw new Error("Le statut de paiement n'a pas été mis à jour correctement.");
    }

    console.log("Paiement confirmé, redirection vers /success...");
    router.push("/success");

    try {
      const formattedStartDate = formatDateWithDay(selectedStage.startDate);
      const formattedEndDate = formatDateWithDay(selectedStage.endDate);
      const emailHTML = generateConfirmationEmail(
        registrationInfo.prenom,
        registrationInfo.nom,
        selectedStage.location,
        selectedStage.numeroStageAnts,
        formattedStartDate,
        formattedEndDate,
        "smblebonpoint@gmail.com",
        "06 19 77 47 82"
      );

      console.log("Envoi de l'email via /api/send-mail...");
      const emailResponse = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: registrationInfo.email,
          subject: "Confirmation de votre inscription au stage",
          text: `Bonjour ${registrationInfo.prenom} ${registrationInfo.nom}, votre inscription au stage ${
            selectedStage.description || "Session #" + selectedStage.id
          } est confirmée.`,
          html: emailHTML,
        }),
      });

      const emailResult = await emailResponse.json();
      console.log("Réponse de /api/send-mail :", emailResult);

      if (!emailResponse.ok) {
        console.error("Échec de l'envoi de l'email :", emailResult.error);
      }
    } catch (emailError: any) {
      console.error("Erreur lors de l'envoi de l'email (non bloquant) :", emailError.message);
    }
  } catch (err: any) {
    console.error("Erreur dans handlePaymentSuccess :", err.message);
    setError(err.message || "Une erreur est survenue après le paiement. Contactez-nous.");
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
        <PersonalInfoStep
          selectedStage={selectedStage}
          onSubmit={handlePersonalInfoSubmit}
          setRegistrationInfo={setRegistrationInfo}
          nextStep={nextStep}
        />
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
        <div className="text-red-500 text-center mb-4 p-3 bg-red-100 border border-red-400 rounded" role="alert">
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
      {isSubmitting && <p className="text-center mt-4">Traitement en cours...</p>}
    </div>
  );
}