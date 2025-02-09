import React from 'react';
import { Clock, Users, CheckCircle, Shield } from 'lucide-react';

export const ExperiencedTrainers = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-center mb-4 sm:mb-0">
        <Users 
          className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mr-4" 
          strokeWidth={1.5}
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
          Formateurs expérimentés et pédagogues
        </h3>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Nos formateurs possèdent une vaste expérience et utilisent des méthodes pédagogiques adaptées pour garantir votre réussite.
        </p>
      </div>
    </div>
  );
};

export const PointRecovery = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-center mb-4 sm:mb-0">
        <Clock 
          className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 mr-4" 
          strokeWidth={1.5}
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
          Récupérer 4 points en 48 heures
        </h3>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Grâce à nos stages, vous pouvez récupérer jusqu'à 4 points sur votre permis de conduire, améliorant ainsi votre profil de conducteur.
        </p>
      </div>
    </div>
  );
};

export const PrefectureApproval = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-center mb-4 sm:mb-0">
        <CheckCircle 
          className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 mr-4" 
          strokeWidth={1.5}
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
          Stages agréés par la préfecture
        </h3>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Nos stages sont officiellement reconnus et agréés par la préfecture, garantissant leur validité et leur efficacité.
        </p>
      </div>
    </div>
  );
};

export const SecureBooking = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-center mb-4 sm:mb-0">
        <Shield 
          className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mr-4" 
          strokeWidth={1.5}
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
          Réservation et paiement en ligne sécurisés
        </h3>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Réservez votre stage en toute confiance grâce à notre plateforme sécurisée, garantissant la protection de vos données et transactions.
        </p>
      </div>
    </div>
  );
};

// Composant conteneur pour organiser les cartes
export const FeaturesGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4">
      <ExperiencedTrainers />
      <PointRecovery />
      <PrefectureApproval />
      <SecureBooking />
    </div>
  );
};

export default FeaturesGrid;