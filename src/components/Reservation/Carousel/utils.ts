// components/Carousel/utils.ts

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
  