"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { generateConfirmationEmail } from "../../lib/emailUtils";
import { formatDateWithDay } from "../utils";
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
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    setError(null);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setError(null);
  };

  const handleStageSelection = async (stage: Stage) => {
    try {
      console.log("Stage sélectionné :", stage);
      if (!stage?.id) throw new Error("Stage invalide ou ID manquant.");
      setSelectedStage(stage);
      setSessionId(stage.id);
      console.log("sessionId défini :", stage.id);

      const paymentIntent = await createPaymentIntent(stage);
      console.log("Réponse de createPaymentIntent :", paymentIntent);
      if (!paymentIntent?.clientSecret) {
        throw new Error("clientSecret non retourné par l'API");
      }
      setClientSecret(paymentIntent.clientSecret);
      console.log("clientSecret défini :", paymentIntent.clientSecret);
      nextStep();
    } catch (err: any) {
      console.error("Erreur lors de la sélection du stage :", err.message, err.stack);
      setError(err.message || "Impossible de sélectionner le stage. Veuillez réessayer.");
    }
  };

  const handlePersonalInfoSubmit = async (data: FormData) => {
    try {
      console.log("Début de handlePersonalInfoSubmit...");
      setIsSubmitting(true);
      setError(null);

      const formEntries = Object.fromEntries(data.entries()) as unknown as RegistrationInfo;
      if (!formEntries.email || !formEntries.confirmationEmail) {
        throw new Error("Email ou confirmation d'email manquant.");
      }
      formEntries.email = formEntries.email.toLowerCase().trim();
      formEntries.confirmationEmail = formEntries.confirmationEmail.toLowerCase().trim();
      console.log("Données personnelles normalisées :", formEntries);
      setRegistrationInfo(formEntries);

      if (!selectedStage || !selectedStage.id) {
        console.error("Aucun stage sélectionné ou ID manquant.");
        throw new Error("Aucun stage sélectionné.");
      }

      const registrationData = { stageId: selectedStage.id, userData: formEntries };
      console.log("Envoi à /api/register avec :", registrationData);

      let response;
      try {
        response = await registerUser(registrationData);
      } catch (apiError: any) {
        throw new Error(`Échec de l'appel à /api/register : ${apiError.message}`);
      }
      console.log("Réponse de registerUser :", response);

      if (response.error) {
        console.error("Erreur retournée par registerUser :", response.error);
        throw new Error(response.error);
      }

      if (!response.user?.id) {
        throw new Error("ID utilisateur non retourné par l'API.");
      }

      setUserId(response.user.id);
      console.log("userId défini :", response.user.id);
      nextStep();
    } catch (err: any) {
      console.error("Erreur dans handlePersonalInfoSubmit :", err.message, err.stack);
      setError(err.message || "Erreur lors de l'enregistrement des informations. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
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
      setError("Informations manquantes. Veuillez revenir en arrière et vérifier toutes les étapes.");
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

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Échec de /api/confirm-payment : ${errorText}`);
      }

      const updateResult = await updateResponse.json();
      console.log("Réponse de /api/confirm-payment :", updateResult);

      if (!updateResult.sessionUser?.isPaid) {
        throw new Error("Le statut de paiement n'a pas été mis à jour correctement.");
      }

      console.log("Paiement confirmé, redirection vers /success...");
      router.push("/success");

      // Envoi de l'email (non bloquant)
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
          "support@votre-site.com",
          "01 23 45 67 89"
        );

        console.log("Envoi de l'email via /api/send-mail...");
        const emailResponse = await fetch("/api/send-mail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: registrationInfo.email,
            subject: "Confirmation de votre inscription au stage",
            text: `Bonjour ${registrationInfo.prenom} ${registrationInfo.nom}, votre inscription est confirmée.`,
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
      console.error("Erreur dans handlePaymentSuccess :", err.message, err.stack);
      setError(err.message || "Erreur après le paiement. Contactez le support.");
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
        <p className="text-gray-500">Veuillez sélectionner un stage avant de continuer.</p>
      ),
    },
    {
      title: "Finalisez votre paiement",
      content: selectedStage && clientSecret ? (
        <PaymentStep
          selectedStage={selectedStage}
          clientSecret={clientSecret}
          onPaymentSuccess={handlePaymentSuccess}
        />
      ) : (
        <p className="text-red-500">
          Informations de paiement non disponibles. Veuillez compléter les étapes précédentes ou réessayer.
        </p>
      ),
    },
  ];

  return (
    <div className="carousel-container max-w-4xl mx-auto">
      <ProgressBar currentStep={currentStep} stepsLength={steps.length} />
      {currentStep >= 0 && currentStep < steps.length ? (
        <>
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
        </>
      ) : (
        <p className="text-red-500 text-center">
          Étape invalide. Veuillez recharger la page ou contacter le support.
        </p>
      )}
      {isSubmitting && (
        <p className="text-center mt-4 text-gray-600">Traitement en cours...</p>
      )}
    </div>
  );
}