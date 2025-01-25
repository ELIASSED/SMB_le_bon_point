import React, { useState } from "react";

type SortOption = "date-asc" | "date-desc" | "price-asc" | "price-desc";
type PrioritySort = "date" | "price";

interface SortModalProps {
  onDataUpdate: (data: any) => void;
}

const SortModal: React.FC<SortModalProps> = ({ onDataUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("date-asc");

  const handleApply = async () => {
    setIsOpen(false);
    try {
      // Extraction du champ et de la direction
      const [field, direction] = sortOption.split("-");

      // Construction des paramètres d'URL
      const currentUrl = new URL(window.location.href);
      const params = new URLSearchParams();

      // Ajout des paramètres de prix existants s'il y en a
      const minPrice = currentUrl.searchParams.get("minPrice");
      const maxPrice = currentUrl.searchParams.get("maxPrice");
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);

      // Ajout des paramètres de tri
      params.append("prioritySort", field); // Le champ devient la priorité
      params.append(field, direction); // Ajoute le tri pour le champ prioritaire

      // Si on trie par prix, on ajoute un tri secondaire par date
      if (field === "price") {
        params.append("date", "asc");
      }
      // Si on trie par date, on ajoute un tri secondaire par prix
      else if (field === "date") {
        params.append("price", "asc");
      }

      // Construction de l'URL finale
      const apiUrl = `/api/stage/filter?${params.toString()}`;
      console.log("Calling API:", apiUrl);

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Erreur lors de l'appel à l'API");
      
      const data = await response.json();
      if (data.success) {
        onDataUpdate(data.data);
      } else {
        console.error("Erreur API:", data.error);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-2"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" 
          />
        </svg>
        Trier les stages
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Options de tri</h2>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">Par date</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="sortOption"
                      value="date-asc"
                      checked={sortOption === "date-asc"}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Plus récent</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="sortOption"
                      value="date-desc"
                      checked={sortOption === "date-desc"}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Moins récent</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">Par prix</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="sortOption"
                      value="price-asc"
                      checked={sortOption === "price-asc"}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Prix croissants</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="sortOption"
                      value="price-desc"
                      checked={sortOption === "price-desc"}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Prix décroissants</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleApply}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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