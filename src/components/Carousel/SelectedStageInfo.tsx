"use client";

import React from "react";
import { Stage } from "./types";
import { formatDateWithDay } from "../utils";
import { UserIcon, AcademicCapIcon } from "@heroicons/react/24/solid";

interface SelectedStageInfoProps {
  selectedStage: Stage;
}

export default function SelectedStageInfo({ selectedStage }: SelectedStageInfoProps) {
  return (
    <div className="p-5 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row md:space-x-4">
        {/* Section gauche : Numéro de stage, dates, animateurs (60%) */}
        <div className="w-full md:w-[60%] space-y-2 text-gray-700">
          <h2 id="selected-stage-heading" className="text-lg font-bold text-gray-900">
            Stage <strong className="text-indigo-600">{selectedStage.numeroStageAnts}</strong> -{" "}
            {formatDateWithDay(selectedStage.startDate)} au {formatDateWithDay(selectedStage.endDate)}
          </h2>
          {/* Psychologue */}
          <div className="flex items-start space-x-6">
            <AcademicCapIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-800">Psychologue</p>
              <p className="text-xs text-gray-500">
                N° Autorisation : {selectedStage.psychologue.numeroAutorisationPrefectorale}
              </p>
            </div> 
            <div className="flex items-start space-x-6">
            <UserIcon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-800">BAFM</p>
              <p className="text-xs text-gray-500">
                N° Autorisation : {selectedStage.instructor.numeroAutorisationPrefectorale}
              </p>
            </div>
          </div>
          </div>
          {/* Instructeur */}
         
        </div>

        {/* Section droite : Prix (40%), centré verticalement */}
        <div className="w-full md:w-[40%] flex justify-end items-center mt-3 md:mt-0">
          <p className="text-xl m-[2px]">
            <span className="text-green-600 font-semibold">
              {selectedStage.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}