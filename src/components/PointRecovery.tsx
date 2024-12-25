// components/PointRecovery.js

export default function PointRecovery() {
    return (
      <div className="flex items-center p-6 bg-white rounded-lg shadow-md">
        {/* Icône */}
        <svg
          className="w-12 h-12 text-yellow-500 mr-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        
        {/* Contenu */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Récupérez 4 points en 48 heures</h3>
          <p className="mt-2 text-gray-600">
            Grâce à nos stages, vous pouvez récupérer jusqu’à 4 points sur votre permis de conduire, améliorant ainsi votre profil de conducteur.
          </p>
        </div>
      </div>
    )
  }
  