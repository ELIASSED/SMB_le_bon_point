// components/DrivingLicenseForm.tsx

"use client";
import React, { useState } from "react";

interface DrivingLicenseFormProps {
  onSubmit: (formData: DrivingLicenseInfo) => void;
}

export interface DrivingLicenseInfo {
  numeroPermis: string;
  dateDelivrancePermis: string;
  prefecture: string;
  etatPermis: string;
  casStage: string;
}

export default function DrivingLicenseForm({ onSubmit }: DrivingLicenseFormProps) {
  const [formData, setFormData] = useState<DrivingLicenseInfo>({
    numeroPermis: "",
    dateDelivrancePermis: "",
    prefecture: "",
    etatPermis: "",
    casStage: "",
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
        scanPermis: e.target.files[0], // Stocke le fichier sélectionné
      }));
    }
  };
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const requiredFields = ["numeroPermis", "dateDelivrancePermis", "prefecture", "etatPermis", "casStage"];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "Ce champ est requis.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData); // Passe les données au parent
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="numeroPermis" className="block text-sm font-medium text-gray-700">
          Numéro de permis
        </label>
        <input
          type="text"
          id="numeroPermis"
          name="numeroPermis"
          value={formData.numeroPermis}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
        />
        {errors.numeroPermis && <p className="text-red-500 text-xs mt-1">{errors.numeroPermis}</p>}
      </div>

      <div>
        <label htmlFor="dateDelivrancePermis" className="block text-sm font-medium text-gray-700">
          Date de délivrance
        </label>
        <input
          type="date"
          id="dateDelivrancePermis"
          name="dateDelivrancePermis"
          value={formData.dateDelivrancePermis}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
        />
        {errors.dateDelivrancePermis && (
          <p className="text-red-500 text-xs mt-1">{errors.dateDelivrancePermis}</p>
        )}
      </div>

      <div>
        <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700">
          Préfecture de délivrance
        </label>
        <input
          type="text"
          id="prefecture"
          name="prefecture"
          value={formData.prefecture}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
        />
        {errors.prefecture && <p className="text-red-500 text-xs mt-1">{errors.prefecture}</p>}
      </div>

      <div>
        <label htmlFor="etatPermis" className="block text-sm font-medium text-gray-700">
          État du permis
        </label>
        <select
          id="etatPermis"
          name="etatPermis"
          value={formData.etatPermis}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
        >
          <option value="">-- Sélectionnez l'état --</option>
          <option value="Valide">Valide</option>
          <option value="Invalide">Invalide</option>
        </select>
        {errors.etatPermis && <p className="text-red-500 text-xs mt-1">{errors.etatPermis}</p>}
      </div>

      <div>
        <label htmlFor="casStage" className="block text-sm font-medium text-gray-700">
          Cas de stage
        </label>
        <select
          id="casStage"
          name="casStage"
          value={formData.casStage}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
        >
          <option value="">-- Sélectionnez un cas --</option>
          <option value="Cas 1">Cas 1 (Volontaire)</option>
          <option value="Cas 2">Cas 2 (Obligatoire)</option>
        </select>
        {errors.casStage && <p className="text-red-500 text-xs mt-1">{errors.casStage}</p>}
      </div>
      <div>
        <label htmlFor="scanPermis" className="block text-sm font-medium text-gray-700">
          Scan du permis de conduire (optionnel)
        </label>
        <input
          type="file"
          id="scanPermis"
          name="scanPermis"
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
          Enregistrer
        </button>
      </div>
    </form>
  );
}
