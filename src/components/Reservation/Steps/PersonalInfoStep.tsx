// Steps/PersonalInfoStep.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDateRange } from "../utils"; // Vérifiez le chemin en fonction de votre projet
import { Stage } from "../types"; // Vérifiez que le type Stage est correctement défini

const PersonalInfoStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // L'ID du stage sélectionné doit être passé dans l'URL sous la clé "stageId"
  const stageId = searchParams.get("stageId");

  // État pour stocker les détails du stage
  const [stage, setStage] = useState<Stage | null>(null);
  const [loadingStage, setLoadingStage] = useState(true);
  const [stageError, setStageError] = useState<string | null>(null);

  // État pour le formulaire d'inscription
  const [formData, setFormData] = useState({
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
    nationalite: "",
    dateNaissance: "",
    codePostalNaissance: "",
    numeroPermis: "",
    dateDelivrancePermis: "",
    prefecture: "",
    etatPermis: "",
    casStage: ""
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Récupérer les informations du stage sélectionné via l'API
  useEffect(() => {
    if (!stageId) return;

    const fetchStage = async () => {
      try {
        const res = await fetch(`/api/stages/${stageId}`);
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération du stage");
        }
        const data = await res.json();
        setStage(data);
      } catch (err: any) {
        setStageError(err.message);
      } finally {
        setLoadingStage(false);
      }
    };

    fetchStage();
  }, [stageId]);

  // Gestion des modifications des champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Envoi du formulaire d'inscription
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: stageId, // Transmission de l'ID du stage sélectionné
          ...formData
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Erreur lors de l'inscription");
        setSubmitting(false);
        return;
      }
      // Redirection vers la page de paiement en passant l'ID de l'utilisateur créé et le stageId
      router.push(`/Steps/PaymentStep?userId=${data.user.id}&stageId=${stageId}`);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStage) return <p>Chargement des détails du stage...</p>;
  if (stageError) return <p className="text-red-500">{stageError}</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Confirmez votre inscription</h1>

      {/* Affichage des détails du stage sélectionné */}
      {stage && (
        <div className="border p-4 rounded mb-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Détails du Stage</h2>
          <p>
            <strong>Dates :</strong> {formatDateRange(stage.startDate, stage.endDate)}
          </p>
          <p>
            <strong>Localisation :</strong> {stage.location}
          </p>
          <p>
            <strong>Prix :</strong>{" "}
            {stage.price.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR"
            })}
          </p>
          <p>
            <strong>Capacité restante :</strong> {stage.capacity}
          </p>
        </div>
      )}

      {/* Affichage des erreurs du formulaire, le cas échéant */}
      {formError && <p className="text-red-500 text-center">{formError}</p>}

      {/* Formulaire d'inscription */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Civilité</label>
          <input
            type="text"
            name="civilite"
            value={formData.civilite}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Nom</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Prénom</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Adresse</label>
          <input
            type="text"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Code Postal</label>
          <input
            type="text"
            name="codePostal"
            value={formData.codePostal}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Ville</label>
          <input
            type="text"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Téléphone</label>
          <input
            type="text"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        {/* Ajoutez ici d'autres champs si nécessaire (nationalité, date de naissance, etc.) */}

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          {submitting ? "Envoi en cours..." : "Confirmer l'inscription et passer au paiement"}
        </button>
      </form>
    </div>
  );
};

export default PersonalInfoStep;
