 // services/api.ts

import axios from "axios";

// Typage du retour de l’API
export interface AddressSuggestion {
  properties: {
    label: string;
    postcode: string;
    city: string;
    name: string;
  };
}

// Fonction pour récupérer les suggestions d’adresses
export async function fetchAddressSuggestions(query: string, limit = 5) {
  if (!query || query.length < 3) return [];

  try {
    const response = await axios.get(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
        query
      )}&limit=${limit}`
    );
    return response.data.features as AddressSuggestion[];
  } catch (error) {
    console.error("Erreur lors de la récupération des suggestions d’adresse:", error);
    return [];
  }
}
