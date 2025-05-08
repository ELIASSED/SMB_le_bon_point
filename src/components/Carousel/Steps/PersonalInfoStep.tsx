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
  selectedStage?: Stage;
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
    id_recto: null,
    id_verso: null,
    permis_recto: null,
    permis_verso: null,
    letter_48N: null,
    extraDocument: null,
    infractionDate: "",
    infractionTime: "",
    infractionPlace: "",
    parquetNumber: "",
    judgmentDate: "",
    acceptConditions: false,
    commitToUpload: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [nationalities, setNationalities] = useState<{ code: string; name: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const inputClassName =
    "mt-1 block w-full border border-gray-300 rounded-md p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500";

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
    if (file && file.size > 20 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [name]: "Le fichier dépasse la taille maximale de 20 Mo." }));
      return;
    }
    if (file && file.size === 0) {
      setErrors((prev) => ({ ...prev, [name]: "Le fichier est vide ou corrompu." }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: file }));
    setUploadProgress((prev) => ({ ...prev, [name]: 0 }));
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
    const props = suggestion.properties;
    setFormData((prev) => ({
      ...prev,
      adresse: props.name || props.street || props.label.split(',')[0] || "",
      codePostal: props.postcode || "",
      ville: props.city || props.context?.split(',')?.[1]?.trim() || "",
    }));
    setShowSuggestions(false);
  };

  const uploadFile = async (file: File, filePath: string): Promise<string> => {
    if (!file || file.size === 0) {
      throw new Error(`Fichier invalide pour ${filePath}`);
    }

    if (!supabase || !supabase.storage) {
      throw new Error("Client Supabase non initialisé correctement");
    }

    const { data, error } = await supabase.storage
      .from("documents")
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
      });

    if (error) {
      console.error(`Erreur Supabase pour ${filePath}:`, error);
      throw error;
    }

    if (!data || !data.path) {
      throw new Error(`Aucun chemin retourné pour ${filePath}`);
    }

    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(data.path);

    if (!urlData || !urlData.publicUrl) {
      throw new Error(`Impossible d'obtenir l'URL publique pour ${filePath}`);
    }

    return urlData.publicUrl;
  };

  const uploadFilesToSupabase = async (id: string): Promise<{ [key: string]: string }> => {
    const uploadedPaths: { [key: string]: string } = {};

    if (!id || typeof id !== 'string') {
      throw new Error("ID utilisateur invalide pour l'upload");
    }

    const fileFields = {
      id_recto: "id_recto",
      id_verso: "id_verso",
      permis_recto: "permis_recto",
      permis_verso: "permis_verso",
      letter_48N: "letter_48N",
      extraDocument: "extraDocument",
    };

    for (const [field, dbField] of Object.entries(fileFields)) {
      const file = formData[field as keyof RegistrationInfo] as File | null;

      if (!file) {
        setUploadProgress((prev) => ({ ...prev, [field]: 100 }));
        continue;
      }

      if (file.size === 0) {
        console.error(`Fichier vide pour ${field}`);
        setErrors((prev) => ({ ...prev, [field]: "Fichier vide" }));
        setUploadProgress((prev) => ({ ...prev, [field]: 0 }));
        continue;
      }

      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${id}/${dbField}/${timestamp}_${cleanFileName}`;

      setUploadProgress((prev) => ({ ...prev, [field]: 10 }));

      try {
        const publicUrl = await uploadFile(file, filePath);
        uploadedPaths[field] = publicUrl;
        setUploadProgress((prev) => ({ ...prev, [field]: 100 }));
      } catch (error: any) {
        console.error(`Erreur pour ${field}:`, error.message);
        setErrors((prev) => ({ ...prev, [field]: `Échec de l'upload: ${error.message}` }));
        setUploadProgress((prev) => ({ ...prev, [field]: 0 }));
      }
    }

    return uploadedPaths;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        // Exclure lieuNaissance, mais inclure acceptConditions et commitToUpload
        if (key === "lieuNaissance") return;
        if (value instanceof File) return; // Les fichiers sont ajoutés après l'upload
        if (value !== null && value !== undefined) {
          formDataObj.append(key, value.toString());
        }
      });

      if (!formData.email) {
        throw new Error("Email requis pour l'upload des fichiers");
      }

      const uploadedPaths = await uploadFilesToSupabase(formData.email);

      Object.entries(uploadedPaths).forEach(([field, url]) => {
        formDataObj.append(field, url);
      });

      const registrationData = Object.fromEntries(formDataObj.entries()) as unknown as RegistrationInfo;
      setRegistrationInfo(registrationData);

      await onSubmit(formDataObj);
    } catch (error: any) {
      console.error("Erreur lors de la soumission:", error.message, error.stack);
      setErrors((prev) => ({ ...prev, submit: error.message || "Erreur lors de l'envoi des données. Veuillez réessayer." }));
    } finally {
      setIsSubmitting(false);
    }
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

    const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    const fileFields = ["id_recto", "id_verso", "permis_recto", "permis_verso", "letter_48N", "extraDocument"];
    fileFields.forEach((field) => {
      const file = formData[field as keyof RegistrationInfo] as File | null;
      if (file && !allowedFileTypes.includes(file.type)) {
        newErrors[field] = "Type de fichier invalide. Autorisé: JPEG, JPG, PNG, PDF.";
      }
    });

    // Vérifier si aucun fichier n'est téléchargé pour les champs affichés
    const showUploadFields = {
      id_recto: ["1", "2", "3", "4"].includes(formData.casStage),
      id_verso: ["1", "2", "3", "4"].includes(formData.casStage),
      permis_recto: ["1", "2", "3", "4"].includes(formData.casStage),
      permis_verso: ["1", "2", "3", "4"].includes(formData.casStage),
      letter_48N: formData.casStage === "2",
      extraDocument: ["3", "4"].includes(formData.casStage),
    };

    const uploadFields = Object.keys(showUploadFields).filter((field) => showUploadFields[field as keyof typeof showUploadFields]);
    const hasFiles = uploadFields.some((field) => formData[field as keyof RegistrationInfo] !== null);

    if (!hasFiles && uploadFields.length > 0 && !formData.commitToUpload) {
      newErrors.commitToUpload = "Vous devez vous engager à fournir les pièces jointes si aucun fichier n'est téléchargé.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (!selectedStage) {
    return (
      <div className="text-center text-red-500 p-4" role="alert">
        Veuillez sélectionner une session avant de continuer.
      </div>
    );
  }

  function getDateSeizeYearsAgo(): string {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 16);
    return today.toISOString().split("T")[0];
  }

  // Détermine les champs d'upload à afficher selon casStage
  const showUploadFields = {
    id_recto: ["1", "2", "3", "4"].includes(formData.casStage),
    id_verso: ["1", "2", "3", "4"].includes(formData.casStage),
    permis_recto: ["1", "2", "3", "4"].includes(formData.casStage),
    permis_verso: ["1", "2", "3", "4"].includes(formData.casStage),
    letter_48N: formData.casStage === "2",
    extraDocument: ["3", "4"].includes(formData.casStage),
  };

  // Vérifier si aucun fichier n'est téléchargé pour les champs affichés
  const uploadFields = Object.keys(showUploadFields).filter((field) => showUploadFields[field as keyof typeof showUploadFields]);
  const hasFiles = uploadFields.some((field) => formData[field as keyof RegistrationInfo] !== null);
  const showCommitToUpload = uploadFields.length > 0 && !hasFiles;

  // Détermine les champs d'infraction et judiciaires à afficher
  const showInfractionFields = formData.casStage === "2";
  const showJudicialFields = ["3", "4"].includes(formData.casStage);

  return (
    <div className="min-h-screen">
      <form onSubmit={handleSubmit} className="p-4 rounded-lg shadow" encType="multipart/form-data" noValidate>
        <SelectedStageInfo selectedStage={selectedStage} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <fieldset className="border p-3 rounded" aria-labelledby="personal-info-legend">
            <legend id="personal-info-legend" className="text-lg font-bold text-gray-800 mb-2">Infos Personnelles</legend>
            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="civilite" className="text-xs font-medium text-gray-700">Civilité *</label>
                  <select id="civilite" name="civilite" value={formData.civilite} onChange={handleChange} className={`${inputClassName} ${errors.civilite ? "border-red-500" : ""}`} aria-required="true">
                    <option value="">--</option>
                    <option value="Monsieur">M.</option>
                    <option value="Madame">Mme</option>
                  </select>
                  {errors.civilite && <p className="text-red-500 text-xs">{errors.civilite}</p>}
                </div>
                <div>
                  <label htmlFor="nom" className="text-xs font-medium text-gray-700">Nom *</label>
                  <input id="nom" type="text" name="nom" value={formData.nom} onChange={handleChange} className={`${inputClassName} ${errors.nom ? "border-red-500" : ""}`} placeholder="Nom" aria-required="true" />
                  {errors.nom && <p className="text-red-500 text-xs">{errors.nom}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="prenom" className="text-xs font-medium text-gray-700">Prénom *</label>
                <input id="prenom" type="text" name="prenom" value={formData.prenom} onChange={handleChange} className={`${inputClassName} ${errors.prenom ? "border-red-500" : ""}`} placeholder="Prénom" aria-required="true" />
                {errors.prenom && <p className="text-red-500 text-xs">{errors.prenom}</p>}
              </div>
              <div>
                <label htmlFor="adresse" className="text-xs font-medium text-gray-700">Adresse *</label>
                <input id="adresse" type="text" name="adresse" value={formData.adresse} onChange={handleAddressChange} className={`${inputClassName} ${errors.adresse ? "border-red-500" : ""}`} placeholder="Adresse" aria-required="true" />
                {isLoadingAddress && <span className="absolute right-2 top-8 text-gray-400 text-xs">Chargement...</span>}
                {showSuggestions && addressSuggestions.length > 0 && (
                  <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-auto">
                    {addressSuggestions.map((suggestion, index) => (
                      <li key={index} onClick={() => handleSuggestionClick(suggestion)} className="p-1 hover:bg-gray-100 cursor-pointer text-xs">{suggestion.properties.label}</li>
                    ))}
                  </ul>
                )}
                {errors.adresse && <p className="text-red-500 text-xs">{errors.adresse}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="codePostal" className="text-xs font-medium text-gray-700">Code Postal *</label>
                  <input id="codePostal" type="text" name="codePostal" value={formData.codePostal} onChange={handleChange} className={`${inputClassName} ${errors.codePostal ? "border-red-500" : ""}`} placeholder="75001" aria-required="true" />
                  {errors.codePostal && <p className="text-red-500 text-xs">{errors.codePostal}</p>}
                </div>
                <div>
                  <label htmlFor="ville" className="text-xs font-medium text-gray-700">Ville *</label>
                  <input id="ville" type="text" name="ville" value={formData.ville} onChange={handleChange} className={`${inputClassName} ${errors.ville ? "border-red-500" : ""}`} placeholder="Ville" aria-required="true" />
                  {errors.ville && <p className="text-red-500 text-xs">{errors.ville}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="telephone" className="text-xs font-medium text-gray-700">Téléphone *</label>
                <input id="telephone" type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className={`${inputClassName} ${errors.telephone ? "border-red-500" : ""}`} placeholder="0123456789" aria-required="true" />
                {errors.telephone && <p className="text-red-500 text-xs">{errors.telephone}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="email" className="text-xs font-medium text-gray-700">Email *</label>
                  <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} className={`${inputClassName} ${errors.email ? "border-red-500" : ""}`} placeholder="Email" aria-required="true" />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="confirmationEmail" className="text-xs font-medium text-gray-700">Confirmer Email *</label>
                  <input id="confirmationEmail" type="email" name="confirmationEmail" value={formData.confirmationEmail} onChange={handleChange} className={`${inputClassName} ${errors.confirmationEmail ? "border-red-500" : ""}`} placeholder="Confirmer" aria-required="true" />
                  {errors.confirmationEmail && <p className="text-red-500 text-xs">{errors.confirmationEmail}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="nationalite" className="text-xs font-medium text-gray-700">Nationalité *</label>
                <select id="nationalite" name="nationalite" value={formData.nationalite} onChange={handleChange} className={`${inputClassName} ${errors.nationalite ? "border-red-500" : ""}`} aria-required="true">
                  <option value="">--</option>
                  {nationalities.map((nat) => (
                    <option key={nat.code} value={nat.name}>{nat.name}</option>
                  ))}
                </select>
                {errors.nationalite && <p className="text-red-500 text-xs">{errors.nationalite}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="dateNaissance" className="text-xs font-medium text-gray-700">Date Naissance *</label>
                  <input
                    id="dateNaissance"
                    type="date"
                    name="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleChange}
                    max={getDateSeizeYearsAgo()}
                    className={`${inputClassName} ${errors.dateNaissance ? "border-red-500" : ""}`}
                    aria-required="true"
                  />
                  {errors.dateNaissance && <p className="text-red-500 text-xs">{errors.dateNaissance}</p>}
                </div>
                <div>
                  <label htmlFor="codePostalNaissance" className="text-xs font-medium text-gray-700">Code Postal Naissance *</label>
                  <input id="codePostalNaissance" type="text" name="codePostalNaissance" value={formData.codePostalNaissance} onChange={handleChange} className={`${inputClassName} ${errors.codePostalNaissance ? "border-red-500" : ""}`} placeholder="75001" aria-required="true" />
                  {errors.codePostalNaissance && <p className="text-red-500 text-xs">{errors.codePostalNaissance}</p>}
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset className="border p-3 rounded" aria-labelledby="driving-license-legend">
            <legend id="driving-license-legend" className="text-lg font-bold text-gray-800 mb-2">Permis de Conduire</legend>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label htmlFor="numeroPermis" className="text-xs font-medium text-gray-700">Numéro Permis *</label>
                <input id="numeroPermis" type="text" name="numeroPermis" value={formData.numeroPermis} onChange={handleChange} className={`${inputClassName} ${errors.numeroPermis ? "border-red-500" : ""}`} placeholder="12AB34567" aria-required="true" />
                {errors.numeroPermis && <p className="text-red-500 text-xs">{errors.numeroPermis}</p>}
              </div>
              <div>
                <label htmlFor="dateDelivrancePermis" className="text-xs font-medium text-gray-700">Date Délivrance *</label>
                <input id="dateDelivrancePermis" type="date" name="dateDelivrancePermis" value={formData.dateDelivrancePermis} onChange={handleChange} className={`${inputClassName} ${errors.dateDelivrancePermis ? "border-red-500" : ""}`} aria-required="true" />
                {errors.dateDelivrancePermis && <p className="text-red-500 text-xs">{errors.dateDelivrancePermis}</p>}
              </div>
              <div>
                <label htmlFor="prefecture" className="text-xs font-medium text-gray-700">Préfecture *</label>
                <select id="prefecture" name="prefecture" value={formData.prefecture} onChange={handleChange} className={`${inputClassName} ${errors.prefecture ? "border-red-500" : ""}`} aria-required="true">
                  <option value="">--</option>
                  {prefecturesData.map((pref) => (
                    <option key={pref.codePostal} value={pref.prefecture}>{pref.prefecture} ({pref.codePostal})</option>
                  ))}
                </select>
                {errors.prefecture && <p className="text-red-500 text-xs">{errors.prefecture}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="etatPermis" className="text-xs font-medium text-gray-700">État Permis *</label>
                  <select id="etatPermis" name="etatPermis" value={formData.etatPermis} onChange={handleChange} className={`${inputClassName} ${errors.etatPermis ? "border-red-500" : ""}`} aria-required="true">
                    <option value="">--</option>
                    <option value="Valide">Valide</option>
                    <option value="Invalide">Invalide</option>
                  </select>
                  {errors.etatPermis && <p className="text-red-500 text-xs">{errors.etatPermis}</p>}
                </div>
                <div>
                  <label htmlFor="casStage" className="text-xs font-medium text-gray-700">Cas Stage *</label>
                  <select
                    id="casStage"
                    name="casStage"
                    value={formData.casStage}
                    onChange={handleChange}
                    className={`${inputClassName} ${errors.casStage ? "border-red-500" : ""}`}
                    aria-required="true"
                  >
                    <option value="">--</option>
                    {casStageData.map((cas, index) => (
                      <option key={index} value={cas.value}>
                        {cas.type} - {cas.description}
                      </option>
                    ))}
                  </select>
                  {errors.casStage && <p className="text-red-500 text-xs">{errors.casStage}</p>}
                </div>
              </div>

              {showInfractionFields && (
                <div className="mt-3 border-t pt-3">
                  <h3 className="text-xs font-semibold text-indigo-600 mb-2">Détails de l'Infraction (Cas 2)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="infractionDate" className="text-xs font-medium text-gray-700">Date de l'Infraction</label>
                      <input
                        id="infractionDate"
                        type="date"
                        name="infractionDate"
                        value={formData.infractionDate}
                        onChange={handleChange}
                        className={`${inputClassName} ${errors.infractionDate ? "border-red-500" : ""}`}
                        aria-label="Date de l'infraction (facultatif)"
                      />
                      {errors.infractionDate && <p className="text-red-500 text-xs">{errors.infractionDate}</p>}
                    </div>
                    <div>
                      <label htmlFor="infractionTime" className="text-xs font-medium text-gray-700">Heure de l'Infraction</label>
                      <input
                        id="infractionTime"
                        type="time"
                        name="infractionTime"
                        value={formData.infractionTime}
                        onChange={handleChange}
                        className={`${inputClassName} ${errors.infractionTime ? "border-red-500" : ""}`}
                        aria-label="Heure de l'infraction (facultatif)"
                      />
                      {errors.infractionTime && <p className="text-red-500 text-xs">{errors.infractionTime}</p>}
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="infractionPlace" className="text-xs font-medium text-gray-700">Lieu de l'Infraction</label>
                      <input
                        id="infractionPlace"
                        type="text"
                        name="infractionPlace"
                        value={formData.infractionPlace}
                        onChange={handleChange}
                        className={`${inputClassName} ${errors.infractionPlace ? "border-red-500" : ""}`}
                        placeholder="Ex. : 123 Rue de Paris, 75001 Paris"
                        aria-label="Lieu de l'infraction (facultatif)"
                      />
                      {errors.infractionPlace && <p className="text-red-500 text-xs">{errors.infractionPlace}</p>}
                    </div>
                  </div>
                </div>
              )}

              {showJudicialFields && (
                <div className="mt-3 border-t pt-3">
                  <h3 className="text-xs font-semibold text-indigo-600 mb-2">Détails Judiciaires (Cas 3 ou 4)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="parquetNumber" className="text-xs font-medium text-gray-700">Numéro de Parquet</label>
                      <input
                        id="parquetNumber"
                        type="text"
                        name="parquetNumber"
                        value={formData.parquetNumber}
                        onChange={handleChange}
                        className={`${inputClassName} ${errors.parquetNumber ? "border-red-500" : ""}`}
                        placeholder="Ex. : 123456789"
                        aria-label="Numéro de parquet (facultatif)"
                      />
                      {errors.parquetNumber && <p className="text-red-500 text-xs">{errors.parquetNumber}</p>}
                    </div>
                    <div>
                      <label htmlFor="judgmentDate" className="text-xs font-medium text-gray-700">Date de Jugement</label>
                      <input
                        id="judgmentDate"
                        type="date"
                        name="judgmentDate"
                        value={formData.judgmentDate}
                        onChange={handleChange}
                        className={`${inputClassName} ${errors.judgmentDate ? "border-red-500" : ""}`}
                        aria-label="Date de jugement (facultatif)"
                      />
                      {errors.judgmentDate && <p className="text-red-500 text-xs">{errors.judgmentDate}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-3 border-t pt-3">
                <h3 className="text-xs font-semibold text-indigo-600 mb-2">Téléchargements</h3>
                <div className="grid grid-cols-2 gap-2">
                  {showUploadFields.permis_recto && (
                    <div>
                      <label htmlFor="permis_recto" className="text-xs font-medium text-gray-700">Permis Recto</label>
                      <input
                        id="permis_recto"
                        type="file"
                        name="permis_recto"
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        className={`${inputClassName} ${errors.permis_recto ? "border-red-500" : ""}`}
                        aria-label="Permis recto (facultatif)"
                      />
                      {uploadProgress.permis_recto > 0 && uploadProgress.permis_recto < 100 && (
                        <div className="mt-1 h-2 bg-gray-200 rounded">
                          <div className="h-full bg-indigo-500 rounded" style={{ width: `${uploadProgress.permis_recto}%` }}></div>
                        </div>
                      )}
                      {errors.permis_recto && <p className="text-red-500 text-xs">{errors.permis_recto}</p>}
                    </div>
                  )}
                  {showUploadFields.permis_verso && (
                    <div>
                      <label htmlFor="permis_verso" className="text-xs font-medium text-gray-700">Permis Verso</label>
                      <input
                        id="permis_verso"
                        type="file"
                        name="permis_verso"
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        className={`${inputClassName} ${errors.permis_verso ? "border-red-500" : ""}`}
                        aria-label="Permis verso (facultatif)"
                      />
                      {uploadProgress.permis_verso > 0 && uploadProgress.permis_verso < 100 && (
                        <div className="mt-1 h-2 bg-gray-200 rounded">
                          <div className="h-full bg-indigo-500 rounded" style={{ width: `${uploadProgress.permis_verso}%` }}></div>
                        </div>
                      )}
                      {errors.permis_verso && <p className="text-red-500 text-xs">{errors.permis_verso}</p>}
                    </div>
                  )}
                  {showUploadFields.id_recto && (
                    <div>
                      <label htmlFor="id_recto" className="text-xs font-medium text-gray-700">ID Recto</label>
                      <input
                        id="id_recto"
                        type="file"
                        name="id_recto"
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        className={`${inputClassName} ${errors.id_recto ? "border-red-500" : ""}`}
                        aria-label="ID recto (facultatif)"
                      />
                      {uploadProgress.id_recto > 0 && uploadProgress.id_recto < 100 && (
                        <div className="mt-1 h-2 bg-gray-200 rounded">
                          <div className="h-full bg-indigo-500 rounded" style={{ width: `${uploadProgress.id_recto}%` }}></div>
                        </div>
                      )}
                      {errors.id_recto && <p className="text-red-500 text-xs">{errors.id_recto}</p>}
                    </div>
                  )}
                  {showUploadFields.id_verso && (
                    <div>
                      <label htmlFor="id_verso" className="text-xs font-medium text-gray-700">ID Verso</label>
                      <input
                        id="id_verso"
                        type="file"
                        name="id_verso"
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        className={`${inputClassName} ${errors.id_verso ? "border-red-500" : ""}`}
                        aria-label="ID verso (facultatif)"
                      />
                      {uploadProgress.id_verso > 0 && uploadProgress.id_verso < 100 && (
                        <div className="mt-1 h-2 bg-gray-200 rounded">
                          <div className="h-full bg-indigo-500 rounded" style={{ width: `${uploadProgress.id_verso}%` }}></div>
                        </div>
                      )}
                      {errors.id_verso && <p className="text-red-500 text-xs">{errors.id_verso}</p>}
                    </div>
                  )}
                  {showUploadFields.letter_48N && (
                    <div>
                      <label htmlFor="letter_48N" className="text-xs font-medium text-gray-700">Lettre 48N</label>
                      <input
                        id="letter_48N"
                        type="file"
                        name="letter_48N"
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        className={`${inputClassName} ${errors.letter_48N ? "border-red-500" : ""}`}
                        aria-label="Lettre 48N (facultatif)"
                      />
                      {uploadProgress.letter_48N > 0 && uploadProgress.letter_48N < 100 && (
                        <div className="mt-1 h-2 bg-gray-200 rounded">
                          <div className="h-full bg-indigo-500 rounded" style={{ width: `${uploadProgress.letter_48N}%` }}></div>
                        </div>
                      )}
                      {errors.letter_48N && <p className="text-red-500 text-xs">{errors.letter_48N}</p>}
                    </div>
                  )}
                  {showUploadFields.extraDocument && (
                    <div>
                      <label htmlFor="extraDocument" className="text-xs font-medium text-gray-700">Document Supplémentaire</label>
                      <input
                        id="extraDocument"
                        type="file"
                        name="extraDocument"
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        className={`${inputClassName} ${errors.extraDocument ? "border-red-500" : ""}`}
                        aria-label="Document supplémentaire (facultatif)"
                      />
                      {uploadProgress.extraDocument > 0 && uploadProgress.extraDocument < 100 && (
                        <div className="mt-1 h-2 bg-gray-200 rounded">
                          <div className="h-full bg-indigo-500 rounded" style={{ width: `${uploadProgress.extraDocument}%` }}></div>
                        </div>
                      )}
                      {errors.extraDocument && <p className="text-red-500 text-xs">{errors.extraDocument}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        <div className="mt-4 flex flex-col items-center space-y-3">
          <label htmlFor="acceptConditions" className="flex items-center text-xs font-medium text-gray-700">
            <input
              id="acceptConditions"
              type="checkbox"
              name="acceptConditions"
              checked={formData.acceptConditions}
              onChange={handleChange}
              className={`mr-2 ${errors.acceptConditions ? "border-red-500" : ""}`}
              aria-required="true"
            />
            <a href="/conditions-générales-de-ventes.pdf" target="_blank" className="underline text-indigo-600">
              J'accepte les conditions générales
            </a>{" "}
            *
          </label>
          {errors.acceptConditions && <p className="text-red-500 text-xs">{errors.acceptConditions}</p>}

          {showCommitToUpload && (
            <label htmlFor="commitToUpload" className="flex items-center text-xs font-medium text-gray-700">
              <input
                id="commitToUpload"
                type="checkbox"
                name="commitToUpload"
                checked={formData.commitToUpload}
                onChange={handleChange}
                className={`mr-2 ${errors.commitToUpload ? "border-red-500" : ""}`}
                aria-required="true"
              />
              Je m'engage à fournir les pièces jointes au plus vite *
            </label>
          )}
          {errors.commitToUpload && <p className="text-red-500 text-xs">{errors.commitToUpload}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full md:w-1/2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 px-4 rounded-lg shadow hover:from-indigo-600 hover:to-blue-600 transition-colors duration-300 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Envoi..." : "Enregistrer"}
          </button>
          {errors.submit && <p className="text-red-500 text-xs">{errors.submit}</p>}
        </div>
      </form>
    </div>
  );
}