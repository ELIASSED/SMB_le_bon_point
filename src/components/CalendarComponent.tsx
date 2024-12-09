"use client"; // Indique que ce composant est client-side

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Link from 'next/link';
import '../../styles/calendar.css'; // Importer les styles personnalisés

export default function CalendarComponent() {
  const [value, setValue] = useState(new Date());
  const [stages, setStages] = useState([]);

  useEffect(() => {
    // Remplacez ceci par un appel à votre API pour récupérer les données réelles
    const mockStages = [
      { id: 1, date: '2024-12-15', availableSlots: 5 },
      { id: 2, date: '2024-12-20', availableSlots: 0 }, // Complet
      { id: 3, date: '2024-12-25', availableSlots: 10 },
      // Ajoutez d'autres stages ici
    ];

    setStages(mockStages);
  }, []);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      const stage = stages.find(stage => stage.date === dateString);
      if (stage) {
        return (
          <div className="mt-1 text-sm">
            {stage.availableSlots > 0 ? (
              <span className="text-green-500">Disponible</span>
            ) : (
              <span className="text-red-500">Complet</span>
            )}
          </div>
        );
      }
    }
    return null;
  };

  const onClickDay = (value, event) => {
    const dateString = value.toISOString().split('T')[0];
    const stage = stages.find(stage => stage.date === dateString);
    if (stage && stage.availableSlots > 0) {
      // Rediriger vers la page de réservation avec la date sélectionnée
      window.location.href = `/stages/reservation?date=${dateString}`;
    } else if (stage && stage.availableSlots === 0) {
      alert("Cette date est complète. Veuillez choisir une autre date.");
    }
  };

  return (
    <div className="flex justify-center">
      <Calendar
        onChange={setValue}
        value={value}
        tileContent={tileContent}
        onClickDay={onClickDay}
        className="react-calendar"
      />
    </div>
  );
}
