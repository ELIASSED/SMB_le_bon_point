"use client";

import { useRouter } from "next/navigation";

export default function BookingButton() {
  const router = useRouter();

  const handleClick = () => {
    // Redirige vers la page des stages
    router.push("/stages");
  };

  return (
    <button 
      onClick={handleClick}
<<<<<<< HEAD
      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
=======
      className={`
        bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded
      `}
>>>>>>> temp-branch
      id="reservation"
    >
      Réserver un stage
    </button>
  );
} 
