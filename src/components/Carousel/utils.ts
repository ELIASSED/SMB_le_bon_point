// components/Carousel/utils.ts
  import axios from "axios";
  import { AddressSuggestion } from "./types";

/**
 * Retourne la date formatée avec nom du jour, jour, mois, année.
 * ex: "jeu. 16 janvier 2025"
 */
export function formatDateWithDay(dateStr: string): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short", // "jeu."
    year: "numeric",  // "2025"
    month: "long",    // "janvier"
    day: "numeric",   // "16"
  };
  return new Date(dateStr).toLocaleDateString("fr-FR", options);
}

/**
 * Retourne un intervalle de dates ("start" - "end") avec la logique demandée :
 * - Si même mois + année, renvoie "jeu. 16 et ven. 17 janvier 2025"
 * - Sinon, renvoie "jeu. 16 janvier 2025 - ven. 17 janvier 2025"
 */
export function formatDateRange(startStr: string, endStr: string): string {
  const startDate = new Date(startStr);
  const endDate   = new Date(endStr);

  // Vérifie si c'est le même mois et la même année
  const sameMonthYear =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  if (sameMonthYear) {
    // -> "jeu. 16" (sans mois/année) + "et" + "ven. 17 janvier 2025"
    // 1) Format "jour + nom du jour" (sans mois/année)
    const shortOptions: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
    };
    const startShort = startDate.toLocaleDateString("fr-FR", shortOptions);
    // 2) Format complet pour la deuxième date
    const endFull = formatDateWithDay(endStr);

    // ex: "jeu. 16 et ven. 17 janvier 2025"
    return `${startShort} et ${endFull}`;
  } else {
    // Cas normal : "formatDateWithDay(start) - formatDateWithDay(end)"
    return `${formatDateWithDay(startStr)} - ${formatDateWithDay(endStr)}`;
  }
}


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

