"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { formatDateRange } from "../../utils";
import { Stage } from "../types";
import { fetchStages } from "../../../lib/api";
import {
  CalendarDays,
  MapPin,
  Clock,
  CreditCard,
  User,
  Phone,
  CheckCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface StageSelectionStepProps {
  onStageSelected: (stage: Stage) => void;
}
 
// Types pour les filtres
type SortOption = "date" | "price" | "none";
type SortDirection = "asc" | "desc";
type DayPair = "lun-mar" | "mar-mer" | "mer-jeu" | "jeu-ven" | "ven-sam" | "all";
type MonthOption = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 0; // 0 = tous les mois

const StageSelectionStep = ({ onStageSelected }: StageSelectionStepProps) => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [filteredStages, setFilteredStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Remplacer la pagination par un système de chargement progressif
  const [visibleStages, setVisibleStages] = useState<Stage[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerLoad = 5;
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  
  // Nouvel état pour les filtres compressables
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Pour mobile seulement

  // Ajout des états pour les filtres
  const [sortOption, setSortOption] = useState<SortOption>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedDayPair, setSelectedDayPair] = useState<DayPair>("all");
  const [selectedMonths, setSelectedMonths] = useState<MonthOption[]>([]);

  const fetchStagesFromApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStages();
      setStages(data);
      setFilteredStages(data);
    } catch (err) {
      setError("Erreur lors de la récupération des stages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStagesFromApi();
  }, []);

  // Fonction pour charger plus d'éléments
  const loadMoreItems = useCallback(() => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    setTimeout(() => {
      const currentLength = visibleStages.length;
      const nextItems = filteredStages.slice(
        currentLength,
        currentLength + itemsPerLoad
      );
      
      if (nextItems.length > 0) {
        setVisibleStages((prev) => [...prev, ...nextItems]);
      }
      
      setHasMore(currentLength + nextItems.length < filteredStages.length);
      setLoadingMore(false);
    }, 200); // Simuler un léger délai de chargement
  }, [filteredStages, visibleStages, loadingMore]);

  // Observer d'intersection pour détecter quand on arrive en bas
  useEffect(() => {
    if (loading) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreItems();
        }
      },
      { threshold: 0.5 }
    );

    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loadMoreItems, hasMore, loading]);

  // Effet pour appliquer les filtres
  useEffect(() => {
    if (stages.length > 0) {
      applyFilters();
    }
  }, [stages, sortOption, sortDirection, selectedDayPair, selectedMonths]);

  // Effet pour initialiser les stages visibles après filtrage
  useEffect(() => {
    setVisibleStages(filteredStages.slice(0, itemsPerLoad));
    setHasMore(filteredStages.length > itemsPerLoad);
  }, [filteredStages]);

  // Fonction pour déterminer le jour de la semaine
  const getDayOfWeek = (dateString: string): number => {
    const date = new Date(dateString);
    return date.getDay();
  };

  const getDayName = (day: number): string => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    return days[day];
  };

  const matchesDayPair = (stage: Stage): boolean => {
    if (selectedDayPair === "all") return true;
    const startDay = getDayOfWeek(stage.startDate);
    const endDay = getDayOfWeek(stage.endDate);

    switch (selectedDayPair) {
      case "lun-mar":
        return startDay === 1 && endDay === 2;
      case "mar-mer":
        return startDay === 2 && endDay === 3;
      case "mer-jeu":
        return startDay === 3 && endDay === 4;
      case "jeu-ven":
        return startDay === 4 && endDay === 5;
      case "ven-sam":
        return startDay === 5 && endDay === 6;
      default:
        return true;
    }
  };

  const matchesMonth = (stage: Stage): boolean => {
    if (selectedMonths.length === 0) return true;
    const startMonth = new Date(stage.startDate).getMonth() + 1;
    return selectedMonths.includes(startMonth as MonthOption);
  };

  const applyFilters = () => {
    let result = [...stages];

    if (selectedDayPair !== "all") {
      result = result.filter(matchesDayPair);
    }

    if (selectedMonths.length > 0) {
      result = result.filter(matchesMonth);
    }

    if (sortOption !== "none") {
      result.sort((a, b) => {
        let comparison = 0;
        if (sortOption === "price") {
          comparison = a.price - b.price;
        } else if (sortOption === "date") {
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        }
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    setFilteredStages(result);
  };

  const resetFilters = () => {
    setSortOption("date");
    setSortDirection("asc");
    setSelectedDayPair("all");
    setSelectedMonths([]);
    setFilteredStages(stages);
    setIsFilterOpen(false); // Ferme les filtres après réinitialisation
  };

  const getCapacityColor = (capacity: number) => {
    if (capacity <= 2) return "text-red-600 bg-red-50";
    if (capacity <= 5) return "text-orange-600 bg-orange-50";
    return "text-green-600 bg-green-50";
  };

  const getCapacityText = (capacity: number) => {
    if (capacity <= 2) return "Presque complet";
    if (capacity <= 5) return `${capacity} places restantes`;
    return "Places disponibles";
  };

  const getMonthName = (monthNum: number): string => {
    const months = [
      "Tous les mois",
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
    return months[monthNum];
  };

  const handleSortClick = (option: SortOption) => {
    if (sortOption === option) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortOption(option);
      setSortDirection("asc");
    }
  };

  const toggleMonth = (month: MonthOption) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  const handleDayPairChange = (dayPair: DayPair) => {
    setSelectedDayPair(dayPair === selectedDayPair ? "all" : dayPair);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = getDayName(date.getDay());
    const dayNum = date.getDate();
    const month = getMonthName(date.getMonth() + 1);
    const year = date.getFullYear();
    return `${day} ${dayNum} ${month} ${year}`;
  };

  const formatTime = (stage: Stage): string => {
    return "7h45 - 16h00";
  };

  const getSortIcon = (option: SortOption) => {
    if (sortOption !== option) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
        <div className="flex">
          <div className="py-1">
            <svg className="h-6 w-6 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <p className="font-bold">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const dayPairs: { value: DayPair; label: string }[] = [
    { value: "lun-mar", label: "Lundi - Mardi" },
    { value: "mar-mer", label: "Mardi - Mercredi" },
    { value: "mer-jeu", label: "Mercredi - Jeudi" },
    { value: "jeu-ven", label: "Jeudi - Vendredi" },
    { value: "ven-sam", label: "Vendredi - Samedi" },
  ];

  // Nombre de filtres actifs
  const activeFiltersCount = 
    (selectedDayPair !== "all" ? 1 : 0) + 
    selectedMonths.length + 
    (sortOption !== "date" || sortDirection !== "asc" ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Bouton pour ouvrir les filtres (mobile) */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Filter className="h-5 w-5 mr-2" />
          {isFilterOpen ? "Masquer les filtres" : `Filtres ${activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}`}
        </button>
      </div>

      <div className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-lg shadow-md">
        {/* Sidebar avec filtres - version compressable pour desktop */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isFilterOpen ? "block" : "hidden md:block"
          } md:border-r md:border-gray-200 md:flex md:flex-col relative bg-gray-50 ${
            isFilterExpanded ? "md:w-1/4" : "md:w-16"
          }`}
        >
          {/* Bouton pour compresser/étendre les filtres (desktop seulement) */}
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="hidden md:flex absolute right-0 top-4 transform translate-x-1/2 z-10 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-50"
          >
            {isFilterExpanded ? (
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            )}
          </button>

          <div className={`p-4 ${isFilterExpanded ? "block" : "hidden md:block"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium text-gray-900 ${!isFilterExpanded && "md:hidden"}`}>
                Filtres {activeFiltersCount > 0 && isFilterExpanded && `(${activeFiltersCount})`}
              </h3>
              {!isFilterExpanded && (
                <div className="hidden md:block text-center">
                  <Filter className="h-5 w-5 mx-auto text-gray-700" />
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mt-1 mx-auto">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
              )}
              <button
                onClick={() => setIsFilterOpen(false)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Contenu des filtres - visible uniquement si développé ou sur mobile */}
            <div className={`${isFilterExpanded ? "block" : "hidden"}`}>
              {/* Tri */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Trier par</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleSortClick("date")}
                    className={`flex items-center justify-between w-full px-3 py-2 text-left rounded-md ${
                      sortOption === "date" ? "bg-blue-50 text-blue-700" : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>Date</span>
                    {getSortIcon("date")}
                  </button>
                  <button
                    onClick={() => handleSortClick("price")}
                    className={`flex items-center justify-between w-full px-3 py-2 text-left rounded-md ${
                      sortOption === "price" ? "bg-blue-50 text-blue-700" : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>Prix</span>
                    {getSortIcon("price")}
                  </button>
                </div>
              </div>

              {/* Jours */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Jours</h4>
                <div className="space-y-2">
                  {dayPairs.map((pair) => (
                    <div key={pair.value} className="flex items-center">
                      <button
                        onClick={() => handleDayPairChange(pair.value)}
                        className={`flex items-center w-full px-3 py-2 text-left rounded-md ${
                          selectedDayPair === pair.value ? "bg-blue-50 text-blue-700" : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full mr-2 flex items-center justify-center border ${
                            selectedDayPair === pair.value ? "border-blue-500 bg-blue-500" : "border-gray-300"
                          }`}
                        >
                          {selectedDayPair === pair.value && <div className="h-2 w-2 rounded-full bg-white"></div>}
                        </div>
                        <span>{pair.label}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mois */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Mois</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 12 }).map((_, index) => {
                    const monthNum = (index + 1) as MonthOption;
                    return (
                      <button
                        key={monthNum}
                        onClick={() => toggleMonth(monthNum)}
                        className={`flex items-center px-3 py-2 text-left rounded-md ${
                          selectedMonths.includes(monthNum) ? "bg-blue-50 text-blue-700" : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded mr-2 flex items-center justify-center border ${
                            selectedMonths.includes(monthNum) ? "border-blue-500 bg-blue-500" : "border-gray-300"
                          }`}
                        >
                          {selectedMonths.includes(monthNum) && (
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span>{getMonthName(monthNum)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Réinitialiser */}
              <button
                onClick={resetFilters}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal - Liste des stages */}
        <div className={`transition-all duration-300 ease-in-out ${isFilterExpanded ? "md:w-3/4" : "md:flex-1"} p-4`}>
          {filteredStages.length > 0 ? (
            <div>
              <div className="mb-4 py-3 px-4 bg-gray-100 rounded-lg flex justify-between items-center">
                <p className="text-gray-700">
                  <span className="font-medium">{filteredStages.length}</span> stages disponibles
                </p>
                
                {/* Bouton pour ouvrir les filtres si ils sont compressés mais pas masqués (desktop) */}
                {!isFilterExpanded && (
                  <button
                    onClick={() => setIsFilterExpanded(true)}
                    className="hidden md:flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    <span>Développer les filtres</span>
                  </button>
                )}
              </div>

              {/* Container pour la liste des stages avec scroll */}
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {visibleStages.map((stage) => {
                  const startDate = new Date(stage.startDate);
                  const endDate = new Date(stage.endDate);
                  const startMonth = getMonthName(startDate.getMonth() + 1);

                  return (
                    <div key={stage.id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                   
                      <div className="p-4">
                        <div className="flex flex-col md:flex-row">
                          {/* Colonne de gauche - Date et infos */}
                          <div className="md:w-3/4 space-y-3">
                            <div className="flex flex-wrap gap-6">
                              {/* Dates */}
                              <div className="flex items-start space-x-2">
                                <CalendarDays className="h-5 w-5 flex-shrink-0 text-blue-500 mt-1" />
                                <div>
                                  <p className="text-md text-gray-600">Dates: {formatDateRange(stage.startDate, stage.endDate)}
                                  </p>
                                </div>
                              </div>

                              {/* Horaires */}
                              <div className="flex items-start space-x-2">
                                <Clock className="h-5 w-5 flex-shrink-0 text-blue-500 mt-1" />
                                <div>
                                  <p className="text-md text-gray-600">Horaires: {formatTime(stage)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Caractéristiques du stage */}
                            <div className="mt-3 flex flex-wrap gap-2">
                              <div className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Numéro de stage : {stage.numeroStageAnts}
                              </div>
                            
                              <div className="mb-2">
                                <span
                                  className={`inline-flex items-center ${getCapacityColor(stage.capacity)} px-3 py-1 rounded-full text-sm font-medium`}
                                >
                                  <User className="h-4 w-4 mr-1" />
                                  {getCapacityText(stage.capacity)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Colonne de droite - Prix et réservation */}
                          <div className="md:w-1/4 mt-6 md:mt-0 flex flex-col items-center justify-center border-t pt-4 md:pt-0 md:border-t-0 md:border-l md:pl-6">
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-800 mb-1">
                                {stage.price.toLocaleString("fr-FR", {
                                  style: "currency",
                                  currency: "EUR",
                                })}
                              </div>

                              <button
                                onClick={() => onStageSelected(stage)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg shadow transition-colors duration-200"
                              >
                                Réserver
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {hasMore && (
                  <div 
                    ref={loadingRef} 
                    className="flex justify-center py-4"
                  >
                    {loadingMore ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    ) : (
                      <p className="text-gray-500 text-sm">Défilez pour charger plus</p>
                    )}
                  </div>
                )}

                {!hasMore && visibleStages.length > 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Fin des résultats
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun stage disponible</h3>
              <p className="mt-1 text-gray-500">Aucune session de stage ne correspond à vos critères de recherche.</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StageSelectionStep;