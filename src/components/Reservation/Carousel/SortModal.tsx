import React, { useState } from "react";

type SortOption = "date" | "price-asc" | "price-desc" | "capacity";

interface SortModalProps {
  onSortChange: (option: SortOption) => void;
}

const SortModal: React.FC<SortModalProps> = ({ onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("date");

  // Met à jour l’option sélectionnée sans encore fermer la modale
  const handleOptionChange = (value: SortOption) => {
    setSortOption(value);
  };

  // Au clic sur "Appliquer", on informe le parent du choix
  const handleApply = () => {
    onSortChange(sortOption);
    setIsOpen(false);
  };

  return (
    <div>
      {/* Bouton d’ouverture de la modale */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-sm"
      >
        Trier les stages
      </button>

      {/* Le contenu de la modale si isOpen = true */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Options de tri</h2>

            <div className="space-y-4">
              {/* Date */}
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sortOption"
                  value="date"
                  checked={sortOption === "date"}
                  onChange={() => handleOptionChange("date")}
                />
                <span>Date (du plus récent au plus ancien)</span>
              </label>

              {/* Prix croissant */}
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sortOption"
                  value="price-asc"
                  checked={sortOption === "price-asc"}
                  onChange={() => handleOptionChange("price-asc")}
                />
                <span>Prix (croissant)</span>
              </label>

              {/* Prix décroissant */}
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sortOption"
                  value="price-desc"
                  checked={sortOption === "price-desc"}
                  onChange={() => handleOptionChange("price-desc")}
                />
                <span>Prix (décroissant)</span>
              </label>

              {/* Places disponibles */}
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sortOption"
                  value="capacity"
                  checked={sortOption === "capacity"}
                  onChange={() => handleOptionChange("capacity")}
                />
                <span>Places disponibles</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              {/* Bouton Annuler */}
              <button
                onClick={() => setIsOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded"
              >
                Annuler
              </button>
              {/* Bouton Appliquer */}
              <button
                onClick={handleApply}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortModal;
