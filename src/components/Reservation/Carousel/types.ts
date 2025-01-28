// components/Carousel/types.ts

export interface Stage {
    id: number;
    numeroStageAnts: string;
    startDate: string;
    endDate: string;
    location: string;
    capacity: number;
    price: number;
  }
  
  
  export interface DrivingLicenseInfo {
    numeroPermis: string;
    dateObtention: string;
    categoriePermis: string;
    // ajoutez d'autres champs selon vos besoins
  }

export interface AddressSuggestion {
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

export interface UserFormData {
  civilite: string;
  nom: string;
  prenom: string;
  prenom1: string;
  prenom2: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  email: string;
  confirmationEmail: string;
  nationalite: string;
  dateNaissance: string;
  lieuNaissance: string;
  codePostalNaissance: string;
  numeroPermis: string;
  dateDelivrancePermis: string;
  prefecture: string;
  etatPermis: string;
  casStage: string;
  scanIdentiteRecto: File | null;
  scanIdentiteVerso: File | null;
  scanPermisRecto: File | null;
  scanPermisVerso: File | null;
  commentaire: string | null;
}

export interface AddressSuggestion {
  properties: {
    name: string;
    postcode: string;
    city: string;
    label: string;
  };
}

export type FormDataType = any; // Remplacez par le type approprié si nécessaire
