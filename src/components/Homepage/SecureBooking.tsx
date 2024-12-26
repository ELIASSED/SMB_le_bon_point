// components/SecureBooking.js

export default function SecureBooking() {
    return (
      <div className="flex items-center p-6 bg-white rounded-lg shadow-md">
        {/* Icône */}
        <svg
          className="w-12 h-12 text-red-500 mr-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 11c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2zm-2 5h4a2 2 0 002-2v-2a2 2 0 00-2-2h-4a2 2 0 00-2 2v2a2 2 0 002 2z" 
          />
        </svg>
        
        {/* Contenu */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Réservation et paiement en ligne sécurisés</h3>
          <p className="mt-2 text-gray-600">
            Réservez votre stage en toute confiance grâce à notre plateforme sécurisée, garantissant la protection de vos données et transactions.
          </p>
        </div>
      </div>
    )
  }
  