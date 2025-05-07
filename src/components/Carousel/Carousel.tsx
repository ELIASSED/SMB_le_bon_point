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
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [registrationInfo, setRegistrationInfo] = useState<RegistrationInfo | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const router = useRouter();

  const nextStep = () => {
    // console.log(`Transition vers l'étape ${currentStep + 1}`);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    setError(null);
  };

  const prevStep = () => {
    // console.log(`Retour à l'étape ${currentStep - 1}`);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setError(null);
  };

  const handleStageSelection = async (stage: Stage) => {
    try {
      // console.log("Stage sélectionné :", stage);
      setSelectedStage(stage);
      setSessionId(stage.id);
      // console.log("sessionId défini :", stage.id);

      const paymentIntent = await createPaymentIntent(stage);
      // console.log("Réponse de createPaymentIntent :", paymentIntent);
      if (!paymentIntent.clientSecret) {
        throw new Error("clientSecret non retourné par l'API");
      }
      setClientSecret(paymentIntent.clientSecret);
      // console.log("clientSecret défini :", paymentIntent.clientSecret);
      nextStep();
    } catch (err: any) {
      console.error("Erreur lors de la sélection du stage :", err.message);
      setError("Impossible de sélectionner le stage. Veuillez réessayer.");
    }
  };

  const handlePersonalInfoSubmit = async (data: FormData) => {
    try {
      // console.log("Début de handlePersonalInfoSubmit...");
      setIsSubmitting(true);
      setError(null);

      const formEntries = Object.fromEntries(data.entries()) as unknown as RegistrationInfo;
      formEntries.email = formEntries.email.toLowerCase().trim();
      formEntries.confirmationEmail = formEntries.confirmationEmail.toLowerCase().trim();
      // console.log("Données personnelles normalisées :", formEntries);
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

      const registrationData = { stageId: selectedStage.id, userData: formEntries };
      // console.log("Envoi à /api/register avec :", registrationData);
      const response = await registerUser(registrationData);

      // console.log("Réponse de registerUser :", response);
      if (response.error) {
        console.error("Erreur retournée par registerUser :", response.error);
        setError(response.error);
        return;
      }

      setUserId(response.user.id);
      // console.log("userId défini :", response.user.id);
      nextStep();
    } catch (err: any) {
      console.error("Erreur inattendue dans handlePersonalInfoSubmit :", err.message, err.stack);
      setError(err.message || "Erreur lors de l'enregistrement des informations. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    // console.log("handlePaymentSuccess appelé avec paymentIntentId :", paymentIntentId);

    if (!selectedStage || !registrationInfo || !sessionId || !userId) {
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

      // Confirm payment
      // console.log("Envoi à /api/confirm-payment :", { sessionId, userId, paymentIntentId });
      const updateResponse = await fetch("/api/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userId, paymentIntentId }),
      });

      const updateResult = await updateResponse.json();
      // console.log("Réponse de /api/confirm-payment :", updateResult);
      if (!updateResponse.ok) {
        throw new Error(updateResult.error || "Erreur lors de la mise à jour du paiement.");
      }
      if (!updateResult.sessionUser?.isPaid) {
        throw new Error("Le statut de paiement n'a pas été mis à jour correctement.");
      }

      setPaymentIntentId(paymentIntentId);
      // console.log("Paiement confirmé, déclenchement de l'email client en arrière-plan...");

      // Fire-and-forget client confirmation email via /api/send-mail
      const emailData = {
        to: registrationInfo.email,
        subject: "Confirmation de votre inscription au stage",
        text: `Bonjour ${registrationInfo.prenom} ${registrationInfo.nom},\n\nNous vous confirmons votre inscription au stage ${selectedStage.numeroStageAnts} à ${selectedStage.location}.\n\nDétails du stage :\n- Début : ${formatDateWithDay(selectedStage.startDate)}\n- Fin : ${formatDateWithDay(selectedStage.endDate)}\n\nVotre paiement a été reçu. Pour toute question, contactez-nous au 01 23 45 67 89.`,
        html: `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmation d'inscription</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #e8ecef;">
            <table role="presentation" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">
              <tr>
                <td style="padding: 20px; text-align: center; background-color: rgb(246 183 50 / var(--tw-bg-opacity, 1)); border-top-left-radius: 10px; border-top-right-radius: 10px;">
           <img src=" https://cdn.prod.website-files.com/6519a8973ae7212cf5a9eb05/652b513bb8dc5f55fe4449b2_SMB%20Le%20Bon%20Point%20(2).png" alt="Logo de l'entreprise" style="max-width: 100px; height: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;">
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <p style="font-size: 16px; color: #202124; margin: 0 0 20px;">
                    Bonjour ${registrationInfo.prenom} ${registrationInfo.nom},<br><br>
                    Nous vous confirmons votre inscription au stage suivant :
                  </p>
                  <table role="presentation" width="100%" style="border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 12px; font-size: 16px; color: #202124; border-bottom: 1px solid #dadce0;">
                        <strong>Numéro du stage :</strong> ${selectedStage.numeroStageAnts}
                      </td>
                    </tr>
                 
                    <tr>
                      <td style="padding: 12px; font-size: 16px; color: #202124; border-bottom: 1px solid #dadce0;">
                        <strong>${formatDateWithDay(selectedStage.startDate)} et ${formatDateWithDay(selectedStage.endDate)}</strong> 
                 
                      </td>
                    </tr>   <tr>
                      <td style="padding: 12px; font-size: 16px; color: #202124; border-bottom: 1px solid #dadce0;">
                        <strong>Lieu :</strong> ${selectedStage.location}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px; font-size: 16px; color: #202124; border-bottom: 1px solid #dadce0;">
                        <strong>Horaires :</strong> 8h00 - 16h30
                      </td>
                    </tr>
                  </table>
                  <p style="font-size: 16px; color: #202124; margin: 0 0 20px;">
                    Votre paiement a été reçu avec succès. Vous recevrez prochainement toute information complémentaire concernant votre stage.
                  </p>
                  <p style="font-size: 16px; color: #202124; margin: 0 0 20px;">
                    <strong>Accès au lieu du stage :</strong><br>
                    Le stage se déroule au <strong>2 Avenue Curti, 94100 Saint-Maur-des-Fossés</strong>.<br>
                    - <strong>En transports en commun :</strong> Prendre le RER A, arrêt "Saint-Maur-Créteil" (10 min à pied).<br>
                    - <strong>En voiture :</strong> Parking disponible à proximité. Accès via l'A4, sortie Saint-Maur.<br>
                    - <strong>Conseil :</strong> Prévoyez d'arriver 10 minutes en avance pour l'accueil.
                  </p>
                  <p style="font-size: 16px; color: #202124; margin: 0 0 20px;">
                    Pour toute question, contactez-nous par téléphone au :<strong> 07 86 00 34 31</strong>
                  </p>
        
                </td>
              </tr>
              <tr>
                <td style="padding: 20px; text-align: center; background-color: #f8f9fa; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
                  <p style="font-size: 14px; color: #5f6368; margin: 0;">
                    © ${new Date().getFullYear()} SMB le bon point. Tous droits réservés.
                  </p> 
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };

      // console.log("Préparation envoi à /api/send-mail avec:", emailData);
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
      content: <StageSelectionStep onStageSelected={handleStageSelection} />,
    },
    {
      title: "FORMULAIRE",
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
      title: "PAIEMENT",
      content: selectedStage && clientSecret ? (
        <PaymentStep
          selectedStage={selectedStage}
          clientSecret={clientSecret}
          onPaymentSuccess={handlePaymentSuccess}
        />
      ) : (
        <p className="text-gray-500">Informations de paiement non disponibles. Veuillez compléter les étapes précédentes.</p>
      ),
    },
    {
      title: "RECAPITULATIF",
      content: selectedStage && registrationInfo && paymentIntentId ? (
        <>
          { console.log("Rendu de RecapStep avec :", { selectedStage, registrationInfo, paymentIntentId })}
          <RecapStep
            selectedStage={selectedStage}
            registrationInfo={registrationInfo}
            paymentIntentId={paymentIntentId}
          />
        </>
      ) : (
        <>
          { console.log("Étape Récapitulatif bloquée, données manquantes :", {
            selectedStage,
            registrationInfo,
            paymentIntentId,
          })}
          <p className="text-gray-500">Veuillez compléter les étapes précédentes.</p>
        </>
      ),
    }
  ];

  const stepTitles = steps.map((step) => step.title);

  return (
    <div className="carousel-container max-w-6xl mx-auto">
      <ProgressBar currentStep={currentStep} steps={stepTitles} />
      {currentStep >= 0 && currentStep < steps.length ? (
        <>
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