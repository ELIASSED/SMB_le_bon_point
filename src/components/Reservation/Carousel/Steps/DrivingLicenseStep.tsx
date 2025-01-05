// components/Carousel/DrivingLicenseStep.tsx
"use client";
import React from "react";
import { Stage, DrivingLicenseInfo } from "../types";
import { formatDateWithDay } from "../utils";
import DrivingLicenseForm from "../Form/DrivingLicenseForm"; // Chemin d'import à ajuster selon votre structure

interface DrivingLicenseStepProps {
  selectedStage: Stage | null;
  onSubmit: (data: DrivingLicenseInfo) => void;
}

const DrivingLicenseStep: React.FC<DrivingLicenseStepProps> = ({
  selectedStage,
  onSubmit,
}) => {
  const renderSelectedStageInfo = () =>
    selectedStage && (
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Stage Sélectionné</h3>
        <p>
          <span className="font-bold">Dates :</span>{" "}
          {formatDateWithDay(selectedStage.startDate)} au{" "}
          {formatDateWithDay(selectedStage.endDate)}
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
          <span
            className={
              selectedStage.capacity <= 5 ? "text-red-600 " : "text-gray-600 "
            }
          >
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

  return (
    <>
      {renderSelectedStageInfo()}
      <DrivingLicenseForm onSubmit={onSubmit} />
    </>
  );
};

export default DrivingLicenseStep;
