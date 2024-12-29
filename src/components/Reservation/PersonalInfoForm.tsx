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
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      scanIdentite: file,
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
    ];

    requiredFields.forEach((field) => {
      if (!formData[field as keyof PersonalInfo]) {
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
      onNext(formData);
    }
  };

  const FormField = ({ 
    label, 
    name, 
    type = "text", 
    required = true,
    options = [],
  }: { 
    label: string; 
    name: keyof PersonalInfo; 
    type?: string;
    required?: boolean;
    options?: { value: string; label: string; }[];
  }) => (
    <div className="w-full px-2 mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "select" ? (
        <select
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">-- Sélectionnez --</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      )}
      {errors[name] && (
        <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4">
      <div className="flex flex-wrap -mx-2">
        <FormField
          label="Civilité"
          name="civilite"
          type="select"
          options={[
            { value: "Monsieur", label: "Monsieur" },
            { value: "Madame", label: "Madame" },
          ]}
        />
        
        <div className="w-full md:w-1/2 px-2 mb-4">
          <FormField label="Nom" name="nom" />
        </div>
        
        <div className="w-full md:w-1/2 px-2 mb-4">
          <FormField label="Prénom" name="prenom" />
        </div>
        
        <div className="w-full md:w-1/2 px-2 mb-4">
          <FormField label="Prénom 1" name="prenom1" required={false} />
        </div>
        
        <div className="w-full md:w-1/2 px-2 mb-4">
          <FormField label="Prénom 2" name="prenom2" required={false} />
        </div>
        
        <div className="w-full px-2 mb-4">
          <FormField label="Adresse" name="adresse" />
        </div>
        
        <div className="w-full md:w-1/3 px-2 mb-4">
          <FormField label="Code Postal" name="codePostal" />
        </div>
        
        <div className="w-full md:w-2/3 px-2 mb-4">
          <FormField label="Ville" name="ville" />
        </div>
        
        <div className="w-full md:w-1/2 px-2 mb-4">
          <FormField label="Date de naissance" name="dateNaissance" type="date" />
        </div>
        
        <div className="w-full md:w-1/2 px-2 mb-4">
          <FormField label="Code postal de naissance" name="codePostalNaissance" />
        </div>
        
        <div className="w-full md:w-1/2 px-2 mb-4">
          <FormField label="Nationalité" name="nationalite" />
        </div>
        
        <div className="w-full md:w-1/2 px-2 mb-4">
          <FormField label="Téléphone" name="telephone" type="tel" />
        </div>
        
        <div className="w-full md:w-1/2 px-2 mb-4">
          <FormField label="Email" name="email" type="email" />
        </div>
        
        <div className="w-full md:w-1/2 px-2 mb-4">
          <FormField label="Confirmation Email" name="confirmationEmail" type="email" />
        </div>
        
        <div className="w-full px-2 mb-4">
          <label htmlFor="scanIdentite" className="block text-sm font-medium text-gray-700 mb-1">
            Scan de la pièce d'identité (optionnel)
          </label>
          <input
            type="file"
            id="scanIdentite"
            name="scanIdentite"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="w-full px-2">
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-md shadow-sm transition duration-150 ease-in-out text-lg font-medium"
          >
            Suivant
          </button>
        </div>
      </div>
    </form>
  );
}