import React from "react";

interface ProgressBarProps {
  currentStep: number;
  stepTitles: string[];
}

export default function ProgressBar({ currentStep, stepTitles }: ProgressBarProps) {
  const stepsLength = stepTitles.length;
  const percentage = ((currentStep + 1) / stepsLength) * 100;

  return (
    <div className="w-full mb-6">
      <div className="relative h-2 bg-gray-200 rounded">
        <div
          className="absolute h-2 bg-blue-500 rounded"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {stepTitles.map((title, index) => (
          <div
            key={index}
            className={`text-sm ${
              index <= currentStep ? "text-blue-500 font-bold" : "text-gray-500"
            }`}
          >
            {title}
          </div>
        ))}
      </div>
    </div>
  );
}