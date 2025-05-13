"use client";
import React from "react";

interface ProgressBarProps {
  currentStep: number;
  stepTitles: string[]; // Liste des titres des étapes
}

export default function ProgressBar({ currentStep, stepTitles }: ProgressBarProps) {
  const stepsLength = stepTitles.length;
  const percentage = ((currentStep + 1) / stepsLength) * 100;

  return (
    <div
      className="w-full my-2 px-2"
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={stepsLength}
      aria-label={`Progression à l'étape ${currentStep + 1} sur ${stepsLength}`}
    >
      {/* Cercles numérotés pour les étapes */}
      <div className="flex justify-between mb-2">
        {stepTitles.map((_, index) => (
          <div
            key={index}
            className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full text-xs md:text-sm font-semibold transition-all duration-300 ${
              index <= currentStep
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div
          className="bg-indigo-600 h-1 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}