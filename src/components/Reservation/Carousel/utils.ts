// components/Carousel/utils.ts
  import axios from "axios";
  import { AddressSuggestion } from "./types";

/**
 * Formate une date (YYYY-MM-DD) en une date lisible avec le jour
 * @param date - la date au format string (ex: "2025-01-05")
 * @returns ex: "lun. 5 janvier 2025"
 */
export const formatDateWithDay = (date: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString("fr-FR", options);
  };


/**
 * Récupère des suggestions d'adresse à partir d'une requête.
 * @param query La chaîne de caractères représentant la recherche d'adresse.
 * @returns Une liste de suggestions d'adresse.
 */
export const fetchAddressSuggestions = async (query: string): Promise<AddressSuggestion[]> => {
  if (query.length < 3) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data.features as AddressSuggestion[];
  } catch (error) {
    console.error("Erreur lors de la recherche d'adresse :", error);
    return [];
  }
};

