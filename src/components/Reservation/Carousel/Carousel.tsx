// components/Carousel/Carousel.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateConfirmationEmail } from "@/lib/emailTemplates";

import { Stage, PersonalInfo, DrivingLicenseInfo } from "./types";
import { formatDateWithDay } from "./utils";

import ProgressBar from "./ProgressBar";
import StageSelectionStep from "./Steps/StageSelectionStep";
import PersonalInfoStep from "./Steps/PersonalInfoStep";
import DrivingLicenseStep from "./Steps/DrivingLicenseStep";
import PaymentStep from "./Steps/PaymentStep";

export default function Carousel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [drivingLicenseInfo, setDrivingLicenseInfo] = useState<DrivingLicenseInfo | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const router = useRouter();

  // 1. Récupération des stages
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const response = await fetch("/api/stage");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des stages");
        }
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

  // 2. Création du PaymentIntent Stripe
  const createPaymentIntent = async (stage: Stage) => {
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: stage.price * 100, currency: "eur" }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de PaymentIntent");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Erreur PaymentIntent :", error);
    }
  };

  // 3. Sélection d’un stage
  const handleStageSelection = async (stage: Stage) => {
    setSelectedStage(stage);
    await createPaymentIntent(stage);
    setCurrentStep(1);
  };

  // 4. Soumission des infos personnelles
  const handlePersonalInfoSubmit = (data: PersonalInfo) => {
    setPersonalInfo(data);
    setCurrentStep(2);
  };

  // 5. Soumission des infos du permis
  const handleDrivingLicenseSubmit = (data: DrivingLicenseInfo) => {
    setDrivingLicenseInfo(data);
    setCurrentStep(3);
  };

  // 6. Enregistrement (inscription) et envoi de mail après succès du paiement
  const handleRegistration = async () => {
    if (!selectedStage || !personalInfo || !drivingLicenseInfo) return;

    // On enlève le champ confirmationEmail avant d'envoyer
    const { confirmationEmail, ...restPersonalInfo } = personalInfo;

    const fullData = {
      stageId: selectedStage.id,
      userData: restPersonalInfo,
      drivingLicenseData: drivingLicenseInfo,
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'inscription");
      }

      const result = await response.json();
      alert(result.message);

      // Envoi de l'email de confirmation
      if (!process.env.IGNORE_EMAIL_CONFIRMATION) {
        const htmlTemplate = generateConfirmationEmail(
          personalInfo.prenom,
          personalInfo.nom,
          selectedStage.location,
          selectedStage.numeroStageAnts,
          formatDateWithDay(selectedStage.startDate),
          formatDateWithDay(selectedStage.endDate),
          "contact@smbebonpoint.com",
          "01 23 45 67 89"
        );

        const emailResponse = await fetch("/api/send-mail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: personalInfo.email,
            subject: "Confirmation d'inscription",
            text: htmlTemplate,
            html: htmlTemplate,
          }),
        });

        if (!emailResponse.ok) {
          const errorDetails = await emailResponse.json();
          console.error("Erreur d'envoi de l'email :", errorDetails);
          throw new Error("L'envoi de l'email a échoué");
        }
      }

      // Redirection si tout est OK
      router.push("/success");
    } catch (error) {
      console.error("Erreur :", error);
      alert("Une erreur est survenue lors de l'inscription.");
    }
  };

  // Liste d’étapes
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
      title: "Informations personnelles",
      content: (
        <PersonalInfoStep
          selectedStage={selectedStage}
          onSubmit={handlePersonalInfoSubmit}
        />
      ),
    },
    {
      title: "Informations sur le permis",
      content: (
        <DrivingLicenseStep
          selectedStage={selectedStage}
          onSubmit={handleDrivingLicenseSubmit}
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Limiter la largeur du contenu à 90% de l’écran */}
      <div 
        className="mx-auto"
        // On conserve max-w-4xl si on veut limiter une large résolution
        style={{
          maxWidth: "80%",   // <= pour ne pas dépasser 90% de l'écran
        }}
      >
        <ProgressBar currentStep={currentStep} stepsLength={steps.length} />
        <h2 className="text-2xl font-bold mb-6 text-center">
          {steps[currentStep].title}
        </h2>
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
