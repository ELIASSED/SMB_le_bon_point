// src/components/MergedForm.tsx

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

  const inputClassName =
    "mt-1 block w-full border rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500";

  const ErrorMessage = ({ message }: { message?: string }) =>
    message ? <p className="text-red-500 text-xs mt-1">{message}</p> : null;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [name]: file }));
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
      if (!formData[field as keyof UserFormData] || formData[field as keyof UserFormData]?.trim() === "") {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
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

      onSubmit(submissionData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-md shadow-md space-y-6" encType="multipart/form-data">
      <h2 className="text-xl font-semibold">Formulaire d'inscription</h2>

      {/* Informations Personnelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Civilité */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Civilité</label>
          <select name="civilite" value={formData.civilite} onChange={handleChange} className={inputClassName}>
            <option value="">-- Sélectionnez --</option>
            <option value="Monsieur">Monsieur</option>
            <option value="Madame">Madame</option>
            <option value="Mademoiselle">Mademoiselle</option>
          </select>
          <ErrorMessage message={errors.civilite} />
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.nom} />
        </div>

        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.prenom} />
        </div>

        {/* Premier Prénom (Optionnel) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Deuxième Prénom (Optionnel)</label>
          <input
            type="text"
            name="prenom1"
            value={formData.prenom1}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.prenom1} />
        </div>

        {/* Second Prénom (Optionnel) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Troisième Prénom (Optionnel)</label>
          <input
            type="text"
            name="prenom2"
            value={formData.prenom2}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.prenom2} />
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Adresse</label>
          <input
            type="text"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.adresse} />
        </div>

        {/* Code Postal */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Code Postal</label>
          <input
            type="text"
            name="codePostal"
            value={formData.codePostal}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.codePostal} />
        </div>

        {/* Ville */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Ville</label>
          <input
            type="text"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.ville} />
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className={inputClassName}
            pattern="[0-9]{10}"
            placeholder="Ex: 0123456789"
          />
          <ErrorMessage message={errors.telephone} />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.email} />
        </div>

        {/* Confirmation Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirmez votre Email</label>
          <input
            type="email"
            name="confirmationEmail"
            value={formData.confirmationEmail}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.confirmationEmail} />
        </div>

        {/* Nationalité */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nationalité</label>
          <input
            type="text"
            name="nationalite"
            value={formData.nationalite}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.nationalite} />
        </div>

        {/* Date de Naissance */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date de Naissance</label>
          <input
            type="date"
            name="dateNaissance"
            value={formData.dateNaissance}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.dateNaissance} />
        </div>

        {/* Lieu de Naissance */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Lieu de Naissance</label>
          <input
            type="text"
            name="lieuNaissance"
            value={formData.lieuNaissance}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.lieuNaissance} />
        </div>

        {/* Code Postal de Naissance */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Code Postal de Naissance</label>
          <input
            type="text"
            name="codePostalNaissance"
            value={formData.codePostalNaissance}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.codePostalNaissance} />
        </div>
      </div>

      {/* Informations Permis */}
      <h3 className="text-lg font-semibold mt-6">Informations Permis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Numéro de Permis */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Numéro de Permis</label>
          <input
            type="text"
            name="numeroPermis"
            value={formData.numeroPermis}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.numeroPermis} />
        </div>

        {/* Date de Délivrance du Permis */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date de Délivrance du Permis</label>
          <input
            type="date"
            name="dateDelivrancePermis"
            value={formData.dateDelivrancePermis}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.dateDelivrancePermis} />
        </div>

        {/* État du Permis */}
        <div>
          <label className="block text-sm font-medium text-gray-700">État du Permis</label>
          <select
            name="etatPermis"
            value={formData.etatPermis}
            onChange={handleChange}
            className={inputClassName}
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
          <label className="block text-sm font-medium text-gray-700">Préfecture</label>
          <input
            type="text"
            name="prefecture"
            value={formData.prefecture}
            onChange={handleChange}
            className={inputClassName}
          />
          <ErrorMessage message={errors.prefecture} />
        </div>

        {/* Cas de Stage */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Cas de Stage</label>
          <select
            name="casStage"
            value={formData.casStage}
            onChange={handleChange}
            className={inputClassName}
          >
            <option value="">-- Sélectionnez --</option>
            <option value="Stage de Conduite">Stage de Conduite</option>
            <option value="Stage de Sensibilisation">Stage de Sensibilisation</option>
            <option value="Autre">Autre</option>
          </select>
          <ErrorMessage message={errors.casStage} />
        </div>
      </div>

      {/* Téléchargements */}
      <h3 className="text-lg font-semibold mt-6">Téléchargements</h3>
      <div className="space-y-4">
        {/* Scan de la Pièce d'Identité */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Scan de la Pièce d'Identité</label>
          <input
            type="file"
            name="scanIdentite"
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className={inputClassName}
          />
          <ErrorMessage message={errors.scanIdentite} />
        </div>

        {/* Scan du Permis de Conduire */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Scan du Permis de Conduire</label>
          <input
            type="file"
            name="scanPermis"
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className={inputClassName}
          />
          <ErrorMessage message={errors.scanPermis} />
        </div>
      </div>

      {/* Commentaire */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Commentaire (Optionnel)</label>
        <textarea
          name="commentaire"
          value={formData.commentaire}
          onChange={handleChange}
          className={`${inputClassName} h-24`}
        />
        <ErrorMessage message={errors.commentaire} />
      </div>

      {/* Bouton de Soumission */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
      >
        Soumettre
      </button>
    </form>
  );
};

export default MergedForm;
