"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateWithDay } from "../utils";
import { Stage, RegistrationInfo } from "./types";
import StageSelectionStep from "./Steps/StageSelectionStep";
import PersonalInfoStep from "./Steps/PersonalInfoStep";
import PaymentStep from "./Steps/PaymentStep";
import RecapStep from "./Steps/RecapStep";
import ProgressBar from "./ProgressBar";
import { createPaymentIntent, registerUser } from "../../lib/api";

export default function Carousel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [registrationInfo, setRegistrationInfo] = useState<RegistrationInfo | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

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
      setSelectedStage(stage);
      const paymentIntent = await createPaymentIntent(stage);
      if (!paymentIntent.clientSecret) {
        throw new Error("clientSecret non retourné par l'API");
      }
      setClientSecret(paymentIntent.clientSecret);
      nextStep();
    } catch (err: any) {
      console.error("Erreur lors de la sélection du stage :", err.message);
      setError("Impossible de sélectionner le stage. Veuillez réessayer.");
    }
  };

  const handlePersonalInfoSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const formEntries = Object.fromEntries(data.entries()) as unknown as RegistrationInfo;
      formEntries.email = formEntries.email.toLowerCase().trim();
      formEntries.confirmationEmail = formEntries.confirmationEmail.toLowerCase().trim();
      setRegistrationInfo(formEntries);

      if (!selectedStage) {
        console.error("Aucun stage sélectionné.");
        setError("Aucun stage sélectionné.");
        return;
      }

      if (!clientSecret) {
        console.error("clientSecret manquant.");
        setError("Erreur de configuration du paiement. Veuillez réessayer la sélection du stage.");
        return;
      }

      const registrationData = {
        stageId: selectedStage.id,
        userData: formEntries,
        userId: userId || undefined,
        sessionUserId: sessionUserId || undefined,
      };
      const response = await registerUser(registrationData);

      if (response.error) {
        console.error("Erreur retournée par registerUser :", response.error);
        setError(response.error);
        return;
      }

      setUserId(response.user.id);
      setSessionUserId(response.sessionUser.id);
      nextStep();
    } catch (err: any) {
      console.error("Erreur inattendue dans handlePersonalInfoSubmit :", err.message, err.stack);
      setError(err.message || "Erreur lors de l'enregistrement des informations. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!selectedStage || !registrationInfo || !sessionUserId || !userId) {
      console.error("Données manquantes pour finaliser le paiement :", {
        selectedStage,
        registrationInfo,
        sessionUserId,
        userId,
        paymentIntentId,
      });
      setError("Informations manquantes. Veuillez revenir en arrière et vérifier.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const updateResponse = await fetch("/api/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedStage.id, userId, paymentIntentId }),
      });

      const updateResult = await updateResponse.json();
      if (!updateResponse.ok) {
        throw new Error(updateResult.error || "Erreur lors de la mise à jour du paiement.");
      }
      if (!updateResult.sessionUser?.isPaid) {
        throw new Error("Le statut de paiement n'a pas été mis à jour correctement.");
      }

      setPaymentIntentId(paymentIntentId);

      const emailData = {
        to: registrationInfo.email,
        subject: "Confirmation de votre inscription au stage",
        text: `Bonjour ${registrationInfo.prenom} ${registrationInfo.nom},\n\nNous vous confirmons votre inscription au stage ${selectedStage.numeroStageAnts} à ${selectedStage.location}.\n\nDétails du stage :\n- Début : ${formatDateWithDay(selectedStage.startDate)}\n- Fin : ${formatDateWithDay(selectedStage.endDate)}\n\nVotre paiement a été reçu. Pour toute question, contactez-nous au 01 23 45 67 89.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a3c6c;">Confirmation d'inscription</h2>
            <p>Bonjour ${registrationInfo.prenom} ${registrationInfo.nom},</p>
            <p>Nous vous confirmons votre inscription au stage suivant :</p>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Numéro du stage :</strong> ${selectedStage.numeroStageAnts}</li>
              <li><strong>Dates :</strong> ${formatDateWithDay(selectedStage.startDate)} et ${formatDateWithDay(selectedStage.endDate)}</li>
              <li><strong>Lieu :</strong> ${selectedStage.location}</li>
              <li><strong>Horaires :</strong> 8h00 - 16h30</li>
            </ul>
            <p>Votre paiement a été reçu avec succès. Vous recevrez prochainement toute information complémentaire concernant votre stage.</p>
            <h3 style="color: #1a3c6c;">Accès au lieu du stage</h3>
            <p>Le stage se déroule au 2 Avenue Curti, 94100 Saint-Maur-des-Fossés.</p>
            <ul style="list-style: none; padding: 0;">
              <li>- <strong>En transports en commun :</strong> Prendre le RER A, arrêt "Saint-Maur-Créteil" (10 min à pied).</li>
              <li>- <strong>En voiture :</strong> Parking disponible à proximité. Accès via l'A4, sortie Saint-Maur.</li>
              <li>- <strong>Conseil :</strong> Prévoyez d'arriver 10 minutes en avance pour l'accueil.</li>
            </ul>
            <p>Pour toute question, contactez-nous par téléphone au : <strong>07 86 00 34 31</strong></p>
            <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} SMB le bon point. Tous droits réservés.</p>
          </div>
        `,
      };

      fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      })
        .then((response) => response.json())
        .then((result) => console.log("Réponse de /api/send-mail:", result))
        .catch((err) => console.error("Erreur dans /api/send-mail:", err.message));

      setCurrentStep(3); // Go to RecapStep
    } catch (err: any) {
      console.error("Erreur dans handlePaymentSuccess:", {
        message: err.message,
        stack: err.stack,
        name: err.name,
      });
      setError(err.message || "Une erreur est survenue après le paiement. Contactez-nous.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: "SELECTIONNEZ VOTRE STAGE",
      content: (
        <StageSelectionStep
          onStageSelected={handleStageSelection}
          selectedStage={selectedStage}
        />
      ),
    },
    {
      title: "FORMULAIRE",
      content: selectedStage ? (
        <PersonalInfoStep
          selectedStage={selectedStage}
          onSubmit={handlePersonalInfoSubmit}
          setRegistrationInfo={setRegistrationInfo}
          registrationInfo={registrationInfo}
          nextStep={nextStep}
        />
      ) : (
        <div className="text-center text-red-500 p-4">
          Veuillez sélectionner un stage avant de continuer.
        </div>
      ),
    },
    {
      title: "PAIEMENT",
      content: selectedStage && clientSecret ? (
        <PaymentStep
          selectedStage={selectedStage}
          clientSecret={clientSecret}
          onPaymentSuccess={handlePaymentSuccess}
        />
      ) : (
        <div className="text-center text-red-500 p-4">
          Informations de paiement non disponibles. Veuillez compléter les étapes précédentes.
        </div>
      ),
    },
    {
      title: "RECAPITULATIF",
      content: selectedStage && registrationInfo && paymentIntentId ? (
        <RecapStep
          selectedStage={selectedStage}
          registrationInfo={registrationInfo}
        />
      ) : (
        <div className="text-center text-red-500 p-4">
          Veuillez compléter les étapes précédentes.
        </div>
      ),
    },
  ];

  const stepTitles = steps.map((step) => step.title);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressBar currentStep={currentStep} stepTitles={stepTitles} />
        {currentStep >= 0 && currentStep < steps.length ? (
          <div className="mt-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-between mb-4">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md"
                >
                  Précédent
                </button>
              )}
              <div />
            </div>
            {steps[currentStep].content}
          </div>
        ) : (
          <div className="text-center text-red-500 p-4">
            Étape invalide. Veuillez recharger la page ou contacter le support.
          </div>
        )}

        {isSubmitting && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="ml-4 text-white">Traitement en cours...</p>
          </div>
        )}
      </div>
    </div>
  );
}