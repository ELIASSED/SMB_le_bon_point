"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { debounce } from "lodash";
import { fetchAddressSuggestions, AddressSuggestion } from "../../../../app/services/apiAdress";
import { AlertCircle } from "lucide-react";
import nationalitiesData from "../nationalite.json";
import casStageData from "../cas_stage.json";

// Définition des interfaces pour le formulaire
export interface PersonalInfo {
  civilite: string;
  nom: string;
  prenom: string;
  prenom1?: string;
  prenom2?: string;
  adresse: string;
  codePostal: string;
  ville: string;
  dateNaissance: string;
  codePostalNaissance: string;
  nationalite: string;
  telephone: string;
  email: string;
  confirmationEmail: string;
  scanIdentite?: File | null;
}

export interface DrivingLicenseInfo {
  numeroPermis: string;
  dateDelivrancePermis: string;
  prefecture: string;
  etatPermis: string;
  casStage: string;
  scanPermis?: File | null;
}

export interface MergedFormData extends PersonalInfo, DrivingLicenseInfo {}

const MergedForm: React.FC<{ onSubmit: (data: MergedFormData) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<MergedFormData>({
    // Champs infos perso
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
    scanIdentite: null,

    // Champs infos permis
    numeroPermis: "",
    dateDelivrancePermis: "",
    prefecture: "",
    etatPermis: "",
    casStage: "",
    scanPermis: null,
  });

  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [nationalities, setNationalities] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    if (nationalitiesData?.nationalities && Array.isArray(nationalitiesData.nationalities)) {
      setNationalities(nationalitiesData.nationalities);
    }
  }, []);

  const debouncedFetchAddressSuggestions = debounce(async (query: string) => {
    setIsLoadingAddress(true);
    const results = await fetchAddressSuggestions(query);
    setAddressSuggestions(results);
    setShowSuggestions(true);
    setIsLoadingAddress(false);
  }, 300);

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, adresse: value }));

    if (value.length >= 3) {
      debouncedFetchAddressSuggestions(value);
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      adresse: suggestion.properties.name,
      codePostal: suggestion.properties.postcode,
      ville: suggestion.properties.city,
    }));
    setShowSuggestions(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    const { name } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    const requiredFields = [
      "civilite",
      "nom",
      "prenom",
      "adresse",
      "codePostal",
      "ville",
      "dateNaissance",
      "codePostalNaissance",
      "nationalite",
      "telephone",
      "email",
      "confirmationEmail",
      "numeroPermis",
      "dateDelivrancePermis",
      "prefecture",
      "etatPermis",
      "casStage",
    ];

    requiredFields.forEach((field) => {
      // @ts-expect-error index signature
      if (!formData[field]) {
        newErrors[field] = "Ce champ est requis";
      }
    });

    if (formData.email && formData.confirmationEmail) {
      if (formData.email !== formData.confirmationEmail) {
        newErrors.confirmationEmail = "Les emails ne correspondent pas.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const inputClassName = "mt-1 block w-full border rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500";

  const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <div className="flex items-center text-red-500 text-xs mt-1">
        <AlertCircle className="w-4 h-4 mr-1" />
        {message}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ==================== COLONNE GAUCHE (Infos Perso) ==================== */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Informations Personnelles
            </h2>

            {/* Civilité + Nationalité */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Civilité
                </label>
                <select
                  name="civilite"
                  value={formData.civilite}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  <option value="">--</option>
                  <option value="Monsieur">M.</option>
                  <option value="Madame">Mme</option>
                </select>
                <ErrorMessage message={errors.civilite} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nationalité
                </label>
                <select
                  name="nationalite"
                  value={formData.nationalite}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  <option value="">--</option>
                  {nationalities.map((nat) => (
                    <option key={nat.code} value={nat.name}>
                      {nat.name}
                    </option>
                  ))}
                </select>
                <ErrorMessage message={errors.nationalite} />
              </div>
            </div>

            {/* Nom + Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={inputClassName}
                />
                <ErrorMessage message={errors.nom} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className={inputClassName}
                />
                <ErrorMessage message={errors.prenom} />
              </div>
            </div>

            {/* Téléphone + Date de naissance */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className={inputClassName}
                />
                <ErrorMessage message={errors.telephone} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date de naissance
                </label>
                <input
                  type="date"
                  name="dateNaissance"
                  value={formData.dateNaissance}
                  onChange={handleChange}
                  className={inputClassName}
                />
                <ErrorMessage message={errors.dateNaissance} />
              </div>
            </div>

            {/* Lieu de naissance (Code postal) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Lieu de naissance (Code postal)
              </label>
              <input
                type="text"
                name="codePostalNaissance"
                value={formData.codePostalNaissance}
                onChange={handleChange}
                className={inputClassName}
              />
              <ErrorMessage message={errors.codePostalNaissance} />
            </div>

            {/* Email + Confirmation */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClassName}
              />
              <ErrorMessage message={errors.email} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirmation Email
              </label>
              <input
                type="email"
                name="confirmationEmail"
                value={formData.confirmationEmail}
                onChange={handleChange}
                className={inputClassName}
              />
              <ErrorMessage message={errors.confirmationEmail} />
            </div>

            {/* Adresse complète + Autocomplétion */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Adresse complète
              </label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleAddressChange}
                className={inputClassName}
                placeholder="Commencez à taper..."
              />
              {showSuggestions && addressSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 shadow-md rounded-md mt-1 max-h-40 overflow-auto">
                  {addressSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.properties.label}
                    </li>
                  ))}
                </ul>
              )}
              {isLoadingAddress && (
                <p className="text-xs text-gray-500">Chargement...</p>
              )}
              <ErrorMessage message={errors.adresse} />
            </div>

            {/* Code Postal + Ville */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Code Postal
                </label>
                <input
                  type="text"
                  name="codePostal"
                  value={formData.codePostal}
                  onChange={handleChange}
                  className={inputClassName}
                />
                <ErrorMessage message={errors.codePostal} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ville
                </label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  className={inputClassName}
                />
                <ErrorMessage message={errors.ville} />
              </div>
            </div>

            {/* Scan CI */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Scan de la pièce d'identité
              </label>
              <input
                type="file"
                name="scanIdentite"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* ==================== COLONNE DROITE (Permis) ==================== */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Permis de conduire
            </h2>

            {/* Numéro de permis */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Numéro de permis
              </label>
              <input
                type="text"
                name="numeroPermis"
                value={formData.numeroPermis}
                onChange={handleChange}
                className={inputClassName}
              />
              <ErrorMessage message={errors.numeroPermis} />
            </div>

            {/* Date délivrance + État */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date de délivrance
                </label>
                <input
                  type="date"
                  name="dateDelivrancePermis"
                  value={formData.dateDelivrancePermis}
                  onChange={handleChange}
                  className={inputClassName}
                />
                <ErrorMessage message={errors.dateDelivrancePermis} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  État du permis
                </label>
                <select
                  name="etatPermis"
                  value={formData.etatPermis}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  <option value="">--</option>
                  <option value="Valide">Valide</option>
                  <option value="Invalide">Invalide</option>
                </select>
                <ErrorMessage message={errors.etatPermis} />
              </div>
            </div>

            {/* Préfecture */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Préfecture
              </label>
              <input
                type="text"
                name="prefecture"
                value={formData.prefecture}
                onChange={handleChange}
                className={inputClassName}
              />
              <ErrorMessage message={errors.prefecture} />
            </div>

            {/* Cas de stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cas de stage
              </label>
              <select
                name="casStage"
                value={formData.casStage}
                onChange={handleChange}
                className={inputClassName}
              >
                <option value="">--</option>
                {casStageData?.map((cas) => (
                  <option key={cas.type} value={cas.type}>
                    {cas.type} - {cas.description}
                  </option>
                ))}
              </select>
              <ErrorMessage message={errors.casStage} />
            </div>

            {/* Scan permis */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Scan du permis
              </label>
              <input
                type="file"
                name="scanPermis"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
          </div>
        </div>
      <div className="mt-8">
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md">
          Suivant
        </button>
      </div>
    </form>
  );
};

export default MergedForm;
