"use client";

export default function BookingButton() {
  const handleClick = () => {
    // Logique à implémenter plus tard : rediriger vers une page de réservation
    alert('Page de réservation à venir.');
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
