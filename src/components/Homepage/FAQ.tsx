/* src/components/FAQ.tsx */

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Combien de points récupère-t-on pendant un stage ?',
    answer: `À la suite d’un stage de récupération de points, il est possible de récupérer 4 points dans la limite des 12 points ou dans la limite du nombre de points affectés (permis probatoire).`,
  },
  {
    question: 'Quand est-il nécessaire de faire un stage de récupérations de points ?',
    answer: `Il est conseillé pour un permis 12 points de participer à un stage lorsque que le solde de points sur le permis de conduire est inférieur ou égal à 6. En ce qui concerne les permis probatoires, il est conseillé d’effectuer un stage lorsque le capital est inférieur ou égal à 3.`,
  },
  {
    question: 'Quand récupère-t-on les points à la suite d’un stage ?',
    answer: `Les points sont effectifs dès le lendemain du stage en date de valeur. À la fin de celui-ci, l’organisateur envoie les attestations de stage à la Préfecture. Par la suite, la Préfecture enregistre les points sur votre dossier dans un délai de quelques semaines.`,
  },
  {
    question: 'Pourquoi certains stages peuvent-ils être annulés ?',
    answer: `La préfecture impose un minimum de 6 participants pour valider un stage de récupération de points. Si ce nombre n’est pas atteint, l’organisateur est dans l’obligation de reporter le stage.`,
  },
  {
    question: 'Quels sont les documents à apporter le jour du stage ?',
    answer: `Le candidat doit se présenter le jour du stage avec une pièce d’identité (carte d’identité ou passeport) et de son permis de conduire.`,
  },
  {
    question: 'Comment se déroule le stage ?',
    answer: `Le stage est animé par deux professionnels :
- Un B.A.F.M : un spécialiste de la sécurité routière
- Un psychologue : qui vous aide à analyser votre comportement sur la route
Le stage est réparti sur 2 jours, 7 heures par jour. Voir le programme du stage.`,
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Questions fréquentes
      </h2>
      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div key={index} className="border rounded-lg shadow-sm">
            <button
              className="w-full flex justify-between items-center p-4 text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => toggleAccordion(index)}
              aria-expanded={activeIndex === index}
            >
              <span className="font-medium text-gray-800">{item.question}</span>
              <svg
                className={`w-5 h-5 transform transition-transform duration-200 ${
                  activeIndex === index ? 'rotate-180' : 'rotate-0'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeIndex === index && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-gray-700 whitespace-pre-line">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
