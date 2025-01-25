"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

// Interface des données utilisateur basée sur le modèle Prisma
export interface UserFormData {
  civilite: string;
  nom: string;
  prenom: string;
  prenom1?: string; // Premier prénom (optionnel)
  prenom2?: string; // Second prénom (optionnel)
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  email: string;
  confirmationEmail: string; // Pour validation côté client
  nationalite: string;
  dateNaissance: string;
  lieuNaissance: string;
  codePostalNaissance: string;
  numeroPermis: string;
  dateDelivrancePermis: string;
  prefecture: string;
  etatPermis: string;
  casStage: string;
  scanIdentite?: File | null;
  scanPermis?: File | null;
  commentaire?: string; // Zone de commentaire (optionnelle)
}

const MergedForm: React.FC<{ onSubmit: (data: FormData) => void }> = ({ onSubmit }) => {
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
    scanIdentite: null,
    scanPermis: null,
    commentaire: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClassName =
    "mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out";

  const ErrorMessage = ({ message }: { message?: string }) =>
    message ? <p className="text-red-500 text-xs mt-1">{message}</p> : null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [name]: file }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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
      "lieuNaissance",
      "codePostalNaissance",
      "numeroPermis",
      "dateDelivrancePermis",
      "prefecture",
      "etatPermis",
      "casStage",
    ];

    requiredFields.forEach((field) => {
      if (
        !formData[field as keyof UserFormData] ||
        formData[field as keyof UserFormData]?.trim() === ""
      ) {
        newErrors[field] = "Ce champ est requis";
      }
    });

    if (formData.email !== formData.confirmationEmail) {
      newErrors.confirmationEmail = "Les emails ne correspondent pas.";
    }

    // Validation supplémentaire pour les formats (exemple : email)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Format d'email invalide.";
    }

    // Validation du numéro de téléphone
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.telephone && !phoneRegex.test(formData.telephone)) {
      newErrors.telephone = "Format de téléphone invalide.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      const submissionData = new FormData();

      // Append les champs texte
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "scanIdentite" || key === "scanPermis") {
          if (value) {
            submissionData.append(key, value);
          }
        } else {
          submissionData.append(key, value);
        }
      });

      try {
        await onSubmit(submissionData);
        // Optionnel: Réinitialiser le formulaire ou afficher un message de succès
      } catch (error) {
        // Gestion des erreurs de soumission
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-3xl shadow-xl space-y-8"
      encType="multipart/form-data"
    >
      <h2 className="text-2xl font-bold text-indigo-700">Formulaire d'inscription</h2>

      {/* Section 1: Informations Personnelles */}
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
            <ErrorMessage message={errors.civilite} />
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
            <ErrorMessage message={errors.nom} />
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
            <ErrorMessage message={errors.prenom} />
          </div>

          {/* 2e Prénom (Optionnel) */}
          <div>
            <label className="block text-gray-700 font-medium">2e Prénom</label>
            <input
              type="text"
              name="prenom1"
              value={formData.prenom1}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Entrez votre deuxième prénom"
            />
            <ErrorMessage message={errors.prenom1} />
          </div>

          {/* 3e Prénom (Optionnel) */}
          <div>
            <label className="block text-gray-700 font-medium">3e Prénom</label>
            <input
              type="text"
              name="prenom2"
              value={formData.prenom2}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Entrez votre troisième prénom"
            />
            <ErrorMessage message={errors.prenom2} />
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-gray-700 font-medium">
              Adresse<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              className={`${inputClassName} ${errors.adresse ? "border-red-500" : ""}`}
              placeholder="Entrez votre adresse"
            />
            <ErrorMessage message={errors.adresse} />
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
            <ErrorMessage message={errors.codePostal} />
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
            <ErrorMessage message={errors.ville} />
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
            <ErrorMessage message={errors.telephone} />
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
            <ErrorMessage message={errors.email} />
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
            <ErrorMessage message={errors.confirmationEmail} />
          </div>

          {/* Nationalité */}
          <div>
            <label className="block text-gray-700 font-medium">
              Nationalité<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nationalite"
              value={formData.nationalite}
              onChange={handleChange}
              className={`${inputClassName} ${errors.nationalite ? "border-red-500" : ""}`}
              placeholder="Entrez votre nationalité"
            />
            <ErrorMessage message={errors.nationalite} />
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
            <ErrorMessage message={errors.dateNaissance} />
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
            <ErrorMessage message={errors.lieuNaissance} />
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
            <ErrorMessage message={errors.codePostalNaissance} />
          </div>
        </div>
      </div>
  
      {/* Section 2: Informations Permis */}
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
            <ErrorMessage message={errors.numeroPermis} />
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
            <ErrorMessage message={errors.dateDelivrancePermis} />
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
            <ErrorMessage message={errors.etatPermis} />
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
            <ErrorMessage message={errors.prefecture} />
          </div>

          {/* Cas de Stage */}
          <div>
            <label className="block text-gray-700 font-medium">
              Cas de Stage<span className="text-red-500">*</span>
            </label>
            <select
              name="casStage"
              value={formData.casStage}
              onChange={handleChange}
              className={`${inputClassName} ${errors.casStage ? "border-red-500" : ""}`}
            >
              <option value="">-- Sélectionnez --</option>
              <option value="Stage de Conduite">Stage de Conduite</option>
              <option value="Stage de Sensibilisation">Stage de Sensibilisation</option>
              <option value="Autre">Autre</option>
            </select>
            <ErrorMessage message={errors.casStage} />
          </div>
        </div>
      </div>

      {/* Section 3: Téléchargements des Pièces */}
      <div className="flex flex-col space-y-6">
        <h3 className="text-lg font-semibold text-indigo-600">Téléchargements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        

          {/* Scan du Permis de Conduire */}
          <div>
            <label className="block text-gray-700 font-medium">
              Scan du Permis de Conduire recto<span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="scanPermis"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className={`${inputClassName} ${errors.scanPermis ? "border-red-500" : ""}`}
            />
            <ErrorMessage message={errors.scanPermis} />
          </div>     <div>
            <label className="block text-gray-700 font-medium">
              Scan du Permis de Conduire verso<span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="scanPermis"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className={`${inputClassName} ${errors.scanPermis ? "border-red-500" : ""}`}
            />
            <ErrorMessage message={errors.scanPermis} />
          </div>
     {/* Scan de la Pièce d'Identité */}
  <div>
            <label className="block text-gray-700 font-medium">
              Scan de la Pièce d'Identité recto<span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="scanIdentite"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className={`${inputClassName} ${errors.scanIdentite ? "border-red-500" : ""}`}
            />
            <ErrorMessage message={errors.scanIdentite} />
          </div>  {/* Scan de la Pièce d'Identité */}
          <div>
            <label className="block text-gray-700 font-medium">
              Scan de la Pièce d'Identité verso<span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="scanIdentite"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className={`${inputClassName} ${errors.scanIdentite ? "border-red-500" : ""}`}
            />
            <ErrorMessage message={errors.scanIdentite} />
          </div>
        </div>  
   
      </div>


      {/* Bouton de Soumission */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-sm text-white py-3 px-6 rounded-lg shadow-lg hover:from-indigo-600 hover:to-blue-600 transition-colors duration-300 ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isSubmitting ? "Envoi en cours..." : "Soumettre"}
      </button>
    </form>
  );
};

export default MergedForm;
