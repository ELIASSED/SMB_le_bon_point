import React, { useState } from "react";

interface AutocompleteAddressProps {
  onSelectAddress: (address: string, postalCode: string, city: string) => void;
}

const AutocompleteAddress: React.FC<AutocompleteAddressProps> = ({ onSelectAddress }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ label: string; postalCode: string; city: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${value}&autocomplete=1`);
      const data = await response.json();

      const newSuggestions = data.features.map((feature: any) => ({
        label: feature.properties.label,
        postalCode: feature.properties.postcode,
        city: feature.properties.city,
      }));

      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (suggestion: { label: string; postalCode: string; city: string }) => {
    setQuery(suggestion.label);
    setSuggestions([]);
    onSelectAddress(suggestion.label, suggestion.postalCode, suggestion.city);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Entrez votre adresse"
        className="mt-1 block w-full border rounded-md p-2"
      />
      {loading && <p className="text-sm text-gray-500">Chargement...</p>}
      {suggestions.length > 0 && (
        <ul className="border rounded-md bg-white shadow-md max-h-60 overflow-y-auto mt-1">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="cursor-pointer p-2 hover:bg-gray-100"
            >
              {suggestion.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteAddress;
