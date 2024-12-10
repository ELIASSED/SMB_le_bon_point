/* src/components/StageForm.tsx */

"use client";

import { useState } from 'react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  permitType: string;
  stageDate: string;
  message: string;
}

export default function StageForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    permitType: '',
    stageDate: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateEmail = (email: string) => {
    // Simple email regex validation
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    // Simple phone number validation (French format)
    const re = /^(\+33|0)[1-9](\d{2}){4}$/;
    return re.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation des champs
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.permitType || !formData.stageDate) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Veuillez entrer une adresse email valide.');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('Veuillez entrer un numéro de téléphone valide.');
      return;
    }

    // Simuler la soumission du formulaire
    // Dans un cas réel, vous enverriez les données à une API ou un backend
    console.log('Form Data Submitted:', formData);
    setIsSubmitted(true);
    // Réinitialiser le formulaire
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      permitType: '',
      stageDate: '',
      message: '',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Réservez Votre Stage de Récupération de Points</h2>

      {isSubmitted && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Votre réservation a été envoyée avec succès !
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Prénom */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            required
          />
        </div>

        {/* Nom */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Adresse Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            required
          />
        </div>

        {/* Téléphone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Numéro de Téléphone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Ex : +33123456789"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            required
          />
        </div>

        {/* Type de Permis */}
        <div>
          <label htmlFor="permitType" className="block text-sm font-medium text-gray-700">
            Type de Permis <span className="text-red-500">*</span>
          </label>
          <select
            name="permitType"
            id="permitType"
            value={formData.permitType}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            required
          >
            <option value="">Sélectionnez votre type de permis</option>
            <option value="Permis A">Permis A</option>
            <option value="Permis B">Permis B</option>
            <option value="Permis C">Permis C</option>
            <option value="Permis D">Permis D</option>
            <option value="Permis E">Permis E</option>
            <option value="Permis Probatoire">Permis Probatoire</option>
          </select>
        </div>

        {/* Date du Stage */}
        <div>
          <label htmlFor="stageDate" className="block text-sm font-medium text-gray-700">
            Date du Stage <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="stageDate"
            id="stageDate"
            value={formData.stageDate}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message (Facultatif)
          </label>
          <textarea
            name="message"
            id="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            placeholder="Ajoutez un message ou des informations supplémentaires..."
          ></textarea>
        </div>

        {/* Bouton de Soumission */}
        <div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-secondary transition-colors"
          >
            Réserver le Stage
          </button>
        </div>
      </form>
    </div>
  );
}
