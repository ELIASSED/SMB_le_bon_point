// components/PrefectureApproval.js

export default function PrefectureApproval() {
    return (
      <div className="flex items-center p-6 bg-white rounded-lg shadow-md">
        {/* Icône */}
        <svg
          className="w-12 h-12 text-indigo-600 mr-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        
        {/* Contenu */}
        <div className="">
          <h3 className="text-xl font-semibold text-gray-800">Stages agréés par la préfecture</h3>
          <p className="mt-2 text-gray-600">
            Nos stages sont officiellement reconnus et agréés par la préfecture, garantissant leur validité et leur efficacité.
          </p>
        </div>
        
      </div>
      
    )
  }
  