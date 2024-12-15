"use client";

import { useRouter } from "next/navigation";

export default function RedirectButton() {
  const router = useRouter();

  const handleClick = () => {
    // Redirige vers la page des stages
    router.push("/stages");
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      id="reservation"
    >
      Réserver un stage
    </button>
  );
}
