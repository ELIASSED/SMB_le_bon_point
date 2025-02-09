"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { fetchAddressSuggestions } from "../utils";
import { AddressSuggestion, UserFormData } from "../types";
import nationalitiesData from "../nationalite.json";
import casStageData from "../cas_stage.json";

interface MergedFormProps {
  onSubmit: (data: FormData) => void;
}

const MergedForm: React.FC<MergedFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<UserFormData>({
    civilite: "",
    nom: "",
    prenom: "",
    prenom1: "",
    prenom2: "",
    adresse: "",
    codePostal: "",
    ville: "",
    telephone: "",
    email: "",
    confirmationEmail: "",
    nationalite: "",
    dateNaissance: "",
    lieuNaissance: "",
    codePostalNaissance: "",
    numeroPermis: "",
    dateDelivrancePermis: "",
    prefecture: "",
    etatPermis: "",
    casStage: "",
    scanIdentiteRecto: null,
    scanIdentiteVerso: null,
    scanPermisRecto: null,
    scanPermisVerso: null,
    commentaire: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [nationalities, setNationalities] = useState<{ code: string; name: string }[]>([]);

  const inputClassName =
    "mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out";

  // Gestion des changements sur les champs classiques
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Gestion des changements sur les inputs de type fichier
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [name]: file }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Recherche d'adresses avec suggestions
  const handleAddressChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setFormData((prev) => ({ ...prev, adresse: query }));
    if (query.length >= 3) {
      setIsLoadingAddress(true);
      try {
        const suggestions = await fetchAddressSuggestions(query);
        setAddressSuggestions(suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Erreur lors de la récupération des suggestions d'adresse :", error);
      } finally {
        setIsLoadingAddress(false);
      }
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

  // Chargement des nationalités depuis un fichier JSON
  useEffect(() => {
    if (nationalitiesData?.nationalities) {
      setNationalities(nationalitiesData.nationalities);
    }
  }, []);

  // Validation des champs obligatoires et formats
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const requiredFields = [
      "civilite",
      "nom",
      "prenom",
      "adresse",
      "codePostal",
      "ville",
      "telephone",
      "email",
      "confirmationEmail",
      "nationalite",
      "dateNaissance",
      "lieuNaissance",
      "codePostalNaissance",
      "numeroPermis",
      "dateDelivrancePermis",
      "prefecture",
      "etatPermis",
      "casStage",
    ];

    requiredFields.forEach((field) => {
      const value = formData[field as keyof UserFormData];
      if ((typeof value === "string" && !value.trim()) || value === null) {
        newErrors[field] = "Ce champ est requis";
      }
    });

    if (formData.email !== formData.confirmationEmail) {
      newErrors.confirmationEmail = "Les emails ne correspondent pas.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Format d'email invalide.";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (formData.telephone && !phoneRegex.test(formData.telephone)) {
      newErrors.telephone = "Format de téléphone invalide.";
    }

    // Validation pour les fichiers (formats autorisés)
    const allowedFileTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (formData.scanPermisRecto && !allowedFileTypes.includes(formData.scanPermisRecto.type)) {
      newErrors.scanPermisRecto = "Type de fichier invalide. Autorisé: JPEG, PNG, PDF.";
    }
    if (formData.scanPermisVerso && !allowedFileTypes.includes(formData.scanPermisVerso.type)) {
      newErrors.scanPermisVerso = "Type de fichier invalide. Autorisé: JPEG, PNG, PDF.";
    }
    if (formData.scanIdentiteRecto && !allowedFileTypes.includes(formData.scanIdentiteRecto.type)) {
      newErrors.scanIdentiteRecto = "Type de fichier invalide. Autorisé: JPEG, PNG, PDF.";
    }
    if (formData.scanIdentiteVerso && !allowedFileTypes.includes(formData.scanIdentiteVerso.type)) {
      newErrors.scanIdentiteVerso = "Type de fichier invalide. Autorisé: JPEG, PNG, PDF.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Création de FormData à partir du formulaire (tous les inputs doivent avoir un attribut "name")
      const formDataObj = new FormData(e.currentTarget);
      onSubmit(formDataObj);
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-3xl shadow-xl space-y-8"
      encType="multipart/form-data"
    >
      {/* SECTION : Informations Personnelles */}
      <div className="flex flex-col space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Civilité */}
          <div>
            <label className="block text-gray-700 font-medium">
              Civilité<span className="text-red-500">*</span>
            </label>
            <select
              name="civilite"
              value={formData.civilite}
              onChange={handleChange}
              className={`${inputClassName} ${errors.civilite ? "border-red-500" : ""}`}
            >
              <option value="">-- Sélectionnez --</option>
              <option value="Monsieur">Monsieur</option>
              <option value="Madame">Madame</option>
            </select>
            {errors.civilite && <p className="text-red-500 text-xs mt-1">{errors.civilite}</p>}
          </div>

          {/* Nom */}
          <div>
            <label className="block text-gray-700 font-medium">
              Nom<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`${inputClassName} ${errors.nom ? "border-red-500" : ""}`}
              placeholder="Entrez votre nom"
            />
            {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
          </div>

          {/* Prénom */}
          <div>
            <label className="block text-gray-700 font-medium">
              Prénom<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className={`${inputClassName} ${errors.prenom ? "border-red-500" : ""}`}
              placeholder="Entrez votre prénom"
            />
            {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
          </div>

          {/* 2e Prénom (Optionnel) */}
          <div>
            <label className="block text-gray-700 font-medium">2e Prénom (Optionnel)</label>
            <input
              type="text"
              name="prenom1"
              value={formData.prenom1}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Entrez votre deuxième prénom"
            />
          </div>

          {/* 3e Prénom (Optionnel) */}
          <div>
            <label className="block text-gray-700 font-medium">3e Prénom (Optionnel)</label>
            <input
              type="text"
              name="prenom2"
              value={formData.prenom2}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Entrez votre troisième prénom"
            />
          </div>

          {/* Adresse avec suggestions */}
          <div className="relative">
            <label htmlFor="adresse" className="block text-gray-700 font-medium">
              Adresse<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleAddressChange}
              className={`mt-1 block w-full border rounded-md p-2 ${errors.adresse ? "border-red-500" : ""}`}
              placeholder="Commencez à taper une adresse..."
              autoComplete="off"
            />
            {isLoadingAddress && (
              <div className="absolute right-2 top-[38px] text-gray-400">Chargement...</div>
            )}
            {showSuggestions && addressSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                {addressSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-indigo-50 cursor-pointer transition-colors duration-150"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.properties.label}
                  </li>
                ))}
              </ul>
            )}
            {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
          </div>

          {/* Code Postal */}
          <div>
            <label className="block text-gray-700 font-medium">
              Code Postal<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="codePostal"
              value={formData.codePostal}
              onChange={handleChange}
              className={`${inputClassName} ${errors.codePostal ? "border-red-500" : ""}`}
              placeholder="Ex: 75001"
            />
            {errors.codePostal && <p className="text-red-500 text-xs mt-1">{errors.codePostal}</p>}
          </div>

          {/* Ville */}
          <div>
            <label className="block text-gray-700 font-medium">
              Ville<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              className={`${inputClassName} ${errors.ville ? "border-red-500" : ""}`}
              placeholder="Entrez votre ville"
            />
            {errors.ville && <p className="text-red-500 text-xs mt-1">{errors.ville}</p>}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-gray-700 font-medium">
              Téléphone<span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className={`${inputClassName} ${errors.telephone ? "border-red-500" : ""}`}
              pattern="[0-9]{10}"
              placeholder="Ex: 0123456789"
            />
            {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${inputClassName} ${errors.email ? "border-red-500" : ""}`}
              placeholder="Entrez votre email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Confirmation Email */}
          <div>
            <label className="block text-gray-700 font-medium">
              Confirmez votre Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="confirmationEmail"
              value={formData.confirmationEmail}
              onChange={handleChange}
              className={`${inputClassName} ${errors.confirmationEmail ? "border-red-500" : ""}`}
              placeholder="Confirmez votre email"
            />
            {errors.confirmationEmail && <p className="text-red-500 text-xs mt-1">{errors.confirmationEmail}</p>}
          </div>

          {/* Nationalité */}
          <div>
            <label htmlFor="nationalite" className="block text-gray-700 font-medium">
              Nationalité<span className="text-red-500">*</span>
            </label>
            <select
              id="nationalite"
              name="nationalite"
              value={formData.nationalite}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded-md p-2 ${errors.nationalite ? "border-red-500" : ""}`}
            >
              <option value="">-- Sélectionnez une nationalité --</option>
              {Array.isArray(nationalities) && nationalities.length > 0 ? (
                nationalities.map((nat) => (
                  <option key={nat.code} value={nat.name}>
                    {nat.name}
                  </option>
                ))
              ) : (
                <option disabled>Chargement des nationalités...</option>
              )}
            </select>
            {errors.nationalite && <p className="text-red-500 text-xs mt-1">{errors.nationalite}</p>}
          </div>

          {/* Date de Naissance */}
          <div>
            <label className="block text-gray-700 font-medium">
              Date de Naissance<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={handleChange}
              className={`${inputClassName} ${errors.dateNaissance ? "border-red-500" : ""}`}
            />
            {errors.dateNaissance && <p className="text-red-500 text-xs mt-1">{errors.dateNaissance}</p>}
          </div>

          {/* Lieu de Naissance */}
          <div>
            <label className="block text-gray-700 font-medium">
              Lieu de Naissance<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lieuNaissance"
              value={formData.lieuNaissance}
              onChange={handleChange}
              className={`${inputClassName} ${errors.lieuNaissance ? "border-red-500" : ""}`}
              placeholder="Entrez votre lieu de naissance"
            />
            {errors.lieuNaissance && <p className="text-red-500 text-xs mt-1">{errors.lieuNaissance}</p>}
          </div>

          {/* Code Postal de Naissance */}
          <div>
            <label className="block text-gray-700 font-medium">
              Code Postal de Naissance<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="codePostalNaissance"
              value={formData.codePostalNaissance}
              onChange={handleChange}
              className={`${inputClassName} ${errors.codePostalNaissance ? "border-red-500" : ""}`}
              placeholder="Ex: 75001"
            />
            {errors.codePostalNaissance && <p className="text-red-500 text-xs mt-1">{errors.codePostalNaissance}</p>}
          </div>
        </div>
      </div>

      {/* SECTION : Informations sur le Permis */}
      <div className="flex flex-col space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Numéro de Permis */}
          <div>
            <label className="block text-gray-700 font-medium">
              Numéro de Permis<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="numeroPermis"
              value={formData.numeroPermis}
              onChange={handleChange}
              className={`${inputClassName} ${errors.numeroPermis ? "border-red-500" : ""}`}
              placeholder="Entrez votre numéro de permis"
            />
            {errors.numeroPermis && <p className="text-red-500 text-xs mt-1">{errors.numeroPermis}</p>}
          </div>

          {/* Date de Délivrance du Permis */}
          <div>
            <label className="block text-gray-700 font-medium">
              Date de Délivrance du Permis<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateDelivrancePermis"
              value={formData.dateDelivrancePermis}
              onChange={handleChange}
              className={`${inputClassName} ${errors.dateDelivrancePermis ? "border-red-500" : ""}`}
            />
            {errors.dateDelivrancePermis && <p className="text-red-500 text-xs mt-1">{errors.dateDelivrancePermis}</p>}
          </div>

          {/* État du Permis */}
          <div>
            <label className="block text-gray-700 font-medium">
              État du Permis<span className="text-red-500">*</span>
            </label>
            <select
              name="etatPermis"
              value={formData.etatPermis}
              onChange={handleChange}
              className={`${inputClassName} ${errors.etatPermis ? "border-red-500" : ""}`}
            >
              <option value="">-- Sélectionnez --</option>
              <option value="Valide">Valide</option>
              <option value="Invalide">Invalide</option>
              <option value="Suspendu">Suspendu</option>
              <option value="Retiré">Retiré</option>
            </select>
            {errors.etatPermis && <p className="text-red-500 text-xs mt-1">{errors.etatPermis}</p>}
          </div>

          {/* Préfecture */}
          <div>
            <label className="block text-gray-700 font-medium">
              Préfecture<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="prefecture"
              value={formData.prefecture}
              onChange={handleChange}
              className={`${inputClassName} ${errors.prefecture ? "border-red-500" : ""}`}
              placeholder="Entrez votre préfecture"
            />
            {errors.prefecture && <p className="text-red-500 text-xs mt-1">{errors.prefecture}</p>}
          </div>

          {/* Cas de Stage */}
          <div>
            <label className="block text-gray-700 font-medium">
              Cas de Stage<span className="text-red-500">*</span>
            </label>
            <select
              id="casStage"
              name="casStage"
              value={formData.casStage}
              onChange={handleChange}
              className={`${inputClassName} ${errors.casStage ? "border-red-500" : ""}`}
            >
              <option value="">-- Sélectionnez un cas --</option>
              {Array.isArray(casStageData) && casStageData.length > 0 ? (
                casStageData.map((cas, index) => (
                  <option key={index} value={cas.description}>
                    {cas.type} - {cas.description}
                  </option>
                ))
              ) : (
                <option disabled>Chargement des cas de stage...</option>
              )}
            </select>
            {errors.casStage && <p className="text-red-500 text-xs mt-1">{errors.casStage}</p>}
          </div>
        </div>
      </div>

      {/* SECTION : Téléchargements */}
      <div className="flex flex-col space-y-6">
        <h3 className="text-lg font-semibold text-indigo-600">Téléchargements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scan du Permis de Conduire Recto */}
          <div>
            <label className="block text-gray-700 font-medium">
              Scan du Permis de Conduire recto
            </label>
            <input
              type="file"
              name="scanPermisRecto"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className={`${inputClassName} ${errors.scanPermisRecto ? "border-red-500" : ""}`}
            />
            {errors.scanPermisRecto && <p className="text-red-500 text-xs mt-1">{errors.scanPermisRecto}</p>}
          </div>

          {/* Scan du Permis de Conduire Verso */}
          <div>
            <label className="block text-gray-700 font-medium">
              Scan du Permis de Conduire verso
            </label>
            <input
              type="file"
              name="scanPermisVerso"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className={`${inputClassName} ${errors.scanPermisVerso ? "border-red-500" : ""}`}
            />
            {errors.scanPermisVerso && <p className="text-red-500 text-xs mt-1">{errors.scanPermisVerso}</p>}
          </div>

          {/* Scan de la Pièce d'Identité Recto */}
          <div>
            <label className="block text-gray-700 font-medium">
              Scan de la Pièce d'Identité recto
            </label>
            <input
              type="file"
              name="scanIdentiteRecto"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className={`${inputClassName} ${errors.scanIdentiteRecto ? "border-red-500" : ""}`}
            />
            {errors.scanIdentiteRecto && <p className="text-red-500 text-xs mt-1">{errors.scanIdentiteRecto}</p>}
          </div>

          {/* Scan de la Pièce d'Identité Verso */}
          <div>
            <label className="block text-gray-700 font-medium">
              Scan de la Pièce d'Identité verso
            </label>
            <input
              type="file"
              name="scanIdentiteVerso"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className={`${inputClassName} ${errors.scanIdentiteVerso ? "border-red-500" : ""}`}
            />
            {errors.scanIdentiteVerso && <p className="text-red-500 text-xs mt-1">{errors.scanIdentiteVerso}</p>}
          </div>
        </div>
      </div>

      {/* Bouton de soumission */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-sm text-white py-3 px-6 rounded-lg shadow-lg hover:from-indigo-600 hover:to-blue-600 transition-colors duration-300 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isSubmitting ? "Envoi en cours..." : "Soumettre"}
      </button>
    </form>
  );
};

export default MergedForm;
