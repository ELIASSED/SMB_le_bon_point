"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { fetchStages, createPaymentIntent, registerUser, sendConfirmationEmail } from "../../../lib/api";

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

  const router = useRouter();

  // Récupération des stages
  useEffect(() => {
    async function loadStages() {
      try {
        const data = await fetchStages();
        setStages(data);
        console.log(data);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadStages();
  }, []);

  // Gestion des étapes
  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => Math.max(0, prev - 1));

  // Sélection d’un stage
  const handleStageSelection = async (stage) => {
    try {
      setSelectedStage(stage);
      const paymentIntent = await createPaymentIntent(stage);
      setClientSecret(paymentIntent.clientSecret);
      nextStep();
    } catch (error) {
      console.error(error.message);
    }
  };

  // Soumission des infos personnelles
  const handlePersonalInfoSubmit = (data) => {
    setPersonalInfo(data);
    nextStep();
  };

  // Enregistrement et confirmation
  const handleRegistration = async () => {
    if (!selectedStage || !personalInfo) return;

    const { confirmationEmail, ...restPersonalInfo } = personalInfo;
    const fullData = {
      stageId: selectedStage.id,
      userData: restPersonalInfo,
    };

    try {
      const result = await registerUser(fullData);
      console.log(result.message);

      const emailData = {
        to: personalInfo.email,
        subject: "Confirmation d'inscription",
        text: `Votre inscription au stage ${selectedStage.description} est confirmée.`,
        html: `<p>Merci pour votre inscription au stage ${selectedStage.description}.</p>`,
      };

      await sendConfirmationEmail(emailData);

      router.push("/success");
    } catch (error) {
      console.error(error.message);
    }
  };

  // Définir les étapes
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
      title: "Renseignez vos informations",
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
      <div>{steps[currentStep].content}</div>
      <div className="navigation">
        {currentStep > 0 && <button onClick={prevStep}>Précédent</button>}
      </div>
    </div>
  );
}
