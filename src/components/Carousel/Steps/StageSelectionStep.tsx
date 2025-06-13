"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { formatDateRange } from "../../utils";
import { Stage } from "../types";
import { fetchStages } from "../../../lib/api";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  User,
  Info,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
} from "lucide-react";
import StageInfoModal from "../StageInfoModal";

interface StageSelectionStepProps {
  onStageSelected: (stage: Stage) => Promise<void>;
  selectedStage: Stage | null;
}

// Types pour les filtres
type SortOption = "date" | "price" | "none";
type SortDirection = "asc" | "desc";
type DayPair = "lun-mar" | "mar-mer" | "mer-jeu" | "jeu-ven" | "ven-sam" | "all";
type MonthOption = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 0; // 0 = tous les mois

const StageSelectionStep = ({ onStageSelected, selectedStage }: StageSelectionStepProps) => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [filteredStages, setFilteredStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chargement progressif
  const [visibleStages, setVisibleStages] = useState<Stage[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerLoad = 5;
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Filtres
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Pour mobile
  const [sortOption, setSortOption] = useState<SortOption>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedDayPair, setSelectedDayPair] = useState<DayPair>("all");
  const [selectedMonths, setSelectedMonths] = useState<MonthOption[]>([]);
  const [showBestDeals, setShowBestDeals] = useState(false);

  // Modal state
  const [modalStage, setModalStage] = useState<Stage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (stage: Stage) => {
    setModalStage(stage);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalStage(null);
    setIsModalOpen(false);
  };

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

  const loadMoreItems = useCallback(() => {
    if (loadingMore) return;

    setLoadingMore(true);
    setTimeout(() => {
      const currentLength = visibleStages.length;
      const nextItems = filteredStages.slice(currentLength, currentLength + itemsPerLoad);

      if (nextItems.length > 0) {
        setVisibleStages((prev) => [...prev, ...nextItems]);
      }

      setHasMore(currentLength + nextItems.length < filteredStages.length);
      setLoadingMore(false);
    }, 200);
  }, [filteredStages, visibleStages, loadingMore]);

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

  const getDayOfWeek = (dateString: string): number => {
    const date = new Date(dateString);
    return date.getDay();
  };

  const getDayName = (day: number): string => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    return days[day];
  };

  const matchesDayPair = useCallback((stage: Stage): boolean => {
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
  }, [selectedDayPair]);

  const matchesMonth = useCallback((stage: Stage): boolean => {
    if (selectedMonths.length === 0) return true;
    const startMonth = new Date(stage.startDate).getMonth() + 1;
    return selectedMonths.includes(startMonth as MonthOption);
  }, [selectedMonths]);

  const isBestDeal = useCallback((stage: Stage): boolean => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const startDate = new Date(stage.startDate);
    return (
      stage.price <= 200 &&
      startDate <= thirtyDaysFromNow
    );
  }, []);
 const isTodayAfter8AM = (stage: Stage): boolean => {
   const now = new Date();
   const startDate = new Date(stage.startDate);
   
    // Vérifier si la date de début est aujourd'hui
   const isToday =
     startDate.getDate() === now.getDate() &&
     startDate.getMonth() === now.getMonth() &&
     startDate.getFullYear() === now.getFullYear();
    
    // Si c'est aujourd'hui, vérifier si l'heure actuelle est après 8h
   if (isToday) {      return now.getHours() >= 8;
   }    return false; 
  };
  const applyFilters = useCallback(() => {
    let result = [...stages];
// Exclure les stages qui commencent aujourd'hui après 8h
result = result.filter((stage) => !isTodayAfter8AM(stage));
    if (selectedDayPair !== "all") {
      result = result.filter((stage) => matchesDayPair(stage));
    }

    if (selectedMonths.length > 0) {
      result = result.filter((stage) => matchesMonth(stage));
    }

    if (showBestDeals) {
      result = result.filter((stage) => isBestDeal(stage));
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
  }, [stages, sortOption, sortDirection, selectedDayPair, selectedMonths, showBestDeals, matchesDayPair, matchesMonth]);

  useEffect(() => {
    if (stages.length > 0) {
      applyFilters();
    }
  }, [stages, sortOption, sortDirection, selectedDayPair, selectedMonths, showBestDeals, applyFilters]);

  useEffect(() => {
    setVisibleStages(filteredStages.slice(0, itemsPerLoad));
    setHasMore(filteredStages.length > itemsPerLoad);
  }, [filteredStages]);

  const resetFilters = () => {
    setSortOption("date");
    setSortDirection("asc");
    setSelectedDayPair("all");
    setSelectedMonths([]);
    setShowBestDeals(false);
    setFilteredStages(stages);
    setIsFilterOpen(false);
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

  const getSortIcon = (option: SortOption) => {
    if (sortOption !== option) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const activeFiltersCount =
    (selectedDayPair !== "all" ? 1 : 0) +
    selectedMonths.length +
    (sortOption !== "date" || sortDirection !== "asc" ? 1 : 0) +
    (showBestDeals ? 1 : 0);

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

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
      {/* Modal */}
      {modalStage && <StageInfoModal stage={modalStage} isOpen={isModalOpen} onClose={closeModal} />}

      {/* Bouton pour ouvrir les filtres (mobile) */}
      <div className="md:hidden mb-3">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center w-full bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
        >
          <Filter className="h-4 w-4 mr-1" />
          {isFilterOpen ? "Masquer les filtres" : `Filtres ${activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}`}
        </button>
      </div>

      <div className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Sidebar avec filtres */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isFilterOpen ? "block" : "hidden md:block"
          } md:border-r md:border-gray-200 md:flex md:flex-col relative bg-gray-50 ${
            isFilterExpanded ? "md:w-1/4" : "md:w-12"
          }`}
        >
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="hidden md:flex absolute right-0 top-3 transform translate-x-1/2 z-10 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50"
          >
            {isFilterExpanded ? (
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>

          <div className={`p-3 ${isFilterExpanded ? "block" : "hidden md:block"}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className={`text-base font-medium text-gray-900 ${!isFilterExpanded && "md:hidden"}`}>
                Filtres {activeFiltersCount > 0 && isFilterExpanded && `(${activeFiltersCount})`}
              </h3>
              {!isFilterExpanded && (
                <div className="hidden md:block text-center">
                  <Filter className="h-4 w-4 mx-auto text-gray-700" />
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center mt-1 mx-auto">
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

            <div className={`${isFilterExpanded ? "block" : "hidden"}`}>
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 text-sm mb-1">Trier par</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => handleSortClick("date")}
                    className={`flex items-center justify-between w-full px-2 py-1.5 text-left rounded-md text-sm ${
                      sortOption === "date" ? "bg-blue-50 text-blue-700" : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>Date</span>
                    {getSortIcon("date")}
                  </button>
                  <button
                    onClick={() => handleSortClick("price")}
                    className={`flex items-center justify-between w-full px-2 py-1.5 text-left rounded-md text-sm ${
                      sortOption === "price" ? "bg-blue-50 text-blue-700" : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>Prix</span>
                    {getSortIcon("price")}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 text-sm mb-1">Meilleurs plans</h4>
                <button
                  onClick={() => setShowBestDeals(!showBestDeals)}
                  className={`flex items-center w-full px-2 py-1.5 text-left rounded-md text-sm ${
                    showBestDeals ? "bg-blue-50 text-blue-700" : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div
                    className={`h-3 w-3 rounded-full mr-1.5 flex items-center justify-center border ${
                      showBestDeals ? "border-blue-500 bg-blue-500" : "border-gray-300"
                    }`}
                  >
                    {showBestDeals && <div className="h-1.5 w-1.5 rounded-full bg-white"></div>}
                  </div>
                  <span>Afficher les meilleurs plans</span>
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 text-sm mb-1">Jours</h4>
                <div className="space-y-1">
                  {dayPairs.map((pair) => (
                    <div key={pair.value} className="flex items-center">
                      <button
                        onClick={() => handleDayPairChange(pair.value)}
                        className={`flex items-center w-full px-2 py-1.5 text-left rounded-md text-sm ${
                          selectedDayPair === pair.value ? "bg-blue-50 text-blue-700" : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div
                          className={`h-3 w-3 rounded-full mr-1.5 flex items-center justify-center border ${
                            selectedDayPair === pair.value ? "border-blue-500 bg-blue-500" : "border-gray-300"
                          }`}
                        >
                          {selectedDayPair === pair.value && <div className="h-1.5 w-1.5 rounded-full bg-white"></div>}
                        </div>
                        <span>{pair.label}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 text-sm mb-1">Mois</h4>
                <div className="grid grid-cols-2 gap-1">
                  {Array.from({ length: 12 }).map((_, index) => {
                    const monthNum = (index + 1) as MonthOption;
                    return (
                      <button
                        key={monthNum}
                        onClick={() => toggleMonth(monthNum)}
                        className={`flex items-center px-2 py-1.5 text-left rounded-md text-sm ${
                          selectedMonths.includes(monthNum) ? "bg-blue-50 text-blue-700" : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div
                          className={`h-3 w-3 rounded mr-1.5 flex items-center justify-center border ${
                            selectedMonths.includes(monthNum) ? "border-blue-500 bg-blue-500" : "border-gray-300"
                          }`}
                        >
                          {selectedMonths.includes(monthNum) && (
                            <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

              <button
                onClick={resetFilters}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1.5 px-3 rounded-md text-sm transition-colors duration-200"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal - Liste des stages */}
        <div className={`transition-all duration-300 ease-in-out ${isFilterExpanded ? "md:w-3/4" : "md:flex-1"} p-3`}>
          {filteredStages.length > 0 ? (
            <div>
              <div className="mb-3 py-2 px-3 bg-gray-100 rounded-md flex justify-between items-center text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">{filteredStages.length}</span> stages disponibles
                </p>
                {!isFilterExpanded && (
                  <button
                    onClick={() => setIsFilterExpanded(true)}
                    className="hidden md:flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    <span>Développer les filtres</span>
                  </button>
                )}
              </div>

              <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
                {visibleStages.map((stage) => (
                  <div
                    key={stage.id}
                    className={`border rounded-lg shadow-sm bg-white ${
                      isBestDeal(stage) ? "border-yellow-400 border-2" : "border-gray-200"
                    } ${selectedStage?.id === stage.id ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="sm:w-1/3 text-left">
                          <div className="text-green-600 font-bold text-lg">
                            {stage.price.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </div>
                          {isBestDeal(stage) && (
                            <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full mt-1">
                              <Star className="h-3 w-3 mr-1" />
                              Meilleur plan
                            </span>
                          )}
                        </div>

                        <div className="sm:w-1/3 text-center flex flex-col items-center justify-center">
                          <div className="flex items-center justify-center space-x-2 text-gray-700">
                            <p className="text-md">{formatDateRange(stage.startDate, stage.endDate)}</p>
                          </div>

                          <div className="flex gap-2 flex-wrap mt-1 justify-center">
                            <span
                              className={`inline-flex items-center ${getCapacityColor(stage.capacity)} px-2 py-0.5 rounded-full text-xs font-medium`}
                            >
                              <User className="h-3 w-3 mr-1" />
                              {getCapacityText(stage.capacity)}
                            </span>
                            <button
                              onClick={() => openModal(stage)}
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs"
                            >
                              <Info className="h-3 w-3 mr-1" />
                              Plus d'info
                            </button>
                          </div>
                        </div>

                        <div className="sm:w-1/3 text-right flex sm:justify-end">
                          <button
                            onClick={() => onStageSelected(stage)}
                            className={`font-medium py-2 px-4 rounded-md text-sm shadow transition-colors duration-200 ${
                              selectedStage?.id === stage.id
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {selectedStage?.id === stage.id ? "Sélectionné" : "Réserver"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <div ref={loadingRef} className="flex justify-center py-3">
                    {loadingMore ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    ) : (
                      <p className="text-gray-500 text-xs">Défilez pour charger plus</p>
                    )}
                  </div>
                )}

                {!hasMore && visibleStages.length > 0 && (
                  <div className="text-center py-3 text-gray-500 text-xs">Fin des résultats</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-1 text-base font-medium text-gray-900">Aucun stage disponible</h3>
              <p className="mt-1 text-gray-500 text-sm">Aucune session de stage ne correspond à vos critères de recherche.</p>
              <button
                onClick={resetFilters}
                className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm transition-colors duration-200"
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