// components/SelectedStageInfo.tsx
"use client";

import React from "react";
import { Stage } from "./types";
import { formatDateWithDay } from "../utils";

interface SelectedStageInfoProps {
  selectedStage: Stage;
}

export default function SelectedStageInfo({ selectedStage }: SelectedStageInfoProps) {
  return (
    <div className="p-4">
      <p>
        <strong>{selectedStage.numeroStageAnts} -</strong> {formatDateWithDay(selectedStage.startDate)} - {formatDateWithDay(selectedStage.endDate)}
      </p>
      <p><strong>Lieu :</strong> {selectedStage.location}</p>
      <p><strong>Places disponibles :</strong> {selectedStage.capacity}</p>
      <p><strong>Prix :</strong> {selectedStage.price}€</p>
    </div>
  );
}
