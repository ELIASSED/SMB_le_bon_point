// components/Carousel/ProgressBar.tsx
"use client";

import React from "react";

interface ProgressBarProps {
  currentStep: number;
  stepsLength: number;
}

export default function ProgressBar({ currentStep, stepsLength }: ProgressBarProps) {
  const percentage = ((currentStep + 1) / stepsLength) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
    </div>
  );
}
