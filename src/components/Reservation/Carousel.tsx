"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PersonalInfoForm, { PersonalInfo } from "./PersonalInfoForm";
import DrivingLicenseForm, { DrivingLicenseInfo } from "./DrivingLicenseForm";
import { generateConfirmationEmail } from "@/lib/emailTemplates";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";

interface Stage {
  id: number;
  numeroStageAnts: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  price: number;
}

// Format date with weekday
const formatDateWithDay = (date: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("fr-FR", options);
};

export default function Carousel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [drivingLicenseInfo, setDrivingLicenseInfo] = useState<DrivingLicenseInfo | null>(null);

  const router = useRouter();
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [page, setPage] = useState(1); // Page actuelle
  const [limit] = useState(10); // Nombre de stages par page
  const [totalPages, setTotalPages] = useState(0); // Total de pages

  // Fonction pour charger les stages
  const fetchStages = async () => {
    setLoading(true); // Début du chargement
    try {
      const response = await fetch(`/api/stage?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error("Erreur lors de la récupération des stages");
      const result = await response.json();

      setStages(result.data || []);
      setTotalPages(result.meta.totalPages || 0);
    } catch (error) {
      console.error("Erreur :", error);
      setStages([]);
    } finally {
      setLoading(false); // Fin du chargement
    }
  };

  // Charge les stages lors du premier rendu
  useEffect(() => {
    fetchStages();
  }, []);

  // Recharge les stages à chaque changement de page
  useEffect(() => {
    fetchStages();
  }, [page]);

  const createPaymentIntent = async (stage: Stage) => {
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: stage.price * 100,
          currency: "eur",
        }),
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

  const handleStageSelection = async (stage: Stage) => {
    setSelectedStage(stage);
    await createPaymentIntent(stage);
    setCurrentStep(1);
  };

  const handlePersonalInfoSubmit = (data: PersonalInfo) => {
    setPersonalInfo(data);
    setCurrentStep(2);
  };

  const handleDrivingLicenseSubmit = (data: DrivingLicenseInfo) => {
    setDrivingLicenseInfo(data);
    setCurrentStep(3);
  };
  const handleRegistration = async () => {
    if (!selectedStage || !personalInfo || !drivingLicenseInfo) return;
  
    // Déstructuration pour enlever 'confirmationEmail' de l'objet
    const { confirmationEmail, ...restPersonalInfo } = personalInfo;
  
    const fullData = {
      stageId: selectedStage.id,
      userData: restPersonalInfo,         // on n'envoie que l'email principal (et autres champs)
      drivingLicenseData: drivingLicenseInfo,
    };
  
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullData),
      });
  
      if (!response.ok) {
        throw new Error("Erreur lors de l'inscription");
      }
  
      const result = await response.json();
      alert(result.message);
  
      if (!process.env.IGNORE_EMAIL_CONFIRMATION) {
        const htmlTemplate = generateConfirmationEmail(
          personalInfo.prenom,
          personalInfo.nom,
          selectedStage.location,
          selectedStage.numeroStageAnts,
          formatDateWithDay(selectedStage.startDate),
          formatDateWithDay(selectedStage.endDate),
          "contact@smbebonpoint.com", // Email de contact
          "01 23 45 67 89"                // Téléphone de contact
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
            html: htmlTemplate, // On fournit le template HTML complet
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
 

  const renderSelectedStageInfo = () =>
    selectedStage && (
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Stage Sélectionné</h3>
        <p>
          <span className="font-bold">Dates :</span>{" "}
          {formatDateWithDay(selectedStage.startDate)} au {formatDateWithDay(selectedStage.endDate)}
        </p>
        <p>
          <span className="font-bold">{selectedStage.location}</span>
        </p>
        <p>
          <span className="font-bold">Numéro de stage préfectoral :</span>{" "}
          <span className="font-semibold">{selectedStage.numeroStageAnts}</span>
        </p>
        <p>
          <span className="font-bold">Places restantes :</span>{" "}
          <span className={selectedStage.capacity <= 5 ? "text-red-600 " : "text-gray-600 "}>
            {selectedStage.capacity}
          </span>
        </p>
        <p>
          <span className="font-bold text-green-600">Prix :</span>{" "}
          {selectedStage.price.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
          })}
        </p>
      </div>
    );

  // Progress bar and step indicators
  const renderProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              index <= currentStep ? "bg-[#508CA4] text-white" : "bg-gray-300 text-gray-600"
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>
      <div className="relative w-full h-2 bg-gray-300 rounded-full">
        <div
          className="absolute top-0 left-0 h-2 bg-[#508CA4] rounded-full"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const steps = [
    {
      title: "Sélectionnez un stage",
      content: (
        <div className="bg-gray-50 p-4 md:p-8 rounded-lg shadow-md">
          <h3 className="text-lg md:text-xl font-bold mb-4">Stages disponibles</h3>
    
          {loading ? (
            <p>Chargement des stages...</p>
          ) : (
            <div className="space-y-4">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between border-b p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Informations sur le stage */}
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-8 mb-4 md:mb-0">
                    <div className="text-base md:text-lg font-bold text-yellow-600">
                      {formatDateWithDay(stage.startDate)} au {formatDateWithDay(stage.endDate)}
                    </div>
    
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">{stage.location}</span>
                    </div>
    
                    <div
                      className={`text-base md:text-lg font-semibold ${
                        stage.capacity <= 5 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      <span>Places restantes: {stage.capacity}</span>
                    </div>
                  </div>
    
                  {/* Prix et bouton */}
                  <div className="flex items-center justify-between md:justify-end space-x-4">
                    <div className="text-base md:text-lg font-bold text-gray">
                      {stage.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </div>
    
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
                      onClick={() => handleStageSelection(stage)}
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
    
          {/* Section des boutons de pagination */}
          <div className="flex justify-center space-x-6 items-center mt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="bg-gray-500 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              Précédent
            </button>
    
            <span className="text-gray-700">
              Page {page} sur {totalPages}
            </span>
    
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="bg-gray-500 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      ),
    }
    ,
    {
      title: "Informations personnelles",
      content: (
        <>
          {renderSelectedStageInfo()}
          <PersonalInfoForm onNext={handlePersonalInfoSubmit} />
        </>
      ),
    },
    {
      title: "",
      content: (
        <>
          {renderSelectedStageInfo()}
          <DrivingLicenseForm onSubmit={handleDrivingLicenseSubmit} />
        </>
      ),
    },
   {
  title: "Paiement",
  content: (
    <div>
      <h3 className="text-xl font-bold mb-4">Effectuez votre paiement</h3>
      {renderSelectedStageInfo()}
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            clientSecret={clientSecret}
            onPaymentSuccess={handleRegistration} // Appelé après le succès
          />
        </Elements>
      ) : (
        <p>Chargement des informations de paiement...</p>
      )}
    </div>
  ),
},
    
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl">
        {renderProgress()}
        <h2 className="text-2xl font-bold mb-6 text-center">{steps[currentStep].title}</h2>
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
        
