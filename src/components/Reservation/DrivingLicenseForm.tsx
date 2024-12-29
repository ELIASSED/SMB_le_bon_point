import React, { useState } from "react";
import { AlertCircle } from "lucide-react";

interface DrivingLicenseFormProps {
  onSubmit: (formData: DrivingLicenseInfo) => void;
}

interface DrivingLicenseInfo {
  numeroPermis: string;
  dateDelivrancePermis: string;
  prefecture: string;
  etatPermis: string;
  casStage: string;
}

const FormField = ({ 
  label, 
  error, 
  children, 
  required = true 
}: { 
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <div className="flex items-center text-red-500 text-xs mt-1">
        <AlertCircle className="w-3 h-3 mr-1" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    // Placeholder for file handling
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const requiredFields = [
      "numeroPermis",
      "dateDelivrancePermis",
      "prefecture",
      "etatPermis",
      "casStage"
    ];

    requiredFields.forEach((field) => {
      if (!formData[field as keyof DrivingLicenseInfo]) {
        newErrors[field] = "Ce champ est requis";
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
    <div className="max-w-4xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Informations du permis de conduire
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label="Numéro de permis" error={errors.numeroPermis}>
            <input
              type="text"
              name="numeroPermis"
              value={formData.numeroPermis}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: 12AB34567"
            />
          </FormField>

          <FormField label="Date de délivrance" error={errors.dateDelivrancePermis}>
            <input
              type="date"
              name="dateDelivrancePermis"
              value={formData.dateDelivrancePermis}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </FormField>

          <FormField label="Préfecture de délivrance" error={errors.prefecture}>
            <input
              type="text"
              name="prefecture"
              value={formData.prefecture}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Paris"
            />
          </FormField>

          <FormField label="État du permis" error={errors.etatPermis}>
            <select
              name="etatPermis"
              value={formData.etatPermis}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Sélectionnez l'état</option>
              <option value="Valide">Valide</option>
              <option value="Invalide">Invalide</option>
            </select>
          </FormField>

          <FormField label="Cas de stage" error={errors.casStage}>
            <select
              name="casStage"
              value={formData.casStage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Sélectionnez un cas</option>
              <option value="Cas 1">Cas 1 (Volontaire)</option>
              <option value="Cas 2">Cas 2 (Obligatoire)</option>
            </select>
          </FormField>

          <FormField label="Scan du permis de conduire" required={false}>
            <input
              type="file"
              name="scanPermis"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </FormField>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-md
              hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              transition-colors duration-200"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}