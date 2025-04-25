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

  const uploadFileWithRetry = async (file: File, filePath: string, retries = 3): Promise<string> => {
    // Vérifier si le fichier est valide avant de tenter l'upload
    if (!file || file.size === 0) {
      throw new Error(`Fichier invalide pour ${filePath}`);
    }
  
    console.log(`Début de l'upload pour ${filePath}, taille: ${file.size} octets, type: ${file.type}`);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Ajout de logs pour le diagnostic
        console.log(`Tentative ${attempt}/${retries} pour ${filePath}`);
        
        // S'assurer que le client Supabase est bien initialisé
        if (!supabase || !supabase.storage) {
          throw new Error("Client Supabase non initialisé correctement");
        }
        
        // Upload avec monitoring de progression
        const { data, error } = await supabase.storage
          .from("documents")
          .upload(filePath, file, { 
            upsert: true,
            // Ajouter un handler de progression si nécessaire
            onUploadProgress: (progress) => {
              const percentComplete = Math.round((progress.loaded / progress.total) * 100);
              setUploadProgress((prev) => ({ 
                ...prev, 
                [filePath.split('/')[1]]: percentComplete 
              }));
            }
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
  
        console.log(`Upload réussi pour ${filePath}:`, urlData.publicUrl);
        return urlData.publicUrl;
      } catch (error: any) {
        console.error(`Tentative ${attempt} échouée pour ${filePath}:`, error.message);
        
        // Si c'est la dernière tentative, propager l'erreur
        if (attempt === retries) {
          throw new Error(`Échec de l'upload de ${filePath} après ${retries} tentatives: ${error.message}`);
        }
        
        // Attendre avant de réessayer avec un délai exponentiel
        const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s...
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error("Erreur inattendue dans uploadFileWithRetry");
  };
  
  // Correction de la fonction uploadFilesToSupabase
  
  const uploadFilesToSupabase = async (id: string): Promise<{ [key: string]: string }> => {
    console.log("Début de l'upload des fichiers pour ID:", id);
    const uploadedPaths: { [key: string]: string } = {};
    
    // Vérifier que l'ID est valide
    if (!id || typeof id !== 'string') {
      throw new Error("ID utilisateur invalide pour l'upload");
    }
    
    // Map des fichiers à uploader avec leurs champs correspondants
    const fileFields = {
      id_recto: "id_recto",
      id_verso: "id_verso",
      permis_recto: "permis_recto",
      permis_verso: "permis_verso",
      letter_48N: "letter_48N",
      extraDocument: "extraDocument",
    };
  
    // Upload séquentiel au lieu de parallèle pour éviter les problèmes de concurrence
    for (const [field, dbField] of Object.entries(fileFields)) {
      const file = formData[field as keyof RegistrationInfo] as File | null;
      
      if (!file) {
        console.log(`Aucun fichier pour ${field}`);
        setUploadProgress((prev) => ({ ...prev, [field]: 100 }));
        continue;
      }
      
      // Vérifier que le fichier est valide
      if (file.size === 0) {
        console.error(`Fichier vide pour ${field}`);
        setErrors((prev) => ({ ...prev, [field]: "Fichier vide" }));
        setUploadProgress((prev) => ({ ...prev, [field]: 0 }));
        continue;
      }
  
      // Créer un chemin unique pour chaque fichier
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${id}/${dbField}/${timestamp}_${cleanFileName}`;
      
      console.log(`Tentative d'upload pour ${field}: ${filePath}`);
      setUploadProgress((prev) => ({ ...prev, [field]: 10 })); // Initial progress
      
      try {
        const publicUrl = await uploadFileWithRetry(file, filePath);
        uploadedPaths[field] = publicUrl;
        setUploadProgress((prev) => ({ ...prev, [field]: 100 }));
        console.log(`Upload réussi pour ${field}: ${publicUrl}`);
      } catch (error: any) {
        console.error(`Erreur pour ${field}:`, error.message);
        setErrors((prev) => ({ ...prev, [field]: `Échec de l'upload: ${error.message}` }));
        // Ne pas lancer d'erreur, continuer avec les autres fichiers
        setUploadProgress((prev) => ({ ...prev, [field]: 0 }));
      }
    }
  
    console.log("Tous les chemins uploadés:", uploadedPaths);
    return uploadedPaths;
  };
  
  // Modification du handleSubmit pour gérer correctement les uploads
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Soumission du formulaire déclenchée");
    if (!validate()) {
      console.log("Validation échouée:", errors);
      return;
    }
  
    setIsSubmitting(true);
    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "acceptConditions" || key === "commitToUpload") return;
        
        // Ne pas ajouter les fichiers à FormData pour l'instant
        if (!(value instanceof File) && value !== null && value !== undefined) {
          formDataObj.append(key, value.toString());
        }
      });
  
      console.log("FormData initial sans fichiers:", Object.fromEntries(formDataObj));
  
      // S'assurer que l'email est disponible pour l'ID
      if (!formData.email) {
        throw new Error("Email requis pour l'upload des fichiers");
      }
  
      // Upload des fichiers à Supabase
      const uploadedPaths = await uploadFilesToSupabase(formData.email);
      console.log("Chemins uploadés reçus:", uploadedPaths);
  
      // Ajouter les URLs des fichiers uploadés à FormData
      Object.entries(uploadedPaths).forEach(([field, url]) => {
        formDataObj.append(field, url);
      });
  
      console.log("FormData final envoyé à onSubmit:", Object.fromEntries(formDataObj));
  
      const registrationData = Object.fromEntries(formDataObj.entries()) as unknown as RegistrationInfo;
      setRegistrationInfo(registrationData);
  
      await onSubmit(formDataObj);
      console.log("Soumission réussie, transition vers l'étape suivante");
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
      // Uncomment to make some files mandatory
      // "permis_recto",
      // "id_recto",
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
    [
      "id_recto",
      "id_verso",
      "permis_recto",
      "permis_verso",
      "letter_48N",
      "extraDocument",
    ].forEach((field) => {
      const file = formData[field as keyof RegistrationInfo] as File | null;
      if (file && !allowedFileTypes.includes(file.type)) {
        newErrors[field] = "Type de fichier invalide. Autorisé: JPEG, JPG, PNG, PDF.";
      }
    });

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
    return today.toISOString().split("T")[0]; // format YYYY-MM-DD
  }

  return (
    <div className="min-h-screen md:p-6">
      <section aria-labelledby="selected-stage-heading" className="mb-4 p-3 border rounded">
        <h2 id="selected-stage-heading" className="text-lg font-bold text-gray-900">Stage Sélectionné</h2>
        <SelectedStageInfo selectedStage={selectedStage} />
      </section>

      <form onSubmit={handleSubmit} className="p-4 md:p-6 rounded-lg shadow" encType="multipart/form-data" noValidate>
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
                  <label htmlFor="codePostalNaissance" className="text-xs font-medium text-gray-700">Lieu Naissance *</label>
                  <input id="codePostalNaissance" type="text" name="codePostalNaissance" value={formData.codePostalNaissance} onChange={handleChange} className={`${inputClassName} ${errors.codePostalNaissance ? "border-red-500" : ""}`} placeholder="Ville, Pays" aria-required="true" />
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
                  <select id="casStage" name="casStage" value={formData.casStage} onChange={handleChange} className={`${inputClassName} ${errors.casStage ? "border-red-500" : ""}`} aria-required="true">
                    <option value="">--</option>
                    {casStageData.map((cas, index) => (
                      <option key={index} value={cas.description}>{cas.type} - {cas.description}</option>
                    ))}
                  </select>
                  {errors.casStage && <p className="text-red-500 text-xs">{errors.casStage}</p>}
                </div>
              </div>

              <div className="mt-3 border-t pt-3">
                <h3 className="text-xs font-semibold text-indigo-600 mb-2">Téléchargements</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="permis_recto" className="text-xs font-medium text-gray-700">Permis Recto</label>
                    <input id="permis_recto" type="file" name="permis_recto" onChange={handleFileChange} accept="image/*,application/pdf" className={`${inputClassName} ${errors.permis_recto ? "border-red-500" : ""}`} />
                    {uploadProgress.permis_recto > 0 && uploadProgress.permis_recto < 100 && (
                      <div className="mt-1 h-2 bg-gray-200 rounded">
                        <div className="h-full bg-indigo-500 rounded" style={{ width: `${uploadProgress.permis_recto}%` }}></div>
                      </div>
                    )}
                    {errors.permis_recto && <p className="text-red-500 text-xs">{errors.permis_recto}</p>}
                  </div>
                  <div>
                    <label htmlFor="permis_verso" className="text-xs font-medium text-gray-700">Permis Verso</label>
                    <input id="permis_verso" type="file" name="permis_verso" onChange={handleFileChange} accept="image/*,application/pdf" className={`${inputClassName} ${errors.permis_verso ? "border-red-500" : ""}`} />
                    {uploadProgress.permis_verso > 0 && uploadProgress.permis_verso < 100 && (
                      <div className="mt-1 h-2 bg-gray-200 rounded">
                        <div className="h-full bg-indigo-500 rounded" style={{ width: `${uploadProgress.permis_verso}%` }}></div>
                      </div>
                    )}
                    {errors.permis_verso && <p className="text-red-500 text-xs">{errors.permis_verso}</p>}
                  </div>
                  <div>
                    <label htmlFor="id_recto" className="text-xs font-medium text-gray-700">ID Recto</label>
                    <input id="id_recto" type="file" name="id_recto" onChange={handleFileChange} accept="image/*,application/pdf" className={`${inputClassName} ${errors.id_recto ? "border-red-500" : ""}`} />
                    {uploadProgress.id_recto > 0 && uploadProgress.id_recto < 100 && (
                      <div className="mt-1 h-2 bg-gray-200 rounded">
                        <div className="h-full bg-indigo-500 rounded" style={{ width: `${uploadProgress.id_recto}%` }}></div>
                      </div>
                    )}
                    {errors.id_recto && <p className="text-red-500 text-xs">{errors.id_recto}</p>}
                  </div>
                  <div>
                    <label htmlFor="id_verso" className="text-xs font-medium text-gray-700">ID Verso</label>
                    <input id="id_verso" type="file" name="id_verso" onChange={handleFileChange} accept="image/*,application/pdf" className={`${inputClassName} ${errors.id_verso ? "border-red-500" : ""}`} />
                    {uploadProgress.id_verso > 0 && uploadProgress.id_verso < 100 && (
                      <div className="mt-1 h-2 bg-gray-200 rounded">
                        <div className="h-full bg-indigo-500 rounded" style={{ width: `${uploadProgress.id_verso}%` }}></div>
                      </div>
                    )}
                    {errors.id_verso && <p className="text-red-500 text-xs">{errors.id_verso}</p>}
                  </div>
                  <div>
                    <label htmlFor="letter_48N" className="text-xs font-medium text-gray-700">Lettre 48N</label>
                    <input id="letter_48N" type="file" name="letter_48N" onChange={handleFileChange} accept="image/*,application/pdf" className={`${inputClassName} ${errors.letter_48N ? "border-red-500" : ""}`} />
                    {uploadProgress.letter_48N > 0 && uploadProgress.letter_48N < 100 && (
                      <div className="mt-1 h-2 bg-gray-200 rounded">
                        <div className="h-full bg-indigo-500 rounded" style={{ width: `${uploadProgress.letter_48N}%` }}></div>
                      </div>
                    )}
                    {errors.letter_48N && <p className="text-red-500 text-xs">{errors.letter_48N}</p>}
                  </div>
                  <div>
                    <label htmlFor="extraDocument" className="text-xs font-medium text-gray-700">Document Supplémentaire</label>
                    <input id="extraDocument" type="file" name="extraDocument" onChange={handleFileChange} accept="image/*,application/pdf" className={`${inputClassName} ${errors.extraDocument ? "border-red-500" : ""}`} />
                    {uploadProgress.extraDocument > 0 && uploadProgress.extraDocument < 100 && (
                      <div className="mt-1 h-2 bg-gray-200 rounded">
                        <div className="h-full bg-indigo-500 rounded" style={{ width: `${uploadProgress.extraDocument}%` }}></div>
                      </div>
                    )}
                    {errors.extraDocument && <p className="text-red-500 text-xs">{errors.extraDocument}</p>}
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        <div className="mt-4 flex flex-col items-center space-y-3">
          <label htmlFor="acceptConditions" className="flex items-center text-xs font-medium text-gray-700">
            <input id="acceptConditions" type="checkbox" name="acceptConditions" checked={formData.acceptConditions} onChange={handleChange} className={`mr-2 ${errors.acceptConditions ? "border-red-500" : ""}`} aria-required="true" />
            J'accepte les conditions générales *
          </label>
          {errors.acceptConditions && <p className="text-red-500 text-xs">{errors.acceptConditions}</p>}
          <button type="submit" disabled={isSubmitting} className={`w-full md:w-1/2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 px-4 rounded-lg shadow hover:from-indigo-600 hover:to-blue-600 transition-colors duration-300 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}>
            {isSubmitting ? "Envoi..." : "Enregistrer"}
          </button>
          {errors.submit && <p className="text-red-500 text-xs">{errors.submit}</p>}
        </div>
      </form>
    </div>
  );
}