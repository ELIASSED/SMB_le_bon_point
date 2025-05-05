// components/SelectedStageInfo.tsx
"use client";

import React from "react";
import { Stage } from "./types";
import { formatDateWithDay } from "../utils";
import { UserIcon, AcademicCapIcon } from "@heroicons/react/24/solid"; // Icônes Heroicons


interface SelectedStageInfoProps {
  selectedStage: Stage;
  
}

export default function SelectedStageInfo({ selectedStage }: SelectedStageInfoProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 id="selected-stage-heading" className="text-xl font-bold text-gray-900 mb-4">
        Stage <strong className="text-indigo-600">{selectedStage.numeroStageAnts}</strong> -{" "}
        {formatDateWithDay(selectedStage.startDate)} au {formatDateWithDay(selectedStage.endDate)}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colonne 1 : Infos générales */}
        <div className="space-y-3 text-gray-700"> 
         {/* Psychologue */}
          <div className="flex items-start space-x-3">
            <AcademicCapIcon className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Psychologue</p>
             
              <p className="text-sm text-gray-500">
                N° Autorisation : {selectedStage.psychologue.numeroAutorisationPrefectorale}
              </p>
            </div>
          </div>
         
       
        </div>

        {/* Colonne 2 : Animateurs */}
        <div className="space-y-4">
          {/* Instructeur (BAFM) */}
          <div className="flex items-start space-x-3">
            <UserIcon className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Instructeur (BAFM)</p>
             
              <p className="text-sm text-gray-500">
                N° Autorisation : {selectedStage.instructor.numeroAutorisationPrefectorale}
              </p>
            </div>
          </div>

        
        </div>
        <p>
            <strong className="font-medium">Prix :</strong>{" "}
            <span className="text-green-600 font-semibold">
              {selectedStage.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
            </span>
          </p>
      </div>
    </div>
  );
}