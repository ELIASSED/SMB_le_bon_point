'use client';

import React, { useState } from 'react';

type Stage = {
  id: number;
  name: string;
};

const stages: Stage[] = [
  { id: 1, name: 'Stage 1 - 22-23 Décembre 2024' },
  { id: 2, name: 'Stage 2 - 29-30 Décembre 2024' },
  { id: 3, name: 'Stage 3 - 5-6 Janvier 2025' },
  { id: 4, name: 'Stage 4 - 15-16 Janvier 2025' },
  { id: 5, name: 'Stage 5 - 25-26 Janvier 2025' },
];

const nationalities = [
  'Française',
  'Belge',
  'Allemande',
  'Espagnole',
  'Italienne',
  'Autre',
];

export default function InscriptionPage() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    telephone: '',
    email: '',
    stage: '',
    nationalite: '',
    dateNaissance: '',
  });

  const [errors, setErrors] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    telephone: '',
    email: '',
    stage: '',
    nationalite: '',
    dateNaissance: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = {
      nom: '',
      prenom: '',
      adresse: '',
      codePostal: '',
      ville: '',
      telephone: '',
      email: '',
      stage: '',
      nationalite: '',
      dateNaissance: '',
    };

    if (!formData.nom) {
      newErrors.nom = 'Le nom est requis.';
      valid = false;
    }
    if (!formData.prenom) {
      newErrors.prenom = 'Le prénom est requis.';
      valid = false;
    }
    if (!formData.adresse) {
      newErrors.adresse = 'L\'adresse est requise.';
      valid = false;
    }
    if (!formData.codePostal) {
      newErrors.codePostal = 'Le code postal est requis.';
      valid = false;
    }
    if (!formData.ville) {
      newErrors.ville = 'La ville est requise.';
      valid = false;
    }
    if (!formData.telephone) {
      newErrors.telephone = 'Le téléphone est requis.';
      valid = false;
    }
    if (!formData.email) {
      newErrors.email = 'L\'email est requis.';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide.';
      valid = false;
    }
    if (!formData.stage) {
      newErrors.stage = 'Veuillez sélectionner un stage.';
      valid = false;
    }
    if (!formData.nationalite) {
      newErrors.nationalite = 'La nationalité est requise.';
      valid = false;
    }
    if (!formData.dateNaissance) {
      newErrors.dateNaissance = 'La date de naissance est requise.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Logique de soumission du formulaire
      console.log(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Inscription au Stage</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
          </div>
          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
              Prénom
            </label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
          </div>
          <div>
            <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <input
              type="text"
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
          </div>
          <div>
            <label htmlFor="codePostal" className="block text-sm font-medium text-gray-700">
              Code Postal
            </label>
            <input
              type="text"
              id="codePostal"
              name="codePostal"
              value={formData.codePostal}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.codePostal && <p className="text-red-500 text-xs mt-1">{errors.codePostal}</p>}
          </div>
          <div>
            <label htmlFor="ville" className="block text-sm font-medium text-gray-700">
              Ville
            </label>
            <input
              type="text"
              id="ville"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.ville && <p className="text-red-500 text-xs mt-1">{errors.ville}</p>}
          </div>
          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
              Téléphone
            </label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700">
              Sélectionnez un stage
            </label>
            <select
              id="stage"
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Sélectionnez un stage --</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.name}>
                  {stage.name}
                </option>
              ))}
            </select>
            {errors.stage && <p className="text-red-500 text-xs mt-1">{errors.stage}</p>}
          </div>
          <div>
            <label htmlFor="nationalite" className="block text-sm font-medium text-gray-700">
              Nationalité
            </label>
            <select
              id="nationalite"
              name="nationalite"
              value={formData.nationalite}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Sélectionnez votre nationalité --</option>
              {nationalities.map((nat, index) => (
                <option key={index} value={nat}>
                  {nat}
                </option>
              ))}
            </select>
            {errors.nationalite && <p className="text-red-500 text-xs mt-1">{errors.nationalite}</p>}
          </div>
          <div>
            <label htmlFor="dateNaissance" className="block text-sm font-medium text-gray-700">
              Date de naissance
            </label>
            <input
              type="date"
              id="dateNaissance"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.dateNaissance && <p className="text-red-500 text-xs mt-1">{errors.dateNaissance}</p>}
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              S'inscrire
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
