"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Stage, AddressSuggestion, RegistrationInfo } from "../types";
import SelectedStageInfo from "../SelectedStageInfo";
import { fetchAddressSuggestions } from "../utils";
import nationalitiesData from "../nationalite.json";
import casStageData from "../cas_stage.json";
import prefecturesData from "../prefectures.json";
import { supabase } from "@/lib/supabaseClient";

interface PersonalInfoStepProps {
  selectedStage: Stage;
  onSubmit: (data: FormData) => Promise<void>;
  setRegistrationInfo: React.Dispatch<React.SetStateAction<RegistrationInfo | null>>;
  nextStep: () => void;
}

export default function PersonalInfoStep({
  selectedStage,
  onSubmit,
  setRegistrationInfo,
  nextStep,
}: PersonalInfoStepProps) {
  const [formData, setFormData] = useState<RegistrationInfo>({
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
    acceptConditions: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [nationalities, setNationalities] = useState<{ code: string; name: string }[]>([]);

  const inputClassName =
    "mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  useEffect(() => {
    if (nationalitiesData?.nationalities) {
      setNationalities(nationalitiesData.nationalities);
    }
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    console.log(`Fichier sélectionné pour ${name}:`, file?.name);
    setFormData((prev) => ({ ...prev, [name]: file }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddressChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, adresse: value }));
    if (value.length >= 3) {
      setIsLoadingAddress(true);
      setShowSuggestions(true);
      try {
        const suggestions = await fetchAddressSuggestions(value);
        setAddressSuggestions(suggestions);
      } catch (error) {
        console.error("Erreur lors de la récupération des suggestions d'adresse:", error);
      } finally {
        setIsLoadingAddress(false);
      }
    } else {
      setShowSuggestions(false);
      setAddressSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      adresse: suggestion.properties.label,
      codePostal: suggestion.properties.postcode || prev.codePostal,
      ville: suggestion.properties.city || prev.ville,
    }));
    setShowSuggestions(false);
  };

  const uploadFilesToSupabase = async (id: string): Promise<{ [key: string]: string }> => {
    const uploadedPaths: { [key: string]: string } = {};
    const fileFields = {
      scanPermisRecto: "permis_recto",
      scanPermisVerso: "permis_verso",
      scanIdentiteRecto: "id_recto",
      scanIdentiteVerso: "id_verso",
    };

    for (const [field, dbField] of Object.entries(fileFields)) {
      const file = formData[field as keyof RegistrationInfo] as File | null;
      if (file) {
        const filePath = `${id}/${dbField}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from("documents")
          .upload(filePath, file, { upsert: true });

        if (error) {
          console.error(`Erreur d'upload pour ${field}:`, error.message);
          throw new Error(`Échec de l'upload de ${field}: ${error.message}`);
        }

        const { publicUrl } = supabase.storage.from("documents").getPublicUrl(filePath).data;
        uploadedPaths[field] = publicUrl;
      }
    }

    return uploadedPaths;
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
      "telephone",
      "email",
      "confirmationEmail",
      "nationalite",
      "dateNaissance",
      "codePostalNaissance",
      "numeroPermis",
      "dateDelivrancePermis",
      "prefecture",
      "etatPermis",
      "casStage",
      "acceptConditions",
    ];

    requiredFields.forEach((field) => {
      const value = formData[field as keyof RegistrationInfo];
      if (field === "acceptConditions" && !value) {
        newErrors[field] = "Vous devez accepter les conditions.";
      } else if (!value?.toString().trim()) {
        newErrors[field] = "Ce champ est requis.";
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
      newErrors.telephone = "Format de téléphone invalide (10 chiffres).";
    }

    const allowedFileTypes = ["image/jpeg", "image/png", "application/pdf"];
    ["scanPermisRecto", "scanPermisVerso", "scanIdentiteRecto", "scanIdentiteVerso"].forEach((field) => {
      const file = formData[field as keyof RegistrationInfo] as File | null;
      if (file && !allowedFileTypes.includes(file.type)) {
        newErrors[field] = "Type de fichier invalide. Autorisé: JPEG, PNG, PDF.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      console.log("Validation échouée:", errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataObj = new FormData(e.currentTarget);
      const uploadedPaths = await uploadFilesToSupabase(formData.email);

      // Remplacer les champs de fichiers par leurs URLs
      if (uploadedPaths.scanPermisRecto) formDataObj.set("permis_recto", uploadedPaths.scanPermisRecto);
      if (uploadedPaths.scanPermisVerso) formDataObj.set("permis_verso", uploadedPaths.scanPermisVerso);
      if (uploadedPaths.scanIdentiteRecto) formDataObj.set("id_recto", uploadedPaths.scanIdentiteRecto);
      if (uploadedPaths.scanIdentiteVerso) formDataObj.set("id_verso", uploadedPaths.scanIdentiteVerso);

      // Supprimer les champs de fichiers originaux et acceptConditions
      formDataObj.delete("scanPermisRecto");
      formDataObj.delete("scanPermisVerso");
      formDataObj.delete("scanIdentiteRecto");
      formDataObj.delete("scanIdentiteVerso");
      formDataObj.delete("acceptConditions");

      // Mettre à jour l'état global via setRegistrationInfo
      const registrationData = Object.fromEntries(formDataObj.entries()) as unknown as RegistrationInfo;
      setRegistrationInfo(registrationData);

      // Appeler onSubmit et passer à l'étape suivante
      await onSubmit(formDataObj);
      nextStep();
    } catch (error: any) {
      console.error("Erreur lors de la soumission:", error.message);
      setErrors((prev) => ({ ...prev, submit: error.message || "Erreur lors de l'envoi des données." }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className=" bg-gray-50 min-h-screen">
      <section aria-labelledby="selected-stage-heading" className="mb-6 p-4 border rounded bg-white shadow">
        <SelectedStageInfo selectedStage={selectedStage} />
      </section>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow" encType="multipart/form-data" noValidate>
        <fieldset className="border p-4 rounded" aria-labelledby="personal-info-legend">
          <legend id="personal-info-legend" className="text-xl font-bold text-gray-800 mb-4">
            Informations Personnelles
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="civilite" className="block text-sm font-medium text-gray-700">
                Civilité <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <select
                id="civilite"
                name="civilite"
                value={formData.civilite}
                onChange={handleChange}
                className={`${inputClassName} ${errors.civilite ? "border-red-500" : ""}`}
                aria-required="true"
              >
                <option value="">-- Sélectionnez --</option>
                <option value="Monsieur">Monsieur</option>
                <option value="Madame">Madame</option>
              </select>
              {errors.civilite && <p id="civilite-error" className="text-red-500 text-xs mt-1">{errors.civilite}</p>}
            </div>

            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                Nom <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="nom"
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`${inputClassName} ${errors.nom ? "border-red-500" : ""}`}
                placeholder="Votre nom"
                aria-required="true"
              />
              {errors.nom && <p id="nom-error" className="text-red-500 text-xs mt-1">{errors.nom}</p>}
            </div>

            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                Prénom <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="prenom"
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className={`${inputClassName} ${errors.prenom ? "border-red-500" : ""}`}
                placeholder="Votre prénom"
                aria-required="true"
              />
              {errors.prenom && <p id="prenom-error" className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
            </div>

            <div>
              <label htmlFor="prenom1" className="block text-sm font-medium text-gray-700">Prénom 1 (Optionnel)</label>
              <input
                id="prenom1"
                type="text"
                name="prenom1"
                value={formData.prenom1}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Optionnel"
              />
            </div>

            <div>
              <label htmlFor="prenom2" className="block text-sm font-medium text-gray-700">Prénom 2 (Optionnel)</label>
              <input
                id="prenom2"
                type="text"
                name="prenom2"
                value={formData.prenom2}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Optionnel"
              />
            </div>

            <div className="relative">
              <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">
                Adresse <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="adresse"
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleAddressChange}
                className={`${inputClassName} ${errors.adresse ? "border-red-500" : ""}`}
                placeholder="Votre adresse"
                autoComplete="off"
                aria-required="true"
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
              {errors.adresse && <p id="adresse-error" className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
            </div>

            <div>
              <label htmlFor="codePostal" className="block text-sm font-medium text-gray-700">
                Code Postal <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="codePostal"
                type="text"
                name="codePostal"
                value={formData.codePostal}
                onChange={handleChange}
                className={`${inputClassName} ${errors.codePostal ? "border-red-500" : ""}`}
                placeholder="Ex: 75001"
                aria-required="true"
              />
              {errors.codePostal && <p id="codePostal-error" className="text-red-500 text-xs mt-1">{errors.codePostal}</p>}
            </div>

            <div>
              <label htmlFor="ville" className="block text-sm font-medium text-gray-700">
                Ville <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="ville"
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                className={`${inputClassName} ${errors.ville ? "border-red-500" : ""}`}
                placeholder="Votre ville"
                aria-required="true"
              />
              {errors.ville && <p id="ville-error" className="text-red-500 text-xs mt-1">{errors.ville}</p>}
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
                Téléphone <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="telephone"
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className={`${inputClassName} ${errors.telephone ? "border-red-500" : ""}`}
                placeholder="Ex: 0123456789"
                pattern="[0-9]{10}"
                aria-required="true"
              />
              {errors.telephone && <p id="telephone-error" className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${inputClassName} ${errors.email ? "border-red-500" : ""}`}
                placeholder="Votre email"
                aria-required="true"
              />
              {errors.email && <p id="email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="confirmationEmail" className="block text-sm font-medium text-gray-700">
                Confirmation Email <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="confirmationEmail"
                type="email"
                name="confirmationEmail"
                value={formData.confirmationEmail}
                onChange={handleChange}
                className={`${inputClassName} ${errors.confirmationEmail ? "border-red-500" : ""}`}
                placeholder="Confirmez votre email"
                aria-required="true"
              />
              {errors.confirmationEmail && (
                <p id="confirmationEmail-error" className="text-red-500 text-xs mt-1">{errors.confirmationEmail}</p>
              )}
            </div>

            <div>
              <label htmlFor="nationalite" className="block text-sm font-medium text-gray-700">
                Nationalité <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <select
                id="nationalite"
                name="nationalite"
                value={formData.nationalite}
                onChange={handleChange}
                className={`${inputClassName} ${errors.nationalite ? "border-red-500" : ""}`}
                aria-required="true"
              >
                <option value="">-- Sélectionnez une nationalité --</option>
                {nationalities.map((nat) => (
                  <option key={nat.code} value={nat.name}>
                    {nat.name}
                  </option>
                ))}
              </select>
              {errors.nationalite && <p id="nationalite-error" className="text-red-500 text-xs mt-1">{errors.nationalite}</p>}
            </div>

            <div>
              <label htmlFor="dateNaissance" className="block text-sm font-medium text-gray-700">
                Date de naissance <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="dateNaissance"
                type="date"
                name="dateNaissance"
                value={formData.dateNaissance}
                onChange={handleChange}
                className={`${inputClassName} ${errors.dateNaissance ? "border-red-500" : ""}`}
                aria-required="true"
              />
              {errors.dateNaissance && <p id="dateNaissance-error" className="text-red-500 text-xs mt-1">{errors.dateNaissance}</p>}
            </div>

            <div>
              <label htmlFor="codePostalNaissance" className="block text-sm font-medium text-gray-700">
                Lieu de naissance <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="codePostalNaissance"
                type="text"
                name="codePostalNaissance"
                value={formData.codePostalNaissance}
                onChange={handleChange}
                className={`${inputClassName} ${errors.codePostalNaissance ? "border-red-500" : ""}`}
                placeholder="Ville, Pays"
                aria-required="true"
              />
              {errors.codePostalNaissance && (
                <p id="codePostalNaissance-error" className="text-red-500 text-xs mt-1">{errors.codePostalNaissance}</p>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className="border p-4 rounded" aria-labelledby="driving-license-legend">
          <legend id="driving-license-legend" className="text-xl font-bold text-gray-800 mb-4">
            Informations sur le Permis de Conduire
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="numeroPermis" className="block text-sm font-medium text-gray-700">
                Numéro de permis <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="numeroPermis"
                type="text"
                name="numeroPermis"
                value={formData.numeroPermis}
                onChange={handleChange}
                className={`${inputClassName} ${errors.numeroPermis ? "border-red-500" : ""}`}
                placeholder="Ex: 12AB34567"
                aria-required="true"
              />
              {errors.numeroPermis && <p id="numeroPermis-error" className="text-red-500 text-xs mt-1">{errors.numeroPermis}</p>}
            </div>

            <div>
              <label htmlFor="dateDelivrancePermis" className="block text-sm font-medium text-gray-700">
                Date de délivrance <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="dateDelivrancePermis"
                type="date"
                name="dateDelivrancePermis"
                value={formData.dateDelivrancePermis}
                onChange={handleChange}
                className={`${inputClassName} ${errors.dateDelivrancePermis ? "border-red-500" : ""}`}
                aria-required="true"
              />
              {errors.dateDelivrancePermis && <p id="dateDelivrancePermis-error" className="text-red-500 text-xs mt-1">{errors.dateDelivrancePermis}</p>}
            </div>

            <div>
              <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700">
                Préfecture <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <select
                id="prefecture"
                name="prefecture"
                value={formData.prefecture}
                onChange={handleChange}
                className={`${inputClassName} ${errors.prefecture ? "border-red-500" : ""}`}
                aria-required="true"
              >
                <option value="">-- Sélectionnez une préfecture --</option>
                {prefecturesData.map((pref) => (
                  <option key={pref.codePostal} value={pref.prefecture}>
                    {pref.prefecture} ({pref.codePostal})
                  </option>
                ))}
              </select>
              {errors.prefecture && <p id="prefecture-error" className="text-red-500 text-xs mt-1">{errors.prefecture}</p>}
            </div>

            <div>
              <label htmlFor="etatPermis" className="block text-sm font-medium text-gray-700">
                État du permis <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <select
                id="etatPermis"
                name="etatPermis"
                value={formData.etatPermis}
                onChange={handleChange}
                className={`${inputClassName} ${errors.etatPermis ? "border-red-500" : ""}`}
                aria-required="true"
              >
                <option value="">Sélectionnez l'état</option>
                <option value="Valide">Valide</option>
                <option value="Invalide">Invalide</option>
              </select>
              {errors.etatPermis && <p id="etatPermis-error" className="text-red-500 text-xs mt-1">{errors.etatPermis}</p>}
            </div>

            <div>
              <label htmlFor="casStage" className="block text-sm font-medium text-gray-700">
                Cas de stage <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <select
                id="casStage"
                name="casStage"
                value={formData.casStage}
                onChange={handleChange}
                className={`${inputClassName} ${errors.casStage ? "border-red-500" : ""}`}
                aria-required="true"
              >
                <option value="">Sélectionnez un cas</option>
                {casStageData.map((cas, index) => (
                  <option key={index} value={cas.description}>
                    {cas.description}
                  </option>
                ))}
              </select>
              {errors.casStage && <p id="casStage-error" className="text-red-500 text-xs mt-1">{errors.casStage}</p>}
            </div>
          </div>
        </fieldset>

        <fieldset className="border p-4 rounded" aria-labelledby="downloads-legend">
          <legend id="downloads-legend" className="text-lg font-semibold text-indigo-600 mb-4">
            Téléchargements
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="scanPermisRecto" className="block text-sm font-medium text-gray-700">
                Permis de Conduire recto
              </label>
              <input
                id="scanPermisRecto"
                type="file"
                name="scanPermisRecto"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className={`${inputClassName} ${errors.scanPermisRecto ? "border-red-500" : ""}`}
                aria-required="true"

              />
              {errors.scanPermisRecto && <p id="scanPermisRecto-error" className="text-red-500 text-xs mt-1">{errors.scanPermisRecto}</p>}
            </div>

            <div>
              <label htmlFor="scanPermisVerso" className="block text-sm font-medium text-gray-700">
                Permis de Conduire verso
              </label>
              <input
                id="scanPermisVerso"
                type="file"
                name="scanPermisVerso"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className={`${inputClassName} ${errors.scanPermisVerso ? "border-red-500" : ""}`}
                aria-required="true"

              />
              {errors.scanPermisVerso && <p id="scanPermisVerso-error" className="text-red-500 text-xs mt-1">{errors.scanPermisVerso}</p>}
            </div>

            <div>
              <label htmlFor="scanIdentiteRecto" className="block text-sm font-medium text-gray-700">
               Pièce d'Identité recto
              </label>
              <input
                id="scanIdentiteRecto"
                type="file"
                name="scanIdentiteRecto"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className={`${inputClassName} ${errors.scanIdentiteRecto ? "border-red-500" : ""}`}
                aria-required="true"

              />
              {errors.scanIdentiteRecto && (
                <p id="scanIdentiteRecto-error" className="text-red-500 text-xs mt-1">{errors.scanIdentiteRecto}</p>
              )}
            </div>

            <div>
              <label htmlFor="scanIdentiteVerso" className="block text-sm font-medium text-gray-700">
                Pièce d'Identité verso
              </label>
              <input
                id="scanIdentiteVerso"
                type="file"
                name="scanIdentiteVerso"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className={`${inputClassName} ${errors.scanIdentiteVerso ? "border-red-500" : ""}`}
                aria-required="true"

              />
              {errors.scanIdentiteVerso && (
                <p id="scanIdentiteVerso-error" className="text-red-500 text-xs mt-1">{errors.scanIdentiteVerso}</p>
              )}
            </div>
          </div>
        </fieldset>

        <div className="mt-4">
          <label htmlFor="acceptConditions" className="flex items-center text-sm font-medium text-gray-700">
            <input
              id="acceptConditions"
              type="checkbox"
              name="acceptConditions"
              checked={formData.acceptConditions}
              onChange={handleChange}
              className={`mr-2 ${errors.acceptConditions ? "border-red-500" : ""}`}
              aria-required="true"
            />
            J'accepte les conditions générales d'utilisation <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          {errors.acceptConditions && <p id="acceptConditions-error" className="text-red-500 text-xs mt-1">{errors.acceptConditions}</p>}
        </div>

        <div className="col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-sm text-white py-3 px-6 rounded-lg shadow-xl hover:from-indigo-600 hover:to-blue-600 transition-colors duration-300 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Envoi en cours..." : "Enregistrer et Continuer"}
          </button>
          {errors.submit && <p className="text-red-500 text-xs mt-2 text-center">{errors.submit}</p>}
        </div>
      </form>
    </div>
  );
}