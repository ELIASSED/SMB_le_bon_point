// components/PersonalInfoForm.tsx

"use client";
import React, { useState } from "react";

interface PersonalInfoFormProps {
  onNext: (formData: PersonalInfo) => void;
}

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
}

export default function PersonalInfoForm({ onNext }: PersonalInfoFormProps) {
  const [formData, setFormData] = useState<PersonalInfo>({
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
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        scanIdentite: e.target.files[0], // Stocke le fichier sélectionné
      }));
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
      "dateNaissance",
      "codePostalNaissance",
      "nationalite",
      "telephone",
      "email",
      "confirmationEmail",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "Ce champ est requis.";
      }
    });

    if (formData.email !== formData.confirmationEmail) {
      newErrors.confirmationEmail = "Les emails ne correspondent pas.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      onNext(formData); // Passe les données à l'étape suivante
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="civilite" className="block text-sm font-medium text-gray-700">
          Civilité
        </label>
        <select
          id="civilite"
          name="civilite"
          value={formData.civilite}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
        >
          <option value="">-- Sélectionnez une civilité --</option>
          <option value="Monsieur">Monsieur</option>
          <option value="Madame">Madame</option>
        </select>
        {errors.civilite && <p className="text-red-500 text-xs mt-1">{errors.civilite}</p>}
      </div>

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

      <div>
        <label htmlFor="prenom1" className="block text-sm font-medium text-gray-700">Prénom 1 (optionnel)</label>
        <input
          type="text"
          id="prenom1"
          name="prenom1"
          value={formData.prenom1}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>

      <div>
        <label htmlFor="prenom2" className="block text-sm font-medium text-gray-700">Prénom 2 (optionnel)</label>
        <input
          type="text"
          id="prenom2"
          name="prenom2"
          value={formData.prenom2}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>

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

      <div>
        <label htmlFor="codePostalNaissance" className="block text-sm font-medium text-gray-700">Lieu de naissance (Code postal)</label>
        <input
          type="text"
          id="codePostalNaissance"
          name="codePostalNaissance"
          value={formData.codePostalNaissance}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
        />
        {errors.codePostalNaissance && <p className="text-red-500 text-xs mt-1">{errors.codePostalNaissance}</p>}
      </div>

      <div>
        <label htmlFor="nationalite" className="block text-sm font-medium text-gray-700">Nationalité</label>
        <input
          type="text"
          id="nationalite"
          name="nationalite"
          value={formData.nationalite}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
        />
        {errors.nationalite && <p className="text-red-500 text-xs mt-1">{errors.nationalite}</p>}
      </div>

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

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
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

      <div>
        <label htmlFor="confirmationEmail" className="block text-sm font-medium text-gray-700">Confirmation Email</label>
        <input
          type="email"
          id="confirmationEmail"
          name="confirmationEmail"
          value={formData.confirmationEmail}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
        />
        {errors.confirmationEmail && <p className="text-red-500 text-xs mt-1">{errors.confirmationEmail}</p>}
      </div> <div>
        <label htmlFor="scanIdentite" className="block text-sm font-medium text-gray-700">
          Scan de la pièce d'identité (optionnel)
        </label>
        <input
          type="file"
          id="scanIdentite"
          name="scanIdentite"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>


      <div className="col-span-2">
        <button
          type="submit"
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md"
        >
          Suivant
        </button>
      </div>
    </form>
  );
}
