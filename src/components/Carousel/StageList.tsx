import SortModal from "./SortOptions";
import { formatDateWithDay } from "../utils";
const StageList = ({
    stages,
    loading,
    currentPage,
    totalPages,
    onStageSelected,
    handlePrevPage,
    handleNextPage,
    handleDataUpdate,
  }) => {
    return (
      <div className="bg-white p-6 md:p-10 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Stages disponibles
        </h3>
  
        {/* Modale pour trier les stages */}
        <div className="mb-4 text-right">
          <SortModal onDataUpdate={handleDataUpdate} />
        </div>
  
        {loading ? (
          <p className="text-gray-500 text-center">Chargement des stages...</p>
        ) : (
          <>
            {/* Liste paginée des stages */}
            <div className="space-y-6">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors shadow-sm"
                >
                  {/* Informations sur le stage */}
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-2 md:space-y-0 mb-4 md:mb-0">
                    <div className="text-lg font-semibold text-yellow-600">
                      {formatDateWithDay(stage.startDate)} -{" "}
                      {formatDateWithDay(stage.endDate)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{stage.location}</span>
                    </div>
                    <div
                      className={`text-lg font-medium ${
                        stage.capacity <= 5 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      Places restantes : {stage.capacity}
                    </div>
                  </div>
  
                  {/* Prix et bouton de réservation */}
                  <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                    <div className="text-lg font-bold text-gray-700">
                      {stage.price.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </div>
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded shadow"
                      onClick={() => onStageSelected(stage)}
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              ))}
            </div>
  
            {/* Pagination */}
            <div className="flex items-center justify-center mt-8 space-x-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`py-2 px-4 rounded shadow ${
                  currentPage === 1
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Précédent
              </button>
              <span className="text-gray-700">
                Page <strong>{currentPage}</strong> / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`py-2 px-4 rounded shadow ${
                  currentPage === totalPages
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Suivant
              </button>
            </div>
          </>
        )}
      </div>
    );
  };
  
  export default StageList;
  