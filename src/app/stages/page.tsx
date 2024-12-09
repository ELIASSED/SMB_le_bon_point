"use client";

import React, { useState } from 'react';
import Image from 'next/image';

type Stage = {

  date: string; // format YYYY-MM-DD
  title: string;

  color: string;
};

// Fonction pour obtenir le nom du mois
function getMonthName(monthIndex: number): string {
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return monthNames[monthIndex];
}

export default function CalendarClient() {
  // État pour l'année et le mois affichés
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth());

  // États pour le formulaire d'inscription
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedDayStages, setSelectedDayStages] = useState<Stage[]>([]);

  // Données de stages fictives
  const stages: Stage[] = [
    { date: '2024-12-05', title: 'Stage Permis A', color: 'bg-blue-200' },
    { date: '2024-12-10', title: 'Stage Permis B', color: 'bg-green-200' },
    { date: '2024-12-15', title: 'Stage Permis Moto', color: 'bg-yellow-200' },
    { date: '2024-12-20', title: 'Stage Points Urgent', color: 'bg-red-200' },
    { date: '2024-12-28', title: 'Stage Récup Points', color: 'bg-purple-200' },    { date: '2024-12-29', title: 'Stage Récup Points', color: 'bg-purple-200' },

    { date: '2025-01-10', title: 'Stage Permis B', color: 'bg-green-200' },
    { date: '2025-01-15', title: 'Stage Permis Moto', color: 'bg-yellow-200' },
    { date: '2025-01-20', title: 'Stage Points Urgent', color: 'bg-red-200' },
    { date: '2025-01-28', title: 'Stage Récup Points', color: 'bg-purple-200' },    { date: '2025-01-29', title: 'Stage Récup Points', color: 'bg-purple-200' },

  ];

  // Calcul du calendrier pour l'année et le mois en cours
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0); // dernier jour du mois
  const totalDays = lastDayOfMonth.getDate();

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  let startDay = firstDayOfMonth.getDay(); 
  // Convertir le dimanche=0, lundi=1 en lundi=0 ... dimanche=6
  startDay = startDay === 0 ? 6 : startDay - 1;

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push(d);
  }

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  // Fonction pour récupérer les stages d'un jour
  const getStagesForDay = (day: number | null): Stage[] => {
    if (day === null) return [];
    // On formate la date en YYYY-MM-DD
    const currentMonth = (month + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dateString = `${year}-${currentMonth}-${dayStr}`;
    return stages.filter((st) => st.date === dateString);
  };

  // Gestion du changement de mois
  const goToPreviousMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11; // Décembre
      newYear = year - 1;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  const goToNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 11) {
      newMonth = 0; // Janvier
      newYear = year + 1;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  // Fonction appelée lorsqu'on clique sur un jour avec des stages
  const handleDayClick = (dayStages: Stage[]) => {
    if (dayStages.length > 0) {
      setSelectedDayStages(dayStages);
      setShowForm(true);
    }
  };

  return (
    <div className="relative p-4">
      {/* En-tête du calendrier */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">
          {getMonthName(month)} {year}
        </h1>
        <div className="space-x-2">
          <button 
            onClick={goToPreviousMonth} 
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
          >
            &larr; Précédent
          </button>
          <button 
            onClick={goToNextMonth} 
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
          >
            Suivant &rarr;
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="mb-6 text-gray-600">
        Consultez les stages disponibles. Cliquez sur une date pour plus d'informations.
        (Exemple fictif, aucune donnée réelle.)
      </p>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-2 border-b pb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center font-semibold text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* Calendrier */}
      <div className="mt-2 space-y-2">
        {weeks.map((week, wIndex) => (
          <div key={wIndex} className="grid grid-cols-7 gap-2">
            {week.map((day, dIndex) => {
              const dayStages = getStagesForDay(day);
              return (
                <div 
                  key={dIndex} 
                  className={`relative border rounded-lg p-2 h-24 cursor-pointer ${dayStages.length > 0 ? 'hover:bg-gray-100' : ''}`} 
                  onClick={() => handleDayClick(dayStages)}
                >
                  {day && (
                    <div className="font-medium text-sm text-gray-800 mb-1">
                      {day}
                    </div>
                  )}
                  {dayStages.length > 0 && (
                    <div className="absolute top-7 left-0 right-0 flex flex-col space-y-1">
                      {dayStages.map((st, i) => (
                        <div 
                          key={i} 
                          className={`text-xs rounded px-1 ${st.color} text-gray-800 hover:bg-opacity-80`}
                          title={st.title}
                        >
                          {st.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Formulaire d'inscription */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <h2 className="text-xl font-bold mb-4">Inscription à un stage</h2>
            <p className="mb-4">
              Vous avez sélectionné les stages suivants :
            </p>
            <ul className="list-disc ml-5 mb-4">
              {selectedDayStages.map((st, index) => (
                <li key={index}>{st.title}</li>
              ))}
            </ul>
            <form>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Nom * :</label>
                <input type="text" required className="w-full border px-2 py-1 rounded" />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Prénom * :</label>
                <input type="text" required className="w-full border px-2 py-1 rounded" />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Adresse * :</label>
                <input type="text" required className="w-full border px-2 py-1 rounded" />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Code Postal * :</label>
                <input type="text" required className="w-full border px-2 py-1 rounded" />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Ville * :</label>
                <input type="text" required className="w-full border px-2 py-1 rounded" />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Date de naissance * :</label>
                <input type="date" required className="w-full border px-2 py-1 rounded" />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Adresse email * :</label>
                <input type="email" required className="w-full border px-2 py-1 rounded" />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Confirmation email * :</label>
                <input type="email" required className="w-full border px-2 py-1 rounded" />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Téléphone * :</label>
                <input type="tel" required className="w-full border px-2 py-1 rounded" />
              </div>
              <p className="text-xs text-gray-500 mb-4">* Champs obligatoires</p>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300" 
                  onClick={() => setShowForm(false)}
                >
                  Fermer
                </button>
                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
