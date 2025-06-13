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

      // Client confirmation email
      const clientEmailData = {
        to: registrationInfo.email,
        subject: "Confirmation de votre inscription au stage",
        text: `Bonjour ${registrationInfo.prenom} ${registrationInfo.nom},\n\nNous vous confirmons votre inscription au stage ${selectedStage.numeroStageAnts} à ${selectedStage.location}.\n\nDétails du stage :\n- Début : ${formatDateWithDay(selectedStage.startDate)}\n- Fin : ${formatDateWithDay(selectedStage.endDate)}\n\nVotre paiement a été reçu. Pour toute question, contactez-nous au 07 86 00 34 31.`,
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
                  <img src="https://cdn.prod.website-files.com/6519a8973ae7212cf5a9eb05/652b513bb8dc5f55fe4449b2_SMB%20Le%20Bon%20Point%20(2).png" alt="Logo de l'entreprise" style="max-width: 100px; height: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;">
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
                        <strong>Dates :</strong> ${formatDateWithDay(selectedStage.startDate)} et ${formatDateWithDay(selectedStage.endDate)}
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
                    Pour toute question, contactez-nous par téléphone au : <strong>07 86 00 34 31</strong>
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

      // Director notification email
      const directorEmailData = {
        to: "smblebonpoint@gmail.com",
        subject: "Nouvelle inscription enregistrée",
        text: `
Nouvelle inscription enregistrée

Bonjour,

Une nouvelle inscription a été enregistrée dans le système. Veuillez vérifier les détails dans le backoffice.

Détails du stagiaire :
- Nom : ${registrationInfo.nom || "Non spécifié"}
- Prénom : ${registrationInfo.prenom || "Non spécifié"}
- Email : ${registrationInfo.email || "Non spécifié"}
- Téléphone : ${registrationInfo.telephone || "Non spécifié"}
- Numéro de permis : ${registrationInfo.numeroPermis || "Non spécifié"}
- Cas de stage : ${registrationInfo.casStage || "Non spécifié"}

Détails de la session :
- Numéro du stage : ${selectedStage.numeroStageAnts || "Non spécifié"}
- Dates : ${formatDateWithDay(selectedStage.startDate)} et ${formatDateWithDay(selectedStage.endDate)}

Date d'inscription : ${updateResult.sessionUser.createdAt ? new Date(updateResult.sessionUser.createdAt).toLocaleString("fr-FR") : new Date().toLocaleString("fr-FR")}
Paiement : ${updateResult.sessionUser.isPaid ? "Payé" : "Non payé"}

Ceci est une notification automatique. Veuillez vérifier les détails dans le backoffice pour toute action nécessaire.

© ${new Date().getFullYear()} SMB le bon point. Tous droits réservés.
        `,
        html: `
          <!DOCTYPE html>
         <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nouvelle inscription enregistrée</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #e8ecef;">
            <table role="presentation" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">
           <tr>
                <td style="padding: 20px; text-align: center; background-color: rgb(246 183 50 / var(--tw-bg-opacity, 1)); border-top-left-radius: 10px; border-top-right-radius: 10px;">
                  <img src="https://cdn.prod.website-files.com/6519a8973ae7212cf5a9eb05/652b513bb8dc5f55fe4449b2_SMB%20Le%20Bon%20Point%20(2).png" alt="Logo de l'entreprise" style="max-width: 100px; height: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;">  <p style="font-size: 14px; color: #5f6368; margin: 0;">
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <p style="font-size: 12px; color: #202124; margin: 0 0 20px;">
                    Cher Partenaire,<br><br>
                    Un nouveau stagiaire vient de s'inscrire sur le stage de récupération de points du <strong> ${selectedStage.startDate || "Non spécifié"} et ${selectedStage.endDate || "Non spécifié"} </strong>  numéro <strong>${selectedStage.numeroStageAnts || "Non spécifié"}</strong> 
                  </p>
                  <h3 style="font-size: 18px; color:  rgb(246 183 50 / var(--tw-bg-opacity, 1)); margin: 0 0 15px;">Stagiaire</h3>
                  <table role="presentation" width="100%" style="border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 12px; font-size: 12px; color: #202124; ">
                        <strong>${registrationInfo.nom || "Non spécifié"}  ${registrationInfo.prenom || "Non spécifié"}</strong> 
                      </td>
                    </tr>
                    <tr>
                   
                    <tr>
                      <td style="padding: 12px; font-size: 12px; color: #202124; ">
                       Né(e) le ${registrationInfo.dateNaissance || "Non spécifié"}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px; font-size: 12px; color: #202124; ">
                       Adresse : ${registrationInfo.adresse || "Non spécifié"}  ${registrationInfo.codePostal || "Non spécifié"}  ${registrationInfo.ville || "Non spécifié"}
                      </td>
                    </tr>
                  <tr>
                      <td style="padding: 12px; font-size: 12px; color: #202124; ">
Paiement :${selectedStage.price} €
                      </td>
                    </tr>
                   
                  </table>
                 
                  <p style="font-size: 12px; color: #202124; margin: 0 0 20px;">
                    Ceci est une notification automatique. Retrouvez les documents du stagiaire directement sur votre espace <a href="https://smb-lbp-backoffice.vercel.app/" style="color: #1a73e8; text-decoration: underline;">privé </a>  une fois que le stagiaire les aura téléchargés depuis son interface.  pour toute action nécessaire.
                  </p> 
              
                </td>
              </tr>
              
               
            </table>
          </body>
          </html>
        `,
      };

      // Send both emails concurrently
      const [clientEmailResponse, directorEmailResponse] = await Promise.all([
        fetch("/api/send-mail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientEmailData),
        }).then((res) => res.json()),
        fetch("/api/send-mail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(directorEmailData),
        }).then((res) => res.json()),
      ]);

      // Log responses
      console.log("Réponse de /api/send-mail (client):", clientEmailResponse);
      console.log("Réponse de /api/send-mail (directeur):", directorEmailResponse);

      // Check for errors in client email (critical)
      if (!clientEmailResponse.success) {
        console.error("Erreur dans l'envoi de l'email client:", clientEmailResponse.error);
        setError("Inscription réussie, mais l'email de confirmation n'a pas pu être envoyé. Veuillez contacter le support.");
      }

      // Log error for director email (non-critical)
      if (!directorEmailResponse.success) {
        console.error("Erreur dans l'envoi de l'email directeur:", directorEmailResponse.error);
      }

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
          prevStep={prevStep}
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
          paymentIntentId={paymentIntentId}
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