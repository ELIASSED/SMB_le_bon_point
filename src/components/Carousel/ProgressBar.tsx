"use client";
import React from "react";

interface ProgressBarProps {
  currentStep: number;
  steps: string[]; // Liste des noms des étapes
}

export default function ProgressBar({ currentStep, steps }: ProgressBarProps) {
  const stepsLength = steps.length;
  const percentage = ((currentStep + 1) / stepsLength) * 100;

  return (
    <div className="w-full my-3 md:my-6 px-2 md:px-4">
      {/* Numéro de l'étape actuelle */}
      <div className="text-center mb-1 md:mb-2">
        <span className="text-sm md:text-md font-bold text-gray-600">
          Étape {currentStep + 1}/{stepsLength}
        </span>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 mb-2 md:mb-4">
        <div
          className="bg-indigo-600 h-1.5 md:h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Liste des noms des étapes */}
      <div className="hidden md:flex justify-between text-md text-gray-600">
        {steps.map((step, index) => (
          <span
            key={index}
            className={`flex-1 text-center ${
              index === currentStep ? "font-semibold text-indigo-600" : ""
            }`}
          >
            {step}
          </span>
        ))}
      </div>

      {/* Version mobile: Afficher uniquement l'étape actuelle */}
      <div className="md:hidden text-center">
        <span className="text-sm font-semibold text-indigo-600">
          {steps[currentStep]}
        </span>
      </div>
    </div>
  );
}