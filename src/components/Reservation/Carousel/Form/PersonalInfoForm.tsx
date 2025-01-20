// components/PersonalInfoForm.tsx

"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { debounce } from "lodash";
import nationalitiesData from "../nationalite.json";

interface PersonalInfoFormProps {
  onNext: (formData: PersonalInfo) => void;
}

interface AddressSuggestion {
  properties: {
    label: string;
    postcode: string;
    city: string;
    name: string;
  };
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
  const [nationalities, setNationalities] = useState<{ code: string; name: string }[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (nationalitiesData?.nationalities) {
      setNationalities(nationalitiesData.nationalities);
    }
  }, []);

  // Fonction debounce pour l'appel API
  const fetchAddressSuggestions = debounce(async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingAddress(true);
    try {
      const response = await axios.get(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
      );
      setAddressSuggestions(response.data.features);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresse:", error);
      setAddressSuggestions([]);
    } finally {
      setIsLoadingAddress(false);
    }
  }, 300);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, adresse: value }));
    fetchAddressSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setFormData(prev => ({
      ...prev,
      adresse: suggestion.properties.name,
      codePostal: suggestion.properties.postcode,
      ville: suggestion.properties.city
    }));
    setShowSuggestions(false);
  };

 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "adresse" && value.length > 2) {
      handleSubmit(value);
    } else {
      setShowSuggestions([]);
    }
  };
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
      scanIdentite: file, // Stocke le fichier sélectionné ou null
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      try {
        // Envoi des données avec fetch
        const response = await fetch("/api/submit-personal-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
  
        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }
  
        const data = await response.json();
        console.log("Données envoyées avec succès :", data);
  
        // Passe les données à l'étape suivante après un succès
        onNext(formData);
      } catch (error) {
        console.error("Erreur lors de l'envoi des données :", error);
        // Vous pouvez afficher un message d'erreur ici
      }
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
      <div className="relative">
        <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">
          Adresse
        </label>
        <input
          type="text"
          id="adresse"
          name="adresse"
          value={formData.adresse}
          onChange={handleAddressChange}
          onFocus={() => formData.adresse.length >= 3 && setShowSuggestions(true)}
          className="mt-1 block w-full border rounded-md p-2"
          placeholder="Commencez à taper une adresse..."
          autoComplete="off"
        />
        
        {isLoadingAddress && (
          <div className="absolute right-2 top-[38px] text-gray-400">
            Chargement...
          </div>
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
      </div>
      <div>
        <label htmlFor="codePostal" className="block text-sm font-medium text-gray-700">
          Code Postal
        </label>
        <input
          type="text"
          id="codePostal"
          name="codePostal"
          value={formData.codePostal}
          onChange={handleInputChange}
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>

      <div>
        <label htmlFor="ville" className="block text-sm font-medium text-gray-700">
          Ville
        </label>
        <input
          type="text"
          id="ville"
          name="ville"
          value={formData.ville}
          onChange={handleInputChange}
          className="mt-1 block w-full border rounded-md p-2"
        />
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
        <label htmlFor="nationalite" className="block text-sm font-medium text-gray-700">
          Nationalité
        </label>
        <select
  id="nationalite"
  name="nationalite"
  value={formData.nationalite}
  onChange={handleChange}
  className="mt-1 block w-full border rounded-md p-2"
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
