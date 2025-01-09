import React, { useState } from "react";

type SortOption = "date-asc" | "date-desc" | "price-asc" | "price-desc";

interface SortModalProps {
  onDataUpdate: (data: any) => void;
}

const SortModal: React.FC<SortModalProps> = ({ onDataUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("date-asc");

  const handleApply = async () => {
    setIsOpen(false);
    try {
      // Extraction sort et order
      const [field, direction] = sortOption.split("-");
      
      // Construction URL avec les bons paramètres
      const currentUrl = new URL(window.location.href);
      const minPrice = currentUrl.searchParams.get("minPrice") || "0";
      const maxPrice = currentUrl.searchParams.get("maxPrice") || "Infinity";
      
      // Construction de l'URL API
      const apiUrl = `/api/stage?minPrice=${minPrice}&maxPrice=${maxPrice}&orderDate=${field === "date" ? direction : "asc"}&orderPrice=${field === "price" ? direction : "asc"}`;

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Erreur API");
      const data = await response.json();
      onDataUpdate(data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-sm"
      >
        Trier les stages
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Options de tri</h2>

            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sortOption"
                  value="date-asc"
                  checked={sortOption === "date-asc"}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                />
                <span>Date (croissant)</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sortOption"
                  value="date-desc"
                  checked={sortOption === "date-desc"}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                />
                <span>Date (décroissant)</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sortOption"
                  value="price-asc"
                  checked={sortOption === "price-asc"}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                />
                <span>Prix (croissant)</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sortOption"
                  value="price-desc"
                  checked={sortOption === "price-desc"}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                />
                <span>Prix (décroissant)</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded"
              >
                Annuler
              </button>
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