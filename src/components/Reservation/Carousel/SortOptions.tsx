import React, { useState } from "react";

type SortOption = "date-asc" | "price-asc";

interface SortOptionsProps {
  onDataUpdate: (data: any) => void;
}

const SortOptions: React.FC<SortOptionsProps> = ({ onDataUpdate }) => {
  const [sortOption, setSortOption] = useState<SortOption>("date-asc");
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);  // Met à jour l'état en fonction de l'action de l'utilisateur
  };

  const handleApply = async () => {
    try {
      const [field, direction] = sortOption.split("-");

      const currentUrl = new URL(window.location.href);
      const params = new URLSearchParams();

      const minPrice = currentUrl.searchParams.get("minPrice");
      const maxPrice = currentUrl.searchParams.get("maxPrice");
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);

      params.append("prioritySort", field);
      params.append(field, direction);

      // Ajout du tri secondaire selon la sélection principale
      if (field === "price") {
        params.append("date", "asc");
      } else if (field === "date") {
        params.append("price", "asc");
      }

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

  const applySort = (option: SortOption) => {
    setSortOption(option);
    handleApply(); // Appliquer le filtre immédiatement après avoir sélectionné
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <label
            className={` items-center space-x-3 cursor-pointer ${
              sortOption === "date-asc" ? "text-blue-600" : ""
            }`}
            onClick={() => applySort("date-asc")}
          >
            <input
              type="radio"
              name="sortOption"
              value="date-asc"
              checked={sortOption === "date-asc"}
              className="w-4 h-4 hidden"
            />
            <span>Plus récent</span>
          </label>

          <label
            className={`items-center space-x-3 cursor-pointer ${
              sortOption === "price-asc" ? "text-blue-600" : ""
            }`}
            onClick={() => applySort("price-asc")}
          >
            <input
              type="radio"
              name="sortOption"
              value="price-asc"
              checked={sortOption === "price-asc"}
              className="w-4 h-4 hidden"
            />
            <span>Prix croissants</span>
          </label>

       
        </div>
      </div>
    </div>
  );
};

export default SortOptions;
