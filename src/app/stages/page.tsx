"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import BookingButton from '@/components/BookingButton';

const civilities = ['Monsieur', 'Madame'];

interface Stage {
  id: number;
  startDate: string;
  endDate: string;
  location: string;
  remainingSlots: number;
}

interface FormData {
  civilite: string;
  nom: string;
  prenom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  dateNaissance: string;
  email: string;
  confirmationEmail: string;
  telephone: string;
  stageId: number | null;
  pieceIdentite?: File;
  permis?: File;
}

interface Errors {
  [key: string]: string;
}

export default function Carousel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  const [formData, setFormData] = useState<FormData>({
    civilite: '',
    nom: '',
    prenom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    dateNaissance: '',
    email: '',
    confirmationEmail: '',
    telephone: '',
    stageId: null,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await fetch('/api/stage');
        if (!res.ok) {
          throw new Error('Erreur lors de la récupération des stages');
        }
        const data = await res.json();
        setStages(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStages();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'stageId' ? parseInt(value, 10) : value,
    }));
  };

  const validate = () => {
    const newErrors: Errors = {};
    const requiredFields = [
      'civilite',
      'nom',
      'prenom',
      'adresse',
      'codePostal',
      'ville',
      'dateNaissance',
      'email',
      'confirmationEmail',
      'telephone',
      'stageId',
    ];

    requiredFields.forEach((field) => {
      if (!formData[field as keyof FormData]) {
        newErrors[field] = `Le champ ${field} est requis.`;
      }
    });

    // Validation des emails
    if (formData.email && formData.confirmationEmail) {
      if (formData.email !== formData.confirmationEmail) {
        newErrors.confirmationEmail = 'Les emails ne correspondent pas.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      console.log(errors);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = new FormData();

      // Ajout des données textuelles
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && !(value instanceof File)) {
          payload.append(key, value as string);
        }
      });

      // Ajout des fichiers (si présents)
      if (formData.pieceIdentite) {
        payload.append('pieceIdentite', formData.pieceIdentite);
      }
      if (formData.permis) {
        payload.append('permis', formData.permis);
      }

      const res = await fetch('/api/inscription', {
        method: 'POST',
        body: payload, // Envoi direct du FormData
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Une erreur est survenue.' });
      } else {
        setMessage({ type: 'success', text: 'Inscription créée avec succès !' });
        setFormData({
          civilite: '',
          nom: '',
          prenom: '',
          adresse: '',
          codePostal: '',
          ville: '',
          dateNaissance: '',
          email: '',
          confirmationEmail: '',
          telephone: '',
          stageId: null,
          pieceIdentite: undefined,
          permis: undefined,
        });
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi du formulaire:', err);
      setMessage({ type: 'error', text: 'Une erreur est survenue lors de l\'envoi du formulaire.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Avancer et reculer dans le carousel
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStageSelection = (stage: Stage) => {
    setSelectedStage(stage);
    // On met à jour le stageId du form
    setFormData((prevData) => ({
      ...prevData,
      stageId: stage.id,
    }));
    nextStep();
  };

  const steps = [
    {
      title: 'Choisir un stage',
      content: (
        <div className="flex flex-col items-center bg-gray-50 p-8 rounded-lg shadow-md">
          <div className="relative w-full h-64 mb-4">
            <Image
              src="/images/center.png"
              alt="Bannière Stage Permis"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
          <h3 className="text-xl font-bold mb-4">Stages disponibles</h3>
          {loading ? (
            <p>Chargement des stages...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  <p className="text-lg font-bold text-yellow-600">
                    Stage du {new Date(stage.startDate).toLocaleDateString('fr-FR')} au {new Date(stage.endDate).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm text-gray-700">Lieu: {stage.location}</p>
                  <p className="text-sm text-gray-600">Places restantes: {stage.remainingSlots}</p>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mt-2"
                    onClick={() => handleStageSelection(stage)}
                  >
                    Réserver
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '',
      content: (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
            {selectedStage && (
              <div className="mb-6 p-4 border rounded bg-gray-50">
                <h3 className="text-lg font-semibold mb-2">Stage Sélectionné</h3>
                <p>
                  <span className="font-bold">Dates: </span>
                  {new Date(selectedStage.startDate).toLocaleDateString('fr-FR')} - {new Date(selectedStage.endDate).toLocaleDateString('fr-FR')}
                </p>
                <p>
                  <span className="font-bold">Lieu: </span>
                  {selectedStage.location}
                </p>
              </div>
            )}
            {message && (
              <div
                className={`mb-4 p-4 rounded text-white ${
                  message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {message.text}
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Civilité */}
              <div className="col-span-1">
                <label htmlFor="civilite" className="block text-sm font-medium text-gray-700">Civilité</label>
                <select
                  id="civilite"
                  name="civilite"
                  value={formData.civilite}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                >
                  <option value="">-- Sélectionnez une civilité --</option>
                  {civilities.map((civ, index) => (
                    <option key={index} value={civ}>{civ}</option>
                  ))}
                </select>
                {errors.civilite && <p className="text-red-500 text-xs mt-1">{errors.civilite}</p>}
              </div>

              {/* Nom */}
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
              </div>

              {/* Prénom */}
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">Prénom</label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                />
                {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
              </div>

              {/* Adresse */}
              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">Adresse</label>
                <input
                  type="text"
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                />
                {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
              </div>

              {/* Code Postal */}
              <div>
                <label htmlFor="codePostal" className="block text-sm font-medium text-gray-700">Code Postal</label>
                <input
                  type="text"
                  id="codePostal"
                  name="codePostal"
                  value={formData.codePostal}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                />
                {errors.codePostal && <p className="text-red-500 text-xs mt-1">{errors.codePostal}</p>}
              </div>

              {/* Ville */}
              <div>
                <label htmlFor="ville" className="block text-sm font-medium text-gray-700">Ville</label>
                <input
                  type="text"
                  id="ville"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                />
                {errors.ville && <p className="text-red-500 text-xs mt-1">{errors.ville}</p>}
              </div>

              {/* Date de Naissance */}
              <div>
                <label htmlFor="dateNaissance" className="block text-sm font-medium text-gray-700">Date de naissance</label>
                <input
                  type="date"
                  id="dateNaissance"
                  name="dateNaissance"
                  value={formData.dateNaissance}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                />
                {errors.dateNaissance && <p className="text-red-500 text-xs mt-1">{errors.dateNaissance}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Confirmation Email */}
              <div>
                <label htmlFor="confirmationEmail" className="block text-sm font-medium text-gray-700">Confirmation email</label>
                <input
                  type="email"
                  id="confirmationEmail"
                  name="confirmationEmail"
                  value={formData.confirmationEmail}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                />
                {errors.confirmationEmail && <p className="text-red-500 text-xs mt-1">{errors.confirmationEmail}</p>}
              </div>

              {/* Téléphone */}
              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                />
                {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
              </div>

              {/* Pièce d'identité */}
              <div>
                <label htmlFor="pieceIdentite" className="block text-sm font-medium text-gray-700">
                  Pièce d'identité
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="pieceIdentite"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                      >
                        <span>Télécharger un fichier</span>
                        <input
                          id="pieceIdentite"
                          name="pieceIdentite"
                          type="file"
                          className="sr-only"
                          accept=".png,.jpg,.jpeg,.pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF jusqu'à 10Mo</p>
                    {formData.pieceIdentite && (
                      <p className="text-sm text-gray-500">
                        {formData.pieceIdentite.name}
                      </p>
                    )}
                    {errors.pieceIdentite && (
                      <p className="text-red-500 text-xs mt-1">{errors.pieceIdentite}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Permis */}
              <div>
                <label htmlFor="permis" className="block text-sm font-medium text-gray-700">
                  Permis
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="permis"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                      >
                        <span>Télécharger un fichier</span>
                        <input
                          id="permis"
                          name="permis"
                          type="file"
                          className="sr-only"
                          accept=".png,.jpg,.jpeg,.pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF jusqu'à 10Mo</p>
                    {formData.permis && (
                      <p className="text-sm text-gray-500">
                        {formData.permis.name}
                      </p>
                    )}
                    {errors.permis && (
                      <p className="text-red-500 text-xs mt-1">{errors.permis}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bouton */}
              <div className="col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    isSubmitting ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'
                  }`}
                >
                  {isSubmitting ? 'En cours...' : 'S\'inscrire'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ),
    
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 text-center">{steps[currentStep].title}</h2>
        <div>{steps[currentStep].content}</div>
        {currentStep === 1 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded disabled:bg-gray-300"
            >
              Précédent
            </button>
           
          </div>
        )}
      </div>
    </div>
  );
}
