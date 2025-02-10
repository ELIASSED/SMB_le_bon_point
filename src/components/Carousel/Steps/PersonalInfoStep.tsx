// components/Carousel/Steps/PersonalInfoStep.tsx
"use client";

import React, { useState } from "react";
import { Stage, AddressSuggestion, RegistrationInfo } from "../../types";
import SelectedStageInfo from "../SelectedStageInfo";
import { fetchAddressSuggestions } from "../utils";


interface PersonalInfoStepProps {
  selectedStage: Stage;
  onSubmit: (info: RegistrationInfo) => void;
}

export default function PersonalInfoStep({ selectedStage, onSubmit }: PersonalInfoStepProps) {
  const [formData, setFormData] = useState<RegistrationInfo>({
    // Informations personnelles
    civilite: "",
    nom: "",
    prenom: "",
    prenom1: "",
    prenom2: "",
    adresse: "",
    codePostal: "",
    ville: "",
    dateNaissance: "",
    codePostalNaissance: "",
    nationalite: "",
    telephone: "",
    email: "",
    confirmationEmail: "",
    // Informations sur le permis
    numeroPermis: "",
    dateDelivrancePermis: "",
    prefecture: "",
    etatPermis: "",
    casStage: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // États pour la suggestion d'adresse
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const inputClassName = "mt-1 block w-full border border-gray-300 rounded-md p-2";

  // Gestion classique des changements pour la plupart des champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gestion spécifique du champ "adresse" avec appel aux suggestions
  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, adresse: value }));
    if (value.length > 2) {
      setIsLoadingAddress(true);
      setShowSuggestions(true);
      try {
        const suggestions = await fetchAddressSuggestions(value);
        setAddressSuggestions(suggestions);
      } catch (error) {
        console.error("Erreur lors de la récupération des suggestions d'adresse :", error);
      }
      setIsLoadingAddress(false);
    } else {
      setShowSuggestions(false);
      setAddressSuggestions([]);
    }
  };

  // Lorsqu'une suggestion est sélectionnée, on met à jour le champ et on masque la liste
  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setFormData(prev => ({
      ...prev,
      adresse: suggestion.properties.label,
      codePostal: suggestion.properties.postcode || prev.codePostal,
      ville: suggestion.properties.city || prev.ville,
    }));
    setShowSuggestions(false);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // Champs obligatoires pour les infos personnelles
    const requiredPersonal = [
      "civilite", "nom", "prenom", "adresse", "codePostal", "ville",
      "dateNaissance", "codePostalNaissance", "nationalite", "telephone", "email", "confirmationEmail"
    ];
    requiredPersonal.forEach(field => {
      if (!formData[field as keyof RegistrationInfo]) {
        newErrors[field] = "Ce champ est requis.";
      }
    });
    if (formData.email !== formData.confirmationEmail) {
      newErrors.confirmationEmail = "Les emails ne correspondent pas.";
    }
    // Champs obligatoires pour le permis
    const requiredLicense = [
      "numeroPermis", "dateDelivrancePermis", "prefecture", "etatPermis", "casStage"
    ];
    requiredLicense.forEach(field => {
      if (!formData[field as keyof RegistrationInfo]) {
        newErrors[field] = "Ce champ est requis.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="px-4 py-6 bg-gray-50 min-h-screen">
      {/* Affichage du stage sélectionné */}
      <div className="mb-6 p-4 border rounded bg-white shadow">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Stage Sélectionné</h2>
        <SelectedStageInfo selectedStage={selectedStage} />
      </div>

      {/* Formulaire d'inscription fusionné */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow relative">
        <h3 className="col-span-2 text-xl font-bold text-gray-800 mb-4">Informations Personnelles</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700">Civilité</label>
          <select name="civilite" value={formData.civilite} onChange={handleChange} className={inputClassName}>
            <option value="">-- Sélectionnez --</option>
            <option value="Monsieur">Monsieur</option>
            <option value="Madame">Madame</option>
          </select>
          {errors.civilite && <p className="text-red-500 text-xs mt-1">{errors.civilite}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input type="text" name="nom" value={formData.nom} onChange={handleChange} className={inputClassName} placeholder="Votre nom" />
          {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom</label>
          <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className={inputClassName} placeholder="Votre prénom" />
          {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom 1 (Optionnel)</label>
          <input type="text" name="prenom1" value={formData.prenom1} onChange={handleChange} className={inputClassName} placeholder="Optionnel" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom 2 (Optionnel)</label>
          <input type="text" name="prenom2" value={formData.prenom2} onChange={handleChange} className={inputClassName} placeholder="Optionnel" />
        </div>

        {/* Champ Adresse avec suggestions */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700">Adresse</label>
          <input
            type="text"
            name="adresse"
            value={formData.adresse}
            onChange={handleAddressChange}
            className={inputClassName}
            placeholder="Votre adresse"
            autoComplete="off"
          />
          {isLoadingAddress && <div className="absolute right-2 top-9 text-gray-400 text-sm">Chargement...</div>}
          {showSuggestions && addressSuggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border mt-1 w-full max-h-60 overflow-auto">
              {addressSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                >
                  {suggestion.properties.label}
                </li>
              ))}
            </ul>
          )}
          {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Code Postal</label>
          <input type="text" name="codePostal" value={formData.codePostal} onChange={handleChange} className={inputClassName} placeholder="Ex: 75001" />
          {errors.codePostal && <p className="text-red-500 text-xs mt-1">{errors.codePostal}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ville</label>
          <input type="text" name="ville" value={formData.ville} onChange={handleChange} className={inputClassName} placeholder="Votre ville" />
          {errors.ville && <p className="text-red-500 text-xs mt-1">{errors.ville}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
          <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} className={inputClassName} />
          {errors.dateNaissance && <p className="text-red-500 text-xs mt-1">{errors.dateNaissance}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Lieu de naissance (Code Postal)</label>
          <input type="text" name="codePostalNaissance" value={formData.codePostalNaissance} onChange={handleChange} className={inputClassName} placeholder="Ex: 75001" />
          {errors.codePostalNaissance && <p className="text-red-500 text-xs mt-1">{errors.codePostalNaissance}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nationalité</label>
          <input type="text" name="nationalite" value={formData.nationalite} onChange={handleChange} className={inputClassName} placeholder="Votre nationalité" />
          {errors.nationalite && <p className="text-red-500 text-xs mt-1">{errors.nationalite}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className={inputClassName} placeholder="Ex: 0123456789" />
          {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClassName} placeholder="Votre email" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Confirmation Email</label>
          <input type="email" name="confirmationEmail" value={formData.confirmationEmail} onChange={handleChange} className={inputClassName} placeholder="Confirmez votre email" />
          {errors.confirmationEmail && <p className="text-red-500 text-xs mt-1">{errors.confirmationEmail}</p>}
        </div>

        {/* Section pour les informations sur le permis */}
        <h3 className="col-span-2 text-xl font-bold text-gray-800 mt-6 mb-4">Informations sur le Permis de Conduire</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700">Numéro de permis</label>
          <input type="text" name="numeroPermis" value={formData.numeroPermis} onChange={handleChange} className={inputClassName} placeholder="Ex: 12AB34567" />
          {errors.numeroPermis && <p className="text-red-500 text-xs mt-1">{errors.numeroPermis}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date de délivrance</label>
          <input type="date" name="dateDelivrancePermis" value={formData.dateDelivrancePermis} onChange={handleChange} className={inputClassName} />
          {errors.dateDelivrancePermis && <p className="text-red-500 text-xs mt-1">{errors.dateDelivrancePermis}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Préfecture de délivrance</label>
          <input type="text" name="prefecture" value={formData.prefecture} onChange={handleChange} className={inputClassName} placeholder="Ex: Paris" />
          {errors.prefecture && <p className="text-red-500 text-xs mt-1">{errors.prefecture}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">État du permis</label>
          <select name="etatPermis" value={formData.etatPermis} onChange={handleChange} className={inputClassName}>
            <option value="">Sélectionnez l'état</option>
            <option value="Valide">Valide</option>
            <option value="Invalide">Invalide</option>
          </select>
          {errors.etatPermis && <p className="text-red-500 text-xs mt-1">{errors.etatPermis}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cas de stage</label>
          <select name="casStage" value={formData.casStage} onChange={handleChange} className={inputClassName}>
            <option value="">Sélectionnez un cas</option>
            <option value="Cas 1">Cas 1 (Volontaire)</option>
            <option value="Cas 2">Cas 2 (Obligatoire)</option>
          </select>
          {errors.casStage && <p className="text-red-500 text-xs mt-1">{errors.casStage}</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Scan du permis (Optionnel)</label>
          <input
            type="file"
            name="scanPermis"
            accept="image/*,application/pdf"
            onChange={(e) => console.log("Fichier sélectionné :", e.target.files?.[0])}
            className={inputClassName}
          />
        </div>

        <div className="col-span-2">
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md">
            Enregistrer et Continuer
          </button>
        </div>
      </form>
    </div>
  );
}
