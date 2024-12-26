// components/ExperiencedTrainers.js

export default function ExperiencedTrainers() {
    return (
      <div className="flex items-center p-6 bg-white rounded-lg shadow-md">
        {/* Icône */}
        <svg
          className="w-12 h-12 text-green-500 mr-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17 20h5V4H2v16h5m10-9l-5 5m0 0l-5-5m5 5V4" 
          />
        </svg>
        
        {/* Contenu */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Formateurs expérimentés et pédagogues</h3>
          <p className="mt-2 text-gray-600">
            Nos formateurs possèdent une vaste expérience et utilisent des méthodes pédagogiques adaptées pour garantir votre réussite.
          </p>
        </div>
      </div>
    )
  }
  