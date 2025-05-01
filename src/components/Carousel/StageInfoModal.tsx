import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Stage } from './types'; // Import Stage type

interface StageInfoModalProps {
  stage: Stage; // Explicitly type stage as Stage
  isOpen: boolean;
  onClose: () => void;
}

const StageInfoModal = ({ stage, isOpen, onClose }: StageInfoModalProps) => {
  // Gérer la fermeture avec la touche Échap
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen || !stage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-5"
        role="dialog"
        aria-labelledby="modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Fermer la modal"
        >
          ✕
        </button>

        {/* Modal Content */}
        <h3 id="modal-title" className="text-lg font-medium text-gray-900 mb-3">
          Détails du Stage
        </h3>
        <div className="space-y-3">
          {/* Stage Number */}
          <div className="flex items-center">
            <p className="text-md text-gray-700">
              <span className="font-medium">Numéro ANTS de stage </span>
              <span className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-sm">
                <CheckCircle className="h-3 w-3 mr-1" />
                {stage.numeroStageAnts}
              </span>
            </p>
          </div>

          {/* Schedule */}
          <div className="flex items-center">
            <p className="text-md text-gray-700">
              <span className="font-medium">Matin: 8h00 - 12h30 / Après-Midi: 13h30 - 16h30</span>
            </p>
          </div>

          {/* Map Image */}
          <div className="mt-3">
            <b className="text-xl text-red-600">Entrée : 2 Av. de Curti, 94100 Saint-Maur-des-Fossés</b>
            <div className="w-full h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.469151394134!2d2.495465315675272!3d48.80686387928407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e60eea5ad9b5c7%3A0x5baf9b8b16dca682!2s35%20Av.%20Foch%2C%2094100%20Saint-Maur-des-Foss%C3%A9s!5e0!3m2!1sfr!2sfr!4v1700000000000!5m2!1sfr!2sfr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Carte du Centre SMB à Saint-Maur"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Close Button (Footer) */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageInfoModal;