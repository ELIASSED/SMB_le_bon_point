"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Inscription réussie !</h1>
        <p className="text-gray-700 mb-6">
          Votre inscription a été validée. Un email de confirmation vous a été envoyé.
        </p>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          onClick={() => router.push("/")} // Redirection vers la page d'accueil
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
