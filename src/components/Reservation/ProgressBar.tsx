// components/Carousel/ProgressBar.tsx
"use client";
import React from "react";

interface ProgressBarProps {
  currentStep: number;
  stepsLength: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, stepsLength }) => {
  return (
    <div className="mb-8">
      {/* Pastilles (ronds) */}
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: stepsLength }, (_, index) => (
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
      {/* Barre de progression */}
      <div className="relative w-full h-2 bg-gray-300 rounded-full">
        <div
          className="absolute top-0 left-0 h-2 bg-[#508CA4] rounded-full"
          style={{ width: `${((currentStep + 1) / stepsLength) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
